#!/usr/bin/env python3
"""
Genera la base de jugadores a partir de la caché de tools/db/fetch.py.
Reglas: docs/plan-base-jugadores.md · Excepciones: data/overrides.json

Uso:  python3 tools/db/build.py
Salida:
  build/players.json   cartas completas (revisión / frontend)
  build/review.csv     hoja para revisar a mano
  build/report.txt     avisos: cruces de nombres que faltan, destacados sin encontrar…
  supabase/seed.sql    datos para Supabase (lo carga .github/workflows/db-load.yml)
"""
import bisect
import collections
import csv
import json
import os
import re

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'db')
OUT = os.path.join(ROOT, 'build')

MAIN = ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3']
MODULE = dict(zip(MAIN, ['IE', 'IE2', 'IE3', 'GO', 'CS', 'GX']))
TAB = {'Inazuma Eleven': 'IE1', 'Inazuma Eleven 2': 'IE2', 'Inazuma Eleven 3': 'IE3', 'Inazuma Eleven GO': 'GO1',
       'Inazuma Eleven GO 2: Chrono Stone': 'GO2', 'Inazuma Eleven GO Galaxy': 'GO3'}
ERA = dict(zip(MAIN, [0, 1, 2, 2, 3, 4]))
IEK = ['Kick', 'Body', 'Control', 'Guard', 'Speed', 'Stamina', 'Guts']
GOK = ['Kick', 'Dribbling', 'Technique', 'Block', 'Speed', 'Stamina', 'Catch']
ST = ['Kick', 'Control', 'Body', 'Speed', 'Guard', 'Catch']            # modelo común (nombres de Strikers)
OUT_NAMES = dict(zip(ST, ['shooting', 'control', 'physical', 'speed', 'defense', 'goalkeeping']))
POSW = {'FW': {'Kick': .5, 'Control': .2, 'Speed': .15, 'Body': .15},
        'MF': {'Control': .4, 'Speed': .2, 'Kick': .2, 'Guard': .1, 'Body': .1},
        'DF': {'Guard': .5, 'Body': .25, 'Speed': .15, 'Control': .1},
        'GK': {'Catch': .6, 'Body': .2, 'Guard': .2}}
RANK = {'S+': 92, 'S': 88, 'A+': 84, 'A': 80, 'B+': 76, 'B': 72, 'C+': 68, 'C': 64, 'D+': 60, 'D': 56, 'E': 48}
CATEGORIES = [('Legendary Player', 89), ('Top Player', 83), ('Advanced Player', 75), ('Growing Player', 65), ('Common Player', 0)]
BAND = {'A': (66, 84), 'B': (56, 77), 'C': (44, 72)}
CAP, CAP_C = 94, 80
CEIL = {'IE1': 85, 'IE2': 88, 'IE3': 91, 'GO1': 90, 'GO2': 93, 'GO3': 94}
ELEMENT = {'Fire': 'fire', 'Forest': 'wood', 'Wood': 'wood', 'Wind': 'air', 'Air': 'air', 'Mountain': 'earth', 'Earth': 'earth'}
SCOUT_TEAMS = {'Unaffiliated', 'Sub Character'}
EXCLUDED_FORMS = ('real inazuma', 'mixi max', 'mixi-max', 'miximax', 'child', 'keshin armed')
HISSATSU_TYPES = ('Shoot', 'Dribble', 'Block', 'Catch')
RANK_COST = {'IE': ('tp_ie3', 'tp_ie2', 'tp_ie'), 'GO': ('tp_iego3', 'tp_iego2', 'tp_iego')}
SHOW_COST = ('tp_iego3', 'tp_ie3', 'tp_iego2', 'tp_ie2', 'tp_iego', 'tp_ie')
COST_GAME = {'tp_iego3': 'GO3', 'tp_ie3': 'IE3', 'tp_iego2': 'GO2', 'tp_ie2': 'IE2', 'tp_iego': 'GO1', 'tp_ie': 'IE1'}

