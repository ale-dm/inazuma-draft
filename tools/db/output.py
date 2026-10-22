"""Salidas de build.py: build/players.json, build/review.csv, build/report.txt y supabase/seed.sql."""
import collections
import csv
import json
import os

from common import CATEGORIES, OUT, ROOT
from edits import apply_edits


def sql(v):
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return str(int(v)) if float(v).is_integer() else str(v)
    if isinstance(v, (dict, list)):
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"


def insert(table, cols, rows, key, chunk=500):
    """upsert en trozos: una fila nueva se inserta y una que ya existe (misma clave) se actualiza solo en estas columnas.
    Así no se pierden las columnas, las filas ni las tablas que se han añadido a mano en la base (p. ej. las columnas
    vr_* / balance_* de techniques o card_victorymods_map, que apunta a cards)"""
    keys = [key] if isinstance(key, str) else list(key)
    sets = ','.join(f'{c}=excluded.{c}' for c in cols if c not in keys)
    tail = f' on conflict ({",".join(keys)}) do update set {sets}' if sets else f' on conflict ({",".join(keys)}) do nothing'
    out = []
    for i in range(0, len(rows), chunk):
        vals = ',\n'.join('(' + ','.join(sql(r[c]) for c in cols) + ')' for r in rows[i:i + chunk])
        out.append(f'insert into public.{table} ({",".join(cols)}) values\n{vals}{tail};')
    return '\n'.join(out)


SAGA_BALANCE = ('go1', 'go2', 'go3')   # TP por saga: data/technique_balance_<saga>.json → balance_tp_<saga>


def saga_balance(saga):
    """TP por saga de las técnicas originales de esa saga: {id: [tp, mínima, máxima]} (vacío si no hay fichero)"""
    path = os.path.join(ROOT, 'data', f'technique_balance_{saga}.json')
    if not os.path.exists(path):
        return {}
    with open(path, encoding='utf-8') as f:
        return json.load(f).get('techniques', {})


def _balance(techs):
    """añade balance_tp / balance_power_* a las técnicas de players.json (la base los lleva en columnas propias)"""
    path = os.path.join(ROOT, 'data', 'technique_balance.json')
    if not os.path.exists(path):
        return
    with open(path, encoding='utf-8') as f:
        bal = json.load(f)['techniques']
    sagas = {s: saga_balance(s) for s in SAGA_BALANCE}
    for t in techs:
        if t['id'] in bal:
            t['balance_tp'], t['balance_power_min'], t['balance_power_max'] = bal[t['id']]
        for s, sb in sagas.items():
            if t['id'] in sb:
                t[f'balance_tp_{s}'], t[f'balance_power_min_{s}'], t[f'balance_power_max_{s}'] = sb[t['id']]


