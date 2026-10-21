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


def _balance(techs):
    """añade balance_tp / balance_power_* a las técnicas de players.json (la base los lleva en columnas propias)"""
    path = os.path.join(ROOT, 'data', 'technique_balance.json')
    if not os.path.exists(path):
        return
    with open(path, encoding='utf-8') as f:
        bal = json.load(f)['techniques']
    go1 = {}
    go1_path = os.path.join(ROOT, 'data', 'technique_balance_go1.json')
    if os.path.exists(go1_path):
        with open(go1_path, encoding='utf-8') as f:
            go1 = json.load(f).get('techniques', {})
    for t in techs:
        if t['id'] in bal:
            t['balance_tp'], t['balance_power_min'], t['balance_power_max'] = bal[t['id']]
        if t['id'] in go1:
            t['balance_tp_go1'], t['balance_power_min_go1'], t['balance_power_max_go1'] = go1[t['id']]


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
        go1_path = os.path.join(ROOT, 'data', 'technique_balance_go1.json')
        if os.path.exists(go1_path):
            with open(go1_path, encoding='utf-8') as gf:
                go1 = json.load(gf).get('techniques', {})
            vals_go1 = ',\n'.join(f"({sql(i)},{tp},{mn},{mx})" for i, (tp, mn, mx) in sorted(go1.items()))
            f.write('\n-- TP por saga: GO1 original. Solo lo leen las cartas de GO1; no toca el TP global.\n'
                    'update public.techniques t set balance_tp_go1 = v.tp, balance_power_min_go1 = v.mn, balance_power_max_go1 = v.mx\n'
                    f'from (values\n{vals_go1}\n) as v(id, tp, mn, mx) where t.id = v.id;\n')


def write_outputs(cards, chars, techniques, teams, staff, zukan_rows, report, dropped=None, removed_cards=None,
                  dropped_techs=None, tech_remove=None, reassert_cards=None):
    os.makedirs(OUT, exist_ok=True)
    used = {t['id'] for c in cards for t in c['moves']}
    go1_path = os.path.join(ROOT, 'data', 'technique_balance_go1.json')
    go1_ids = set()
    if os.path.exists(go1_path):
        with open(go1_path, encoding='utf-8') as f:
            go1_ids = set(json.load(f).get('techniques', {}))
    techs = [{k: v for k, v in t.items() if k != '_inf'}
             for t in techniques.values() if t and (t['id'] in used or t['id'] in go1_ids)]
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