# Formas de Strikers 2013 → (juego, equipo de la versión). Orden = prioridad.
STRIKERS_FORMS = [
    ('dark emperors', 'IE2', 'Dark Emperors'), ('chaos', 'IE2', 'Chaos'), ('shin teikoku', 'IE2', 'Royal Academy Redux'),
    ('second raimon', 'IE2', 'Raimon'), ('raimon ii', 'IE2', 'Raimon'), ('neo japan', 'IE3', 'Neo Japan'),
    ('inazuma japan', 'IE3', 'Inazuma Japan'), ('fire dragon', 'IE3', 'Fire Dragon'), ('sekai senbatsu', 'IE3', 'Sekai Senbatsu'),
    ('teikoku', 'IE1', 'Royal Academy'), ('zeus', 'IE1', 'Zeus'), ('raimon form', 'IE1', 'Raimon'),
    ('shinsei raimon', 'GO1', 'Raimon'), ('tenmas', 'GO1', 'Tenmas'), ('adult', 'GO3', 'Adult'),
]
ALT_VERSION = ('dark emperors', 'chaos', 'atsuya', 'shirou', 'merged', 'ishido', 'gran', 'chrono storm')


def load(name):
    with open(os.path.join(CACHE, name), encoding='utf-8') as f:
        return json.load(f) if name.endswith('.json') else f.read()


def slug(s):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', s.lower())).strip('-')


def lua_entries(text):
    starts = [(m.start(), m.group(1)) for m in re.finditer(r'\n\t(\w+)=\{', text)]
    return {k: text[p:(starts[i + 1][0] if i + 1 < len(starts) else len(text))] for i, (p, k) in enumerate(starts)}


def lua_field(body, name):
    m = re.search(r'\n\t\t' + name + r'="([^"]*)"', body)
    return m.group(1) if m else None


def lua_moves(body, module):
    m = re.search(r'\n\t\t\t' + module + r'=\{(.*?)\n\t\t\t\}', body, re.S)
    return re.findall(r'\{"(\w+)"', m.group(1)) if m else []


def category(ovr):
    return next(c for c, t in CATEGORIES if ovr >= t)


