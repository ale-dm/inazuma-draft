#!/usr/bin/env python3
"""
Descarga (con caché) todas las fuentes de la base de jugadores.
Ver docs/plan-base-jugadores.md.

Uso:  python3 tools/db/fetch.py [--refresh]
      --refresh  vuelve a descargarlo todo (si no, reutiliza tools/.cache/db/)

Solo usa la librería estándar. Las páginas normales de Fandom están tras
Cloudflare, pero la API de MediaWiki (api.php) funciona.
"""
import html
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, 'tools', '.cache', 'db')
WIKI_API = 'https://inazuma-eleven.fandom.com/api.php'
WIKI_ES_API = 'https://inazuma.fandom.com/es/api.php'
XTREME_API = 'https://iegos13xtreme.fandom.com/api.php'
ZUKAN_LIST = 'https://zukan.inazuma.jp/en/chara_list/?page='
BALANCING_DOC = 'https://docs.google.com/document/d/1PT3LSxd1CUyhkHUD9xtpZdm4zmhScg-ZvIW6Yz1wy0M/export?format=txt'
UA = {'User-Agent': 'Mozilla/5.0 (inazuma-draft data tools)'}
MODULES = ['IE', 'IE2', 'IE3', 'GO', 'CS', 'GX']
GAMES = ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3', 'ARES', 'ORION', 'VR']
TEAM_PAGES = ['Chrono Storm', 'Shinsei Raimon', 'Inazuma Japan (GO)', 'Earth Eleven', 'Inazuma Legend Japan']
WIKI_ONLY = ['Nakata Hidetoshi', 'Pants']   # no están en Victory Road (licencias)

REFRESH = '--refresh' in sys.argv


def log(*a):
    print(*a, flush=True)


def get(url, params=None, tries=5):
    if params:
        url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
                return r.read()
        except Exception as e:  # red inestable / 429
            if i == tries - 1:
                raise
            time.sleep(2 ** i)


def api(base, **params):
    params.update(format='json', formatversion=2)
    return json.loads(get(base, params))


