"""Balance de stats del mod de Victory Road (EditorMods/balance.py, modelo 3) para TODAS las sagas.

El mod solo balancea (e instala en el juego) las sagas de su configuración (IE1-3). Este script carga los datos como
al abrir EditorMods y hace el mismo cálculo con todas las sagas, en memoria: no guarda nada en EditorMods ni en el juego.
Deja build/mod_balance_all.json ({last: {fila: 7 stats de Lv 200}, copies: {...}}), que lee
tools/db/import_stats_mod.py para las cartas de GO1-3, Ares, Orion y VR.

Uso:  python tools/db/mod_balance_all.py [ruta del EditorMods]   (Windows, con el Team Editor instalado)
"""
import copy
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MOD_DEFAULT = r'C:\Program Files (x86)\Steam\steamapps\common\INAZUMA ELEVEN Victory Road\EditorMods'
SAGAS = ['IE1', 'IE2', 'IE3', 'GO1', 'GO2', 'GO3', 'ARES', 'ORION', 'VR']


def main():
    mod = sys.argv[1] if len(sys.argv) > 1 else MOD_DEFAULT
    out = os.path.join(ROOT, 'build', 'mod_balance_all.json')
    sys.path.insert(0, mod)
    os.chdir(mod)
    import editor_mods as EM                     # el propio editor: mismos datos y mismo cálculo
    B = EM.BALANCE
    B.setup(EM)
    EM.DATA.load()
    if not EM.DATA.ready:
        raise SystemExit('no se cargaron los datos del juego: %s' % EM.DATA.error)
    p = copy.deepcopy(EM.project())              # copia: la configuración del mod no se toca
    p['balance'] = dict(p.get('balance') or {}, sagas=SAGAS, model=B.MODEL)
    P = B.plan(p, B.medias(), B.base())
    rows = B.compute(p)
    copies = {str(cid): {k: v for k, v in cp.items() if v is None or isinstance(v, (str, int, float, list, bool))}
              for cid, cp in P['copies'].items()}
    with open(out, 'w', encoding='utf-8') as f:
        json.dump({'_doc': 'Balance del mod (modelo 3) con todas las sagas, calculado en memoria por '
                           'tools/db/mod_balance_all.py. Lo lee tools/db/import_stats_mod.py.',
                   'sagas': SAGAS, 'last': {str(r['row']): r['after'] for r in rows}, 'copies': copies}, f)
    print('fichas %d, copias %d: %s' % (len(rows), len(copies), out))


if __name__ == '__main__':
    main()
