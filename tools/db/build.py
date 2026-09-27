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
    ('shinsei raimon', 'GO1', 'Raimon'), ('tenmas', 'GO1', 'Tenmas'),
]
# Formas de PlayerData (wiki) → equipo de la versión. Real Inazuma, Mixi Max, modos y disfraces quedan fuera.
WIKI_FORM_TEAM = {'Dark Emperors': 'Dark Emperors', 'Chaos': 'Chaos', 'Epsilon Kai': 'Epsilon Plus',
                  'Shin Teikoku Gakuen': 'Royal Academy Redux', 'Diamond Dust': 'Diamond Dust', 'Prominence': 'Prominence',
                  'Neo Japan': 'Neo Japan', 'Fire Dragon': 'Fire Dragon', 'Unicorn': 'Unicorn', 'Zeus': 'Zeus'}
TEAM_FORM_WORD = {v: k.lower() for k, v in WIKI_FORM_TEAM.items()} | {'Young Inazuma': 'young'}
ALT_VERSION = ('mixi', 'dark emperors', 'chaos', 'atsuya', 'shirou', 'merged', 'ishido', 'gran', 'chrono storm')
ILJ = 'Inazuma Legend Japan'
# nombres de equipo de zukan → los de la base
ZUKAN_TEAM = {'Inazuma National': 'Inazuma Japan', 'Inazuma Legend National': ILJ, 'Neo National': 'Neo Japan'}


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


def load_opt(name, default):
    """caché opcional (pasos de fetch.py añadidos después)"""
    return load(name) if os.path.exists(os.path.join(CACHE, name)) else default


def lua_game_list(body, field, module):
    """keshin={GO={"Lancelot",true}, CST={{"A",true,2,"…"},{"B",…}}} → [("Lancelot", True)] para ese juego"""
    m = re.search(r'\n\t\t' + field + r'=\{(.*?)\n\t\t\}', body or '', re.S)
    if not m:
        return []
    out, key = [], None
    for line in m.group(1).split('\n'):
        km = re.match(r'\s*(\w+)=\{(.*)', line)
        if km:
            key, line = km.group(1), km.group(2)
        if key == module:
            out += [(n, a == 'true') for n, a in re.findall(r'"(\w+)"(?:,(true|false))?', line)]
    return out


DESC_CODE = dict(zip(MAIN, ['', ' IE2', ' IE3', ' IEGO', ' IEGO2', ' IEGO3']))    # |Descripción IEGO2 = …


def es_desc_tabs(section):
    """sección 'Descripciones' de la wiki española → [(pestaña, texto)] (pestañas anidadas incluidas)"""
    section = section.split('===Manga===')[0]
    parts = re.split(r'(?:\|-\||\{\{!\}\}-\{\{!\}\}|\{\{#tag: ?tabber\|\s*)([^=\n|{}]+)=', section)
    tabs = [('', parts[0])] + [(parts[i].strip(), parts[i + 1]) for i in range(1, len(parts) - 1, 2)]
    return [(l, t) for l, t in tabs if 'Descripción' in t]


def es_desc_clean(v):
    v = re.split(r'\n\s*=+', v)[0]                     # sin subsecciones (===Sitio Oficial===…)
    v = v.split('----')[-1]
    v = re.sub(r'^\s*[A-Z]{2}\|:?\s*', '', v)
    v = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', v)
    v = re.sub(r"\{\{[^{}]*\}\}|<[^>]+>|'''?", '', v)
    v = re.sub(r'\{\{|\}\}|\[\[|\]\]', '', v)
    v = re.sub(r'^\s*[A-Z]{2}\|:?\s*\*?\s*', '', v)
    return re.sub(r'\s+', ' ', v).strip(' *|')


def es_description(section, game, version, adult, mixi, page_es, version_es='', partner=''):
    """descripción en castellano de esa carta: pestaña de la versión (joven/adulto/Mixi Max) y plantilla del juego"""
    if not section:
        return None
    tabs = es_desc_tabs(section)
    if not tabs:
        return None
    def score(lt):
        l = lt[0].lower()
        sc = 3 * (mixi and 'mixi' in l) + 3 * (adult and ('adult' in l or l == page_es.lower()))
        sc += 4 * any(v and len(v) > 3 and v.lower() in l for v in (version_es, version))
        sc += 4 * bool(mixi and partner and any(w.lower() in l for w in partner.split() if len(w) > 3))
        sc -= 3 * (not mixi and 'mixi' in l) + 2 * (not adult and 'adult' in l) + ('armadura' in l or 'hyper' in l)
        return sc
    order = sorted(range(len(tabs)), key=lambda i: (-score(tabs[i]), i))
    for i in order[:1] + [j for j in order[1:] if score(tabs[j]) == score(tabs[order[0]])]:
        text = tabs[i][1]
        for g in [game] + [x for x in reversed(MAIN) if x != game and x[:2] == game[:2]]:
            # vale para {{Descripción/IE GO 2|Descripción IEGO2 = …}} y para {{Descripción|Descripción IE3 = …|Descripción IEGO = …}}
            m = re.search(r'\|\s*Descripción' + DESC_CODE[g] + r'\s*=(.*?)(?=\s*\|\s*Descripción|\n\{\{Descripción|\n\s*\}\}\s*$|\Z)',
                          text, re.S | re.M)
            if not m:
                continue
            v = re.sub(r'\}\}\s*(\}\})?\s*$', '', m.group(1).strip())
            bullets = re.findall(r"\*\s*'''([^']+)''':\s*([^\n]+)", v)
            if bullets:
                want = version.lower()
                pick = next((t for lab, t in bullets if any(w in lab.lower() for w in want.split() if len(w) > 3)), bullets[0][1])
                v = pick
            v = es_desc_clean(v)
            if v:
                return v
    return None