def write_balance():
    """supabase/technique_balance.sql: TP balanceado y su potencia por técnica (data/technique_balance.json, ver balance_xlsx.py).
    Solo actualiza esas tres columnas; las demás columnas y filas de la tabla no se tocan."""
    path = os.path.join(ROOT, 'data', 'technique_balance.json')
    if not os.path.exists(path):
        return
    with open(path, encoding='utf-8') as f:
        t = json.load(f)['techniques']
    vals = ',\n'.join(f"({sql(i)},{tp},{mn},{mx})" for i, (tp, mn, mx) in sorted(t.items()))
    with open(os.path.join(ROOT, 'supabase', 'technique_balance.sql'), 'w', encoding='utf-8') as f:
        f.write('-- Generado por tools/db/build.py desde data/technique_balance.json — no editar a mano.\n'
                '-- TP balanceado de las técnicas y la potencia que le corresponde (hoja de balance). Idempotente.\n'
                'update public.techniques t set balance_tp = v.tp, balance_power_min = v.mn, balance_power_max = v.mx\n'
                f'from (values\n{vals}\n) as v(id, tp, mn, mx) where t.id = v.id;\n')
        for s in SAGA_BALANCE:
            sb = saga_balance(s)
            if not sb:
                continue
            vals_s = ',\n'.join(f"({sql(i)},{tp},{mn},{mx})" for i, (tp, mn, mx) in sorted(sb.items()))
            # las columnas también están en schema.sql; aquí van para que la carga balance_only funcione sola. Las que
            # ya no están en el JSON (p. ej. las de espíritu guerrero que salieron de GO1) se vacían antes de escribir.
            ids = ','.join(sql(i) for i in sorted(sb))
            f.write(f'\n-- TP por saga: {s.upper()} original. Solo lo leen las cartas de {s.upper()}; no toca el TP global.\n'
                    + ''.join(f'alter table public.techniques add column if not exists {c}_{s} int;\n'
                              for c in ('balance_tp', 'balance_power_min', 'balance_power_max'))
                    + f'update public.techniques set balance_tp_{s} = null, balance_power_min_{s} = null, balance_power_max_{s} = null\n'
                    f'where balance_tp_{s} is not null and id not in ({ids});\n'
                    + f'update public.techniques t set balance_tp_{s} = v.tp, balance_power_min_{s} = v.mn, balance_power_max_{s} = v.mx\n'
                    f'from (values\n{vals_s}\n) as v(id, tp, mn, mx) where t.id = v.id;\n')


AURA_FIELDS = ('key', 'hyper', 'hyper_es', 'hyper_fr', 'hyper_it', 'hyper_id', 'points', 'cost', 'atk')


def _aura_points(cards, report):
    """completa los puntos de aura de los espíritus guerreros y tótems: los puestos a mano (CRUD) copian los de otra
    carta con el mismo especial; los de VR sin KP en la wiki salen de data/aura_points.json (tabla de Aura Points)"""
    path = os.path.join(ROOT, 'data', 'aura_points.json')
    cfg = json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}
    known = {}
    for c in cards:
        for sp in c.get('specials') or []:
            if sp['type'] in ('keshin', 'soul') and sp.get('key') and sp.get('points'):
                known.setdefault((sp['type'], sp['name']), sp)
    missing = 0
    for c in cards:
        for sp in c.get('specials') or []:
            if sp['type'] not in ('keshin', 'soul'):
                continue
            ref = known.get((sp['type'], sp['name']))
            if ref and not sp.get('key'):
                for k in AURA_FIELDS:
                    if sp.get(k) is None and ref.get(k) is not None:
                        sp[k] = ref[k]
            fix = (cfg.get(sp['type']) or {}).get(sp.get('key') or '') or {}
            dflt = (cfg.get('default') or {}).get(sp['type']) or {}
            for k in ('points', 'cost', 'atk'):
                if sp.get(k) is None and (k != 'atk' or sp['type'] == 'keshin'):
                    sp[k] = fix.get(k, dflt.get(k))
                    missing += k == 'points' and k not in fix
    if missing:
        report.append(f'Puntos de aura: {missing} especiales con la reserva por defecto (data/aura_points.json)')


