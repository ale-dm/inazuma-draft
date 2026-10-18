"""Curva de rivales de la historia (overrides.team_tuning): media del once titular por equipo, capitán que destaca,
escala de poder de cada juego (compresión, techo) y suelos de estrellas. Lo llama build.py."""
from common import CEIL, category


def apply_scout_pool(cards, ov, report):
    """Pool sin equipo de cada juego: OVR por stats + técnica (percentiles del propio pool). overrides.scout_pool."""
    cfg = {k: v for k, v in (ov.get('scout_pool') or {}).items() if not k.startswith('_')}
    for g, sc in cfg.items():
        pool = [c for c in cards if c['game'] == g and c['team'] in ('Unaffiliated', 'Sub Character')]
        if not pool:
            continue
        pct = lambda vals, v: sum(1 for x in vals if x < v) / len(vals)
        stats = sorted(c['ovr_raw'] for c in pool)
        cg = sc.get('cost', 'IE3')                 # juego del que se toma el TP de las técnicas

        def tval(c):                                # mejor técnica del jugador según ese juego
            return max((m.get('costs', {}).get(cg) or 0 for m in c.get('moves', [])), default=0)
        moves = sorted(tval(c) for c in pool)
        lo, hi, cap = sc.get('lo', 44), sc.get('hi', 77), sc.get('cap', 81)
        ws, wt = sc.get('stats', 0.4), sc.get('tech', 0.6)
        for c in pool:
            qs, qm = pct(stats, c['ovr_raw']), pct(moves, tval(c))
            o = round(lo + (hi - lo) * (ws * qs + wt * qm) + (sc.get('bonus', 0) if qm >= 0.95 else 0))
            o = max(sc.get('floor', 30), min(cap, o))
            c.setdefault('ovr_untuned', c['ovr'])
            if o != c['ovr']:
                d = o - c['ovr']
                c['stats'] = {k: max(25, min(99, v + d)) for k, v in c['stats'].items()}
                c['ovr'] = o
                c['category'] = category(o)
        n = sum(1 for c in pool if c['ovr'] != c.get('ovr_untuned'))
        report.append(f'scout_pool: {g} {len(pool)} cartas · {n} con OVR nuevo')


def apply_tuning(cards, games, ov, report):
    """team_tuning de esos juegos (los clásicos aquí; Ares, después de crear sus cartas)"""
    apply_scout_pool(cards, ov, report)
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
            if not isinstance(cfg, dict):
                continue
            grp = [c for c in cards if c['game'] == g_ and c['team'] == tm]
            if not grp:
                report.append(f'team_tuning: {g_} {tm} sin cartas')
                continue
            capt = [c for c in grp if c['page'] == cfg.get('captain')]
            top_ = game_cfg.get(g_, {}).get('cap') or max(CEIL.get(g_, 88), 88)   # techo de las subidas; nadie baja por él
            cap_c = cfg.get('captain_cap', top_)      # techo propio del capitán (Barcelona Orb en Ares: 89)
            cp_, cr_ = game_cfg.get(g_, {}).get('captain_plus', 4), game_cfg.get(g_, {}).get('captain_raise', 6)
            n11 = min(11, len(grp))
            # k<1 comprime la dispersión del equipo hacia su media (evita que un crack suelto de un equipo flojo salga alto)
            k_comp = cfg.get('compress', game_cfg.get(g_, {}).get('compress', 1.0))
            for c in grp:
                c.setdefault('ovr_untuned', c['ovr'])
            t11 = sum(sorted(c['ovr_untuned'] for c in grp)[-n11:]) / n11       # media del once antes de tocar nada
            # 1) curva del equipo: se coloca la media en el objetivo y se comprime el reparto (k=1: solo se mueve la media)
            for c in grp:
                base = round(cfg['top11'] + (c['ovr_untuned'] - t11) * k_comp)
                c['ovr'] = max(25, min(max(top_, c['ovr_untuned']), base))
            # 2) capitán: +2 y cerca de 4 por encima del once (subida máx. +6)
            for c in capt:
                new = min(max(cap_c, c['ovr_untuned']),
                          max(c['ovr'] + 2, min(round(cfg['top11']) + cp_, c['ovr'] + cr_), c['ovr_untuned']))
                c['ovr'] = max(25, min(max(top_, c['ovr_untuned']), new))
            # 3) +1 a los más flojos del once hasta clavar la media objetivo (redondeos)
            for _ in range(60):
                if sum(sorted(c['ovr'] for c in grp)[-n11:]) / n11 >= cfg['top11'] - 1e-9:
                    break
                once = sorted(grp, key=lambda c: c['ovr'])[-n11:]
                weak = next((c for c in sorted(once, key=lambda c: c['ovr']) if c not in capt), None)
                if weak is None or weak['ovr'] >= max(top_, weak['ovr_untuned']):
                    break
                weak['ovr'] += 1
            # 4) el capitán siempre es la estrella del equipo: por encima del mejor no-capitán
            others = max((c['ovr'] for c in grp if c not in capt), default=None)
            for c in capt:
                if others is not None and c['ovr'] <= others:
                    c['ovr'] = max(c['ovr'], min(cap_c, others + 1))
            # 5) stats y categoría
            for c in grp:
                d_ = c['ovr'] - c['ovr_untuned']
                c['stats'] = {k: max(25, min(99, v + d_)) for k, v in c['stats'].items()}
                c['category'] = category(c['ovr'])
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
    # OVR a mano (overrides.ovr_manual): manda al final sobre la curva y las reglas (ficha|juego|versión → nota)
    manual = {k: v for k, v in ov.get('ovr_manual', {}).items() if not k.startswith('_')}
    for c in cards:
        v = manual.get(f"{c['page']}|{c['game']}|{c['version']}")
        if v is not None and c['ovr'] != v:
            d_ = v - c['ovr']
            c['stats'] = {k: max(25, min(99, s + d_)) for k, s in c['stats'].items()}
            c['ovr'] = v
            c['category'] = category(v)
