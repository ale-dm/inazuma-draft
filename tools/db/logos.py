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
    name, tags = _parse(title)
    return name, bool(tags)


def _parse(title):
    """"File:Inazuma Japan (GO) emblem (VR).png" -> ("Inazuma Japan", {"GO", "VR"}): nombre y etiquetas de versión"""
    s = re.sub(FILE_EXT, '', title[len('File:'):] if title.startswith('File:') else title, flags=re.I)
    tags = set(re.findall(r'\(([^)]*)\)', s))
    s = re.sub(r'\s*\([^)]*\)', '', s)
    return re.sub(r'\s*emblem$', '', s, flags=re.I).strip(), tags


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


# época de cada juego → etiquetas de la wiki que la marcan (de más a menos preferida)
ERA_TAGS = {'GO': ['GO', 'CS', 'GX', 'Tenma-hen'], 'ARES': ['Ares', 'Orion', 'Asuto-hen'], 'VR': ['VR', 'Victory Road']}
# otras versiones (Strikers, SD, Cross, dub…): solo si no hay otra cosa
OTHER_TAGS = {'S', 'SD', 'X', 'Strikers', 'MegaMusa', 'dub', 'team', 'Shinsengumi', 'IE2', 'IE3'}


def _era_index(emblems):
    """tnorm(nombre) -> lista de (orden de categoría, etiquetas, url) de todos sus archivos"""
    idx = {}
    for ci, cat in enumerate(emblems['order']):
        for title in emblems['files'].get(cat, []):
            url = emblems['urls'].get(title)
            if not url:
                continue
            name, tags = _parse(title)
            if tnorm(name):
                idx.setdefault(tnorm(name), []).append((ci, tags, url))
    return idx


def _era_logos(files):
    """escudo de cada época: IE (sin etiqueta, serie original), GO, ARES (Ares/Orión) y VR; solo las que cambian"""
    base = sorted((f for f in files if not f[1]), key=lambda f: f[0])
    out = {'IE': base[0][2]} if base else {}
    for era, want in ERA_TAGS.items():
        for tag in want:
            hit = sorted((f for f in files if tag in f[1]), key=lambda f: (len(f[1] & OTHER_TAGS), len(f[1] - {tag}), f[0]))
            if hit:
                out[era] = hit[0][2]
                break
    return out


def assign_logos(teams, report):
    """añade logo_url a cada dict de teams (None si no se encuentra escudo)"""
    emblems = load_opt('team_emblems.json', None)
    if not emblems:
        report.append('Escudos: sin caché (falta el paso 10c de fetch.py)')
        return
    idx = _build_index(emblems)
    era_idx = _era_index(emblems)
    n_eras = 0
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
        key = next((k for k in tnorms if k in idx), None)
        url = idx[key] if key else None
        tm['logo_url'] = url
        eras = _era_logos(era_idx.get(key, [])) if key else {}
        tm['logos'] = {k: v for k, v in eras.items() if v != url} or None
        found += bool(url)
        n_eras += bool(tm['logos'])
    report.append(f'Escudos de equipo: {found}/{len(teams)} · con escudo distinto según la época: {n_eras}')
