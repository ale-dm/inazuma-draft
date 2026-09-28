"""Curva de rivales de la historia (overrides.team_tuning): media del once titular por equipo, capitán que destaca,
escala de poder de cada juego (compresión, techo) y suelos de estrellas. Lo llama build.py."""
from common import CEIL, category


def apply_tuning(cards, games, ov, report):
    """team_tuning de esos juegos (los clásicos aquí; Ares, después de crear sus cartas)"""
    game_cfg = {k: v for k, v in ov.get('team_tuning', {}).get('_game', {}).items() if not k.startswith('_')}
    for g_, gc in game_cfg.items():                # escala de poder del juego: comprimir las notas muy altas (GO1 tipo IE1)
        if gc.get('compress_above') and g_ in games:
            a_, f_ = gc['compress_above'], gc.get('compress_factor', 0.5)
            for c in cards:
                if c['game'] == g_ and c['ovr'] > a_:
                    new = round(a_ + (c['ovr'] - a_) * f_)
                    c.setdefault('ovr_untuned', c['ovr'])
                    c['stats'] = {k: max(25, min(99, v + new - c['ovr'])) for k, v in c['stats'].items()}
                    c['ovr'] = new
                    c['category'] = category(new)
    for g_, tms in ov.get('team_tuning', {}).items():
        if g_.startswith('_') or g_ not in games:
            continue
        for tm, cfg in tms.items():
            grp = [c for c in cards if c['game'] == g_ and c['team'] == tm]
            if not grp:
                report.append(f'team_tuning: {g_} {tm} sin cartas')
                continue
            capt = [c for c in grp if c['page'] == cfg.get('captain')]
            top_ = game_cfg.get(g_, {}).get('cap') or max(CEIL.get(g_, 88), 88)   # techo de las subidas; nadie baja por él
            def tuned(c, delta):
                new = max(25, min(max(c['ovr'], top_), c['ovr'] + delta))
                if c in capt:                      # capitán: +2 y cerca de 4 por encima del once (subida máx. +6)
                    cap_c = cfg.get('captain_cap', top_)      # techo propio del capitán (Barcelona Orb en Ares: 89)
                    cp_, cr_ = game_cfg.get(g_, {}).get('captain_plus', 4), game_cfg.get(g_, {}).get('captain_raise', 6)
                    new = min(max(cap_c, c['ovr']), max(new + 2, min(round(cfg['top11']) + cp_, new + cr_), c['ovr']))
                return new
            # desplazamiento entero más alto que no pasa del objetivo (con el capitán ya subido) y +1 a los más flojos del
            # once hasta clavar la media: así el orden de la historia se cumple exacto
            n11 = min(11, len(grp))
            mean11 = lambda d: sum(sorted(tuned(c, d) for c in grp)[-11:]) / n11
            delta = max((d for d in range(-25, 26) if mean11(d) <= cfg['top11'] + 1e-9), default=-25)
            once = sorted(grp, key=lambda c: tuned(c, delta))[-11:]
            extra = {id(c) for c in once[:round((cfg['top11'] - mean11(delta)) * n11)] if c not in capt}
            for c in grp:
                new = min(max(cfg.get('captain_cap', top_) if c in capt else top_, c['ovr']), tuned(c, delta) + (id(c) in extra))
                d_ = new - c['ovr']
                c.setdefault('ovr_untuned', c['ovr'])
                c['ovr'] = new
                c['stats'] = {k: max(25, min(99, v + d_)) for k, v in c['stats'].items()}
                c['category'] = category(new)
            for c in grp:                          # suelo del equipo: nadie por debajo (Zanark Outsiders en VR: 84)
                if c['ovr'] < cfg.get('floor', 0):
                    c['stats'] = {k: max(25, min(99, v + cfg['floor'] - c['ovr'])) for k, v in c['stats'].items()}
                    c['ovr'] = cfg['floor']
                    c['category'] = category(c['ovr'])
            if cfg.get('captain') and not capt:
                report.append(f"team_tuning: capitán {cfg['captain']} no está en {g_} {tm}")
    # estrellas del juego: suelo de nota después de la curva (Harper Evans, los que tienen versión héroe/basara en VR)
    for g_, gc in game_cfg.items():
        if g_ not in games or not (gc.get('stars') or gc.get('hero_floor')):
            continue
        stars = {k: v for k, v in (gc.get('stars') or {}).items() if not k.startswith('_')}
        for c in cards:
            if c['game'] != g_:
                continue
            fl = max(stars.get(c['page'], 0), gc.get('hero_floor', 0) if c.get('hero') else 0)
            if c['ovr'] < fl:
                c.setdefault('ovr_untuned', c['ovr'])
                c['stats'] = {k: max(25, min(99, v + fl - c['ovr'])) for k, v in c['stats'].items()}
                c['ovr'] = fl
                c['category'] = category(fl)
