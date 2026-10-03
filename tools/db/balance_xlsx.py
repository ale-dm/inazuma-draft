"""Importa el TP balanceado de las técnicas desde la hoja de cálculo («Sheet2»: TÉCNICA, TIPO, TP NUEVO, POT. MIN., POT.
MAX., COSTE REAL, JUG.), la cruza con la tabla `techniques` de Supabase y escribe:
  - data/technique_balance.json  (id → [TP, potencia mínima, potencia máxima]; lo carga supabase/technique_balance.sql)
  - docs/balance-tp.md           (qué se ha cruzado, los casos dudosos y lo que no ha cruzado)

Uso:  python3 tools/db/balance_xlsx.py hoja.xlsx [--db tecnicas.json]     (requiere openpyxl)
Sin --db lee la tabla pública de Supabase (solo lectura).

Reglas:
  - El TP de la hoja manda. La potencia mínima/máxima NO se copia de la hoja (en muchas filas se cambió el TP y no la
    potencia): sale de la escala TP → potencia, que es la que repite la inmensa mayoría de filas de la hoja.
  - Cruce por nombre (español o inglés), tipo y coste real de los juegos antiguos («—» = solo Victory Road). Si el nombre
    no coincide, por tipo y coste entre las técnicas sin pareja.
  - Si una técnica sale dos veces con TP distinto: gana la fila con la potencia sin actualizar (es la que se ha editado);
    si no hay, la que ya tiene la tabla; si tampoco, la de más TP. Con varias variantes y el mismo número de filas, por orden.
"""
import collections
import json
import os
import re
import subprocess
import sys
import unicodedata

from common import ROOT

SUPABASE = 'https://xacgoiaejdgjrvvsnqyi.supabase.co/rest/v1/techniques'
KEY = 'sb_publishable_iaMxVv0YacdSYbqOArEMJw_7OMGCMhb'      # clave pública (solo lee)
TYPE = {'Shoot': 'Tiro', 'Dribble': 'Regate', 'Block': 'Bloqueo', 'Catch': 'Parada'}
FIELDS = 'id,name,name_es,type,cost,cost_game,source,balance_tp,balance_power_min,balance_power_max'


