"""Genera data/stats_mod.json para la app desde el balance del mod de Victory Road.

Lee balance_last.json (stats finales de nivel 200 por ficha), balance_copies.json /
balance_versiones.json (copias de versión), balance_base.json (crecimiento y libertad) y
balance_medias.json (medias de Supabase), y cruza cada carta de la app (IE1/IE2/IE3) con su ficha:

  card_id -> {
    "stats": [kick, control, technique, pressure, physical, intelligence, agility],  # nivel 200
    "media": OVR con el que se calcularon,
    "growth": 0/1/2, "freedom": N,
    "copy": true si es una copia de versión
  }

Las stats de la carta se reescalan a su OVR en tools/db/stats_mod.py y se pasan a nivel 40.

Uso:  python3 tools/db/import_stats_mod.py [ruta del EditorMods]
"""
import collections
import json
import os
import sys
import zlib

from common import ROOT

MOD_DEFAULT = r'C:\Program Files (x86)\Steam\steamapps\common\INAZUMA ELEVEN Victory Road\EditorMods'
SAGA = {'c01': 'IE1', 'c02': 'IE2', 'c03': 'IE3', 'c04': 'GO1', 'c05': 'GO2', 'c06': 'GO3',
        'c07': 'ARES', 'c08': 'ORION', 'c11': 'VR'}
SEASON = {'series_01': 'IE1', 'series_02': 'IE2', 'series_03': 'IE3'}


def main():
    mod = sys.argv[1] if len(sys.argv) > 1 else MOD_DEFAULT
    load = lambda n: json.load(open(os.path.join(mod, n), encoding='utf-8'))
    M, B, L, V, P = (load('balance_medias.json'), load('balance_base.json'), load('balance_last.json'),
                     load('balance_versiones.json'), load('proyecto.json'))
    d = json.load(open(os.path.join(ROOT, 'build', 'players.json'), encoding='utf-8'))
    row_season = {}
    for t in P.get('teams') or []:
        s = SEASON.get((t.get('bb') or {}).get('season'))
        for pl in t.get('players') or []:
            if pl.get('card'):
                row_season.setdefault(pl['card'], s)
    copies_by_template = collections.defaultdict(list)
    for hexrow, cp in (V.get('copies') or {}).items():
        copies_by_template[cp['template']].append((int(hexrow, 16), cp))
    by_chara = collections.defaultdict(list)
    for row, b in (B.get('rows') or {}).items():
        by_chara[b['chara']].append(int(row))
    card_code = {}
    for code, ids in (M.get('codes') or {}).items():
        for cid in ids:
            card_code.setdefault(cid, code)
    base_media = {}
    for code, ids in (M.get('codes') or {}).items():
        own = SAGA.get(code[:3])
        vals = [M['cards'][i][5] for i in ids if i in M['cards'] and M['cards'][i][1] == own]
        if vals:
            base_media[code] = max(vals)

    out, miss = {}, []
    for c in d['cards']:
        if c['game'] not in ('IE1', 'IE2', 'IE3'):
            continue
        code = card_code.get(c['id'])
        if not code:
            miss.append((c['name'], c['game'], c['team'], 'sin código'))
            continue
        rows = [r for r in by_chara.get(zlib.crc32(code.encode()) & 0xffffffff, []) if str(r) in L]
        if not rows:
            miss.append((c['name'], c['game'], c['team'], 'sin fila'))
            continue
        same = [r for r in rows if row_season.get(r) == c['game']]
        base = (same or rows)[0]
        cp = next((x for x in copies_by_template.get(base, []) if x[1]['saga'] == c['game']), None)
        row = cp[0] if cp else base
        if str(row) not in L:
            miss.append((c['name'], c['game'], c['team'], 'sin stats finales'))
            continue
        if cp:
            media = cp[1]['media']
        elif code in base_media:
            media = base_media[code]
        else:
            miss.append((c['name'], c['game'], c['team'], 'sin media base'))
            continue
        b = B['rows'][str(base)]
        out[c['id']] = {'stats': L[str(row)], 'media': media, 'growth': b.get('growth', 1),
                        'freedom': b.get('freedom'), 'copy': bool(cp)}

    print(f'cartas con datos: {len(out)} · sin datos: {len(miss)}')
    print(collections.Counter(m[3] for m in miss))
    for m in miss[:12]:
        print('  ', m)
    path = os.path.join(ROOT, 'data', 'stats_mod.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump({'_doc': 'Stats finales del mod de balance de Victory Road (nivel 200) por carta, con su media, '
                           'crecimiento y libertad. Lo usa tools/db/stats_mod.py; se regenera con '
                           'tools/db/import_stats_mod.py desde EditorMods/balance_*.json.',
                   'source': 'EditorMods/balance_*.json', 'cards': dict(sorted(out.items()))},
                  f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('escrito', path)


if __name__ == '__main__':
    main()