def main():
    report = []
    ov = json.load(open(os.path.join(ROOT, 'data', 'overrides.json'), encoding='utf-8'))
    zukan = load('zukan.json')
    titles = load('redirects.json')
    params = load('params.json')
    move_page = load('move_page.json')
    move_info = load('moves.json')
    teams_wiki = load('teams.json')
    wiki_only_img = load('wiki_only_images.json')
    mods = {m: lua_entries(load(f'PlayerData_{m}.lua')) for m in MODULE.values()}

    # --- stats de la wiki: página → juego → [(forma, stats)] + formas de Strikers + nº de spin-offs
    def parse_params(sec):
        games, strikers, spin = collections.defaultdict(list), [], 0
        if not sec:
            return games, strikers, spin
        parts = re.split(r'\n\|(Inazuma Eleven[^|\n]*)\|', sec)
        for i in range(1, len(parts), 2):
            name, body = parts[i].strip(), parts[i + 1]
            body = re.split(r'\n\}\}', body)[0]
            chunks = re.split(r'\n----', body)
            if name in TAB:
                g = TAB[name]
                keys = IEK if g.startswith('IE') else GOK
                for ch in chunks:
                    label = ' '.join(re.findall(r'^;(.+)$', ch, re.M)) or 'default'
                    v = {k: int(x) for k, x in re.findall(r"'''([A-Za-z]+)''':\s*(\d+)", ch)}
                    if all(k in v for k in keys):
                        games[g].append((label, [v[k] for k in keys]))
            else:
                spin += 1
                if name == 'Inazuma Eleven GO Strikers 2013':
                    for ch in chunks:
                        label = ' '.join(re.findall(r'^;(.+)$', ch, re.M)) or 'default'
                        v = {k: RANK[x] for k, x in re.findall(r"'''(\w+)''':\s*([SABCDE]\+?)", ch)}
                        if v:
                            strikers.append({'label': label, 'grades': v, 'source': 'Strikers 2013'})
        return games, strikers, spin

    wiki = {p: parse_params((d or {}).get('params')) for p, d in params.items()}
    info = {p: (d or {}).get('info', {}) for p, d in params.items()}

    # --- entradas de PlayerData por página y módulo
    entries = collections.defaultdict(dict)      # (page, module) -> {key: body}
    for mod, es in mods.items():
        for k, body in es.items():
            pg = lua_field(body, 'page')
            if pg:
                entries[(pg, mod)][k] = body

    by_page = collections.defaultdict(list)          # página -> [cuerpo] (todos los módulos, sin formas primero)
    for (pg_, mod), es in entries.items():
        for k, b in es.items():
            by_page[pg_].append(b)
    for pg_ in by_page:
        by_page[pg_].sort(key=lambda b: 'form=' in b)

    def base_entry(page, game):
        es = entries.get((page, MODULE[game]), {})
        plain = [b for b in es.values() if 'form=' not in b]
        return (plain or list(es.values()) or [None])[0]

    def moves_for(page, game, entry=None, adult=False):
        """moveset del juego: la entrada indicada, o la entrada de la página que más técnicas tenga para ese juego"""
        mod = MODULE[game]
        if entry and lua_moves(entry, mod):
            return lua_moves(entry, mod)
        cands = [b for b in by_page.get(page, []) if lua_moves(b, mod)]
        if adult:
            cands = [b for b in cands if 'adult' in (lua_field(b, 'form') or '').lower()] or cands
        else:
            cands = [b for b in cands if 'form=' not in b] or cands
        return max((lua_moves(b, mod) for b in cands), key=len, default=[])

    # --- Xtreme: balancing doc (sobre Strikers 2013) y wiki del Xtreme
    page_set = set(wiki)

    def find_page(name, table):
        name = re.sub(r'\s*\(.*\)', '', name).strip()
        if name in table:
            return table[name]
        for c in (name, ' '.join(reversed(name.split()))):
            if c in page_set:
                return c
        return None

    team_form = {'Raimon': 'raimon form', 'Raimon 2': 'second raimon', 'Inazuma Japan': 'inazuma japan',
                 'Dark Emperors': 'dark emperors', 'Teikoku Gakuen': 'teikoku', 'Zeus': 'zeus', 'Chaos': 'chaos', 'Neo Japan': 'neo japan'}
    team = None
    missing_bal = []
    for line in load('xtreme_balancing.txt').splitlines():
        line = line.strip()
        if not line or line.startswith(('BALANCING', 'At some point')):
            continue
        if ' - ' not in line:
            team = line
            continue
        name, ch = line.split(' - ', 1)
        changes = re.findall(r'(Kick|Guard|Body|Speed|Control|Catch) \((\S+) to ([SABCDE]\+?)\)', ch)
        if not changes:
            continue
        pg = find_page(name, ov.get('xtreme_balancing_pages', {}))
        forms = wiki.get(pg, (None, [], 0))[1] if pg else []
        if not forms:
            missing_bal.append(f'{name} ({team})')
            continue
        key = team_form.get(team)
        tgt = [f for f in forms if key and key in f['label'].lower()] or ([forms[0]] if len(forms) == 1 else
               [f for f in forms if f['label'] == 'default'] or forms)
        for f in tgt:
            for stat, _, to in changes:
                f['grades'][stat] = RANK[to]
            f['source'] = 'Xtreme (balancing)'
    if missing_bal:
        report.append(f'Balancing doc del Xtreme sin ficha ({len(missing_bal)}): añadir a overrides.xtreme_balancing_pages → ' + ', '.join(missing_bal))

    for xt, raw in load('xtreme_wiki.json').items():
        if 'pre-mix' in xt.lower():
            continue
        pg = ov['xtreme_wiki_pages'].get(xt)
        if not pg or pg not in wiki:
            report.append(f'Wiki del Xtreme: "{xt}" sin ficha ({pg})')
            continue
        grades = {k.capitalize(): RANK[x] for k, x in re.findall(r'(kick|guard|body|speed|control|catch)=([SABCDE]\+?)', raw)}
        forms = wiki[pg][1]
        nonadult = [f for f in forms if 'adult' not in f['label'].lower()]
        if nonadult:
            nonadult[-1].update(grades=grades, source='Xtreme (wiki)')    # forma más avanzada no adulta
        else:
            forms.append({'label': 'default', 'grades': grades, 'source': 'Xtreme (wiki)'})

    # --- equipos de las cartas actuales del juego (nombre, juego) → equipo
    old_team = {}
    for m in re.finditer(r'^\s*p\("([^"]*)", "(\w+)", "([^"]*)"', open(os.path.join(ROOT, 'src', 'data', 'players.ts'), encoding='utf-8').read(), re.M):
        old_team.setdefault((m.group(1), m.group(2)), m.group(3))

    # --- personajes: zukan agrupado por ficha + los que solo están en la wiki
    chars = collections.OrderedDict()
    no_page = []
    for z in zukan:
        if not z['role'].startswith('Player'):
            continue
        pg = titles.get(z['name'])
        if not pg:
            no_page.append(z['name'])
            continue
        chars.setdefault(pg, []).append(z)
    for pg in ('Nakata Hidetoshi', 'Pants'):
        chars.setdefault(pg, [])
    if no_page:
        report.append(f'Jugadores de zukan sin ficha en la wiki ({len(no_page)}): ' + ', '.join(no_page))

    # --- población por juego para percentiles (todas las formas de todos los personajes)
    raw_pop = {g: collections.defaultdict(list) for g in MAIN}
    for pg in chars:
        for g, forms in wiki.get(pg, ({},))[0].items():
            for _, s in forms:
                for k, x in zip(IEK if g.startswith('IE') else GOK, s):
                    raw_pop[g][k].append(x)
    for g in MAIN:
        for l in raw_pop[g].values():
            l.sort()

    def common(g, s):
        d = dict(zip(IEK if g.startswith('IE') else GOK, s))
        if g.startswith('IE'):
            return {'Kick': d['Kick'], 'Control': d['Control'], 'Body': (d['Body'] + d['Stamina']) / 2, 'Speed': d['Speed'],
                    'Guard': d['Guard'], 'Catch': (d['Guard'] + d['Guts']) / 2}
        return {'Kick': d['Kick'], 'Control': (d['Dribbling'] + d['Technique']) / 2, 'Body': d['Stamina'], 'Speed': d['Speed'],
                'Guard': d['Block'], 'Catch': d['Catch']}

    com_pop = {g: collections.defaultdict(list) for g in MAIN}
    for pg in chars:
        for g, forms in wiki.get(pg, ({},))[0].items():
            for _, s in forms:
                for k, x in common(g, s).items():
                    com_pop[g][k].append(x)
    for g in MAIN:
        for l in com_pop[g].values():
            l.sort()

    def pct(l, x):
        return (bisect.bisect_left(l, x) + bisect.bisect_right(l, x)) / 2 / max(1, len(l))

    def robust(g, s, pos, ceil_minus=0):
        d = dict(zip(IEK if g.startswith('IE') else GOK, s))
        def sc(k):
            l = raw_pop[g][k]
            lo, hi = l[int(.02 * (len(l) - 1))], l[int(.98 * (len(l) - 1))]
            return max(30, min(99, 40 + (CEIL[g] - ceil_minus - 40) * (d[k] - lo) / max(1, hi - lo)))
        c = {'Kick': sc('Kick'), 'Speed': sc('Speed')}
        if g.startswith('IE'):
            c.update(Control=sc('Control'), Body=(sc('Body') + sc('Stamina')) / 2, Guard=sc('Guard'), Catch=(sc('Guard') + sc('Guts')) / 2)
        else:
            c.update(Control=(sc('Dribbling') + sc('Technique')) / 2, Body=sc('Stamina'), Guard=sc('Block'), Catch=sc('Catch'))
        return sum(c[k] * w for k, w in POSW[pos].items())

    # --- técnicas
    techniques = {}

    def technique(mid):
        if mid in techniques:
            return techniques[mid]
        page = move_page.get(mid, mid)
        inf = move_info.get(page) or {}
        if inf.get('type') not in HISSATSU_TYPES:
            techniques[mid] = None
            return None
        dub = (inf.get('name_dub') or '').replace('{{PAGENAME}}', page)
        dub = re.sub(r'\{\{Hover\|[^|}]*\|([^}]*)\}\}', r'\1', dub)          # {{Hover|largo|corto}} → corto
        dub = re.sub(r'\{\{[^}]*\}\}|\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', lambda m: m.group(1) or '', dub)
        dub = re.split(r'\*|<br', dub.lstrip('*'))[0]
        dub = re.sub(r'\s*\((?:game|games|EU|anime|games & anime|game & movie|[^)]*version)\)', '', dub).strip() or page
        costs = {COST_GAME[k]: inf[k] for k in SHOW_COST if k in inf}
        show = next(((inf[k], COST_GAME[k]) for k in SHOW_COST if k in inf), (None, None))
        techniques[mid] = {'id': mid, 'name': dub, 'name_jp': inf.get('name_jp'), 'type': inf['type'],
                           'element': ELEMENT.get(inf.get('element'), (inf.get('element') or '').lower() or None),
                           'cost': show[0], 'cost_game': show[1], 'costs': costs, '_inf': inf}
        return techniques[mid]

    def rank_cost(t, g):
        return next((t['_inf'][k] for k in RANK_COST[g[:2]] if k in t['_inf']), 0)

    # --- equipos protagonistas GO: (página, juego) → versión
    proto = {}
    def team_members(page, caption='Main members', game=None):
        out = []
        for t in re.findall(r'\{\{#invoke:MemberTable\|main(.*?)\}\}\s*\n', teams_wiki.get(page, ''), re.S):
            cap = re.search(r'\|caption=([^\n|]*)', t)
            gm = re.search(r'\|game=(\w+)', t)
            if caption and (not cap or cap.group(1).strip() != caption):
                continue
            if game and (not gm or gm.group(1) != game):
                continue
            out += [k.strip() for k in re.findall(r'\|p\d+=([^\n|]+)', t)]
        return out

    def key_page(key):
        for es in mods.values():
            if key in es:
                return lua_field(es[key], 'page'), es[key]
        return None, None

    for key in team_members('Chrono Storm'):
        pg, body = key_page(key)
        if pg:
            form = lua_field(body, 'form') or ''
            target = re.findall(r'\[\[([^|\]]+)(?:\|([^\]]+))?\]\]', form)
            names = [x for pair in target[1:] for x in pair if x] if len(target) > 1 else []
            proto[(pg, 'GO2', 'Chrono Storm')] = {'team': 'Chrono Storm', 'mixi': names, 'entry': body}
    for key in team_members('Shinsei Raimon', game='GO'):
        pg, body = key_page(key)
        if pg:
            proto.setdefault((pg, 'GO2', 'Raimon'), {'team': 'Raimon', 'mixi': None, 'entry': None})
    ee = team_members('Earth Eleven')
    for key in ee + [k for k in team_members('Inazuma Japan (GO)', caption=None, game='GX') if k not in ee]:
        pg, body = key_page(key)
        if pg:
            tm = 'Earth Eleven' if key in ee else 'Inazuma Japan'
            proto.setdefault((pg, 'GO3', tm), {'team': tm, 'mixi': None, 'entry': body})

    # --- destacados y excepciones
    featured = {p: 83 for p in ov['featured']['top']}
    featured.update({p: 78 for p in ov['featured']['advanced'] if p not in featured})
    for p in featured:
        if p not in chars:
            report.append(f'Destacado sin carta: {p}')
    pos_override = {(o['page'], o['game']): o['position'] for o in ov['position_by_version']}
    manual = {k: v for k, v in ov.get('ovr_manual', {}).items() if not k.startswith('_')}

    # --- generación de cartas
    cards = []
    chars_out = {}
    skipped_no_stats = []
    for pg, zs in chars.items():
        stats_by_game, strikers, spin = wiki.get(pg, ({}, [], 0))
        games_present = [g for g in MAIN if g in stats_by_game]
        if not games_present:
            skipped_no_stats.append(pg)
            continue
        zukan_games = {g for z in zs for g in z['games']}
        name = zs[0]['name'] if zs else re.sub(r'"', '', (info.get(pg) or {}).get('name_dub') or pg)
        first = next((g for g in MAIN if g in zukan_games and g in stats_by_game), games_present[0])
        char_id = slug(pg)
        chars_out[char_id] = {'id': char_id, 'name': name, 'wiki_page': pg}
        n_games = len({m for (p, m) in entries if p == pg})
        is_scout_char = bool(zs) and all(set(z['teams']) <= SCOUT_TEAMS for z in zs)

        # versiones: (juego, versión, equipo, pista de forma, entrada de técnicas)
        versions = [(first, 'base', None, None, None)]
        for f in strikers:
            lab = f['label'].lower()
            hit = next(((g, tm) for key, g, tm in STRIKERS_FORMS if key in lab), None)
            if not hit:
                continue            # 'default' y formas desconocidas → la carta base
            g, tm = hit
            if g not in stats_by_game:
                continue
            versions.append((g, tm, tm, f, None))
        for (p, g, tm), d in proto.items():
            if p == pg and g in stats_by_game:
                versions.append((g, tm, tm, d, d['entry']))

        seen = set()
        for g, ver, tm, hint, entry in versions:
            vkey = (g, 'base' if ver == 'base' else ver)
            if vkey in seen:
                continue
            if ver != 'base' and (g, 'base') in seen and g == first and tm in (None, old_team.get((name, g))):
                continue                     # la versión coincide con la carta base
            seen.add(vkey)

            # stats del juego: forma adecuada
            forms = [(l, s) for l, s in stats_by_game[g] if not any(x in l.lower() for x in EXCLUDED_FORMS)] or stats_by_game[g]
            if g == 'IE1':
                forms = [x for x in forms if 'European' in x[0]] or forms
            mixi = hint.get('mixi') if isinstance(hint, dict) else None
            if mixi:
                mm = [x for x in stats_by_game[g] if 'mixi' in x[0].lower() and any(n.lower() in x[0].lower() for n in mixi)]
                forms = mm or forms
            want = (tm or '').lower()
            if 'adult' in want:
                forms = [x for x in forms if 'adult' in x[0].lower()] or forms
            elif want:
                forms = [x for x in forms if want.split()[0] in x[0].lower()] or forms
            label, raw = forms[0]

            base_body = entry or base_entry(pg, g)
            position = pos_override.get((pg, g)) or (lua_field(base_body, 'position') if base_body else None) \
                or (zs[0]['position'] if zs else 'MF')
            if position not in POSW:
                position = 'MF'
            element = ELEMENT.get(lua_field(base_body, 'element') if base_body else None) \
                or ELEMENT.get(zs[0]['element'] if zs else None)
            real = [t for z in zs for t in z['teams'] if t not in SCOUT_TEAMS]
            ot = old_team.get((name, g))
            team = tm if tm and tm != 'Adult' else ((ot if ot and ot not in SCOUT_TEAMS else None) or (real[0] if real else None)
                                                      or ot or (zs[0]['teams'][0] if zs and zs[0]['teams'] else None))
            if tm == 'Adult':
                team = 'Adult'

            # técnicas
            mids = moves_for(pg, g, entry, adult=(tm == 'Adult'))
            if not mids and entry and MODULE[g] == 'CS':
                mids = lua_moves(entry, 'GX')          # formas Mixi Max: técnicas en GX
            moves = [t for t in (technique(m) for m in mids) if t]
            best_move = max((rank_cost(t, g) for t in moves), default=0)

            c = common(g, raw)
            q = {k: pct(com_pop[g][k], c[k]) for k in ST}

            # formas de Strikers/Xtreme para esta versión
            sform = None
            if strikers:
                if isinstance(hint, dict) and 'grades' in hint:
                    sform = hint
                else:
                    lab_of = lambda k: [f for f in strikers if k in f['label'].lower()]
                    order = {'IE1': ['raimon form', 'teikoku', 'zeus'], 'IE2': ['second raimon', 'raimon ii', 'raimon form'],
                             'IE3': ['inazuma japan', 'neo japan'], 'GO1': ['shinsei', 'adult'], 'GO2': ['adult'], 'GO3': ['adult']}[g]
                    for k in ([want.split()[0]] if want and 'adult' not in want else []) + order:
                        if lab_of(k):
                            sform = lab_of(k)[0]
                            break
                    if not sform:
                        sform = next((f for f in strikers if f['label'] == 'default'), None) or \
                            (strikers[-1] if g.startswith('GO') else strikers[0])

            if sform:
                tier, src = 'S', sform['source']
                st = {k: sform['grades'].get(k, 72) + 6 * (q[k] - 0.5) for k in ST}
                ovr = sum(st[k] * w for k, w in POSW[position].items())
            else:
                if is_scout_char:
                    tier = 'C'
                elif n_games >= 4 or spin >= 1:
                    tier = 'A'
                else:
                    tier = 'B'
                src = 'stats del juego'
                rb = robust(g, raw, position, 0 if tier != 'C' else 7)
                ovr = rb      # se convierte a banda más abajo (necesita el percentil del grupo)
                st = None
            cards.append({
                'character_id': char_id, 'page': pg, 'name': name, 'game': g, 'saga': g[:2], 'version': 'base' if ver == 'base' else ver,
                'form_label': label, 'team': team, 'position': position, 'element': element, 'tier': tier, 'source': src,
                'raw': raw, 'raw_keys': IEK if g.startswith('IE') else GOK, 'q': q, 'ovr_raw': ovr, 'st': st,
                'moves': moves, 'best_move': best_move, 'is_version': ver != 'base',
                'zukan': zs, 'featured': featured.get(pg),
            })
    if skipped_no_stats:
        report.append(f'Personajes sin stats de la saga principal (fuera): {len(skipped_no_stats)}')

    # --- bandas para niveles A/B/C (percentil dentro de juego y posición)
    grp = collections.defaultdict(list)
    for c in cards:
        if c['tier'] != 'S':
            grp[(c['game'], c['position'])].append(c['ovr_raw'])
    for l in grp.values():
        l.sort()
    moves_pop = collections.defaultdict(list)
    for c in cards:
        moves_pop[c['saga']].append(c['best_move'])
    for l in moves_pop.values():
        l.sort()
    for c in cards:
        if c['tier'] == 'S':
            continue
        qs = pct(grp[(c['game'], c['position'])], c['ovr_raw'])
        lo, hi = BAND[c['tier']]
        if c['tier'] == 'C':
            qm = pct(moves_pop[c['saga']], c['best_move'])
            o = lo + (hi - lo) * (0.6 * qs + 0.4 * qm) + 0.5 * ERA[c['game']] + (5 if qm >= 0.95 else 0)
            o = min(CAP_C, o)
        else:
            o = lo + (hi - lo) * qs + 0.5 * ERA[c['game']]
        c['ovr_raw'] = o
        c['st'] = {k: o + 22 * (c['q'][k] - 0.5) for k in ST}

    # --- ajustes finales: suelos de destacados, techo, línea principal sin bajadas, OVR manual
    for c in cards:
        o = c['ovr_raw']
        if c['featured']:
            o = max(o, c['featured'])
        c['ovr'] = int(round(min(CAP, o)))
    by_line = collections.defaultdict(list)
    for c in cards:
        alt = any(a in (c['version'] + ' ' + c['form_label']).lower() for a in ALT_VERSION)
        if not alt:
            by_line[(c['character_id'], c['position'])].append(c)
    for line in by_line.values():
        best = 0
        for c in sorted(line, key=lambda c: MAIN.index(c['game'])):
            c['ovr'] = max(c['ovr'], best)
            best = c['ovr']
    go2 = {(c['character_id'], c['position']): c['ovr'] for c in cards if c['game'] == 'GO2' and c['version'] != 'Chrono Storm'}
    for c in cards:
        if c['version'] == 'Chrono Storm':
            ref = go2.get((c['character_id'], c['position']))
            if ref:
                c['ovr'] = min(CAP, max(c['ovr'], ref + 2))
    for c in cards:
        k = f"{c['page']}|{c['game']}|{c['version']}"
        if k in manual:
            c['ovr'] = manual[k]
        # stats de la carta: reparto alrededor del OVR (media ponderada = OVR)
        st = c['st']
        off = c['ovr'] - sum(st[k] * w for k, w in POSW[c['position']].items())
        c['stats'] = {OUT_NAMES[k]: max(25, min(99, int(round(st[k] + off)))) for k in ST}
        c['category'] = category(c['ovr'])
        # imagen: ficha de zukan que mejor encaja (equipo / juego)
        img, zid = None, None
        if c['zukan']:
            z = max(c['zukan'], key=lambda z: (c['team'] in z['teams'], c['game'] in z['games']))
            zid = z['id']
            img = f'https://dxi4wb638ujep.cloudfront.net/1/{zid}.png'
        else:
            img = wiki_only_img.get(c['page'])
        c['zukan_id'], c['image_url'] = zid, img
        ver = c['version'] if c['version'] != 'base' else 'base'
        c['id'] = f"{c['character_id']}--{c['game'].lower()}--{slug(ver)}"

    # ids únicos
    seen_ids = collections.Counter()
    for c in cards:
        seen_ids[c['id']] += 1
        if seen_ids[c['id']] > 1:
            c['id'] += f"-{seen_ids[c['id']]}"

    write_outputs(cards, chars_out, techniques, report)


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


