"""Muestra de notas de Ares (prototipo, no carga nada): python3 tools/db/ares_preview.py → build/ares_preview.csv

Nota: banda por el tier de potencial del juego (clave de stats de Victory Road, 0–3; data/roadtoultimate);
posición en la banda = percentil (en su posición) de 0,6·mejor técnica + 0,4·media de sus 3 mejores (potencia máx.
de Victory Road); +1 si tiene una técnica de 640 o más. Los que tienen versión héroe/basara en el juego
(protagonistas de Ares: Sonny, Elliot, Heath) tienen suelo de Top. Personajes de sagas anteriores: media con la nota de
su carta de IE2 (o la primera que tengan), salvo Shawn.
Stats: forma de su plantilla de VR (fórmulas de docs/victory-road-stats.md) + tipo de sus técnicas, repartidas
alrededor de la nota como en los clásicos. Stats de VR de la carta: su plantilla a nivel 50 × el multiplicador de la
rareza que corresponde a su categoría (Común = Normal ×1,0 … Legendario = Légendaire ×1,4).
"""
import collections, csv, json, os, re, statistics as stt

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
C = os.path.join(ROOT, 'tools', '.cache', 'db')
D = os.path.join(ROOT, 'data')
Z = json.load(open(os.path.join(D, 'zukan', 'chara_list.json')))
AZ = {x['zukan_id']: x for x in json.load(open(os.path.join(D, 'azalee', 'ares.json')))}
SK = json.load(open(os.path.join(D, 'azalee', 'skills.json')))
titles = json.load(open(os.path.join(C, 'redirects.json')))
moves = json.load(open(os.path.join(C, 'moves.json')))
moves.update(json.load(open(os.path.join(D, 'azalee', 'wiki_moves_ares_orion.json'))))
waza = open(os.path.join(C, 'WazaData.lua')).read()
AT = open(os.path.join(C, 'PlayerData_AT.lua')).read()
cards = json.load(open(os.path.join(ROOT, 'build', 'players.json')))['cards']
TAB = json.load(open(os.path.join(D, 'roadtoultimate', 'stat_tables.json')))
RTU = collections.defaultdict(list)
for x in json.load(open(os.path.join(D, 'roadtoultimate', 'ares.json'))):
    RTU[x['zukan_id']].append(x)
NO_ANCHOR = {'Fubuki Shirou'}                     # Shawn: su versión de Ares va sola

norm = lambda s: re.sub(r'[\W_]+', '', (s or '').replace('*', '').lower())
slug = lambda s: re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')
wz_page = dict(re.findall(r'\n\t(\w+)=\{\n\t\tpage="([^"]+)"', waza))
az_en, az_ja = {}, {}
for code, v in sorted(SK.items(), key=lambda kv: (kv[0].endswith('_mm'), -kv[1].get('uses', 0))):   # nombre repetido: la más común
    if v.get('max'):
        az_en.setdefault(norm(v['name_en']), code)
        az_ja.setdefault(norm(v['name_ja']), code)


def az_skill(mid):
    pg = wz_page.get(mid) or mid
    mv = moves.get(pg) or {}
    return az_ja.get(norm(mv.get('name_jp'))) or az_en.get(norm(pg)) or az_en.get(norm(mv.get('name_dub')))


at_by_page = {}
for m in re.finditer(r'\n\t(\w+)=\{\n\t\tpage="([^"]+)"(.*?)\n\t\}', AT, re.S):
    vm = re.search(r'\n\t\t\tVR=\{(.*?)\n\t\t\t\}', m.group(3), re.S)
    if vm:
        at_by_page.setdefault(m.group(2), [x for x, _ in re.findall(r'\{"(\w+)",(\d+)', vm.group(1))])
