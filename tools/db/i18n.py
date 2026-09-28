"""Nombres en francés e italiano de técnicas, espíritus guerreros, tótems, hipertécnicas y equipos.

Orden: a mano (overrides.names_i18n) → doblaje de la ficha de la wiki española ("Nombre DOB") → wikis francesa e
italiana (fichas por nombre japonés o rōmaji). Lo que no se encuentre se queda en inglés en la app. Lo llama build.py."""
import re

from common import load, load_opt, norm_jp, romaji, tnorm


def localize(cards, techniques, teams, ov, report):
    """añade name_fr / name_it (y hyper_fr / hyper_it en los poderes especiales) en su sitio"""
    fr_wiki, it_wiki = load_opt('fr_wiki.json', {}), load_opt('it_wiki.json', {})
    def wiki_idx(w, tpls, key):
        idx = {}
        for tpl in tpls:
            for title, v in sorted(w.get(tpl, {}).items(), key=lambda kv: '(' in kv[0]):   # fichas principales primero
                for j in v['jp']:
                    k = key(j)
                    if k:
                        idx.setdefault(k, re.sub(r'\s*\([^)]*\)$', '', v['name']))     # "Tir en Spirale (Jeu)" → "Tir en Spirale"
        return idx
    lat = lambda j: romaji(j) if re.search(r'[A-Za-z]', j) else None
    tech_idx = {'fr': wiki_idx(fr_wiki, ['Supertechnique'], norm_jp), 'it': wiki_idx(it_wiki, ['Tecnica', 'Tecniche'], norm_jp)}
    kesh_idx = {'fr': wiki_idx(fr_wiki, ['Esprit Guerrier'], lat), 'it': wiki_idx(it_wiki, ['Spirito Guerriero', 'Avatar'], lat)}
    team_idx = {'fr': {**wiki_idx(fr_wiki, ['Equipe'], lambda j: tnorm(j) or None), **wiki_idx(fr_wiki, ['Equipe'], norm_jp)},
                'it': {**wiki_idx(it_wiki, ['Squadra'], lambda j: tnorm(j) or None), **wiki_idx(it_wiki, ['Squadra'], norm_jp)}}
    es_tech_dub = {}
    for title, d in {**load_opt('es_hyper.json', {}), **load('es_techniques.json')}.items():
        es_tech_dub.setdefault(re.sub(r'\s*\([^)]*\)$', '', title).strip(), d)
    es_kesh_raw = {re.sub(r'\s*\(Tótem\)$', '', t): d for t, d in {**load_opt('es_souls.json', {}), **load_opt('es_keshin.json', {})}.items()}
    es_team_raw = {}
    for title, d in sorted(load('es_teams.json').items(), key=lambda kv: '(' in kv[0]):
        for k in d['en'] + d['jp'] + [title]:
            if k != '/' and tnorm(k):
                es_team_raw.setdefault(tnorm(k), d)
    first = lambda xs: (xs or [None])[0]
    manual_i18n = {k: v for k, v in ov.get('names_i18n', {}).items() if not k.startswith('_')}   # a mano: {"inglés": {"fr":…, "it":…}}

    def tech_local(en, es, jp):
        d, k = es_tech_dub.get(es) or {}, norm_jp(jp)
        return {lg: (manual_i18n.get(en) or {}).get(lg) or first(d.get(lg)) or (k and tech_idx[lg].get(k)) or None for lg in ('fr', 'it')}

    def spirit_local(en, es):
        d = es_kesh_raw.get(es) or {}
        keys = [romaji(x) for x in [en] + d.get('jp', [])[:1] + d.get('en', []) if x]   # solo el 1.º: hay fichas con el de otro
        return {lg: (manual_i18n.get(en) or {}).get(lg) or first(d.get(lg)) or next((kesh_idx[lg][k] for k in keys if k in kesh_idx[lg]), None)
                for lg in ('fr', 'it')}

    def team_local(tm):
        d = es_team_raw.get(tnorm(tm)) or {}
        keys = [tnorm(tm)] + [x for j in d.get('jp', []) + d.get('en', []) for x in (tnorm(j), norm_jp(j)) if x]
        return {lg: (manual_i18n.get(tm) or {}).get(lg) or first(d.get(lg)) or next((team_idx[lg][k] for k in keys if k in team_idx[lg]), None)
                for lg in ('fr', 'it')}

    for t_ in techniques.values():
        if t_:
            loc = tech_local(t_['name'], t_.get('name_es'), t_.get('name_jp'))
            t_['name_fr'], t_['name_it'] = loc['fr'], loc['it']
    for c in cards:
        for sp in c.get('specials') or []:
            if sp['type'] in ('keshin', 'soul'):
                loc = spirit_local(sp['name'], sp.get('name_es'))
                sp['name_fr'], sp['name_it'] = loc['fr'], loc['it']
            if sp.get('hyper'):
                loc = tech_local(sp['hyper'], sp.get('hyper_es'), sp.get('hyper_jp'))
                sp['hyper_fr'], sp['hyper_it'] = loc['fr'], loc['it']
            sp.pop('hyper_jp', None)
    for tm in teams:
        loc = team_local(tm['name'])
        tm['name_fr'], tm['name_it'] = loc['fr'], loc['it']
    for lg in ('fr', 'it'):
        n_t = sum(1 for t_ in techniques.values() if t_ and t_.get('name_' + lg))
        n_e = sum(1 for tm in teams if tm.get('name_' + lg))
        report.append(f'Nombres {lg}: técnicas {n_t}/{sum(1 for t_ in techniques.values() if t_)} · equipos {n_e}/{len(teams)}')
