#!/usr/bin/env python3
"""
Genera la base de jugadores a partir de la caché de tools/db/fetch.py.
Reglas: docs/plan-base-jugadores.md · Excepciones: data/overrides.json

Módulos:
  common.py   rutas, constantes y utilidades (lua, nombres comparables)
  es_text.py  descripciones en castellano de la wiki española
  ares.py     cartas de Ares, Orion y Victory Road
  tuning.py   curva de rivales de cada juego (overrides.team_tuning)
  i18n.py     nombres en francés e italiano
  output.py   escritura de las salidas

Uso:  python3 tools/db/build.py
Salida:
  build/players.json   cartas completas (revisión / frontend)
  build/review.csv     hoja para revisar a mano
  build/report.txt     avisos: cruces de nombres que faltan, destacados sin encontrar…
  supabase/seed.sql    datos para Supabase (lo carga .github/workflows/db-load.yml)
"""
import bisect
import collections
import json
import os
import re

import ares                                  # tools/db/ares.py (cartas de Ares, Orion y Victory Road)
from common import (AGE_VERSION, ALT_VERSION, BAND, CACHE, CAP, CAP_C, CEIL, COST_GAME, ELEMENT, EN_TEAM_CODE, ERA, EXCLUDED_FORMS,
                    EXTRA_TEAM_FORMS, GOK, HISSATSU_TYPES, IEK, ILJ, MAIN, MODULE, OUT, OUT_NAMES, POSW, RANK,
                    RANK_COST, ROOT, SCOUT_TEAMS, SHOW_COST, ST, STRIKERS_FORMS, TAB, TEAM_FORM_WORD, WIKI_FORM_TEAM,
                    ZUKAN_DIR, ZUKAN_TEAM, category, load, load_opt, lua_entries, lua_field, lua_game_list, lua_moves,
                    norm_jp, romaji, slug, tnorm)
from es_text import es_description
from tuning import apply_tuning
from i18n import localize
from output import write_outputs


