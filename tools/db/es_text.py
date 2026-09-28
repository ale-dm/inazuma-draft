"""Descripciones en castellano: bloques {{Descripción …}} de las fichas de la wiki española (por juego y versión)."""
import re

from common import MAIN


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
