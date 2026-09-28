"""Rutas, constantes y utilidades compartidas por build.py y sus módulos."""
import json
import os
import re

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'db')
OUT = os.path.join(ROOT, 'build')
ZUKAN_DIR = os.path.join(ROOT, 'data', 'zukan')

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
    ('dark emperors', 'IE2', 'Dark Emperors'), ('shin teikoku', 'IE2', 'Royal Academy Redux'),
    ('second raimon', 'IE2', 'Raimon'), ('raimon ii', 'IE2', 'Raimon'), ('neo japan', 'IE3', 'Neo Japan'),
    ('inazuma japan', 'IE3', 'Inazuma Japan'), ('fire dragon', 'IE3', 'Fire Dragon'),
    ('teikoku', 'IE1', 'Royal Academy'), ('zeus', 'IE1', 'Zeus'), ('raimon form', 'IE1', 'Raimon'),
    ('shinsei raimon', 'GO1', 'Raimon'), ('tenmas', 'GO2', 'The Sherwinds'),     # Los Arions: equipo de Chrono Stone
]
# Formas de PlayerData (wiki) → equipo de la versión. Real Inazuma, Mixi Max, modos y disfraces quedan fuera.
# Caos no tiene cartas propias: su pool son las cartas de Prominence / Diamond Dust de sus jugadores (EXTRA_TEAM_FORMS)
EXTRA_TEAM_FORMS = {'Chaos': 'Chaos'}
WIKI_FORM_TEAM = {'Dark Emperors': 'Dark Emperors', 'Epsilon Kai': 'Epsilon Plus',
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


# códigos de equipo de los avatares de Victory Road en la wiki inglesa: (equipo, saga) → prefijos
EN_TEAM_CODE = {('Raimon', 'GO'): ['SR', 'R (GO)'], ('Raimon', 'IE'): ['R', 'SR'], ('Fire Dragon', 'IE'): ['FD'],
                ('Epsilon Plus', 'IE'): ['EK', 'EK-F', 'EK-GK'], ('Neo Japan', 'IE'): ['NJ'], ('Inazuma Japan', 'IE'): ['IJ'],
                ('Earth Eleven', 'GO'): ['EE', 'EE-F', 'EE-A'], ('Zeus', 'IE'): ['Z'], ('Royal Academy', 'IE'): ['TG'],
                ('Royal Academy Redux', 'IE'): ['STG'], ('Dark Emperors', 'IE'): ['DE'], ('Young Inazuma', 'IE'): ['YI'],
                ('Protocol Omega', 'GO'): ['PO'], ('Protocol Omega 2.0', 'GO'): ['PO2'], ('Protocol Omega 3.0', 'GO'): ['PO3'],
                ('Inazuma Legend Japan', 'GO'): ['ILJ'], ('Alpine', 'IE'): ['H'], ('Genesis', 'IE'): ['G'],
                ('The Sherwinds', 'GO'): ['T']}


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


def category(ovr):
    return next(c for c, t in CATEGORIES if ovr >= t)


AGE_VERSION = {'Adult': 'Adult', 'Child': 'Child', 'Elementary': 'Child', 'High School': 'High School', 'College': 'Adult'}


def romaji(k):                                       # "Seijuu"/"Seiju", "Jinrou"/"Jinro", "Buffalo (Soul)"/"Buffalo"
    k = re.sub(r'\s*\((?:soul|tótem|totem)\)', '', k.lower())
    k = re.sub(r'[^a-z]', '', k).replace('ou', 'o')
    return re.sub(r'([aeiou])\1+', r'\1', k)


def norm_jp(s):                                      # nombre japonés comparable: sin ruby, etiquetas ni signos
    s = re.sub(r'\{\{Ruby\|([^|}]*)\|[^}]*\}\}', r'\1', s or '')
    s = re.sub(r'<[^>]+>|\{\{[^}]*\}\}', '', s)
    return re.sub(r'[\s・･!！?？「」『』*＊]', '', s)


SUF = r'\b(jr\.? high|junior high|middle school|merchant marine academy|military academy|academy|school)\b|^order of |^the '


def tnorm(s):                                        # nombre de equipo comparable: "Raimon Junior High" = "Raimon"
    return re.sub(r'[^a-z0-9]', '', re.sub(SUF, '', s.lower()))