def main(extra_z=None, write=True):
    """extra_z: {página: [fichas de zukan]} que aún no tienen carta propia → se crea una versión para cada una"""
    extra_z = extra_z or {}
    report = []
    ov = json.load(open(os.path.join(ROOT, 'data', 'overrides.json'), encoding='utf-8'))
    zukan = json.load(open(os.path.join(ZUKAN_DIR, 'chara_list.json'), encoding='utf-8'))       # copia de zukan en el repo
    zdesc = json.load(open(os.path.join(ZUKAN_DIR, 'chara_param.json'), encoding='utf-8'))
    es_desc = load_opt('es_descriptions.json', {})
    keshin_data = lua_entries(load_opt('KeshinData.lua', ''))
    soul_data = lua_entries(load_opt('SoulData.lua', ''))
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
    zalias = {k: v for k, v in ov.get('zukan_wiki_pages', {}).items() if not k.startswith('_')}
    titles.update({k: v for k, v in zalias.items() if not k.startswith('#')})
    page_of = lambda z: zalias.get(f"#{z['no']}") or titles.get(z['name'])     # '#Nº': nombres repetidos en zukan
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

    # equipos extra sin cartas propias (Caos): páginas cuyos jugadores forman parte de ese equipo
    extra_team_pages = collections.defaultdict(set)
    for (pg_, mod), es in entries.items():
        for b in es.values():
            link = re.match(r'\[\[([^|\]]+)\]\] form$', lua_field(b, 'form') or '')
            if link and link.group(1) in EXTRA_TEAM_FORMS:
                extra_team_pages[pg_].add((next(g for g, m in MODULE.items() if m == mod), EXTRA_TEAM_FORMS[link.group(1)]))

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
            hk = re.search(r'\n\t\thissatsu="(\w+)"', kd)                     # hipertécnica del espíritu guerrero
            ht = technique_any(hk.group(1)) if hk else None
            out.append({'type': 'keshin', 'name': en or page, 'name_es': es, 'armed': armed,
                        'hyper': ht and ht['name'], 'hyper_es': ht and ht.get('name_es'), 'hyper_jp': ht and ht.get('name_jp')})
        for key, _ in lua_game_list(body, 'soul', MODULE[game]):
            sd = soul_data.get(key, '')
            page = (re.search(r'page="([^"]+)"', sd) or [None, key])[1]
            es, en = es_soul.get(romaji(page), (None, None))
            out.append({'type': 'soul', 'name': en or page, 'name_es': es})
        if tm in ('Mixi Max', 'Chrono Storm') and isinstance(hint, dict):
            who = hint.get('fusion_partner') or next((n for n in (hint.get('mixi') or []) if n and n != 'mixi'), None)
            out.append({'type': 'mixi', 'name': who})
        # cada juego, su poder: GO → espíritu guerrero; Chrono Stone → + armadura y Mixi Max; Galaxy → tótem
        if game == 'GO1':
            out = [{**x, 'armed': False} for x in out if x['type'] == 'keshin']
        elif game == 'GO3':
            souls = [x for x in out if x['type'] == 'soul']
            out = (souls or [{**x, 'armed': False} for x in out if x['type'] == 'keshin']) + [x for x in out if x['type'] == 'mixi']
        elif game != 'GO2':
            out = []
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
    legacy_cnt = collections.Counter((t, g) for (n, g), t in old_team.items())
    team_home = {}
    for (t, g), n_ in legacy_cnt.items():
        if n_ >= 8 and n_ > legacy_cnt.get((t, team_home.get(t)), 0):
            team_home[t] = g
    # las selecciones no estaban en el draft original: su juego va fijo
    team_home.update({'Inazuma Japan': 'IE3', 'Neo Japan': 'IE3', ILJ: 'GO2', 'Earth Eleven': 'GO3'})
    # juegos clásicos en los que zukan pone cada equipo (los de solo Ares/Orion/VR quedan vacíos)
    team_classic = collections.defaultdict(set)
    for z in zukan:
        for t in z['teams']:
            team_classic[ZUKAN_TEAM.get(t, t)] |= set(z['games']) & set(MAIN)

    # --- personajes: zukan agrupado por ficha + los que solo están en la wiki
    chars = collections.OrderedDict()
    no_page = []
    for z in zukan:
        if not z['role'].startswith('Player'):
            continue
        pg = page_of(z)
        if not pg:
            no_page.append(z['name'])
            continue
        chars.setdefault(pg, []).append(z)
    for z in zukan:
        pg = page_of(z)
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
    es_by_jp, es_by_en = {}, {}
    for title, d in {**load_opt('es_hyper.json', {}), **load('es_techniques.json')}.items():
        es = re.sub(r'\s*\([^)]*\)$', '', title).strip()          # "Tormenta (supertécnica)" → "Tormenta"
        for j in d['jp']:
            es_by_jp.setdefault(norm_jp(j), es)
        for e in d['en']:
            es_by_en.setdefault(e.lower(), es)

    zskills, zskills_en = {}, {}    # supertécnicas de zukan por nombre japonés / inglés (descripción, imagen, tipos; sin vídeo)
    for r in (json.load(open(os.path.join(ZUKAN_DIR, 'skills.json'), encoding='utf-8'))
              if os.path.exists(os.path.join(ZUKAN_DIR, 'skills.json')) else []):
        if r.get('name_ja'):
            zskills.setdefault(norm_jp(r['name_ja']), r)
        if r.get('name') and r['name'] != '???':
            zskills_en.setdefault(re.sub(r'[^a-z0-9]', '', r['name'].lower()), r)

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
        zs_ = zskills.get(norm_jp(inf.get('name_jp'))) or zskills_en.get(re.sub(r'[^a-z0-9]', '', dub.lower()))
        techniques[mid] = {'id': mid, 'name': dub, 'name_es': name_es, 'name_jp': inf.get('name_jp'), 'type': inf['type'],
                           'element': ELEMENT.get(inf.get('element'), (inf.get('element') or '').lower() or None),
                           'cost': show[0], 'cost_game': show[1], 'costs': costs, '_inf': inf,
                           'description': zs_ and zs_.get('description'), 'image_url': zs_ and zs_.get('image'),
                           'zukan_types': zs_ and zs_.get('types')}
        return techniques[mid]

    # técnicas de las formas Mixi Max en la wiki española ("[Miximax - Okita]": Proyectil letal, Katana crisantemo…)
    mid_by_es = {}
    def es_index():
        if not mid_by_es:
            for mid_ in sorted(move_page):
                t_ = technique(mid_)
                if t_ and t_.get('name_es'):
                    mid_by_es.setdefault(t_['name_es'].lower(), mid_)
        return mid_by_es

    def es_mixi_blocks(sec):
        """bloques de técnicas por forma en la wiki española: [(pestaña de juego, etiqueta, [nombres])]"""
        out = []
        for m in re.finditer(r'\|-\|(IE GO(?: \d)?)=(.*?)(?=\n\|-\||</tabber>|\Z)', sec, re.S):
            tab, body = m.group(1), m.group(2)
            for b in re.split(r'\{\{ST/Set \(J\) \(Usu\)', body)[1:]:          # formato {{ST/Set (J) (Usu) |F = [Miximax - Okita]}}
                label = (re.search(r'\|\s*F\s*=\s*([^}]*)\}\}', b) or [None, ''])[1]
                out.append((tab, label, [n.strip() for c_, n in re.findall(r'\{\{Stec\|(\w+)\|([^|}]+)', b) if c_ != 'TA']))
            parts = re.split(r'(?:\{\{!\}\}-\{\{!\}\}|\{\{#tag: ?tabber\|\s*)([^=\n{}|]+)=', body)
            for i in range(1, len(parts) - 1, 2):                                # formato de pestañas "Miximax con …=" + lista
                names = [n.strip() for img, n in re.findall(r'\[\[Archivo:([^\]]+)\]\]\s*\[\[([^\]|]+)', parts[i + 1])
                         if 'talento' not in img.lower()]
                out.append((tab, parts[i].strip(), names))
            segs = re.split(r'\n;([^\n]+)', body)                            # formato ";Sol (Miximax con Zhuge Liang)" + lista
            for i in range(1, len(segs) - 1, 2):
                names = [n.strip() for code, n in re.findall(r'\{\{ST\|T\|(\w+)\}\}\s*\[\[([^\]|]+)', segs[i + 1]) if code != 'TA']
                names += [n.strip() for img, n in re.findall(r'\[\[Archivo:([^\]]+)\]\]\s*\[\[([^\]|]+)', segs[i + 1])
                          if 'talento' not in img.lower()]
                out.append((tab, segs[i].strip(), names))
        return out

    def es_mixi_moves(page, partners):
        sec = (es_desc.get(page) or {}).get('techniques') or ''
        alias = {'arthur': 'arturo', 'joan': 'juana', 'jeanne': 'juana', 'tyrannosaurus': 'tirano', 'queen': 'reina',
                 'dragons': 'dragones', 'soji': 'okita', 'souji': 'okita'}
        words = [w.lower() for p_ in partners for w in re.split(r"[\s|']+", p_ or '') if len(w) > 1 and w.lower() not in ('the', 'of', 'and')]
        words = [x[:5] for w in words for x in {w, alias.get(w, w)}]
        blocks = es_mixi_blocks(sec)
        for tab in ('IE GO 3', 'IE GO 2'):                                      # la de Galaxy primero
            mixis = [(l, n) for t_, l, n in blocks if t_ == tab and 'mixi' in l.lower() and n]
            pick = next((n for l, n in mixis if any(w in l.lower() for w in words)), None) \
                or (mixis[0][1] if len(mixis) == 1 else None)
            mids = [es_index().get(n.lower()) for n in pick or []]
            if any(mids):
                return [m for m in mids if m]
        return []

    def technique_any(mid):
        page = move_page.get(mid, mid)
        inf = move_info.get(page) or {}
        t_ = technique(mid)
        if t_:
            return t_
        dub = re.sub(r'\{\{[^}]*\}\}|\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', lambda m: m.group(1) or '', (inf.get('name_dub') or '').replace('{{PAGENAME}}', page))
        dub = re.split(r'\*|<br', dub.lstrip('*'))[0].strip() or re.sub(r'(?<=[a-z])(?=[A-Z])', ' ', mid)
        name_es = es_by_jp.get(norm_jp(inf.get('name_jp'))) or es_by_en.get(dub.lower())
        return {'name': dub, 'name_es': name_es, 'name_jp': inf.get('name_jp')}

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
    extra_ver = [x for x in ov.get('extra_versions', []) if 'page' in x]

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
        # equipo de otro juego (Thor: scout en IE2, Inazuma Japón en IE3): la base va sin equipo y se añade la versión de ese juego
        base_tm = old_team.get((name, first)) or next((ZUKAN_TEAM.get(t, t) for z in zs for t in z['teams'] if t not in SCOUT_TEAMS), None)
        home = team_home.get(base_tm)
        if home and home != first and legacy_cnt.get((base_tm, first), 0) <= 3:
            versions[0] = (first, 'base', None, {'team_override': 'Unaffiliated'}, None)
            if home in stats_by_game:
                versions.append((home, base_tm, base_tm, {'force': True}, None))
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
                # el compañero es el de la ficha de zukan (la wiki a veces no lo da o da otra forma: Zanark → Cao Cao)
                zp = next(p for z, p in mixi_z if z is pick)
                versions[cs_i] = versions[cs_i][:3] + ({**versions[cs_i][3], 'zukan': pick['id'], 'mixi': ([zp] if zp else []) + names},) + versions[cs_i][4:]
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

        # a mano: overrides.extra_versions (Nakata en Orfeo: sin ficha de zukan, hueco Nº 1922)
        for x in extra_ver:
            if x['page'] == pg and x['game'] in stats_by_game:
                versions.append((x['game'], x['team'], x['team'], {'force': True}, None))

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
                or ELEMENT.get(zs[0]['element'] if zs else None) or ELEMENT.get((info.get(pg) or {}).get('element'))
            real = [ZUKAN_TEAM.get(t, t) for z in zs for t in z['teams'] if t not in SCOUT_TEAMS]
            ot = old_team.get((name, g))
            team = tm if tm and tm != 'Adult' else ((ot if ot and ot not in SCOUT_TEAMS else None) or (real[0] if real else None)
                                                      or ot or (ZUKAN_TEAM.get(zs[0]['teams'][0], zs[0]['teams'][0]) if zs and zs[0]['teams'] else None))
            if isinstance(hint, dict) and hint.get('team_override'):
                team = hint['team_override']
            if tm == 'Adult':
                # el equipo es el de su ficha de adulto en zukan (casi siempre Sub Character); si no está en zukan, Sub Character
                azs = [z for z in zs if z.get('age') == 'Adult' and g in z['games'] and z['teams']
                       and 'Inazuma Legend National' not in z['teams']]
                az = next((z for z in azs if next((x for x in MAIN if x in z['games']), None) == g), azs[0] if azs else None)
                team = ZUKAN_TEAM.get(az['teams'][0], az['teams'][0]) if az else 'Sub Character'

            # técnicas
            mg = hint.get('moves_game') if isinstance(hint, dict) and hint.get('moves_game') else g
            mids = moves_for(fusion, 'GO3', entry) if fusion else moves_for(pg, mg, entry, adult=(tm in (ILJ, 'Adult')))
            if tm in ('Mixi Max', 'Chrono Storm') and not fusion and isinstance(hint, dict):
                mids = es_mixi_moves(pg, [n for n in (hint.get('mixi') or []) if n != 'mixi']) or mids
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
                'vr_file': (re.search(r'\n\t\t\tVR="([^"]+)"', entry or base_body or '') or [None, None])[1],
                'game_file': (re.search(r'\n\t\t\t' + MODULE[g] + r'="([^"]+)"', entry or base_body or '') or [None, None])[1],
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

    apply_tuning(cards, set(MAIN), ov, report)

    # a mano: overrides.drop_cards (versiones descartadas)
    drop = set(ov.get('drop_cards', {}).get('ids', []))
    cards = [c for c in cards if c['id'] not in drop]

    # equipos que no son de ese juego
    for c in cards:
        # los de Ares/Orion/Victory Road (Alia Academy, The Sambassadors…) → otro equipo clásico del personaje o sin equipo
        if c['team'] and c['team'] in team_classic and not team_classic[c['team']] and c['team'] not in SCOUT_TEAMS:
            alt = next((ZUKAN_TEAM.get(t, t) for z in c['zukan'] for t in z['teams']
                        if c['game'] in team_classic.get(ZUKAN_TEAM.get(t, t), ()) and t not in SCOUT_TEAMS), None)
            # si no, su equipo de zukan de secundarios/sin equipo (Cao Cao → Sub Character); los personajes solo de Ares/Orion/VR no llegan aquí (sin stats de la saga)
            alt = alt or next((t for z in c['zukan'] for t in z['teams'] if t in SCOUT_TEAMS), 'Unaffiliated')
            report.append(f"Equipo de Ares/Orion/VR en {c['name']} {c['game']}: {c['team']} → {alt}")
            c['team'] = alt
        # el primer equipo del Raimon de GO se llama Raimon en Chrono Stone y Galaxy
        if c['team'] == 'Raimon First Squad' and c['game'] in ('GO2', 'GO3'):
            c['team'] = 'Raimon'
    # aviso: equipos con 1–3 cartas en un juego que no es el suyo
    tg = collections.Counter((c['game'], c['team']) for c in cards)
    for (g_, t_), n_ in sorted(tg.items(), key=str):
        home_ = max((x for x in MAIN if tg.get((x, t_))), key=lambda x: tg[(x, t_)])
        if n_ <= 3 and home_ != g_ and tg[(home_, t_)] >= 8 and t_ not in SCOUT_TEAMS | {'Mixi Max'}:
            report.append(f'Equipo en otro juego: {t_} en {g_} ({n_}) — su juego es {home_}')

    # versión de adulto que coincide con otra carta del mismo personaje, juego y equipo (Caleb en la Resistencia de Japón): fuera
    keyset = collections.Counter((c['character_id'], c['game'], c['team']) for c in cards)
    cards = [c for c in cards if not (c['version'] == 'Adult' and keyset[(c['character_id'], c['game'], c['team'])] > 1)]

    # equipos con un solo jugador en ese juego: de momento fuera (el jugador pasa a sin equipo)
    solo = collections.Counter((c['game'], c['team']) for c in cards)
    for c in cards:
        if c['team'] and c['team'] not in SCOUT_TEAMS | {'Mixi Max'} and solo[(c['game'], c['team'])] == 1:
            report.append(f"Equipo con un solo jugador, fuera: {c['team']} ({c['game']}) → {c['name']} sin equipo")
            c['team'] = 'Unaffiliated'
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

    # poderes: las cartas Mixi Max (y el Chrono Storm, que va en su forma Mixi Max) no pueden usar nada;
    # la versión normal de GO2 del jugador indica con quién puede hacer Mixi Max
    partners = collections.defaultdict(list)
    for c in cards:
        if c['team'] in ('Mixi Max', 'Chrono Storm'):
            for sp in c.get('specials') or []:
                if sp['type'] == 'mixi' and sp.get('name') and sp['name'] not in partners[c['character_id']]:
                    partners[c['character_id']].append(sp['name'])
            c['specials'] = []
    for c in cards:
        if c['game'] == 'GO2' and c['team'] not in ('Mixi Max', 'Chrono Storm') and partners.get(c['character_id']):
            c['specials'] = [x for x in c.get('specials') or [] if x['type'] != 'mixi'] + \
                [{'type': 'mixi', 'name': ', '.join(partners[c['character_id']])}]

    # Caos: la carta base de ese juego (Prominence / Diamond Dust) cuenta también para ese equipo
    for c in cards:
        c['extra_teams'] = sorted({tm for g, tm in extra_team_pages.get(c['page'], ()) if g == c['game'] and c['version'] == 'base'})

    # --- nombres de equipo en castellano (wiki en español: plantilla Equipo; cruce por nombre inglés o japonés)
    es_team = {}
    for title, d in sorted(load('es_teams.json').items(), key=lambda kv: '(' in kv[0]):     # fichas principales primero
        es = re.sub(r'^Instituto ', '', d['es'] or re.sub(r'\s*\(.*\)$', '', title))
        for k in d['en'] + d['jp'] + [title]:
            if k != '/' and tnorm(k):
                es_team.setdefault(tnorm(k), es)
    manual_es = {k: v for k, v in ov.get('team_es', {}).items() if not k.startswith('_')}
    teams = []
    for tm in sorted({c['team'] for c in cards if c['team']} | {t for c in cards for t in c.get('extra_teams') or []}):
        teams.append({'name': tm, 'name_es': manual_es.get(tm) or es_team.get(tnorm(tm))})
    sin_es = [t['name'] for t in teams if not t['name_es']]
    if sin_es:
        report.append(f'Equipos sin nombre en castellano ({len(sin_es)}): añadir a overrides.team_es → ' + ', '.join(sin_es))

    # --- sprites de Victory Road por versión (wiki española: Diseño en los Videojuegos → Saga de Destin): más fieles que zukan
    sprites = load_opt('es_sprites.json', {})
    def norm_label(x):
        x = re.sub(r'\((?:GO|HVR|PR|IE HVR)\)', '', x or '')
        return re.sub(r'[^a-záéíóúñ0-9]', '', x.lower())
    LABEL_ALIAS = {}          # el Nuevo Inazuma Japón / Inazuma Japón Alterno (IJA) es de Victory Road, no el Earth Eleven
    def label_keys(label):
        """'Nuevo Inazuma Japón / Inazuma Japón Alterno' → cada nombre por separado (+ alias: Earth Eleven)"""
        out = set()
        for part in re.split(r'\s*(?:/|&)\s*', label or ''):
            k = norm_label(part)
            out |= {k, LABEL_ALIAS.get(k, k).replace('earthelevel', 'eartheleven')}
        return out
    sprite_force = {k: v for k, v in ov.get('sprite_force', {}).items() if not k.startswith('_')}
    # solo donde hace falta: foto repetida entre versiones del mismo personaje, o sin foto de zukan
    img_count = collections.Counter((c['character_id'], c['image_url']) for c in cards)
    first_holder = {}                                  # la primera carta con esa foto (la base) se la queda
    for c in sorted(cards, key=lambda c: (c['is_version'], MAIN.index(c['game']))):
        first_holder.setdefault((c['character_id'], c['image_url']), c['id'])
    sprite_review = []
    for c in cards:
        groups = sprites.get(c['page'])
        if not groups:
            continue
        mixi_card = c['team'] in ('Mixi Max', 'Chrono Storm')
        adult = c['version'] in (ILJ, 'Adult') or (c['team'] == 'Sub Character' and c['version'] == 'Adult')
        es_names = {norm_label(n) for n in (c['team'], c['version'], manual_es.get(c['team']), es_team.get(tnorm(c['team'] or '')),
                                             manual_es.get(c['version']), es_team.get(tnorm(c['version']))) if n}
        pm = re.search(r'Mixi Max \(([^)]+)\)', c['version'])
        partner = pm.group(1) if pm else next((sp.get('name') or '' for sp in c.get('specials') or [] if sp['type'] == 'mixi'), '')
        best, best_sc = None, 0
        for g in groups:
            era = g['era'].lower()
            if mixi_card != era.startswith('miximax'):
                continue
            if not (label_keys(g['label']) & es_names) and not (mixi_card and partner and partner.split()[0].lower()[:4] in era):
                continue
            sc = 5 + 3 * (('mark' in era and c['game'].startswith('IE')) or ('arion' in era and c['game'].startswith('GO')) or not era)
            for im in g['images']:
                if not im.get('url'):
                    continue
                cap = (im.get('caption') or '').lower()
                s2 = sc + 2 * (('portero' in cap and c['position'] == 'GK') or (('líbero' in cap or 'libero' in cap) and c['position'] != 'GK'))
                s2 += 2 * (('adult' in cap) == adult) - 3 * ('sin bandana' in cap) - 2 * (('joven' in cap) and adult)
                s2 -= 2 * (('portero' in cap and c['position'] != 'GK') or ('líbero' in cap and c['position'] == 'GK'))
                if s2 > best_sc:
                    best, best_sc = im['url'], s2
        if best:
            key = (c['character_id'], c['image_url'])
            repeated = img_count[key] > 1 and first_holder[key] != c['id']
            no_zukan = 'cloudfront.net' not in (c['image_url'] or '')
            always = c['version'] == ILJ                                # Legendario: siempre su sprite
            if repeated or no_zukan or always:
                c['image_url'] = best
            else:
                sprite_review.append({'id': c['id'], 'name': c['name'], 'game': c['game'], 'version': c['version'],
                                      'zukan': c['image_url'], 'sprite': best})
    have_lab = collections.defaultdict(set)
    for c in cards:
        have_lab[c['page']] |= {norm_label(x) for x in (c['team'], c['version'], es_team.get(tnorm(c['team'] or '')), manual_es.get(c['team']),
                                                         es_team.get(tnorm(c['version'])), manual_es.get(c['version'])) if x}
    extra_sprites = []
    for pg_, groups in sprites.items():
        if pg_ not in have_lab:
            continue
        for g in groups:
            if g['era'].lower().startswith(('saga de mark', 'saga de arion')) and norm_label(g['label']) not in have_lab[pg_]:
                extra_sprites.append(f"{pg_}: {g['label']} ({g['era']})")
    # índice de sprites de Victory Road de la wiki española: "(EO) Steve (HVR).png" = iniciales del equipo en castellano + nombre
    hvr = load_opt('es_hvr_files.json', {})
    en_vr = load_opt('en_vr_sprites.json', {})
    en_vr_index = load_opt('en_vr_index.json', {})
    def en_vr_sprite(c):
        """avatar de Victory Road (wiki inglesa) de la forma de la carta: el de su PlayerData, o el que corresponde
        al sprite de su juego: "(SR) Kurama Norihito sprite" → "(SR) Kurama Norihito sprite (VR)\""""
        mixi = c['team'] in ('Mixi Max', 'Chrono Storm')
        cands = []
        if c.get('vr_file'):
            cands.append(c['vr_file'])
        gf = c.get('game_file') or ''
        m_ = re.match(r'(\([^)]*(?:\([^)]*\))?[^)]*\))\s+(.+?) sprite', gf)
        if m_:
            cands.append(f'{m_.group(1)} {m_.group(2)} sprite (VR)')
        # por código de equipo de la wiki inglesa + nombre (romaji de la ficha o apodo): "(EK) Zel sprite (VR)"
        codes = EN_TEAM_CODE.get((c['team'], c['game'][:2]), []) + EN_TEAM_CODE.get((c['version'], c['game'][:2]), [])
        # porteros: la equipación de portero primero ("(EE-A)", "(SR-GK)")
        codes = sorted(codes, key=lambda k: (c['position'] == 'GK') != bool(re.search(r'-(A|GK)$', k)))
        names = {c['page']} | {lua_field(b, 'nickname') for b in by_page.get(c['page'], []) if lua_field(b, 'nickname')} \
            | {f for b in by_page.get(c['page'], []) for f in re.findall(r'\bfile="([^"(]+)"', b)}
        team_c = [f'({code}) {n_} sprite (VR)' for code in codes for n_ in sorted(names)]
        # versiones de equipo (Earth Eleven…): primero el avatar de ese equipo; el de su PlayerData es el de la carta base
        own = re.match(r'\((.+?)\) ', c.get('vr_file') or '')
        first_team = c['is_version'] and c['team'] not in ('Mixi Max', 'Chrono Storm') \
            and not (own and own.group(1) in codes)         # su PlayerData ya trae el de ese equipo (Desarm "(EK-GK)")
        cands = team_c + cands if first_team else cands + team_c
        if c['version'] in ('Adult', ILJ):                 # adultos: avatar de entrenador / adulto con cualquier prefijo
            cands += sorted(k for k in en_vr_index for n_ in names
                            if k.endswith((f'{n_} sprite (coach) (VR)', f'{n_} sprite (adult) (VR)')))
        for n_ in cands:
            if ('(MM' in n_ or 'Mixi' in n_) and not mixi:
                continue
            url = en_vr.get(n_) or en_vr_index.get(n_)
            if url:
                return url
        return None
    import unicodedata
    plain = lambda x: ''.join(ch for ch in unicodedata.normalize('NFD', x or '') if unicodedata.category(ch) != 'Mn').lower()
    hvr_idx = collections.defaultdict(list)
    for fname, url in hvr.items():
        m_ = re.match(r'\((.+?)\)\s+(.+?)\s*\((HVR[^)]*)\)', fname)
        if m_:
            hvr_idx[m_.group(1)].append((plain(m_.group(2)), m_.group(3), fname, url))
    def initials(team_es):
        words = [w for w in re.split(r'[\s-]+', plain(team_es)) if w and w not in ('de', 'del', 'la', 'las', 'los', 'el')]
        return ''.join(w[0] for w in words).upper()
    es_char = {k: v.get('es_page') for k, v in es_desc.items()}
    def hvr_sprite(c):
        team_es = manual_es.get(c['team']) or es_team.get(tnorm(c['team'] or '')) or c['team'] or ''
        ver_es = manual_es.get(c['version']) or es_team.get(tnorm(c['version'])) or ''
        codes = []
        for t_ in (ver_es, team_es):
            if t_:
                ini = initials(t_)
                # en GO, el Raimon es "R (GO)": el "(R)" a secas es el de la saga original (otro Peabody…)
                codes += ([f'{ini} (GO)'] + ([] if ini == 'R' else [ini])) if c['game'].startswith('GO') else [ini]
        names = {w for n_ in (c['name'], es_char.get(c['page'])) for w in re.split(r'[\s"\']+', plain(n_)) if len(w) > 2}
        best, best_sc = None, 0
        for code in codes:
            for nick, var, fname, url in hvr_idx.get(code, []):
                if not (set(nick.split()) & names):
                    continue
                v = var.lower()
                sc = 10 + 2 * (('pr' in v) == (c['position'] == 'GK')) + (('df' in v) == (c['position'] == 'DF'))
                sc += 2 * (('adult' in v) == (c['version'] in (ILJ, 'Adult'))) - 2 * ('joven' in v and c['version'] in (ILJ, 'Adult'))
                if sc > best_sc:
                    best, best_sc = url, sc
            if best:
                break
        return best
    dup_img = collections.Counter((c['character_id'], c['image_url']) for c in cards)
    first_img = {}
    for c in sorted(cards, key=lambda c: (c['is_version'], MAIN.index(c['game']))):
        first_img.setdefault((c['character_id'], c['image_url']), c['id'])
    for c in cards:
        key = (c['character_id'], c['image_url'])
        pending = (dup_img[key] > 1 and first_img[key] != c['id']) or '3D' in (c['image_url'] or '') \
            or (c['version'] == ILJ and '/inazuma/images' not in (c['image_url'] or ''))
        if pending:
            # 1) sprite de la wiki española por iniciales + nombre; 2) avatar de Victory Road de su forma en la wiki inglesa
            url = hvr_sprite(c) or en_vr_sprite(c)
            if url:
                c['image_url'] = url

    for c in cards:                                   # a mano: overrides.sprite_force
        f_ = sprite_force.get(c['id'])
        if f_:
            url = next((im.get('url') for g in sprites.get(c['page'], []) for im in g['images'] if im['file'] == f_ and im.get('url')), None)
            if url:
                c['image_url'] = url
                sprite_review = [x for x in sprite_review if x['id'] != c['id']]
            else:
                report.append(f'sprite_force sin imagen: {c["id"]} → {f_}')
    team_force = {k: v for k, v in ov.get('team_force', {}).items() if not k.startswith('_')}
    xv_by_id = {f"{slug(x['page'])}--{x['game'].lower()}--{slug(x['team'])}": x for x in extra_ver}
    for c in cards:                                   # a mano: overrides.team_force / extra_versions (equipo, foto, nº)
        if c['id'] in team_force:
            c['team'] = team_force[c['id']]
        x = xv_by_id.get(c['id'])
        if x and x.get('image'):
            c['image_url'] = x['image']
            sprite_review = [r for r in sprite_review if r['id'] != c['id']]
        if x and x.get('no'):
            c['no_force'] = x['no']
    with open(os.path.join(OUT, 'sprites_review.json'), 'w', encoding='utf-8') as f:
        json.dump(sprite_review, f, ensure_ascii=False, indent=1)
    if extra_sprites:
        report.append(f'Versiones con sprite de Victory Road sin carta ({len(extra_sprites)}): ' + '; '.join(extra_sprites))

    # nº de cada carta: el de su ficha de zukan (la primera carta que la usa); las nuestras, a partir del último de zukan
    max_no = max(z['no'] for z in zukan if z.get('no'))
    zgames = {z['no']: set(z['games']) for z in zukan if z.get('no')}
    for c in cards:                     # ficha de zukan solo de Ares/Orion/VR (Ulvida IE2 = Isabelle Trick de Ares): ese nº es de su carta de Ares
        if c.get('zukan_no') and not zgames.get(c['zukan_no'], set()) & MAINLINE:
            c['zukan_no'] = None
    taken = set()
    for c in cards:
        if c.get('no_force'):
            c['no'] = c.pop('no_force')
            taken.add(c['no'])
    for c in sorted(cards, key=lambda c: (c['is_version'], MAIN.index(c['game']), c['id'])):
        if 'no' in c:
            continue
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
        if not role or not (set(z['games']) & (MAINLINE | {'ARES', 'ORION'}) or set(z['games']) == {'VR'}):
            continue
        zteams = [ZUKAN_TEAM.get(t, t) for t in z['teams']]
        staff.append({'zukan_no': z['no'], 'name': z['name'], 'role': role, 'team': zteams[0] if zteams else None,
                      'teams': zteams, 'games': [g for g in MAIN + ['ARES', 'ORION'] if g in z['games']] + (['VR'] if set(z['games']) == {'VR'} else []), 'age': z['age'],
                      'element': ELEMENT.get(z['element']), 'image_url': f"https://dxi4wb638ujep.cloudfront.net/1/{z['id']}.png",
                      'description': (zdesc.get(str(z['no'])) or {}).get('desc'), 'wiki_page': page_of(z)})
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
    # --- Ares (Ares no Tenbin, curva de IE2) y Orion (Orion no Kokuin, curva de IE3): Victory Road + wiki (tools/db/ares.py)
    classic = list(cards)
    a_cards = []
    for g_ in ('ARES', 'ORION', 'VR'):
        g_cards, g_chars = ares.build(ROOT, CACHE, zukan, zdesc, page_of, classic, techniques, es_by_jp, es_by_en, norm_jp,
                                      zskills, zskills_en, ELEMENT, ZUKAN_TEAM, category, es_desc, report, game=g_, ares_cards=a_cards)
        apply_tuning(g_cards, {g_}, ov, report)                  # curva de rivales (team_tuning.ARES / .ORION)
        a_cards += g_cards
        for k, v in g_chars.items():
            chars_out.setdefault(k, v)
    nxt = max(c['no'] for c in cards)                # ficha de Ares y Orion: la carta de Orion, un nº propio (después de los nuestros)
    for c in sorted((c for c in a_cards if not c['no']), key=lambda c: c['id']):
        nxt += 1
        c['no'] = nxt
    # poderes especiales de VR (módulo PlayerData/VR de la wiki): espíritu guerrero de su ficha; los Zanark Outsiders son
    # Mixi Max con Zanark (su ficha de forma Mixi Max, con su keshin si lo tiene)
    vr_path = os.path.join(CACHE, 'PlayerData_VR.lua')
    vr_by_page = collections.defaultdict(list)
    special_es = {k: v for k, v in ov.get('special_es', {}).items() if not k.startswith('_')}   # a mano: los que la wiki no enlaza
    for b_ in (lua_entries(open(vr_path, encoding='utf-8').read()).values() if os.path.exists(vr_path) else []):
        pg_ = re.search(r'\n\t\tpage="([^"]+)"', b_)
        if pg_:
            vr_by_page[pg_.group(1)].append(b_)
    for c in a_cards:
        if c['game'] != 'VR' or not c['page']:
            continue
        outsider = c['team'] == "Zanark's Outsiders"
        bodies = vr_by_page.get(c['page'], [])
        form_of = lambda b_: (re.search(r'\n\t\tform="([^"]*)"', b_) or [None, ''])[1]
        body = next((b_ for b_ in bodies if outsider and 'mixi' in form_of(b_).lower()), None) \
            or next((b_ for b_ in bodies if not form_of(b_)), None)
        sp = []
        for key, armed in (lua_game_list(body, 'keshin', 'VR') if body else []):
            kd = keshin_data.get(key, '')
            kpage = (re.search(r'page="([^"]+)"', kd) or [None, key])[1]
            es, en = es_keshin.get(romaji(kpage), (None, None))
            hk = re.search(r'\n\t\thissatsu="(\w+)"', kd)
            ht = technique_any(hk.group(1)) if hk else None
            sp.append({'type': 'keshin', 'name': en or kpage, 'name_es': es or special_es.get(en or kpage), 'armed': False,
                       'hyper': ht and ht['name'], 'hyper_es': ht and (ht.get('name_es') or special_es.get(ht['name'])),
                       'hyper_jp': ht and ht.get('name_jp')})
        if outsider:
            sp.append({'type': 'mixi', 'name': 'Zanark' if c['character_id'] != 'zanark-avalonic' else 'Zanark (futuro)'})
        c['specials'] = sp
    solo = collections.Counter((c['game'], c['team']) for c in a_cards)   # equipos con un solo jugador: fuera, como en los clásicos
    for c in a_cards:
        if c['team'] not in SCOUT_TEAMS and solo[(c['game'], c['team'])] == 1:
            report.append(f"Equipo con un solo jugador, fuera: {c['team']} ({c['game']}) → {c['name']} sin equipo")
            c['team'] = 'Unaffiliated'
    cards += a_cards
    known = {t['name'] for t in teams}
    for tm in sorted({c['team'] for c in a_cards} - known):
        teams.append({'name': tm, 'name_es': manual_es.get(tm) or es_team.get(tnorm(tm))})
    sin_es = sorted(t['name'] for t in teams if not t['name_es'] and t['name'] in {c['team'] for c in a_cards})
    if sin_es:
        report.append(f'Ares/Orion: equipos sin nombre en castellano ({len(sin_es)}): añadir a overrides.team_es → ' + ', '.join(sin_es))
    names_ja = json.load(open(os.path.join(ZUKAN_DIR, 'chara_names_ja.json'), encoding='utf-8')) \
        if os.path.exists(os.path.join(ZUKAN_DIR, 'chara_names_ja.json')) else {}
    zukan_rows = [{'no': z['no'], 'image_id': z['id'], 'name': z['name'], 'name_ja': names_ja.get(z['id']), 'role': z['role'], 'age': z['age'],
                   'element': ELEMENT.get(z['element']), 'position': z['position'], 'teams': z['teams'], 'games': z['games'],
                   'description': (zdesc.get(str(z['no'])) or {}).get('desc'), 'vr_lv50': (zdesc.get(str(z['no'])) or {}).get('vr_lv50'),
                   'wiki_page': page_of(z)} for z in zukan if z.get('no')]
    localize(cards, techniques, teams, ov, report)           # nombres en francés e italiano (i18n.py)
    if write:
        write_outputs(cards, chars_out, techniques, teams, staff, zukan_rows, report)
    return uncovered



if __name__ == '__main__':
    main(main(write=False))