def insert(table, cols, rows, chunk=500):
    out = []
    for i in range(0, len(rows), chunk):
        vals = ',\n'.join('(' + ','.join(sql(r[c]) for c in cols) + ')' for r in rows[i:i + chunk])
        out.append(f'insert into public.{table} ({",".join(cols)}) values\n{vals};')
    return '\n'.join(out)


def write_outputs(cards, chars, techniques, report):
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
            'image_url': c['image_url'], 'zukan_id': c['zukan_id'], 'is_version': c['is_version'],
            'raw_stats': {'form': c['form_label'], **dict(zip(c['raw_keys'], c['raw']))},
            'techniques': [t['id'] for t in c['moves']],
        })
    with open(os.path.join(OUT, 'players.json'), 'w', encoding='utf-8') as f:
        json.dump({'cards': public, 'techniques': techs, 'characters': chars}, f, ensure_ascii=False, indent=1)

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
                 'zukan_id', 'raw_stats', 'is_version']
    links = [{'card_id': c['id'], 'technique_id': t, 'slot': i + 1}
             for c in public for i, t in enumerate(dict.fromkeys(c['techniques']))]
    seed = ['-- Generado por tools/db/build.py — no editar a mano.', 'begin;',
            'truncate public.card_techniques, public.cards, public.techniques, public.characters;',
            insert('characters', ['id', 'name', 'wiki_page'], [{**c} for c in chars]),
            insert('techniques', ['id', 'name', 'name_jp', 'type', 'element', 'cost', 'cost_game', 'costs'], techs),
            insert('cards', card_cols, public),
            insert('card_techniques', ['card_id', 'technique_id', 'slot'], links),
            'commit;', '']
    os.makedirs(os.path.join(ROOT, 'supabase'), exist_ok=True)
    with open(os.path.join(ROOT, 'supabase', 'seed.sql'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(seed))

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


if __name__ == '__main__':
    main()