def cached(name, producer):
    path = os.path.join(CACHE, name)
    if not REFRESH and os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f) if name.endswith('.json') else f.read()
    data = producer()
    os.makedirs(CACHE, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        if name.endswith('.json'):
            json.dump(data, f, ensure_ascii=False)
        else:
            f.write(data)
    return data


# ---------------------------------------------------------------- zukan
def fetch_zukan():
    def text(s):
        s = re.sub(r'<br\s*/?>', ' / ', s)
        return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', s))).strip()
    first = get(ZUKAN_LIST + '1').decode('utf-8')
    last = max(int(n) for n in re.findall(r'chara_list/\?page=(\d+)', first))
    rows = []
    for page in range(1, last + 1):
        h = first if page == 1 else get(ZUKAN_LIST + str(page)).decode('utf-8')
        for block in h.split('<tbody>')[1:]:
            m = re.search(r'data-chara-id="([^"]+)"\s*data-chara-name="([^"]*)"', block)
            if not m:
                continue
            cells = [text(c) for c in re.findall(r'<td[^>]*>(.*?)</td>', block, re.S)]
            q = re.search(r'href="/en/chara_param/\?q=([^"]+)"', block)
            marks = cells[-9:]
            rows.append({
                'no': int(cells[1]) if cells[1].isdigit() else None,          # nº oficial del zukan
                'id': m.group(1), 'name': html.unescape(m.group(2)).strip(), 'q': q.group(1) if q else None,
                'element': cells[6], 'position': cells[7], 'role': cells[8], 'age': cells[9],
                'teams': [t.strip() for t in cells[11].split(' / ') if t.strip()],
                'games': [g for g, x in zip(GAMES, marks) if x == '○'],
            })
        log(f'  zukan {page}/{last}')
        time.sleep(0.3)
    return rows


ZUKAN_PARAM = 'https://zukan.inazuma.jp/en/chara_param/?q='
MAINLINE = {'IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3'}


def fetch_zukan_desc(zukan):
    """nº de zukan → descripción oficial (texto tras 'Character Viewer Game: …') y juego de estreno"""
    from concurrent.futures import ThreadPoolExecutor
    todo = [z for z in zukan if z.get('q')]
    def one(z):
        t = get(ZUKAN_PARAM + z['q']).decode('utf-8')
        t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
        t = html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', t)))
        m = re.search(r'Character Viewer Game: (.+?) (?:How to Obtain|Position )', t)
        game, desc = (None, None)
        if m:
            g = re.match(r'(Inazuma Eleven(?: GO Chrono Stones: Wildfire / Thunderflash| GO Galaxy: Big Bang / Supernova| GO: Light / Shadow'
                         r'| 2: Firestorm / Blizzard| 3: Lightning Bolt / Bomb Blast / Team Ogre Attacks!| Ares| Orion|: Victory Road)?) (.*)', m.group(1))
            game, desc = (g.group(1), g.group(2)) if g else (None, m.group(1))
        stats = {k: int(v) for k, v in re.findall(r'(Kick|Control|Technique|Pressure|Physical|Agility|Intelligence) Lv50 (\d+)', t)}
        return str(z['no']), {'game': game, 'desc': desc, 'vr_lv50': stats or None}
    part = os.path.join(CACHE, 'zukan_desc.partial.json')      # progreso parcial: se puede reanudar
    out = json.load(open(part, encoding='utf-8')) if os.path.exists(part) else {}
    todo = [z for z in todo if str(z['no']) not in out]
    with ThreadPoolExecutor(4) as ex:
        for i, (k, v) in enumerate(ex.map(one, todo), 1):
            out[k] = v
            if i % 100 == 0 or i == len(todo):
                with open(part, 'w', encoding='utf-8') as f:
                    json.dump(out, f, ensure_ascii=False)
                log(f'  fichas {i}/{len(todo)}')
    os.remove(part) if os.path.exists(part) else None
    return out


# ---------------------------------------------------------------- wiki
def wikitext(base, title):
    d = api(base, action='parse', page=title, prop='wikitext', redirects=1)
    return d['parse']['wikitext']


def resolve_titles(names):
    """nombre inglés → título de la ficha (sigue redirecciones)"""
    out = {}
    names = sorted(set(names))
    for i in range(0, len(names), 50):
        batch = names[i:i + 50]
        d = api(WIKI_API, action='query', titles='|'.join(batch), redirects=1)['query']
        norm = {n['from']: n['to'] for n in d.get('normalized', [])}
        red = {r['from']: r['to'] for r in d.get('redirects', [])}
        exist = {p['title'] for p in d['pages'] if not p.get('missing')}
        for n in batch:
            t = norm.get(n, n)
            t = red.get(t, t)
            out[n] = t if t in exist else None
        log(f'  redirecciones {min(i + 50, len(names))}/{len(names)}')
        time.sleep(0.3)
    return out


def page_contents(titles, keep):
    """título → keep(contenido) para muchas páginas (lotes de 25)"""
    out = {}
    titles = sorted(set(titles))
    for i in range(0, len(titles), 25):
        batch = titles[i:i + 25]
        d = api(WIKI_API, action='query', prop='revisions', rvprop='content', rvslots='main',
                titles='|'.join(batch), redirects=1)['query']
        red = {r['from']: r['to'] for r in d.get('redirects', []) + d.get('normalized', [])}
        got = {p['title']: p['revisions'][0]['slots']['main']['content']
               for p in d['pages'] if not p.get('missing') and p.get('revisions')}
        for t in batch:
            tt = red.get(t, t)
            tt = red.get(tt, tt)
            out[t] = keep(got[tt]) if tt in got else None
        log(f'  páginas {min(i + 25, len(titles))}/{len(titles)}')
        time.sleep(0.3)
    return out


def parameters_section(content):
    i = content.find('==Parameters==')
    if i < 0:
        return None
    j = content.find('\n==', i + 14)
    while j > 0 and content[j + 3:j + 4] == '=':   # saltar subsecciones ===
        j = content.find('\n==', j + 4)
    return content[i:j if j > 0 else None]


def infobox(content):
    fields = {}
    for k in ('name_dub', 'name_jp', 'type', 'type2', 'element', 'position', 'image'):
        m = re.search(r'\|\s*' + k + r'\s*=\s*([^\n]*)', content)
        if m:
            fields[k] = m.group(1).strip()
    for k in ('tp_iego3', 'tp_ie3', 'tp_iego2', 'tp_ie2', 'tp_iego', 'tp_ie'):
        m = re.search(r'\|\s*' + k + r'\s*=\s*([^\n|]*)', content)
        n = re.search(r'\d+', m.group(1)) if m else None
        if n:
            fields[k] = int(n.group())
    return fields


def lua_entries(text):
    """módulo Lua → {clave: cuerpo} (entradas de primer nivel)"""
    starts = [(m.start(), m.group(1)) for m in re.finditer(r'\n\t(\w+)=\{', text)]
    return {k: text[p:(starts[i + 1][0] if i + 1 < len(starts) else len(text))]
            for i, (p, k) in enumerate(starts)}


def load_fusions():
    path = os.path.join(CACHE, 'fusions.json')
    return json.load(open(path, encoding='utf-8')) if os.path.exists(path) else {}


def main():
    log('1/8 zukan')
    zukan = cached('zukan.json', fetch_zukan)
    log(f'    {len(zukan)} fichas')

    log('1b ficha de cada personaje de zukan (descripción oficial y stats de Victory Road) — todas')
    path = os.path.join(CACHE, 'zukan_desc.json')
    have = {} if REFRESH or not os.path.exists(path) else json.load(open(path, encoding='utf-8'))
    if any(z.get('q') and str(z['no']) not in have for z in zukan):          # incremental: solo las que faltan
        have.update(fetch_zukan_desc([z for z in zukan if str(z['no']) not in have]))
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(have, f, ensure_ascii=False)

    log('2/8 módulos de la wiki (PlayerData, WazaData)')
    mods = {m: cached(f'PlayerData_{m}.lua', lambda m=m: wikitext(WIKI_API, f'Module:PlayerData/{m}')) for m in MODULES}
    waza = cached('WazaData.lua', lambda: wikitext(WIKI_API, 'Module:WazaData'))

    log('3/8 nombres de zukan → fichas de la wiki')
    names = [z['name'] for z in zukan if z['role'].startswith('Player')]
    titles = cached('redirects.json', lambda: resolve_titles(names))

    log('4/8 fichas de jugadores (Parameters + infobox)')
    pages = sorted({t for t in titles.values() if t} | set(WIKI_ONLY))
    params = cached('params.json', lambda: page_contents(pages, lambda c: {'params': parameters_section(c), 'info': infobox(c)}))

    log('5/8 técnicas (ficha de cada técnica)')
    used = set()
    for m in MODULES:
        used |= set(re.findall(r'\{"(\w+)"', mods[m]))
    wz = lua_entries(waza)
    move_page = {}
    for k in used:
        pm = re.search(r'page="([^"]+)"', wz.get(k, ''))
        move_page[k] = pm.group(1).split('#')[0] if pm else k
    move_info = cached('moves.json', lambda: page_contents(sorted(set(move_page.values())), infobox))
    cached('move_page.json', lambda: move_page)

    log('6/8 equipos protagonistas de GO')
    cached('teams.json', lambda: {t: wikitext(WIKI_API, t) for t in TEAM_PAGES})

    log('6b fusiones Mixi Max de la wiki (Gousetsuji = Axel + Shawn "Shaxel"…)')
    def fusions():
        titles_ = []
        for cat in ('Category:Galaxy scouts', 'Category:Chrono Stone scouts'):
            cont = {}
            while True:
                d = api(WIKI_API, action='query', list='categorymembers', cmtitle=cat, cmlimit=500, **cont)
                titles_ += [m['title'] for m in d['query']['categorymembers'] if m['ns'] == 0]
                if 'continue' not in d:
                    break
                cont = {'cmcontinue': d['continue']['cmcontinue']}
        out = {}
        def keep(c):
            prof = re.search(r'\{\{Profile/Entry[^\n]*', c)
            if not prof or 'Mixi Max' not in prof.group(0):
                return None
            dub = re.search(r'\|name_dub=\s*([^\n]*)', c)
            return {'pair': [x for x in re.findall(r'\[\[([^|\]]+)', prof.group(0)) if x != 'Mixi Max'],
                    'dub': dub.group(1).strip() if dub else None, 'params': parameters_section(c), 'info': infobox(c)}
        return {t: v for t, v in page_contents(sorted(set(titles_)), keep).items() if v}
    cached('fusions.json', fusions)

    log('6c Keshin (espíritus guerreros) y Souls (tótems): módulos de la wiki y nombres en castellano')
    cached('KeshinData.lua', lambda: wikitext(WIKI_API, 'Module:KeshinData'))
    cached('SoulData.lua', lambda: wikitext(WIKI_API, 'Module:SoulData'))
    def es_category(cat, tpl_fields=('Nombre Japonés', 'Nombre Inglés')):
        titles_, cont = [], {}
        while True:
            d = api(WIKI_ES_API, action='query', list='categorymembers', cmtitle=cat, cmlimit=500, **cont)
            titles_ += [m['title'] for m in d['query']['categorymembers'] if m.get('ns') == 0]
            if 'continue' not in d:
                break
            cont = {'cmcontinue': d['continue']['cmcontinue']}
        out = {}
        for i in range(0, len(titles_), 50):
            d = api(WIKI_ES_API, action='query', prop='revisions', rvprop='content', rvslots='main', titles='|'.join(titles_[i:i + 50]))
            for p in d['query']['pages']:
                if p.get('missing') or not p.get('revisions'):
                    continue
                c = p['revisions'][0]['slots']['main']['content']
                jp = re.search(r'\|\s*Nombre Japonés\s*=(.*?)\n\|', c, re.S)
                en = re.search(r'\|\s*Nombre Inglés\s*=\s*([^\n]*)', c)
                out[p['title']] = {'jp': re.findall(r'(?:<br>|\n)\s*([A-Za-z][^<{\n]*)', jp.group(1)) + re.findall(r'title="([^"]+)"', jp.group(1)) if jp else [],
                                   'en': [en.group(1).strip()] if en else []}
            time.sleep(0.3)
        return out
    cached('es_keshin.json', lambda: es_category('Categoría:Espíritus Guerreros'))
    cached('es_souls.json', lambda: es_category('Categoría:Tótem'))

    log('6d descripciones en castellano (inazuma.fandom.com/es, sección Descripciones)')
    def query_all(base, **params):
        """api(query) siguiendo 'continue' (las respuestas grandes llegan en trozos) → páginas fusionadas por título"""
        pages, red, cont = {}, {}, {}
        while True:
            d = api(base, action='query', **params, **cont)
            q = d.get('query', {})
            for r in q.get('redirects', []) + q.get('normalized', []):
                red[r['to']] = r['from']
            for p in q.get('pages', []):
                cur = pages.setdefault(p['title'], {'title': p['title']})
                for k in ('langlinks', 'revisions'):
                    if p.get(k):
                        cur.setdefault(k, []).extend(p[k])
            if 'continue' not in d:
                return pages, red
            cont = d['continue']
            time.sleep(0.2)

    def es_descriptions():
        pages_ = sorted({t for t in titles.values() if t} | set(WIKI_ONLY) | set(load_fusions()))
        es = {}
        for i in range(0, len(pages_), 50):                  # ficha inglesa → ficha española (enlace interlingüístico)
            pg_, red = query_all(WIKI_API, titles='|'.join(pages_[i:i + 50]), prop='langlinks', lllang='es', lllimit=500, redirects=1)
            for t, p in pg_.items():
                for ll in p.get('langlinks', []):
                    es[red.get(t, t)] = ll['title']
        log(f'  {len(es)} fichas con enlace a la wiki en castellano')
        # sin enlace: probar con el nombre inglés de zukan (la wiki española usa los nombres del doblaje: Axel Blaze…)
        name_of = {}
        for n, t in titles.items():
            if t and t not in es:
                name_of.setdefault(t, n)
        cand = sorted(set(name_of.values()))
        for i in range(0, len(cand), 50):
            d = api(WIKI_ES_API, action='query', titles='|'.join(cand[i:i + 50]), redirects=1)['query']
            red = {r['from']: r['to'] for r in d.get('normalized', []) + d.get('redirects', [])}
            exist = {p['title'] for p in d['pages'] if not p.get('missing') and not p.get('invalid')}
            for n in cand[i:i + 50]:
                t = red.get(n, n)
                t = red.get(t, t)
                if t in exist:
                    for pg_en, nn in name_of.items():
                        if nn == n:
                            es.setdefault(pg_en, t)
            time.sleep(0.2)
        log(f'  {len(es)} fichas con versión en castellano (enlace o nombre)')
        inv = {v: k for k, v in es.items()}
        out, es_titles = {}, sorted(inv)
        for i in range(0, len(es_titles), 20):
            pg_, red = query_all(WIKI_ES_API, titles='|'.join(es_titles[i:i + 20]), prop='revisions', rvprop='content', rvslots='main', redirects=1)
            for t, p in pg_.items():
                if not p.get('revisions'):
                    continue
                c = p['revisions'][0]['slots']['main']['content']
                m = re.search(r'\n==\s*Descripci(?:ón|ones)\s*==', c)
                if not m:
                    continue
                b2 = re.search(r'\n==[^=]', c[m.end():])
                sec = c[m.start():m.end() + b2.start()] if b2 else c[m.start():]
                out[inv.get(red.get(t, t), inv.get(t, t))] = {'es_page': t, 'section': sec}
            if i % 400 == 0:
                log(f'  descripciones {i}/{len(es_titles)}')
        return out
    cached('es_descriptions.json', es_descriptions)

    log('7/8 jugadores solo de la wiki (imagen)')
    def wiki_only():
        d = api(WIKI_API, action='query', titles='|'.join(WIKI_ONLY), prop='pageimages', piprop='original')['query']
        return {p['title']: (p.get('original') or {}).get('source') for p in d['pages']}
    cached('wiki_only_images.json', wiki_only)

    log('8/9 supertécnicas en castellano (inazuma.fandom.com/es)')
    def es_techniques():
        titles_, cont = [], {}
        while True:
            d = api(WIKI_ES_API, action='query', list='categorymembers', cmtitle='Categoría:Supertécnicas', cmlimit=500, **cont)
            titles_ += [m['title'] for m in d['query']['categorymembers'] if m.get('ns') == 0]
            if 'continue' not in d:
                break
            cont = {'cmcontinue': d['continue']['cmcontinue']}
        out = {}
        for i in range(0, len(titles_), 50):
            d = api(WIKI_ES_API, action='query', prop='revisions', rvprop='content', rvslots='main', titles='|'.join(titles_[i:i + 50]))
            for p in d['query']['pages']:
                if p.get('missing') or not p.get('revisions'):
                    continue
                c = p['revisions'][0]['slots']['main']['content']
                jsec = re.search(r'\|\s*Nombre Japonés\s*=(.*?)\n\|', c, re.S)
                jsec = jsec.group(1) if jsec else ''
                jp = re.findall(r'\|\s*K\s*=\s*([^}|]+)', jsec) + re.findall(r'<span[^>]*>([^<]+)</span>', jsec)
                dob = re.search(r'\|\s*Nombre DOB\s*=(.*?)\n\|', c, re.S)
                en = re.findall(r'\*?\s*([^*{}\n\']+?)\s*\{\{(?:EN|US)\}\}', dob.group(1)) if dob else []
                en += re.findall(r'\|\s*Nombre Inglés\s*=\s*([^\n|]+)', c)
                out[p['title']] = {'jp': [j.strip() for j in jp if j.strip()], 'en': [e.strip() for e in en if e.strip() not in ('/', '')]}
            log(f'  técnicas ES {min(i + 50, len(titles_))}/{len(titles_)}')
            time.sleep(0.3)
        return out
    cached('es_techniques.json', es_techniques)

    log('9/10 renders 3D de las formas (wiki): "(DE) Kazemaru 3D (1).png"')
    def form_images():
        cands = set()
        for m in MODULES:
            for body in lua_entries(mods[m]).values():
                nick = re.search(r'\n\t\tnickname="([^"]+)"', body)
                if not nick:
                    continue
                for pre in re.findall(r'="\(([^)]+(?:\([^)]*\))?)\) [^"]*sprite', body):
                    cands.add(f'File:({pre}) {nick.group(1)} 3D (1).png')
        cands, out = sorted(cands), {}
        for i in range(0, len(cands), 50):
            d = api(WIKI_API, action='query', titles='|'.join(cands[i:i + 50]), prop='imageinfo', iiprop='url')['query']
            norm = {n['to']: n['from'] for n in d.get('normalized', [])}
            for pg in d['pages']:
                if not pg.get('missing') and pg.get('imageinfo'):
                    out[norm.get(pg['title'], pg['title'])] = pg['imageinfo'][0]['url']
            log(f'  renders {min(i + 50, len(cands))}/{len(cands)}')
            time.sleep(0.3)
        return out
    cached('form_images.json', form_images)

    log('10/11 equipos en castellano (inazuma.fandom.com/es, plantilla Equipo)')
    def es_teams():
        titles_, cont = [], {}
        while True:
            d = api(WIKI_ES_API, action='query', list='embeddedin', eititle='Plantilla:Equipo', einamespace=0, eilimit=500, **cont)
            titles_ += [m['title'] for m in d['query']['embeddedin']]
            if 'continue' not in d:
                break
            cont = {'eicontinue': d['continue']['eicontinue']}
        out = {}
        for i in range(0, len(titles_), 50):
            d = api(WIKI_ES_API, action='query', prop='revisions', rvprop='content', rvslots='main', titles='|'.join(titles_[i:i + 50]))
            for p in d['query']['pages']:
                if p.get('missing') or not p.get('revisions'):
                    continue
                c = p['revisions'][0]['slots']['main']['content']
                field = lambda k: (re.search(r'\|\s*' + k + r'\s*=(.*?)\n\|', c, re.S) or [None, ''])[1]
                nombre = field('Nombre')
                es = re.match(r'\s*([^{<\n]+?)\s*\{\{ES\}\}', nombre)
                jsec = field('Nombre Japonés')
                jp = re.findall(r'\|\s*K\s*=\s*([^}|]+)', jsec) + re.findall(r'<br>\s*([^<{\n]+)', jsec)
                en = re.findall(r'\*?\s*([^*{}\n]+?)\s*\{\{(?:EN|US)\}\}', field('Nombre DOB'))
                out[p['title']] = {'es': es.group(1).strip() if es else None, 'jp': [j.strip() for j in jp if j.strip()],
                                   'en': [e.strip() for e in en if e.strip()]}
            log(f'  equipos ES {min(i + 50, len(titles_))}/{len(titles_)}')
            time.sleep(0.3)
        return out
    cached('es_teams.json', es_teams)

    log('11/11 Xtreme (balancing doc + wiki)')
    cached('xtreme_balancing.txt', lambda: get(BALANCING_DOC).decode('utf-8-sig'))
    def xtreme_wiki():
        d = api(XTREME_API, action='query', list='allpages', aplimit=500)['query']['allpages']
        titles_ = [p['title'] for p in d]
        d = api(XTREME_API, action='query', prop='revisions', rvprop='content', rvslots='main', titles='|'.join(titles_))
        out = {}
        for p in d['query']['pages']:
            m = re.search(r'\{\{Stats\|([^}]*)\}\}', p['revisions'][0]['slots']['main']['content'])
            if m:
                out[p['title']] = m.group(1)
        return out
    cached('xtreme_wiki.json', xtreme_wiki)
    log(f'Listo. Caché en {os.path.relpath(CACHE, ROOT)}/')


if __name__ == '__main__':
    main()
