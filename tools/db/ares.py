"""Cartas de Ares (Ares no Tenbin) y Orion (Orion no Kokuin) a partir de zukan, Victory Road y la wiki. Lo llama build.py.

Una carta por ficha de zukan de jugador de ese juego, con su nº oficial (si la ficha es de los dos juegos, la de Orion
lleva un nº propio) y en su equipo de ese juego:
  - Ares: el primero de su ficha que no sea Inazuma Japón (que es de Orion).
  - Orion: Inazuma Japón si lo tiene (así los de Ares tienen sus dos versiones); si no, su equipo de Orion.

Nota:
  1. Banda por el tier de potencial del juego (clave de stats de Victory Road, 0–3; data/roadtoultimate).
  2. Posición en la banda = percentil (en su posición) de 0,6·mejor técnica + 0,4·media de sus 3 mejores
     (potencia máx. de Victory Road; data/azalee); +1 si tiene una técnica de 640 o más.
  3. Los que tienen versión héroe/basara en el juego (protagonistas de Ares: Sonny, Elliot, Heath): suelo de Top.
  4. Personajes de sagas anteriores: media con la nota de su carta de IE2 / IE3 (o la primera que tengan), salvo Shawn.
  5. Ares es IE2 en otra línea temporal y Orion es IE3: las notas se reparten con la curva de los equipos de ese juego.
Stats de la carta: forma de su plantilla de Victory Road (fórmulas de docs/victory-road-stats.md) + tipo de sus
técnicas, repartidas alrededor de la nota como en los clásicos; la stat principal de su posición es la más alta.
raw_stats: su plantilla de Victory Road a nivel 50 × el multiplicador de la rareza de su categoría
(Común = Normal ×1,0 · Creciente = Grimpant ×1,1 · Avanzado = Expérimenté ×1,2 · Top = Émérite ×1,3 · Legendario ×1,4).
"""
import collections
import json
import os
import re
import statistics as stt

CFG = {
    'ARES': dict(label='Ares', ref='IE2', data='ares.json', module='PlayerData_AT.lua',
                 mark=r"Desde Ares\s*=|Inazuma Eleven Ares'|\{\{Medio\|A\|AR\}\}", words=('Ares',), other=('Orion', 'Orión')),
    'ORION': dict(label='Orion', ref='IE3', data='orion.json', module='PlayerData_OK.lua',
                  mark=r"Desde Orion\s*=|Desde Orión\s*=|Inazuma Eleven Orion'|\{\{Medio\|A\|OR\}\}", words=('Orion', 'Orión'), other=('Ares',)),
}
KEYS = ['kick', 'control', 'technique', 'pressure', 'physical', 'agility', 'intelligence']
VR_KEYS = ['Kick', 'Control', 'Technique', 'Pressure', 'Physical', 'Agility', 'Intelligence']
BAND = {3: (74, 86), 2: (68, 80), 1: (61, 74), 0: (54, 68)}          # por tier de potencial de VR
NO_ANCHOR = {'Fubuki Shirou'}                                         # Shawn: su versión de Ares va sola
CAT_TYPE = {'Tir': 'Shoot', 'Dribble': 'Dribble', 'Défense': 'Block', 'Arrêt': 'Catch'}
FR_ELEMENT = {'Feu': 'fire', 'Vent': 'air', 'Montagne': 'earth', 'Forêt': 'wood', 'Bois': 'wood'}
W = {'FW': {'shooting': .5, 'control': .2, 'speed': .15, 'physical': .15},
     'MF': {'control': .4, 'speed': .2, 'shooting': .2, 'defense': .1, 'physical': .1},
     'DF': {'defense': .5, 'physical': .25, 'speed': .15, 'control': .1},
     'GK': {'goalkeeping': .6, 'physical': .2, 'defense': .2}}
CAT_OF_STAT = {'shooting': 'Tir', 'control': 'Dribble', 'defense': 'Défense', 'goalkeeping': 'Arrêt', 'physical': 'Défense', 'speed': 'Dribble'}
RARITY_BY_OVR = (('legendaire', 89), ('emerite', 83), ('experimente', 75), ('grimpant', 65), ('normal', 0))