def norm(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


def cost_class(c):
    """'85 (GO3)' → (85, 'GO3') · 90 (solo el número) → (90, None) · '—' / vacío → None (técnica solo de Victory Road)"""
    m = re.match(r'(\d+)\s*\((\w+)\)', str(c or ''))
    if m:
        return int(m.group(1)), m.group(2)
    try:
        return int(float(c)), None
    except (TypeError, ValueError):
        return None


def read_sheet(path):
    import openpyxl
    ws = openpyxl.load_workbook(path, data_only=True)['Sheet2']
    rows = []
    for i, r in enumerate(ws.iter_rows(min_row=2, values_only=True)):
        if r[0] is None or r[2] is None:
            continue
        rows.append({'name': str(r[0]).strip(), 'type': r[1], 'tp': int(r[2]), 'mn': r[3], 'mx': r[4], 'cost': cost_class(r[5]), 'cands': []})
    return rows


def read_db(path):
    if path:
        return json.load(open(path, encoding='utf-8'))
    out = subprocess.run(['curl', '-sS', f'{SUPABASE}?select={FIELDS}&order=id&limit=5000', '-H', f'apikey: {KEY}'], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def main(xlsx, db_path=None):
    rows = read_sheet(xlsx)
    db = read_db(db_path)
    base = [d for d in db if d.get('source') is None]            # las filas de la carga (no las añadidas a mano)
    byid = {d['id']: d for d in base}

    # la escala TP → (mín., máx.): el par más repetido de la hoja para cada TP
    pairs = collections.defaultdict(collections.Counter)
    for r in rows:
        if r['mn'] is not None and r['mx'] is not None:
            pairs[r['tp']][(int(r['mn']), int(r['mx']))] += 1
    scale = {tp: c.most_common(1)[0][0] for tp, c in pairs.items()}
    stale = lambda r: r['mn'] is None or scale[r['tp']] != (int(r['mn']), int(r['mx']))

    def keys(d):
        return {norm(d[f]) for f in ('name_es', 'name') if d.get(f)}

    def of_cost(d, cc):
        if cc is None:
            return d['cost'] is None
        return d['cost'] == cc[0] and (cc[1] is None or d['cost_game'] == cc[1])

    # 1) por nombre + tipo + coste (si el tipo no cuadra, solo nombre + coste)
    for r in rows:
        by_name = [d for d in base if norm(r['name']) in keys(d) and of_cost(d, r['cost'])]
        exact = [d for d in by_name if TYPE.get(d['type']) == r['type']]
        r['cands'] = [d['id'] for d in (exact or by_name)]
        r['note'] = '' if exact or not by_name else f"tipo distinto en la hoja ({r['type']}) y en la tabla"
    # 2) sin nombre que cuadre: por tipo + coste entre las técnicas que aún no tienen pareja (solo si es única)
    used = {i for r in rows for i in r['cands']}
    for r in rows:
        if r['cands'] or r['cost'] is None:
            continue
        free = [d for d in base if d['id'] not in used and of_cost(d, r['cost']) and TYPE.get(d['type']) == r['type']]
        if len(free) == 1:
            r['cands'] = [free[0]['id']]
            r['note'] = f"cruzada por tipo y coste: la tabla la llama «{free[0]['name_es'] or free[0]['name']}»"
            used.add(free[0]['id'])

    assign, notes = {}, []
    groups = collections.defaultdict(list)
    for r in rows:
        groups[tuple(sorted(r['cands']))].append(r)
    for cands, rs in groups.items():
        if not cands:
            continue
        name = rs[0]['name']
        tps = {r['tp'] for r in rs}
        if len(rs) == 1 or len(tps) == 1:
            for i in cands:
                assign[i] = rs[0]['tp']
            if len(cands) > 1:
                notes.append((name, f"una fila de la hoja para {len(cands)} variantes ({', '.join(cands)}): TP {rs[0]['tp']} en todas"))
            if rs[0]['note']:
                notes.append((name, rs[0]['note']))
        elif len(cands) == len(rs):
            order = sorted(cands, key=lambda i: (-(byid[i]['balance_tp'] or 0), i))
            for i, r in zip(order, sorted(rs, key=lambda r: -r['tp'])):
                assign[i] = r['tp']
            notes.append((name, f"{len(rs)} filas y {len(cands)} variantes: emparejadas por orden de TP ({', '.join(f'{i}→{assign[i]}' for i in order)})"))
        else:
            cur = byid[cands[0]]['balance_tp']
            edited = [r for r in rs if stale(r)]
            same = [r for r in rs if r['tp'] == cur]
            pick, why = ((edited[0], 'la fila con la potencia sin actualizar (editada)') if len(edited) == 1
                         else (same[0], 'la que ya tenía la tabla') if same else (max(rs, key=lambda r: r['tp']), 'la de más TP'))
            for i in cands:
                assign[i] = pick['tp']
            notes.append((name, f"la hoja la repite con TP {sorted(tps, reverse=True)}; elegido {pick['tp']} ({why}); en la tabla tenía {cur}"))

    out = {'scale': {str(k): list(v) for k, v in sorted(scale.items())},
           'techniques': {i: [tp, *scale[tp]] for i, tp in sorted(assign.items())}}
    with open(os.path.join(ROOT, 'data', 'technique_balance.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)

    # informe
    unmatched = [r for r in rows if not r['cands']]
    no_row = [d for d in base if d['id'] not in assign]
    fixed = [r for r in rows if r['cands'] and stale(r)]
    changed = [i for i, tp in assign.items() if byid[i]['balance_tp'] != tp]
    L = ['# TP balanceado de las técnicas (hoja «Sheet2» → Supabase)', '',
         'Generado por `tools/db/balance_xlsx.py`. Se carga con `supabase/technique_balance.sql` (columnas `balance_tp`, '
         '`balance_power_min`, `balance_power_max` de `techniques`); la app enseña `balance_tp` como el TP de la técnica.', '',
         '## Resumen', '',
         f'- Filas de la hoja: {len(rows)} · técnicas de la tabla con valor nuevo: {len(assign)} (de ellas, con TP distinto al anterior: {len(changed)})',
         f'- Filas con la potencia sin actualizar y corregida por la escala: {len(fixed)}',
         f'- Filas de la hoja sin pareja en la tabla: {len(unmatched)} · técnicas de la tabla sin fila en la hoja (se quedan como estaban): {len(no_row)}', '',
         '## Escala TP → potencia', '', '| TP | Mínima | Máxima | Filas de la hoja que la cumplen |', '|---|---|---|---|']
    for tp, (mn, mx) in sorted(scale.items()):
        L.append(f'| {tp} | {mn} | {mx} | {pairs[tp][(mn, mx)]} de {sum(pairs[tp].values())} |')
    L += ['', '## Casos dudosos (revisar)', ''] + [f'- **{n}**: {t}' for n, t in sorted(notes)]
    L += ['', '## Filas de la hoja sin pareja en la tabla (no se ha cambiado nada)', ''] + [f"- {r['name']} ({r['type']}, coste {r['cost'] or '—'}) · TP {r['tp']}" for r in unmatched]
    L += ['', '## Técnicas de la tabla sin fila en la hoja (se quedan como estaban)', ''] + [f"- `{d['id']}` · {d['name_es'] or d['name']} ({TYPE.get(d['type'])}) · TP {d['balance_tp']}" for d in no_row]
    with open(os.path.join(ROOT, 'docs', 'balance-tp.md'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(L) + '\n')
    print(f'{len(rows)} filas · asignadas {len(assign)} · sin pareja {len(unmatched)} · dudosas {len(notes)} · TP distinto {len(changed)} · potencia corregida {len(fixed)}')


if __name__ == '__main__':
    args = sys.argv[1:]
    db = args[args.index('--db') + 1] if '--db' in args else None
    main(args[0], db)