def category(ovr):
    return next(c for c, t in CATEGORIES if ovr >= t)


AGE_VERSION = {'Adult': 'Adult', 'Child': 'Child', 'Elementary': 'Child', 'High School': 'High School', 'College': 'Adult'}


def main(extra_z=None, write=True):
    """extra_z: {página: [fichas de zukan]} que aún no tienen carta propia → se crea una versión para cada una"""
    extra_z = extra_z or {}
    report = []
    ov = json.load(open(os.path.join(ROOT, 'data', 'overrides.json'), encoding='utf-8'))
    zukan = load('zukan.json')
    zdesc = load('zukan_desc.json')
    es_desc = load_opt('es_descriptions.json', {})
    keshin_data = lua_entries(load_opt('KeshinData.lua', ''))
    soul_data = lua_entries(load_opt('SoulData.lua', ''))
    def romaji(k):                                   # "Seijuu"/"Seiju", "Jinrou"/"Jinro", "Buffalo (Soul)"/"Buffalo"
        k = re.sub(r'\s*\((?:soul|tótem|totem)\)', '', k.lower())
        k = re.sub(r'[^a-z]', '', k).replace('ou', 'o')
        return re.sub(r'([aeiou])\1+', r'\1', k)
    def es_names(d):
        idx = {}
        for title, v in d.items():
            for k in v['jp'] + v['en']:
                idx.setdefault(romaji(k), (re.sub(r'\s*\(Tótem\)$', '', title), (v['en'] or [None])[0]))
        return idx
    es_keshin, es_soul = es_names(load_opt('es_keshin.json', {})), es_names(load_opt('es_souls.json', {}))
    GAME_TITLE = re.compile(r'^(?:Inazuma Eleven )?(?:GO Chrono Stones: Wildfire / Thunderflash|GO Galaxy: Big Bang / Supernova|'
                            r'GO: Light / Shadow|2: Firestorm / Blizzard|3: Lightning Bolt / Bomb Blast / Team Ogre Attacks!|'
                            r'Ares|Orion|: Victory Road)\s+')
    for v in zdesc.values():
        v['desc'] = GAME_TITLE.sub('', v.get('desc') or '') or None
    titles = load('redirects.json')
    params = load('params.json')
    move_page = load('move_page.json')
    move_info = load('moves.json')
    teams_wiki = load('teams.json')
    wiki_only_img = load('wiki_only_images.json')
    form_img = load('form_images.json')
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
    # fusiones Mixi Max con ficha propia (Gousetsuji = Axel + Shawn "Shaxel"): stats y técnicas de Galaxy
    fusions = load_opt('fusions.json', {})
    fusion_stats = {f: parse_params(v.get('params'))[0] for f, v in fusions.items()}
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

    def form_entry(page, game, form_word):
        """entrada de PlayerData de una forma concreta (p. ej. 'atsuya') con técnicas en ese juego"""
        mod = MODULE[game]
        for b in by_page.get(page, []):
            if form_word in (lua_field(b, 'form') or '').lower() and lua_moves(b, mod):
                return b
        return None

    # versiones que define la wiki: (página, juego) → [(equipo, entrada)]
    wiki_forms = collections.defaultdict(list)
    for (pg_, mod), es in entries.items():
        g_ = next(g for g, m in MODULE.items() if m == mod)
        for b in es.values():
            f = lua_field(b, 'form') or ''
            link = re.match(r'\[\[([^|\]]+)\]\] form$', f)
            if link and link.group(1) in WIKI_FORM_TEAM:
                tm_ = WIKI_FORM_TEAM[link.group(1)]
            elif f == 'young form' and mod == 'IE2':
                tm_ = 'Young Inazuma'
            elif f in ('adult form', '<i>Galaxy</i> form') and mod in ('CS', 'GX'):
                tm_ = 'Adult'
            else:
                continue
            if tm_ not in [t for t, _ in wiki_forms[(pg_, g_)]]:
                wiki_forms[(pg_, g_)].append((tm_, b))

    PARTNER_ALIAS = {'jeanne': 'joan', 'kongming': 'zhugeliang', 'ryubi': 'liubei', 'nobunaga': 'odanobunaga', 'tyrano': 'tyranosaurus'}
    def pnorm(x):
        x = re.sub(r'[^a-z]', '', x.lower()).replace('ou', 'o').replace('uu', 'u').replace('nn', 'n')
        x = re.sub(r'^(the|king|queen)', '', x)
        return PARTNER_ALIAS.get(x, x)

    def same_partner(a, b):
        """'Joan of Arc' ~ "Jeanne d'Arc|Jeanne", 'Soji' ~ 'Okita Souji', 'Cao Cao' ~ 'Caocao'"""
        wa = [pnorm(w) for w in re.split(r"[\s|]+", a) if len(w) > 2] + [pnorm(a)]
        wb = [pnorm(w) for w in re.split(r"[\s|]+", b) if len(w) > 2] + [pnorm(b)]
        return any(x and y and (x.startswith(y[:5]) or y.startswith(x[:5])) for x in wa for y in wb)

    def zdesc_of(z):
        return (zdesc.get(str(z.get('no'))) or {}).get('desc') or ''

    def find_fusion(page, partner):
        """ficha de la fusión Mixi Max de `page` con `partner` (nombre inglés), si la wiki la tiene"""
        for f, v in fusions.items():
            if page not in v['pair']:
                continue
            for other in v['pair']:
                names = [other] + [z['name'] for z in chars.get(other, [])[:1]]
                if other != page and any(w[:3].lower() == partner.split()[0][:3].lower() for n in names for w in n.split()):
                    return f
        return None

    def specials_for(body, game, hint, tm):
        """poderes especiales de la carta: Keshin (espíritu guerrero), Keshin Armed (armadura), Soul (tótem), Mixi Max"""
        out = []
        for key, armed in lua_game_list(body, 'keshin', MODULE[game]):
            kd = keshin_data.get(key, '')
            page = (re.search(r'page="([^"]+)"', kd) or [None, key])[1]
            es, en = es_keshin.get(romaji(page), (None, None))
            out.append({'type': 'keshin', 'name': en or page, 'name_es': es, 'armed': armed})
        for key, _ in lua_game_list(body, 'soul', MODULE[game]):
            sd = soul_data.get(key, '')
            page = (re.search(r'page="([^"]+)"', sd) or [None, key])[1]
            es, en = es_soul.get(romaji(page), (None, None))
            out.append({'type': 'soul', 'name': en or page, 'name_es': es})
        if tm in ('Mixi Max', 'Chrono Storm') and isinstance(hint, dict):
            who = hint.get('fusion_partner') or next((n for n in (hint.get('mixi') or []) if n and n != 'mixi'), None)
            out.append({'type': 'mixi', 'name': who})
        return out

    def mixi_partner(z, char_name):
        """None si la descripción de zukan no habla de Mixi Max; si no, el nombre del compañero ('' si no se lee)"""
        desc = (zdesc.get(str(z.get('no'))) or {}).get('desc') or ''
        if not re.search(r'mixi[\s-]?max', desc, re.I):
            return None
        m = re.match(r"(.+?) and (?:the )?(.+?)'s? miximax(?:ed form)?\b", desc)       # "Arion and King Arthur's miximaxed form"
        if m and re.search(r"'s? miximax", desc):                                     # minúscula: figura histórica / animal
            return m.group(2)
        m = re.search(r'Miximaxed with ([A-Z][\w-]*)', desc)                           # "Miximaxed with Zanark, …"
        if m:
            return m.group(1)
        m = re.search(r"Miximax of ([A-Z][\w'-]*(?: [A-Z][\w'-]*)?) and ([A-Z][\w'-]*)", desc) \
            or re.match(r"([A-Z][\w'-]*(?: [A-Z][\w'-]*)?) and ([A-Z][\w'-]*)'s Miximax", desc)
        if not m:
            return ''
        mine = [w[:3].lower() for w in char_name.split()]                             # "Gabi" ↔ Gabriel
        a, b = m.group(1), m.group(2)
        return b if a.split()[0][:3].lower() in mine else a if b.split()[0][:3].lower() in mine else b

    def zukan_entry(page, game, z, used):
        """entrada de PlayerData que corresponde a una ficha de zukan (por edad y equipo) + palabra de su forma"""
        age = z.get('age', '')
        words = [w.lower() for t in z['teams'] for w in re.findall(r'[A-Za-z]{3,}', ZUKAN_TEAM.get(t, t))]
        def sc(b):
            f = (lua_field(b, 'form') or '').lower()
            return (3 * (age == 'Adult' and any(k in f for k in ('adult', 'legend', 'galaxy', 'ishido', 'go</i>')))
                    + 3 * (age in ('Child', 'Elementary') and any(k in f for k in ('child', 'young')))
                    + 3 * any(w in f for w in words) + (not f and age in ('Middle School', 'Exobeing'))
                    - 2 * (b in used) - 5 * any(k in f for k in ('real inazuma', 'mixi max', 'hyper dive')))
        cands = [b for b in entries.get((page, MODULE[game]), {}).values() if lua_moves(b, MODULE[game])]
        if not cands:
            return None, None
        b = max(cands, key=sc)
        f = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]|<[^>]+>', r'\1', lua_field(b, 'form') or '').lower()
        want = re.sub(r'\s*(form|mode)$', '', f).strip() or None
        return b, want

    def form_image(body, game):
        """render 3D de la forma en la wiki: "(DE) Kazemaru 3D (1).png" (prefijo del sprite de ese juego primero)"""
        nick = lua_field(body, 'nickname')
        mine = re.findall(r'\n\t\t\t' + MODULE[game] + r'="\(([^)]+(?:\([^)]*\))?)\) ', body)
        rest = re.findall(r'="\(([^)]+(?:\([^)]*\))?)\) [^"]*sprite', body)
        return next((form_img[f'File:({p}) {nick} 3D (1).png'] for p in mine + rest
                     if f'File:({p}) {nick} 3D (1).png' in form_img), None)

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
    # (equipos por juego del juego original: data/legacy-teams.json, "nombre|juego" → equipo)
    with open(os.path.join(ROOT, 'data', 'legacy-teams.json'), encoding='utf-8') as f:
        old_team = {tuple(k.split('|', 1)): v for k, v in json.load(f).items()}

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
    for z in zukan:
        pg = titles.get(z['name'])
        if not z['role'].startswith('Player') and pg in chars and 'Inazuma Legend National' in z['teams']:
            chars[pg].append(z)                         # solo para la foto: Mark adulto figura como 'Coach'
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

    # --- técnicas (+ nombre en castellano: wiki inazuma.fandom.com/es, cruzado por nombre japonés o inglés)
    techniques = {}
    def norm_jp(s):
        s = re.sub(r'\{\{Ruby\|([^|}]*)\|[^}]*\}\}', r'\1', s or '')
        s = re.sub(r'<[^>]+>|\{\{[^}]*\}\}', '', s)
        return re.sub(r'[\s・･!！?？「」『』]', '', s)
    es_by_jp, es_by_en = {}, {}
    for title, d in load('es_techniques.json').items():
        es = re.sub(r'\s*\([^)]*\)$', '', title).strip()          # "Tormenta (supertécnica)" → "Tormenta"
        for j in d['jp']:
            es_by_jp.setdefault(norm_jp(j), es)
        for e in d['en']:
            es_by_en.setdefault(e.lower(), es)

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
        dub = re.sub(r'\s*\([^)]*(?:game|anime|movie|manga|EU|version)[^)]*\)', '', dub)
        dub = re.sub(r'\s+', ' ', dub).strip() or page
        costs = {COST_GAME[k]: inf[k] for k in SHOW_COST if k in inf}
        show = next(((inf[k], COST_GAME[k]) for k in SHOW_COST if k in inf), (None, None))
        name_es = es_by_jp.get(norm_jp(inf.get('name_jp'))) or es_by_en.get(dub.lower())
        techniques[mid] = {'id': mid, 'name': dub, 'name_es': name_es, 'name_jp': inf.get('name_jp'), 'type': inf['type'],
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
    for key in dict.fromkeys(team_members(ILJ, caption=None, game='CS')):
        pg, body = key_page(key)
        if pg:
            proto[(pg, 'GO2', ILJ)] = {'team': ILJ, 'mixi': None, 'entry': body}
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
            subform = re.search(r'[–-]\s*(.+?)\s+form', f['label'])
            ver = f'{tm} ({subform.group(1)})' if subform else tm
            versions.append((g, ver, tm, f, None))
        for (p, g, tm), d in proto.items():
            if p == pg and g in stats_by_game:
                versions.append((g, tm, tm, d, d['entry']))
        # versiones de la wiki (formas de PlayerData); si la versión ya existe, se le asigna la entrada de su forma
        for g in MAIN:
            for tm, body in wiki_forms.get((pg, g), []):
                if g not in stats_by_game:
                    continue
                if tm == 'Adult' and any(v[0] == g and v[2] == ILJ for v in versions):
                    continue
                idx = next((i for i, v in enumerate(versions) if v[0] == g and v[2] == tm), None)
                if idx is None and g == first and tm == old_team.get((name, first)):
                    idx = 0                  # la forma es la de su carta base (p. ej. Burn en Prominence)
                if idx is None:
                    versions.append((g, tm, tm, None, body))
                elif versions[idx][4] is None:
                    versions[idx] = versions[idx][:4] + (body,)
        # fichas de zukan que su descripción oficial define como Mixi Max ("The Miximax of Axel and Shawn…")
        mixi_z = [(z, p) for z in zs for p in [mixi_partner(z, name)]
                  if p is not None and any(g in z['games'] and g in stats_by_game for g in MAIN)]
        cs_i = next((i for i, v in enumerate(versions) if v[1] == 'Chrono Storm' and isinstance(v[3], dict)), None)
        if cs_i is not None and mixi_z:
            # la forma del Chrono Storm protagonista (compañero de la wiki; si no cuadra, su "X and <figura>'s miximaxed form")
            names = versions[cs_i][3].get('mixi') or []
            pick = next((z for z, p in mixi_z if any(same_partner(p, n) for n in names)), None) \
                or next((z for z, p in mixi_z if 'Chrono Storm' in z['teams'] and re.search(r"'s? miximax", zdesc_of(z))), None)
            if pick:
                versions[cs_i] = versions[cs_i][:3] + ({**versions[cs_i][3], 'zukan': pick['id']},) + versions[cs_i][4:]
                mixi_z = [(z, p) for z, p in mixi_z if z is not pick]
        for z, partner in mixi_z:
            g = next(g for g in MAIN if g in z['games'] and g in stats_by_game)
            ver = f'Mixi Max ({partner})' if partner else 'Mixi Max'
            fus = find_fusion(pg, partner) if partner else None
            if fus:
                nick = re.search(r'"([^"]+)"', fusions[fus].get('dub') or '')
                ver += f' «{nick.group(1)}»' if nick else ''
                fbody = next(iter(entries.get((fus, 'GX'), {}).values()), None)
                versions.append((g, ver, 'Mixi Max', {'zukan': z['id'], 'force': True, 'fusion': fus, 'fusion_partner': partner}, fbody))
                continue
            mm = next((b for b in entries.get((pg, MODULE[g]), {}).values()
                       if 'mixi' in (lua_field(b, 'form') or '').lower() and partner
                       and same_partner(partner, re.sub(r'.*form', '', lua_field(b, 'form') or ''))), None)
            versions.append((g, ver, 'Mixi Max', {'zukan': z['id'], 'force': True, 'mixi': [partner] if partner else ['mixi']}, mm))

        # versiones de zukan (foto propia) de equipos que el personaje aún no tiene: Young Inazuma, Perfect Cascade…
        have = {v[2] for v in versions if v[2]} | {old_team.get((name, first))}
        base_z = [z for z in zs if first in z['games']]
        have |= {ZUKAN_TEAM.get(t, t) for z in base_z[:1] for t in z['teams']}
        for z in zs:
            zteams = [ZUKAN_TEAM.get(t, t) for t in z['teams'] if t not in SCOUT_TEAMS]
            zgames = [g for g in MAIN if g in z['games'] and g in stats_by_game]
            if not zteams or not zgames or any(t in have for t in zteams) or mixi_partner(z, name) is not None:
                continue
            tm = zteams[0]
            wf = next((b for g_ in zgames for t_, b in wiki_forms.get((pg, g_), []) if t_ == tm), None)
            versions.append((zgames[0], tm, tm, {'zukan': z['id']}, wf))
            have.add(tm)

        # fichas oficiales de zukan (saga principal) que no tenían carta propia en la pasada anterior
        for z in extra_z.get(pg, []):
            zg = [g for g in MAIN if g in z['games'] and g in stats_by_game]
            if not zg:
                continue
            zteams = [ZUKAN_TEAM.get(t, t) for t in z['teams'] if t not in SCOUT_TEAMS]
            have_tm = {v[2] for v in versions} | {old_team.get((name, first))} \
                | {ZUKAN_TEAM.get(t, t) for z2 in zs if z2 not in extra_z.get(pg, []) for t in z2['teams']}
            label = next((t for t in zteams if t not in have_tm), zteams[0]) if zteams \
                else AGE_VERSION.get(z['age'], (z['teams'] or ['Unaffiliated'])[0])
            taken = {(v[0], v[1]) for v in versions}
            g = next((g for g in zg if (g, label) not in taken), zg[0])
            ver = label if (g, label) not in taken else f"{label} (Nº {z['no']})"
            tm = label if zteams or label == 'Adult' else (z['teams'] or ['Unaffiliated'])[0]
            body, want = zukan_entry(pg, g, z, [v[4] for v in versions if v[0] == g])
            hint = {'zukan': z['id'], 'force': True, 'want': want}
            if g.startswith('GO') and first.startswith('IE') and z['age'] == 'Middle School' and zteams and mixi_partner(z, name) is None:
                # la versión de niño que sale en Chrono Stone / Galaxy (viaje al pasado): equipo propio y técnicas de su época
                ver = tm = f'{label} (Past)'
                ie = next((x for x in ('IE3', 'IE2', 'IE1') if base_entry(pg, x) and lua_moves(base_entry(pg, x), MODULE[x])), None)
                if ie:
                    body, hint['moves_game'] = None, ie          # técnicas como su carta de ese juego
            versions.append((g, ver, tm, hint, body))

        seen = set()
        for g, ver, tm, hint, entry in versions:
            vkey = (g, 'base' if ver == 'base' else ver)
            if vkey in seen:
                continue
            forced = isinstance(hint, dict) and hint.get('force')
            if ver != 'base' and not forced and (g, 'base') in seen and g == first and tm in (None, old_team.get((name, g))):
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
            subm = re.search(r'\((.+)\)$', ver)
            want = hint['want'] if isinstance(hint, dict) and hint.get('want') else 'adult' if tm in (ILJ, 'Adult') else (subm.group(1) if subm else TEAM_FORM_WORD.get(tm, tm or '')).lower()
            if 'adult' in want:
                forms = [x for x in forms if 'adult' in x[0].lower()] or forms
            elif want:
                forms = [x for x in forms if want.split()[0] in x[0].lower()] or forms
            fusion = hint.get('fusion') if isinstance(hint, dict) else None
            if fusion and fusion_stats.get(fusion, {}).get('GO3'):
                forms = fusion_stats[fusion]['GO3']          # stats de la fusión (Galaxy)
            label, raw = forms[0]

            if not entry and subm:
                entry = form_entry(pg, g, subm.group(1).lower())
            base_body = entry or base_entry(pg, g)
            position = pos_override.get((pg, g)) or (lua_field(base_body, 'position') if base_body else None) \
                or (zs[0]['position'] if zs else 'MF')
            if position not in POSW:
                position = 'MF'
            element = ELEMENT.get(lua_field(base_body, 'element') if base_body else None) \
                or ELEMENT.get(zs[0]['element'] if zs else None)
            real = [ZUKAN_TEAM.get(t, t) for z in zs for t in z['teams'] if t not in SCOUT_TEAMS]
            ot = old_team.get((name, g))
            team = tm if tm and tm != 'Adult' else ((ot if ot and ot not in SCOUT_TEAMS else None) or (real[0] if real else None)
                                                      or ot or (ZUKAN_TEAM.get(zs[0]['teams'][0], zs[0]['teams'][0]) if zs and zs[0]['teams'] else None))
            if tm == 'Adult':
                team = 'Adult'

            # técnicas
            mg = hint.get('moves_game') if isinstance(hint, dict) and hint.get('moves_game') else g
            mids = moves_for(fusion, 'GO3', entry) if fusion else moves_for(pg, mg, entry, adult=(tm in (ILJ, 'Adult')))
            if not mids and entry and MODULE[g] == 'CS':
                mids = lua_moves(entry, 'GX')          # formas Mixi Max: técnicas en GX
            moves = [t for t in (technique(m) for m in mids) if t]
            # el keshin/soul de un juego puede estar en la entrada de otro módulo (p. ej. Tenma de GO trae el de CS)
            kcands = ([entry] if entry else []) + sorted(by_page.get(fusion or pg, []), key=lambda b: 'form=' in b)
            kbody = next((b for b in kcands if lua_game_list(b, 'keshin', MODULE[g]) or lua_game_list(b, 'soul', MODULE[g])), entry)
            specials = specials_for(kbody if tm not in (ILJ, 'Adult') or entry else None, g, hint, tm)
            best_move = max((rank_cost(t, g) for t in moves), default=0)

            c = common(g, raw)
            q = {k: pct(com_pop[g][k], c[k]) for k in ST}

            # formas de Strikers/Xtreme para esta versión
            sform = None
            if strikers and not fusion:                 # las fusiones van por sus stats de Galaxy
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
                'moves': moves, 'best_move': best_move, 'is_version': ver != 'base', 'specials': specials, 'fusion': fusion,
                'zhint': hint.get('zukan') if isinstance(hint, dict) else None,
                'zukan': zs, 'featured': featured.get(pg), 'form_image': form_image(base_body, g) if base_body else None,
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
    # fusiones Mixi Max (Shaxel…): al menos tan buenas como el mejor de sus dos jugadores
    best_page = collections.defaultdict(int)
    for c in cards:
        if c['team'] != 'Mixi Max':
            best_page[c['page']] = max(best_page[c['page']], c['ovr'])
    for c in cards:
        if c.get('fusion'):
            c['ovr'] = min(CAP, max(c['ovr'], *(best_page.get(p, 0) for p in fusions[c['fusion']]['pair'])))
    go2 = {(c['character_id'], c['position']): c['ovr'] for c in cards
           if c['game'] == 'GO2' and c['version'] != 'Chrono Storm' and c['team'] != 'Mixi Max'}
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
        ver = c['version'] if c['version'] != 'base' else 'base'
        c['id'] = f"{c['character_id']}--{c['game'].lower()}--{slug(ver)}"

    # --- imágenes: por personaje, cada versión con la ficha de zukan que mejor encaja (sin repetir si hay otra)
    MAINLINE = set(MAIN)
    by_char = collections.defaultdict(list)
    for c in cards:
        by_char[c['character_id']].append(c)
    for group in by_char.values():
        used_z = set()
        # base primero; después las versiones cuyo equipo tiene ficha en zukan; las que tienen render de la wiki, al final
        in_zukan = lambda c: bool(c['zhint']) or any(c['team'] in {ZUKAN_TEAM.get(t, t) for t in z['teams']} for z in c['zukan'])
        for c in sorted(group, key=lambda c: (c['is_version'], not in_zukan(c), bool(c['form_image']), MAIN.index(c['game']))):
            if not c['zukan']:
                c['zukan_id'], c['image_url'], c['zukan_no'] = None, wiki_only_img.get(c['page']) or c['form_image'], None
                continue
            ilj, cs = c['version'] in (ILJ, 'Adult'), c['version'] == 'Chrono Storm'
            scout = c['tier'] == 'C'
            def score(z):
                teams, games = {ZUKAN_TEAM.get(t, t) for t in z['teams']}, set(z['games'])
                adult = z.get('age') == 'Adult'
                return (10 * (z['id'] == c['zhint']) + 4 * (c['team'] in teams) + 5 * (c['version'] == ILJ and ILJ in teams)
                        + 3 * (cs and 'Chrono Storm' in teams and not games & {'IE1', 'IE2', 'IE3'})
                        + 2 * (z['id'] not in used_z) + (z['position'] == c['position']) + 3 * (c['game'] in games)
                        + 2 * (next((g for g in MAIN if g in games), None) == c['game'])
                        - 6 * (not games & MAINLINE) - 3 * (teams <= SCOUT_TEAMS and not scout and c['version'] != 'Adult')
                        - 4 * (adult and not ilj) - 4 * (ilj and not adult)
                        - 8 * (mixi_partner(z, c['name']) is not None and c['team'] not in ('Mixi Max', 'Chrono Storm')))
            z = max(c['zukan'], key=score)
            wrong_age = c['version'] in (ILJ, 'Adult') and z.get('age') != 'Adult'
            if c['form_image'] and (z['id'] in used_z or wrong_age):
                c['zukan_id'], c['image_url'], c['zukan_no'] = None, c['form_image'], None      # zukan no tiene foto de esta forma
                continue
            used_z.add(z['id'])
            c['zukan_id'], c['image_url'] = z['id'], f"https://dxi4wb638ujep.cloudfront.net/1/{z['id']}.png"
            c['zukan_no'] = z['no']

    # ids únicos
    seen_ids = collections.Counter()
    for c in cards:
        seen_ids[c['id']] += 1
        if seen_ids[c['id']] > 1:
            c['id'] += f"-{seen_ids[c['id']]}"

    # --- nombres de equipo en castellano (wiki en español: plantilla Equipo; cruce por nombre inglés o japonés)
    SUF = r'\b(jr\.? high|junior high|middle school|merchant marine academy|military academy|academy|school)\b|^order of |^the '
    tnorm = lambda s: re.sub(r'[^a-z0-9]', '', re.sub(SUF, '', s.lower()))
    es_team = {}
    for title, d in sorted(load('es_teams.json').items(), key=lambda kv: '(' in kv[0]):     # fichas principales primero
        es = re.sub(r'^Instituto ', '', d['es'] or re.sub(r'\s*\(.*\)$', '', title))
        for k in d['en'] + d['jp'] + [title]:
            if k != '/' and tnorm(k):
                es_team.setdefault(tnorm(k), es)
    manual_es = {k: v for k, v in ov.get('team_es', {}).items() if not k.startswith('_')}
    teams = []
    for tm in sorted({c['team'] for c in cards if c['team']}):
        teams.append({'name': tm, 'name_es': manual_es.get(tm) or es_team.get(tnorm(tm))})
    sin_es = [t['name'] for t in teams if not t['name_es']]
    if sin_es:
        report.append(f'Equipos sin nombre en castellano ({len(sin_es)}): añadir a overrides.team_es → ' + ', '.join(sin_es))

    # nº de cada carta: el de su ficha de zukan (la primera carta que la usa); las nuestras, a partir del último de zukan
    max_no = max(z['no'] for z in zukan if z.get('no'))
    taken = set()
    for c in sorted(cards, key=lambda c: (c['is_version'], MAIN.index(c['game']), c['id'])):
        if c.get('zukan_no') and c['zukan_no'] not in taken:
            c['no'] = c['zukan_no']
            taken.add(c['no'])
    char_no = {}
    for c in cards:
        if c.get('zukan_no'):
            char_no[c['character_id']] = min(char_no.get(c['character_id'], 10 ** 6), c['zukan_no'])
    nxt = max_no
    for c in sorted((c for c in cards if 'no' not in c),
                    key=lambda c: (char_no.get(c['character_id'], 10 ** 6), MAIN.index(c['game']), c['id'])):
        nxt += 1
        c['no'] = nxt

    # fichas oficiales de zukan (saga principal) sin carta propia: la pasada siguiente crea su versión
    assigned = {c['zukan_id'] for c in cards}
    with_cards = {c['page'] for c in cards}
    uncovered = {pg: [z for z in zs if set(z['games']) & MAINLINE and z['id'] not in assigned]
                 for pg, zs in chars.items() if pg in with_cards}
    uncovered = {pg: zs for pg, zs in uncovered.items() if zs}
    for c in cards:                         # nº oficial del personaje: su primera ficha de zukan
        chars_out[c['character_id']]['zukan_no'] = min((z['no'] for z in c['zukan'] if z.get('no')), default=None)
    if uncovered:
        left = [f"{z['name']} (Nº {z['no']})" for zs in uncovered.values() for z in zs]
        report.append(f'Fichas de zukan de la saga principal sin carta ({len(left)}; sin stats en esos juegos o sin entrada): ' + ', '.join(left))
    # --- cuerpo técnico (zukan: Manager = entrenador, Coach = segundo entrenador, Coordinator = gerente), sin stats
    staff = []
    for z in zukan:
        role = next((r for r in ('Manager', 'Coach', 'Coordinator') if r in z['role']), None)
        if not role or not set(z['games']) & MAINLINE:
            continue
        zteams = [ZUKAN_TEAM.get(t, t) for t in z['teams']]
        staff.append({'zukan_no': z['no'], 'name': z['name'], 'role': role, 'team': zteams[0] if zteams else None,
                      'teams': zteams, 'games': [g for g in MAIN if g in z['games']], 'age': z['age'],
                      'element': ELEMENT.get(z['element']), 'image_url': f"https://dxi4wb638ujep.cloudfront.net/1/{z['id']}.png",
                      'description': (zdesc.get(str(z['no'])) or {}).get('desc'), 'wiki_page': titles.get(z['name'])})
    known = {t['name'] for t in teams}
    for tm in sorted({t for st in staff for t in st['teams']} - known):
        teams.append({'name': tm, 'name_es': manual_es.get(tm) or es_team.get(tnorm(tm))})
    for c in cards:
        c['description'] = (zdesc.get(str(c.get('zukan_no'))) or {}).get('desc')
        d = es_desc.get(c['page']) or {} if not c.get('fusion') else {}          # las fusiones no tienen ficha en castellano
        partner = next((sp.get('name') or '' for sp in c.get('specials') or [] if sp['type'] == 'mixi'), '')
        c['description_es'] = es_description(d.get('section'), c['game'], c['version'], c['team'] in (ILJ, 'Adult'),
                                             c['team'] in ('Mixi Max', 'Chrono Storm'), d.get('es_page') or '',
                                             manual_es.get(c['version']) or es_team.get(tnorm(c['version'])) or '', partner)
    zukan_rows = [{'no': z['no'], 'image_id': z['id'], 'name': z['name'], 'role': z['role'], 'age': z['age'],
                   'element': ELEMENT.get(z['element']), 'position': z['position'], 'teams': z['teams'], 'games': z['games'],
                   'description': (zdesc.get(str(z['no'])) or {}).get('desc'), 'vr_lv50': (zdesc.get(str(z['no'])) or {}).get('vr_lv50'),
                   'wiki_page': titles.get(z['name'])} for z in zukan if z.get('no')]
    if write:
        write_outputs(cards, chars_out, techniques, teams, staff, zukan_rows, report)
    return uncovered


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
            'specials': c.get('specials') or [],
            'raw_stats': {'form': c['form_label'], **dict(zip(c['raw_keys'], c['raw']))},
            'techniques': [t['id'] for t in c['moves']],
        })
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
                 'zukan_id', 'zukan_no', 'no', 'description', 'description_es', 'specials', 'raw_stats', 'is_version']
    links = [{'card_id': c['id'], 'technique_id': t, 'slot': i + 1}
             for c in public for i, t in enumerate(dict.fromkeys(c['techniques']))]
    seed = ['-- Generado por tools/db/build.py — no editar a mano.', 'begin;',
            'truncate public.card_techniques, public.cards, public.techniques, public.characters, public.teams, public.staff, public.zukan;',
            insert('zukan', ['no', 'image_id', 'name', 'role', 'age', 'element', 'position', 'teams', 'games', 'description', 'vr_lv50', 'wiki_page'], zukan_rows),
            insert('staff', ['zukan_no', 'name', 'role', 'team', 'teams', 'games', 'age', 'element', 'image_url', 'description', 'wiki_page'], staff),
            insert('teams', ['name', 'name_es'], teams),
            insert('characters', ['id', 'name', 'wiki_page', 'zukan_no'], [{**c} for c in chars]),
            insert('techniques', ['id', 'name', 'name_es', 'name_jp', 'type', 'element', 'cost', 'cost_game', 'costs'], techs),
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
    main(main(write=False))
