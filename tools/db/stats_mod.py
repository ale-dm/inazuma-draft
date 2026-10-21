"""Stats de la ficha desde el balance del mod de Victory Road (EditorMods/balance.py).

data/stats_mod.json guarda, por carta, las 7 stats finales del mod (nivel 200), la media con la que se
calcularon, el crecimiento y la libertad. Aquí se reescalan a la media (OVR) de la carta y se pasan a
nivel 40 (la curva de Character Reforged); el resultado se guarda como stats40, que es lo que enseña la
ficha (7 stats, letras y duelos). Las 6 stats del motor NO se tocan: el duelo/simulación de la app sigue
con su balance.

Nivel 40: factor 1,50/1,35/1,25 (slow/normal/fast), exponente 1,6/1,0/0,6:
  v99 = round(v200 / factor) · lv1 = round(v99 * 0,10) · v40 = round(lv1 + (v99 - lv1) * (39/98)^exp)
"""
import json
import math
import os

from common import ROOT

# Roles del mod (7 stats): principal 1,0 · secundaria 0,5 · resto 0,15
ROLES = {'FW': {'main': [0, 1], 'sec': [2, 4, 5]},
         'MF': {'main': [1, 2, 5], 'sec': [0, 6, 4]},
         'DF': {'main': [3, 4, 5], 'sec': [2, 6]},
         'GK': {'main': [6, 4, 3], 'sec': [5]}}
W_MAIN, W_SEC, W_REST = 1.0, 0.5, 0.15
TOP, SPAN = 1.70, 31
LEVEL = 40
DEFAULTS = {'enabled': True}


def _weight(pos, i):
    r = ROLES[pos]
    return W_MAIN if i in r['main'] else W_SEC if i in r['sec'] else W_REST


def at_level(v200, growth, level=LEVEL):
    growth = 1 if growth not in (0, 1, 2) else growth
    factor = {0: 1.50, 1: 1.35, 2: 1.25}[growth]
    exp = {0: 1.6, 1: 1.0, 2: 0.6}[growth]
    v99 = round(v200 / factor)
    lv1 = round(v99 * 0.10)
    return round(lv1 + (v99 - lv1) * ((level - 1) / 98) ** exp)


def apply_stats_mod(cards, ov, report):
    cfg = dict(DEFAULTS)
    cfg.update({k: v for k, v in (ov.get('stats_mod') or {}).items() if not k.startswith('_')})
    if not cfg.get('enabled'):
        return
    path = os.path.join(ROOT, 'data', 'stats_mod.json')
    if not os.path.exists(path):
        report.append('stats_mod: falta data/stats_mod.json')
        return
    with open(path, encoding='utf-8') as f:
        src = json.load(f)['cards']
    lt = math.log(TOP) / SPAN
    n = 0
    for c in cards:
        v = src.get(c['id'])
        if not v or c['position'] not in ROLES or len(v.get('stats') or []) != 7:
            continue
        med = c['ovr']
        s200 = [x * math.exp(_weight(c['position'], i) * lt * (med - v.get('media', med)))
                for i, x in enumerate(v['stats'])]
        c['stats40'] = [at_level(x, v.get('growth', 1)) for x in s200]
        c['growth'] = v.get('growth', 1)
        c['freedom'] = v.get('freedom')
        n += 1
    if not n:
        report.append('stats_mod: ninguna carta con datos del mod')
        return
    # Las 6 stats del motor NO se tocan: el duelo/simulación de la app sigue con su balance.
    report.append(f'stats_mod: {n} cartas con las stats del mod (nivel {LEVEL}; IE1-3 del balance instalado, el resto del cálculo con todas las sagas)')