norm = lambda s: re.sub(r'[\W_]+', '', (s or '').replace('*', '').lower())
slug = lambda s: re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')


def _clean(txt):
    txt = re.sub(r'<nowiki>\s*</nowiki>|<br\s*/?>|\{\{[^}]*\}\}|\'{2,}', ' ', txt)
    txt = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', txt)
    return re.sub(r'\s+', ' ', txt).strip(' *:')


def es_ares_desc(section, ares_only, words=('Ares',), other=('Orion', 'Orión')):
    """descripción en castellano de la versión de Ares. Wiki española: plantillas de Victory Road (IEHVR) y SD (IESD).
    1) el texto marcado «Ares:» (en SD o en Victory Road); 2) si el personaje solo es de Ares: el de SD o el primero de VR"""
    if not section:
        return None
    blocks = {}
    for tpl in ('IESD', 'IEHVR'):
        m = re.search(r'\|\s*Descripci[oó]n ' + tpl + r'\s*=', section)
        if not m:
            continue
        i, depth = m.end(), 1                                # hasta el }} que cierra la plantilla (hay plantillas anidadas)
        while i < len(section) and depth:
            if section.startswith('{{', i):
                depth, i = depth + 1, i + 2
            elif section.startswith('}}', i):
                depth, i = depth - 1, i + 2
            else:
                i += 1
        blocks[tpl] = section[m.end():i - 2]
    for tpl in ('IESD', 'IEHVR'):
        a = re.search(r"'{2,}\s*(?:" + '|'.join(words) + r")\s*'{2,}\s*:?\s*(?:<br\s*/?>)?(.*?)(?:\n-{4}|\n\*\s*'{2,}|$)", blocks.get(tpl, ''), re.S)
        if a and len(_clean(a.group(1))) > 10:
            return _clean(a.group(1))
    if not ares_only:
        return None
    sd = blocks.get('IESD', '').split('----')[-1]
    if len(_clean(sd)) > 10 and not any(w in sd for w in other):
        return _clean(sd)
    for line in blocks.get('IEHVR', '').split('\n'):
        line = re.sub(r"^\*?\s*'{2,}[^']*'{2,}\s*:", '', line.strip())      # «*'''Beta 1.0.0''':» fuera
        if len(_clean(line)) > 10:
            return _clean(line)
    return None


ICON_TYPE = {'TI': 'Shoot', 'RE': 'Dribble', 'BL': 'Block', 'AT': 'Catch',
             'tiro': 'Shoot', 'regate': 'Dribble', 'bloqueo': 'Block', 'atajo': 'Catch', 'parada': 'Catch'}
def anime_ares_moves(section, game='ARES'):
    """supertécnicas del anime de Ares (wiki española, «Supertécnicas → Anime → Desde Ares»; en los clásicos es el
    bloque de la segunda línea temporal) → [(nombre en castellano, tipo)]"""
    anime = (section or '').split('===Videojuegos')[0]
    m = re.search(CFG[game]['mark'], anime)
    tok = ('AR', 'Ares') if game == 'ARES' else ('OR', 'Orion', 'Orión')
    if not m:
        return []
    out, started = [], False
    for line in anime[m.end():].split('\n')[1:] if not anime[m.end():].startswith('\n') else anime[m.end():].split('\n')[1:]:
        line = line.strip()
        if not line.startswith('*'):
            if started or (line and 'Desde' in line and not any(t_ in line for t_ in tok)):
                break
            continue
        started = True
        if '(Errónea)' in line:
            continue
        link = next((l for l in re.findall(r'\[\[([^\]]+)\]\]', line) if not l.lower().startswith(('archivo:', 'file:'))), None)
        if not link:
            continue
        ic = re.search(r'\{\{ST\|T\|(\w+)\}\}|Archivo:(\w+)\.gif', line, re.I)
        typ = ICON_TYPE.get(ic.group(1) or ic.group(2).lower()) if ic else None
        out.append((link.split('|')[0].strip(), typ))
    return out


