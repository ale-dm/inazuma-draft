"""Escudo de cada equipo (para mostrarlo en la carta en vez del nombre). Lo llama build.py.

Fuente: inazuma-eleven.fandom.com, Category:Team emblem images (y sus 7 subcategorías, de más a menos oficial/
reciente). Los títulos de archivo son casi siempre "<Equipo> emblem[ (VERSIÓN)].png"; como nuestro nombre de
equipo (el de zukan.inazuma.jp) a veces no es el título de la wiki (que suele ser el nombre japonés romanizado),
se prueba también su redirección ("Almighty Faith" → "Mannouzaka") y su alias de WIKI_FORM_TEAM."""
import re

from common import WIKI_FORM_TEAM, load_opt, tnorm

FILE_EXT = r'\.(png|jpe?g|gif|webp)$'


def _extract_name(title):
    """"File:Rose Griffon emblem (VR).png" -> ("Rose Griffon", con_version=True)"""
    s = re.sub(FILE_EXT, '', title[len('File:'):] if title.startswith('File:') else title, flags=re.I)
    has_paren = False
    while True:
        m = re.search(r'\s*\([^)]*\)\s*$', s)
        if not m:
            break
        has_paren = True
        s = s[:m.start()]
    return re.sub(r'\s*emblem$', '', s, flags=re.I).strip(), has_paren


def _build_index(emblems):
    """tnorm(nombre) -> url del escudo, prefiriendo la categoría más oficial y el archivo sin "(versión)" """
    idx, best = {}, {}
    for ci, cat in enumerate(emblems['order']):
        for title in emblems['files'].get(cat, []):
            url = emblems['urls'].get(title)
            if not url:
                continue
            name, has_paren = _extract_name(title)
            key = tnorm(name)
            if not key:
                continue
            cand = (ci, 1 if has_paren else 0)
            if key not in best or cand < best[key]:
                best[key], idx[key] = cand, url
    return idx


def assign_logos(teams, report):
    """añade logo_url a cada dict de teams (None si no se encuentra escudo)"""
    emblems = load_opt('team_emblems.json', None)
    if not emblems:
        report.append('Escudos: sin caché (falta el paso 10c de fetch.py)')
        return
    idx = _build_index(emblems)
    redirects = emblems['redirects']
    rev_form = {v: k for k, v in WIKI_FORM_TEAM.items()}   # nuestro nombre -> alias que usa la wiki
    found = 0
    for tm in teams:
        name = tm['name']
        keys = [name]
        if name in redirects:
            keys.append(redirects[name])
        if name in rev_form:
            keys.append(rev_form[name])
        base = re.sub(r'\s*\(Past\)$', '', name)
        if base != name:
            keys.append(base)
            if base in redirects:
                keys.append(redirects[base])
        tnorms = []
        for k in keys:
            tnorms.append(tnorm(k))
            if k.endswith('s'):
                tnorms.append(tnorm(k[:-1]))
        url = next((idx[k] for k in tnorms if k in idx), None)
        tm['logo_url'] = url
        found += bool(url)
    report.append(f'Escudos de equipo: {found}/{len(teams)}')
