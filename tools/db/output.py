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


def insert(table, cols, rows, chunk=500, key=None):
    """insert en trozos; con key (columna única) es un upsert: lo que ya hay se actualiza solo en estas columnas, así las
    columnas y filas añadidas a mano en la tabla no se pierden"""
    tail = ''
    if key:
        sets = ','.join(f'{c}=excluded.{c}' for c in cols if c != key)
        tail = f' on conflict ({key}) do update set {sets}'
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
    for t in techs:
        if t['id'] in bal:
            t['balance_tp'], t['balance_power_min'], t['balance_power_max'] = bal[t['id']]


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


def write_outputs(cards, chars, techniques, teams, staff, zukan_rows, report):
    os.makedirs(OUT, exist_ok=True)
    used = {t['id'] for c in cards for t in c['moves']}
    techs = [{k: v for k, v in t.items() if k != '_inf'} for t in techniques.values() if t and t['id'] in used]
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
                 'duel_att', 'duel_con', 'duel_def']
    links = [{'card_id': c['id'], 'technique_id': t, 'slot': i + 1}
             for c in public for i, t in enumerate(dict.fromkeys(c['techniques']))]
    seed = ['-- Generado por tools/db/build.py — no editar a mano.', 'begin;',
            '-- las técnicas no se vacían: tienen columnas y filas propias (ver schema.sql); se actualizan con upsert',
            'truncate public.card_techniques, public.cards, public.characters, public.teams, public.staff, public.zukan;',
            insert('zukan', ['no', 'image_id', 'name', 'name_ja', 'role', 'age', 'element', 'position', 'teams', 'games', 'description', 'vr_lv50', 'wiki_page'], zukan_rows),
            insert('staff', ['zukan_no', 'name', 'role', 'team', 'teams', 'games', 'age', 'element', 'image_url', 'description', 'wiki_page'], staff),
            insert('teams', ['name', 'name_es', 'name_fr', 'name_it', 'logo_url', 'logos'], teams),
            insert('characters', ['id', 'name', 'wiki_page', 'zukan_no'], [{**c} for c in chars]),
            insert('techniques', ['id', 'name', 'name_es', 'name_fr', 'name_it', 'name_jp', 'type', 'element', 'cost', 'cost_game', 'costs',
                                  'description', 'image_url', 'zukan_types', 'traits'], techs, key='id'),
            insert('cards', card_cols, public),
            insert('card_techniques', ['card_id', 'technique_id', 'slot'], links),
            '-- cambios hechos desde el CRUD de la app (supabase/admin.sql): se vuelven a aplicar encima',
            'select public.admin_replay();',
            'commit;', '']
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