def build(root, cache, zukan, zdesc, page_of, classic_cards, techniques, es_by_jp, es_by_en, norm_jp, zskills, zskills_en,
          element_map, zukan_team, category, es_desc, report, game='ARES', ares_cards=()):
    """→ (cartas de ese juego, personajes nuevos {id: fila})"""
    cfg, GAME = CFG[game], game
    D = os.path.join(root, 'data')
    AZ = {x['zukan_id']: x for x in json.load(open(os.path.join(D, 'azalee', cfg['data']), encoding='utf-8'))}
    SK = json.load(open(os.path.join(D, 'azalee', 'skills.json'), encoding='utf-8'))
    TAB = json.load(open(os.path.join(D, 'roadtoultimate', 'stat_tables.json'), encoding='utf-8'))
    RTU = collections.defaultdict(list)
    for x in json.load(open(os.path.join(D, 'roadtoultimate', cfg['data']), encoding='utf-8')):
        RTU[x['zukan_id']].append(x)
    moves = json.load(open(os.path.join(cache, 'moves.json'), encoding='utf-8'))
    moves.update(json.load(open(os.path.join(D, 'azalee', 'wiki_moves_ares_orion.json'), encoding='utf-8')))
    wz_page = dict(re.findall(r'\n\t(\w+)=\{\n\t\tpage="([^"]+)"', open(os.path.join(cache, 'WazaData.lua'), encoding='utf-8').read()))
    # técnicas de VR de la forma de ese juego en la wiki inglesa (Orion: módulo OK y, si no, el de Ares)
    AT = ''.join(open(os.path.join(cache, m_), encoding='utf-8').read() for m_ in (cfg['module'], 'PlayerData_AT.lua')
                 if os.path.exists(os.path.join(cache, m_)))

    # técnicas de VR: por nombre japonés / inglés (nombre repetido: la versión más común, nunca la Mixi Max "_mm")
    az_en, az_ja = {}, {}
    for code, v in sorted(SK.items(), key=lambda kv: (kv[0].endswith('_mm'), -kv[1].get('uses', 0))):
        if v.get('max'):
            az_en.setdefault(norm(v['name_en']), code)
            az_ja.setdefault(norm(v['name_ja']), code)

    def az_skill(mid):
        pg = wz_page.get(mid) or mid
        mv = moves.get(pg) or {}
        return az_ja.get(norm(mv.get('name_jp'))) or az_en.get(norm(pg)) or az_en.get(norm(mv.get('name_dub')))

    # técnica de VR → técnica de la base (la misma si ya existe por nombre japonés; si no, una nueva "vr_<código>")
    by_jp = {norm_jp(t['name_jp']): t for t in techniques.values() if t and t.get('name_jp')}

    def technique_vr(code):
        v = SK[code]
        t = by_jp.get(norm_jp(v.get('name_ja')))
        if t:
            return t
        tid = 'vr_' + code
        if tid not in techniques:
            zs_ = zskills.get(norm_jp(v.get('name_ja'))) or zskills_en.get(re.sub(r'[^a-z0-9]', '', (v.get('name_en') or '').lower()))
            techniques[tid] = {'id': tid, 'name': v.get('name_en') or v.get('name_fr'), 'name_jp': v.get('name_ja'),
                               'name_es': es_by_jp.get(norm_jp(v.get('name_ja'))) or es_by_en.get((v.get('name_en') or '').lower()),
                               'type': CAT_TYPE.get(v['category']), 'element': FR_ELEMENT.get(v.get('element')),
                               'cost': None, 'cost_game': None, 'costs': {'VR_power': v.get('max')},
                               'description': zs_ and zs_.get('description'), 'image_url': zs_ and zs_.get('image'),
                               'zukan_types': zs_ and zs_.get('types')}
        return techniques[tid]

    by_es = {norm(t['name_es']): t for t in techniques.values() if t and t.get('name_es')}
    es_to_jp = {}
    for jp_, es_ in es_by_jp.items():
        es_to_jp.setdefault(norm(es_), jp_)
    az_jp, az_fr = {}, {}
    for code, v in sorted(SK.items(), key=lambda kv: (kv[0].endswith('_mm'), -kv[1].get('uses', 0))):
        if v.get('max'):
            az_jp.setdefault(norm_jp(v.get('name_ja')), code)
            az_fr.setdefault(norm(v.get('name_fr')), code)

    def technique_es(name, typ):
        """supertécnica por su nombre en castellano: la de la base, la de VR (por el japonés) o una nueva solo con ese nombre"""
        t = by_es.get(norm(name))
        if t:
            return t
        jp = es_to_jp.get(norm(name))
        t = by_jp.get(jp) if jp else None
        if not t and jp in az_jp:
            t = technique_vr(az_jp[jp])
        if t:
            t['name_es'] = t.get('name_es') or name
            return t
        tid = 'es_' + slug(name)
        techniques.setdefault(tid, {'id': tid, 'name': name, 'name_es': name, 'name_jp': None, 'type': typ, 'element': None,
                                    'cost': None, 'cost_game': None, 'costs': {}, 'description': None, 'image_url': None,
                                    'zukan_types': None})
        return techniques[tid]

    def rtu_moves(zid):
        """Road to Ultimate, la ficha de Ares del personaje: técnicas comunes + rama principal (nombres en francés)"""
        x = next((x for x in RTU.get(zid, []) if x['type'] == 'normal'), None)
        if not x:
            return []
        names = [n for k in ('commonTechniqueIds', 'baseBranchTechniqueIds') for s_ in (x['techniques'].get(k) or [])
                 for n in re.findall(r'\s*([^|]+?)\s*\(Lv\d+\)', s_)]
        return [technique_vr(az_fr[norm(n)]) for n in dict.fromkeys(names) if norm(n) in az_fr]

    at_by_page = {}
    for m in re.finditer(r'\n\t(\w+)=\{\n\t\tpage="([^"]+)"(.*?)\n\t\}', AT, re.S):
        vm = re.search(r'\n\t\t\tVR=\{(.*?)\n\t\t\t\}', m.group(3), re.S)
        if vm:
            at_by_page.setdefault(m.group(2), [x for x, _ in re.findall(r'\{"(\w+)",(\d+)', vm.group(1))])
    tmpl_common = {}
    for pos in ('FW', 'MF', 'DF', 'GK'):
        cnt = collections.Counter(tuple(x['lv99'][k] for k in KEYS) for x in AZ.values() if x['position'] == pos and x['rarity_code'] == 0)
        tmpl_common[pos] = dict(zip(KEYS, cnt.most_common(1)[0][0]))
    ref_card = {}                                     # carta de referencia: la de IE2 (Ares) / IE3 (Orion) si la tiene; si no, la primera
    order = ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3']
    for c in sorted(classic_cards, key=lambda c: (c['game'] != cfg['ref'], order.index(c['game']), c['is_version'])):
        ref_card.setdefault(c['character_id'], c)

    # equipos de Orion: los de las fichas que se estrenan en Orion (las compartidas con Ares traen también sus equipos de Ares)
    orion_teams = {t for z in zukan if 'ORION' in z['games'] and 'ARES' not in z['games'] for t in z['teams']}
    rows, no_tech = [], []
    for z in zukan:
        if GAME not in z['games'] or not z['role'].startswith('Player'):
            continue
        x = AZ.get(z['id'])
        pg = page_of(z)
        if x:
            codes = [s['code'] for s in x['skills'] if SK[s['code']].get('max')]
            st = x['lv99']
        else:
            codes = [c for c in dict.fromkeys(az_skill(mid) for mid in at_by_page.get(pg, [])) if c]
            st = tmpl_common[z['position']]
        sk = list({SK[c]['name_en']: SK[c] | {'code': c} for c in sorted(codes, key=lambda c: SK[c]['max'])}.values())
        if not sk:
            no_tech.append(z['name'])
        top = sorted((s['max'] for s in sk), reverse=True)
        rx = RTU.get(z['id'], [])
        key = next((x_['stat_key'] for x_ in rx if x_['type'] == 'normal' and x_.get('stat_key')), None)
        if game == 'ARES':
            team = next((t for t in z['teams'] if t != 'Inazuma National'), z['teams'][0] if z['teams'] else 'Unaffiliated')
        else:                                         # Orion: Inazuma Japón primero; si no, su equipo de Orion
            team = 'Inazuma National' if 'Inazuma National' in z['teams'] else \
                next((t for t in z['teams'] if t in orion_teams), z['teams'][0] if z['teams'] else 'Unaffiliated')
        rows.append(dict(z=z, page=pg, pos=z['position'], team=zukan_team.get(team, team), st=st, key=key,
                         vtier=int(key[-1]) if key else 0, hero=any(x_['type'] in ('hero', 'basara') for x_ in rx),
                         best=top[0] if top else 0, top3=stt.mean(top[:3]) if top else 0,
                         cats={c: max((s['max'] for s in sk if s['category'] == c), default=0) for c in CAT_TYPE},
                         skills=sorted(sk, key=lambda s: -s['max'])))
    if no_tech:
        report.append(f"{cfg['label']}: jugadores sin supertécnicas de VR ({len(no_tech)}): " + ', '.join(no_tech))

    # 1–4: nota propia
    for pos in ('FW', 'MF', 'DF', 'GK'):
        g = [r for r in rows if r['pos'] == pos]
        sc = sorted(0.6 * r['best'] + 0.4 * r['top3'] for r in g)
        for r in g:
            s = 0.6 * r['best'] + 0.4 * r['top3']
            q = (sum(1 for v in sc if v < s) + 0.5 * sum(1 for v in sc if v == s)) / len(sc)
            lo, hi = BAND[r['vtier']]
            r['ovr'] = round(lo + (hi - lo) * q + (1 if r['best'] >= 640 else 0))
            if r['hero']:
                r['ovr'] = max(r['ovr'], 84)
            fc = ref_card.get(slug(r['page'])) if r['page'] and r['page'] not in NO_ANCHOR else None
            r['anchor'] = fc and fc['id']
            r['ovr_mix'] = round((r['ovr'] + fc.get('ovr_untuned', fc['ovr'])) / 2) if fc else r['ovr']   # sin el ajuste de team_tuning
    # 5: curva de los equipos de IE2 / IE3 (mismo orden)
    ref = sorted(c.get('ovr_untuned', c['ovr']) for c in classic_cards if c['game'] == cfg['ref'] and c['team'] not in ('Unaffiliated', 'Sub Character'))
    src = sorted(r['ovr_mix'] for r in rows)
    for r in rows:
        v = r['ovr_mix']
        q = (sum(1 for s in src if s < v) + 0.5 * sum(1 for s in src if s == v)) / len(src)
        r['final'] = ref[min(len(ref) - 1, int(q * (len(ref) - 1) + .5))]

    # stats de la carta
    def shape(s):
        k, c, t, p, ph, a, i = (s[x] for x in KEYS)
        return {'shooting': k + c, 'control': c + t + .5 * k, 'defense': ((i + t + .5 * a) + (p + i) + (ph + p)) / 3,
                'physical': ph + i, 'speed': a, 'goalkeeping': 4 * a + 3 * ph + 2 * p}
    zs_ = lambda xs, v: (v - stt.mean(xs)) / (stt.pstdev(xs) or 1)
    for pos in ('FW', 'MF', 'DF', 'GK'):
        g = [r for r in rows if r['pos'] == pos]
        shs = [shape(r['st']) for r in g]
        comb = [{k: zs_([x[k] for x in shs], sh[k]) + 0.8 * zs_([g2['cats'][CAT_OF_STAT[k]] for g2 in g], r['cats'][CAT_OF_STAT[k]])
                 for k in sh} for r, sh in zip(g, shs)]
        main = max(W[pos], key=W[pos].get)
        for r, cb in zip(g, comb):
            o = r['final']
            q = {k: (sum(1 for x in comb if x[k] < cb[k]) + 0.5 * sum(1 for x in comb if x[k] == cb[k])) / len(comb) for k in cb}
            raw = {k: o + 14 * (q[k] - 0.5) for k in cb}
            off = o - sum(raw[k] * w for k, w in W[pos].items())
            stt_ = {k: max(25, min(99 if k == main else o + 4, round(raw[k] + off if k in W[pos] else raw[k] - 3))) for k in raw}
            stt_[main] = max(stt_[main], min(99, o + 2))
            r['stats'] = {k: v if k == main else min(v, stt_[main] - 1) for k, v in stt_.items()}

    cards, new_chars = [], {}
    classic_ids = {c['character_id'] for c in classic_cards}
    ares_nos = {c['zukan_no'] for c in ares_cards}          # ficha de Ares y Orion: el nº oficial es de la carta de Ares
    move_src = collections.Counter()
    basic_jp = {norm_jp(v['name_ja']) for v in SK.values() if v.get('max') == 200 and v.get('name_ja')}
    seen = collections.Counter()
    for r in rows:
        z = r['z']
        char_id = slug(r['page']) if r['page'] else slug(z['name'])
        seen[char_id] += 1
        ver = 'base' if seen[char_id] == 1 else r['team']            # 2ª ficha de Ares del mismo personaje (Hunter Foster)
        rar = next(n for n, t in RARITY_BY_OVR if r['final'] >= t)
        mult = next(x['multiplierPct'] for x in TAB['rarities'] if x['name'] == rar) / 100
        tpl = TAB['templates'].get(r['key'] or '', {}).get('50') or [r['st'][k] for k in KEYS]
        es = es_desc.get(r['page']) or {} if r['page'] else {}
        moves = [technique_es(n, t_) for n, t_ in anime_ares_moves(es.get('techniques'), game)]
        src_m = 'anime'
        if not moves:
            moves, src_m = rtu_moves(z['id']), 'rtu'
        if not moves:
            moves, src_m = [technique_vr(s['code']) for s in r['skills']], 'vr'
        # fuera las técnicas básicas de VR (potencia base 30, máx. 200: Power Shot, Dust Kick, Heel Flick…)
        moves = [t for t in {id(t): t for t in moves}.values() if norm_jp(t.get('name_jp')) not in basic_jp]
        move_src[src_m] += 1
        # el Raimon de Ares es el de los nuevos: los del Raimon original que salen en Ares van a secundarios
        team = 'Sub Character' if game == 'ARES' and r['team'] == 'Raimon' and char_id in classic_ids else r['team']
        cards.append({
            'id': f"{char_id}--{game.lower()}--{slug(ver)}", 'character_id': char_id, 'page': r['page'], 'name': z['name'],
            'game': GAME, 'saga': 'IE', 'version': ver, 'team': team, 'position': r['pos'],
            'element': element_map.get(z['element']), 'ovr': r['final'], 'category': category(r['final']),
            'tier': {3: 'A', 2: 'A', 1: 'B', 0: 'C'}[r['vtier']],
            'source': f"Victory Road (tier {r['vtier']}{', héroe' if r['hero'] else ''}) + técnicas" + (f" + {r['anchor']}" if r['anchor'] else ''),
            'stats': r['stats'], 'image_url': f"https://dxi4wb638ujep.cloudfront.net/1/{z['id']}.png",
            'zukan_id': z['id'], 'zukan_no': z['no'], 'no': None if z['no'] in ares_nos else z['no'], 'is_version': ver != 'base', 'zukan': [z],
            'description': (zdesc.get(str(z['no'])) or {}).get('desc'),
            'description_es': es_ares_desc(es.get('section'), not r['anchor'] and char_id not in classic_ids, cfg['words'], cfg['other']),
            'specials': [], 'extra_teams': [], 'form_label': f'Victory Road Lv50 · {rar}', 'raw_keys': VR_KEYS,
            'raw': [round(v * mult) for v in tpl], 'moves': moves,
        })
        new_chars.setdefault(char_id, {'id': char_id, 'name': z['name'], 'wiki_page': r['page'], 'zukan_no': z['no']})
    report.append(f"{cfg['label']}: supertécnicas de la carta — " + ', '.join(f'{k} {v}' for k, v in move_src.items())
                  + f" (anime = wiki española «Desde {cfg['label']}»; rtu = Road to Ultimate, comunes + rama principal; vr = todas las de VR)")
    return cards, new_chars
