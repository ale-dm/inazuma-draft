"""Stats de las cartas a partir del balance del mod de Victory Road (EditorMods/balance.py).

data/stats_mod.json guarda, por carta, las 7 stats finales del mod (nivel 200), la media con la que se
calcularon, el crecimiento y la libertad. Aquí se reescalan a la media (OVR) de la carta, se pasan a
nivel 40 (la curva de Character Reforged) y se guardan como stats40. Las 6 stats del motor se calculan
con esas 7 (mismas fórmulas de duelo del juego), normalizadas por puesto a la escala 25-99 de la app y
ajustadas para que su media ponderada siga siendo el OVR.

Nivel 40: factor 1,50/1,35/1,25 (slow/normal/fast), exponente 1,6/1,0/0,6:
  v99 = round(v200 / factor) · lv1 = round(v99 * 0,10) · v40 = round(lv1 + (v99 - lv1) * (39/98)^exp)
"""
import collections
import json
import math
import os

from common import ROOT

KEYS = ('shooting', 'control', 'physical', 'speed', 'defense', 'goalkeeping')
# Pesos de la media en las 6 stats de la app (los mismos de la curva de Ares/VR)
APP_W = {'FW': {'shooting': .5, 'control': .2, 'speed': .15, 'physical': .15},
         'MF': {'control': .4, 'speed': .2, 'shooting': .2, 'defense': .1, 'physical': .1},
         'DF': {'defense': .5, 'physical': .25, 'speed': .15, 'control': .1},
         'GK': {'goalkeeping': .6, 'physical': .2, 'defense': .2}}
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


def _shape(s):
    k, c, t, p, ph, a, i = s
    return {'shooting': k + c, 'control': c + t + .5 * k,
            'defense': ((i + t + .5 * a) + (p + i) + (ph + p)) / 3,
            'physical': ph + i, 'speed': a, 'goalkeeping': 4 * a + 3 * ph + 2 * p}


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
    base = {}
    for c in cards:
        v = src.get(c['id'])
        if not v or c['position'] not in ROLES or len(v.get('stats') or []) != 7:
            continue
        med = c['ovr']
        s200 = [x * math.exp(_weight(c['position'], i) * lt * (med - v.get('media', med)))
                for i, x in enumerate(v['stats'])]
        s40 = [at_level(x, v.get('growth', 1)) for x in s200]
        c['stats40'] = s40
        c['growth'] = v.get('growth', 1)
        c['freedom'] = v.get('freedom')
        base[c['id']] = _shape(s40)
    if not base:
        report.append('stats_mod: ninguna carta con datos del mod')
        return
    # normalización por puesto: cada stat conserva la media que tenía la app (escala 25-99)
    sb = collections.defaultdict(lambda: collections.Counter())
    sr = collections.defaultdict(lambda: collections.Counter())
    for c in cards:
        b = base.get(c['id'])
        if not b:
            continue
        for k in KEYS:
            sb[c['position']][k] += c['stats'][k]
            sr[c['position']][k] += b[k]
    norm = {p: {k: (sb[p][k] / sr[p][k] if sr[p][k] else 1) for k in KEYS} for p in sb}
    for c in cards:
        b = base.get(c['id'])
        if not b:
            continue
        s = {k: b[k] * norm[c['position']][k] for k in KEYS}
        w = APP_W[c['position']]
        for _ in range(8):
            off = c['ovr'] - sum(s[k] * wt for k, wt in w.items())
            s = {k: max(25, min(99, s[k] + off)) for k in KEYS}
            if abs(off) < .01:
                break
        c['stats'] = {k: int(round(v)) for k, v in s.items()}
    report.append(f'stats_mod: {len(base)} cartas con las stats del mod (nivel {LEVEL}, IE1-3)')