KEYS = ['kick', 'control', 'technique', 'pressure', 'physical', 'agility', 'intelligence']
tmpl_common = {}
for pos in ('FW', 'MF', 'DF', 'GK'):
    cnt = collections.Counter(tuple(x['lv99'][k] for k in KEYS) for x in AZ.values() if x['position'] == pos and x['rarity_code'] == 0)
    tmpl_common[pos] = dict(zip(KEYS, cnt.most_common(1)[0][0]))
first_card = {}                                   # carta de referencia: la de IE2 si la tiene; si no, la primera
for c in sorted(cards, key=lambda c: (c['game'] != 'IE2', ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3'].index(c['game']), c['version'] != 'base')):
    first_card.setdefault(c['character_id'], c)

rows = []
for z in Z:
    if 'ARES' not in z['games'] or not z['role'].startswith('Player'):
        continue
    x = AZ.get(z['id'])
    team = next((t for t in z['teams'] if t != 'Inazuma National'), '-')
    if x:
        sk = [SK[s['code']] | {'code': s['code']} for s in x['skills'] if SK[s['code']].get('max')]
        src, st, rar = 'azalee', x['lv99'], x['rarity']
    else:
        pg = titles.get(z['name'])
        sk = [SK[c] | {'code': c} for c in dict.fromkeys(az_skill(mid) for mid in at_by_page.get(pg, [])) if c]
        src, st, rar = ('wiki' if pg in at_by_page else '-'), tmpl_common[z['position']], 'Normal'
    sk = list({s['name_en']: s for s in sorted(sk, key=lambda s: s['max'])}.values())      # mismo nombre (otra versión): la más fuerte
    top = sorted((s['max'] for s in sk), reverse=True)
    rx = RTU.get(z['id'], [])
    norm_x = next((x for x in rx if x['type'] == 'normal'), None)
    key = (norm_x or {}).get('stat_key')
    rows.append(dict(key=key, vtier=int(key[-1]) if key else 0, hero=any(x['type'] in ('hero', 'basara') for x in rx),no=z['no'], name=z['name'], page=titles.get(z['name']), pos=z['position'], team=team, src=src, st=st, rar=rar,
                     tier='A' if 'Raimon' in z['teams'] else 'C' if team == 'Sub Character' else 'B',
                     best=top[0] if top else 0, top3=stt.mean(top[:3]) if top else 0,
                     cats={c: max((s['max'] for s in sk if s['category'] == c), default=0) for c in ('Tir', 'Dribble', 'Défense', 'Arrêt')},
                     skills=[f"{s['name_en']} ({s['max']})" for s in sorted(sk, key=lambda s: -s['max'])[:4]]))

BAND = {3: (74, 86), 2: (68, 80), 1: (61, 74), 0: (54, 68)}      # por tier de potencial de VR
for pos in ('FW', 'MF', 'DF', 'GK'):
    g = [r for r in rows if r['pos'] == pos]
    sc = sorted(0.6 * r['best'] + 0.4 * r['top3'] for r in g)
    for r in g:
        s = 0.6 * r['best'] + 0.4 * r['top3']
        q = (sum(1 for v in sc if v < s) + 0.5 * sum(1 for v in sc if v == s)) / len(sc)
        lo, hi = BAND[r['vtier']]
        r['ovr'] = round(lo + (hi - lo) * q + (1 if r['best'] >= 640 else 0))
        if r['hero']:
            r['ovr'] = max(r['ovr'], 84)                  # protagonistas de Ares (versión héroe/basara en el juego)
        fc = first_card.get(slug(r['page'])) if r['page'] and r['page'] not in NO_ANCHOR else None
        r['classic'] = f"{fc['game']} {fc['ovr']}" if fc else ''
        r['ovr_mix'] = round((r['ovr'] + fc['ovr']) / 2) if fc else r['ovr']


def shape(s):
    k, c, t, p, ph, a, i = (s[x] for x in KEYS)
    return {'shooting': k + c, 'control': c + t + .5 * k, 'defense': ((i + t + .5 * a) + (p + i) + (ph + p)) / 3,
            'physical': ph + i, 'speed': a, 'goalkeeping': 4 * a + 3 * ph + 2 * p}


W = {'FW': {'shooting': .5, 'control': .2, 'speed': .15, 'physical': .15}, 'MF': {'control': .4, 'speed': .2, 'shooting': .2, 'defense': .1, 'physical': .1},
     'DF': {'defense': .5, 'physical': .25, 'speed': .15, 'control': .1}, 'GK': {'goalkeeping': .6, 'physical': .2, 'defense': .2}}
CAT = {'shooting': 'Tir', 'control': 'Dribble', 'defense': 'Défense', 'goalkeeping': 'Arrêt', 'physical': 'Défense', 'speed': 'Dribble'}
SPREAD = 7
zs = lambda xs, v: (v - stt.mean(xs)) / (stt.pstdev(xs) or 1)
for pos in ('FW', 'MF', 'DF', 'GK'):
    g = [r for r in rows if r['pos'] == pos]
    shs = [shape(r['st']) for r in g]
    comb = [{k: zs([x[k] for x in shs], sh[k]) + 0.8 * zs([g2['cats'][CAT[k]] for g2 in g], r['cats'][CAT[k]]) for k in sh} for r, sh in zip(g, shs)]
    for r, cb in zip(g, comb):
        q = {k: (sum(1 for x in comb if x[k] < cb[k]) + 0.5 * sum(1 for x in comb if x[k] == cb[k])) / len(comb) for k in cb}
        raw = {k: r['ovr_mix'] + SPREAD * 2 * (q[k] - 0.5) for k in cb}
        off = r['ovr_mix'] - sum(raw[k] * w for k, w in W[pos].items())
        main = max(W[pos], key=W[pos].get)                  # su stat principal (Tiro, Control, Defensa, Parada) manda
        r['stats'] = {k: max(25, min(99 if k == main else r['ovr_mix'] + 4, round(raw[k] + off if k in W[pos] else raw[k] - 3))) for k in raw}
        r['stats'][main] = max(r['stats'][main], min(99, r['ovr_mix'] + 2))   # la stat principal de su posición, por encima de la nota
        r['stats'] = {k: v if k == main else min(v, r['stats'][main] - 1) for k, v in r['stats'].items()}   # y la más alta
        # stats de VR de la carta: plantilla Lv50 × rareza de su categoría
        rar = next(n for n, t in (('legendaire', 89), ('emerite', 83), ('experimente', 75), ('grimpant', 65), ('normal', 0)) if r['ovr_mix'] >= t)
        mult = next(x['multiplierPct'] for x in TAB['rarities'] if x['name'] == rar) / 100
        tpl = TAB['templates'].get(r['key'] or '', {}).get('50')
        r['vr_rarity'], r['vr_stats'] = rar, [round(v * mult) for v in tpl] if tpl else None

os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
with open(os.path.join(ROOT, 'build', 'ares_preview.csv'), 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    w.writerow(['no', 'nombre', 'equipo', 'pos', 'tier_vr', 'heroe', 'nota_ares', 'clasico', 'nota_final', 'tiro', 'control', 'fisico',
                'velocidad', 'defensa', 'parada', 'rareza_vr', 'stats_vr_lv50', 'tecnicas', 'fuente'])
    for r in sorted(rows, key=lambda r: (r['team'], -r['ovr_mix'])):
        s = r['stats']
        w.writerow([r['no'], r['name'], r['team'], r['pos'], r['vtier'], 'sí' if r['hero'] else '', r['ovr'], r['classic'], r['ovr_mix'], s['shooting'],
                    s['control'], s['physical'], s['speed'], s['defense'], s['goalkeeping'], r['vr_rarity'],
                    '/'.join(map(str, r['vr_stats'])) if r['vr_stats'] else '', ' · '.join(r['skills']), r['src']])
print(f"{len(rows)} jugadores de Ares → build/ares_preview.csv", collections.Counter(r['src'] for r in rows))