def write_outputs(cards, chars, techniques, teams, staff, zukan_rows, report, dropped=None, removed_cards=None,
                  dropped_techs=None, tech_remove=None, reassert_cards=None):
    os.makedirs(OUT, exist_ok=True)
    used = {t['id'] for c in cards for t in c['moves']}
    used |= {sp['hyper_id'] for c in cards for sp in c.get('specials') or [] if sp.get('hyper_id')}   # técnicas de keshin / tótem
    saga_ids = {i for s in SAGA_BALANCE for i in saga_balance(s)}
    vr_extra_path = os.path.join(ROOT, 'data', 'technique_vr_extra.json')
    if os.path.exists(vr_extra_path):
        with open(vr_extra_path, encoding='utf-8') as f:
            saga_ids |= {x['id'] for x in json.load(f).get('techniques', [])}
    aura_path = os.path.join(ROOT, 'data', 'aura_points.json')
    if os.path.exists(aura_path):
        with open(aura_path, encoding='utf-8') as f:
            saga_ids |= set(json.load(f).get('tecnicas_sin_carta', []))
    techs = [{k: v for k, v in t.items() if k != '_inf'}
             for t in techniques.values() if t and (t['id'] in used or t['id'] in saga_ids)]
    char_ids = {c['character_id'] for c in cards}
    chars = [c for c in chars.values() if c['id'] in char_ids]

    public = []
    for c in sorted(cards, key=lambda c: (-c['ovr'], c['name'])):
        public.append({
            'id': c['id'], 'character_id': c['character_id'], 'name': c['name'], 'game': c['game'], 'saga': c['saga'],
            'version': c['version'], 'team': c['team'], 'position': c['position'], 'element': c['element'],
            'ovr': c['ovr'], 'category': c['category'], 'tier': c['tier'], 'source': c['source'], **c['stats'],
            'image_url': c['image_url'], 'zukan_id': c['zukan_id'], 'zukan_no': c.get('zukan_no'), 'is_version': c['is_version'],
            'description': c.get('description'), 'description_es': c.get('description_es'), 'no': c['no'],
            'specials': c.get('specials') or [], 'extra_teams': c.get('extra_teams') or [],
            'raw_stats': {'form': c['form_label'], **dict(zip(c['raw_keys'], c['raw']))},
            'stats40': c.get('stats40'), 'growth': c.get('growth'), 'freedom': c.get('freedom'),
            'techniques': [t['id'] for t in c['moves']],
            'duel_att': c.get('duel_att'), 'duel_con': c.get('duel_con'), 'duel_def': c.get('duel_def'),
        })
    _balance(techs)
    apply_edits(public, techs, chars, report)                # cambios del CRUD oculto (data/card_edits.json)
    _aura_points(public, report)
    with open(os.path.join(OUT, 'players.json'), 'w', encoding='utf-8') as f:
        json.dump({'cards': public, 'techniques': techs, 'characters': chars, 'teams': teams, 'staff': staff}, f, ensure_ascii=False, indent=1)

    tname = {t['id']: f"{t['name']} ({t['cost']})" for t in techs}
    with open(os.path.join(OUT, 'review.csv'), 'w', encoding='utf-8', newline='') as f:
        w = csv.writer(f)
        w.writerow(['ovr', 'categoría', 'nombre', 'juego', 'versión', 'equipo', 'pos', 'nivel', 'fuente',
                    'tiro', 'control', 'físico', 'velocidad', 'defensa', 'parada', 'técnicas', 'id'])
        for c in public:
            w.writerow([c['ovr'], c['category'], c['name'], c['game'], c['version'], c['team'], c['position'], c['tier'], c['source'],
                        c['shooting'], c['control'], c['physical'], c['speed'], c['defense'], c['goalkeeping'],
                        ' · '.join(tname.get(t, t) for t in c['techniques']), c['id']])

    card_cols = ['id', 'character_id', 'name', 'game', 'saga', 'version', 'team', 'position', 'element', 'ovr', 'category',
                 'tier', 'source', 'shooting', 'control', 'physical', 'speed', 'defense', 'goalkeeping', 'image_url',
                 'zukan_id', 'zukan_no', 'no', 'description', 'description_es', 'specials', 'extra_teams', 'raw_stats', 'is_version',
                 'stats40', 'growth', 'freedom',
                 'duel_att', 'duel_con', 'duel_def']
    links = [{'card_id': c['id'], 'technique_id': t, 'slot': i + 1}
             for c in public for i, t in enumerate(dict.fromkeys(c['techniques']))]
    seed = ['-- Generado por tools/db/build.py — no editar a mano.',
            '-- Upserts: las filas nuevas se insertan y las que ya existen se actualizan en las columnas de la carga;',
            '-- las columnas, filas y tablas añadidas a mano en la base se quedan como están (salvo overrides.drop_cards).',
            'begin;']
    if dropped:
        seed += ['-- cartas descartadas a mano (overrides.drop_cards): se borran también de la base',
                 f"delete from public.cards where id in ({', '.join(sql(i) for i in sorted(dropped))});"]
    if removed_cards:
        seed += ['-- técnicas quitadas a mano (overrides.tech_remove): se borran sus enlaces antes de reinsertar',
                 f"delete from public.card_techniques where card_id in ({', '.join(sql(i) for i in sorted(removed_cards))});"]
    if dropped_techs:
        seed += ['-- técnicas eliminadas (overrides.tech_drop): se borran de la base',
                 f"delete from public.techniques where id in ({', '.join(sql(i) for i in sorted(dropped_techs))});"]
    seed += ['-- Limpieza: el tiro antiguo es_remate-cazaosos se sustituye por vr_whs02920 (Remate cazaosos).',
             "delete from public.techniques where id = 'es_remate-cazaosos';"]
    seed += [
            insert('zukan', ['no', 'image_id', 'name', 'name_ja', 'role', 'age', 'element', 'position', 'teams', 'games', 'description', 'vr_lv50', 'wiki_page'], zukan_rows, key='no'),
            insert('staff', ['zukan_no', 'name', 'role', 'team', 'teams', 'games', 'age', 'element', 'image_url', 'description', 'wiki_page'], staff, key='zukan_no'),
            insert('teams', ['name', 'name_es', 'name_fr', 'name_it', 'logo_url', 'logos'], teams, key='name'),
            insert('characters', ['id', 'name', 'wiki_page', 'zukan_no'], [{**c} for c in chars], key='id'),
            insert('techniques', ['id', 'name', 'name_es', 'name_fr', 'name_it', 'name_jp', 'type', 'element', 'cost', 'cost_game', 'costs',
                                  'description', 'image_url', 'zukan_types', 'traits'], techs, key='id'),
            insert('cards', card_cols, public, key='id'),
            insert('card_techniques', ['card_id', 'technique_id', 'slot'], links, key=('card_id', 'technique_id')),
            '-- cambios hechos desde el CRUD de la app (supabase/admin.sql): se vuelven a aplicar encima',
            'select public.admin_replay();']
    if tech_remove:
        seed += ['-- limpieza final: las técnicas quitadas no vuelven por admin_replay']
        for cid, tids in sorted(tech_remove.items()):
            seed.append(f"delete from public.card_techniques where card_id = {sql(cid)} and technique_id in ({', '.join(sql(t) for t in tids)});")
    if reassert_cards:
        final_links = [l for l in links if l['card_id'] in set(reassert_cards)]
        if final_links:
            seed += ['-- reafirmar las técnicas de las cartas tocadas a mano (extra_moves/tech_remove)',
                     insert('card_techniques', ['card_id', 'technique_id', 'slot'], final_links, key=('card_id', 'technique_id'))]
    seed += ['commit;', '']
    os.makedirs(os.path.join(ROOT, 'supabase'), exist_ok=True)
    with open(os.path.join(ROOT, 'supabase', 'seed.sql'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(seed))
    write_balance()

    cats = collections.Counter(c['category'] for c in public)
    tiers = collections.Counter(c['tier'] for c in public)
    ovrs = sorted(c['ovr'] for c in public)
    n = len(ovrs)
    summary = [f'Cartas: {n} ({sum(c["is_version"] for c in public)} versiones extra) · personajes: {len(chars)} · técnicas: {len(techs)}',
               'Categorías: ' + ' · '.join(f'{k} {cats[k]}' for k, _ in CATEGORIES),
               'Niveles: ' + ' · '.join(f'{k} {tiers[k]}' for k in 'SABC'),
               f'OVR: mediana {ovrs[n // 2]} · p90 {ovrs[n * 9 // 10]} · p99 {ovrs[n * 99 // 100]} · máx {ovrs[-1]}']
    with open(os.path.join(OUT, 'report.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(summary + [''] + report) + '\n')
    print('\n'.join(summary))
    print(f'Avisos: {len(report)} (ver build/report.txt)')
