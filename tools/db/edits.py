"""Cambios hechos a mano en el CRUD oculto de la app (#/admin → Exportar → data/card_edits.json).

Mismo formato que guarda la app (src/lib/admin-edits.ts), con los nombres de columna de la base:
  {"cards": {id: {campo: valor, "techniques": [ids]}}, "created": {id: {...todos los campos}},
   "deleted": [ids], "techniques": {id: {campo: valor}}}
Lo llama output.py justo antes de escribir players.json y seed.sql, así los cambios sobreviven a cada build."""
import json
import os

from common import ROOT

PATH = os.path.join(ROOT, 'data', 'card_edits.json')
CARD_FIELDS = {'character_id', 'name', 'game', 'version', 'team', 'position', 'element', 'ovr', 'category', 'tier',
               'shooting', 'control', 'physical', 'speed', 'defense', 'goalkeeping', 'image_url', 'duel_att', 'duel_con',
               'duel_def', 'is_version', 'no'}
TECH_FIELDS = {'name', 'name_es', 'type', 'element', 'cost', 'traits'}
SAGA = {'IE1': 'IE', 'IE2': 'IE', 'IE3': 'IE', 'GO1': 'GO', 'GO2': 'GO', 'GO3': 'GO', 'ARES': 'IE', 'ORION': 'IE', 'VR': 'IE'}


def apply_edits(public, techs, chars, report):
    """aplica los cambios sobre las filas finales (cartas, técnicas y personajes); devuelve nada, cambia en su sitio"""
    if not os.path.exists(PATH):
        return
    with open(PATH, encoding='utf-8') as f:
        e = json.load(f)
    by_id = {c['id']: c for c in public}
    tech_ids = {t['id'] for t in techs}
    n = {'cards': 0, 'created': 0, 'deleted': 0, 'techniques': 0}

    for cid, patch in (e.get('cards') or {}).items():
        c = by_id.get(cid)
        if not c:
            report.append(f'card_edits: la carta {cid} ya no existe')
            continue
        c.update({k: v for k, v in patch.items() if k in CARD_FIELDS})
        if 'techniques' in patch:
            c['techniques'] = [t for t in patch['techniques'] if t in tech_ids]
        n['cards'] += 1

    char_ids = {ch['id'] for ch in chars}
    for cid, card in (e.get('created') or {}).items():
        if cid in by_id:
            continue
        c = {k: None for k in public[0]} if public else {}
        c.update({'id': cid, 'character_id': card.get('character_id') or cid, 'version': 'base', 'source': 'card_edits',
                  'zukan_id': None, 'zukan_no': None, 'is_version': True, 'specials': [], 'extra_teams': [], 'raw_stats': {},
                  'description': None, 'description_es': None})
        c.update({k: v for k, v in card.items() if k in CARD_FIELDS})
        c['saga'] = SAGA.get(c.get('game'), 'IE')
        c['techniques'] = [t for t in card.get('techniques') or [] if t in tech_ids]
        if c['character_id'] not in char_ids:
            chars.append({'id': c['character_id'], 'name': c.get('name') or cid, 'wiki_page': None, 'zukan_no': None})
            char_ids.add(c['character_id'])
        public.append(c)
        by_id[cid] = c
        n['created'] += 1

    gone = set(e.get('deleted') or [])
    if gone:
        public[:] = [c for c in public if c['id'] not in gone]
        n['deleted'] = len(gone)

    tby = {t['id']: t for t in techs}
    for tid, patch in (e.get('techniques') or {}).items():
        if tid in tby:
            tby[tid].update({k: v for k, v in patch.items() if k in TECH_FIELDS})
            n['techniques'] += 1
    report.append('card_edits.json: ' + ' · '.join(f'{k} {v}' for k, v in n.items()))
