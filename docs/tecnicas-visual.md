# Técnicas como en el juego (placa, icono, TP y marcas)

> **Estado:** aplicado (2026-10-20) en la ficha del jugador y en Mis cartas.
> **Referencia:** `C:\Program Files (x86)\Steam\steamapps\common\INAZUMA ELEVEN Victory Road\EditorMods\tecnicas_visual_para_otra_conversacion.md`.

## Qué se pinta

Cada técnica es un bloque `div.tblock` con:

1. **Placa del elemento** (`plate_fsp_<el>.png`): Aire 1, Bosque 2, Fuego 3, Montaña 4, Vacío 5.
   Si la técnica no tiene elemento, se usa el degradado del elemento 5.
2. **Icono de categoría** (`icon_sp_area01..04.png`): tiro, regate, bloqueo, parada.
3. **Nombre** en castellano (o el idioma de la interfaz).
4. **Marcas de tipo** (`icon_sp_sub01.png` tiro lejano, `icon_sp_sub02.png` bloqueo de tiro), a partir
   de `technique.traits` (`long`, `block`).
5. **TP** a la derecha (`TP` pequeño + número grande, cursiva), el `balance_tp` de la app.
6. **Tooltip**: nombre · categoría · elemento · TP · potencia mínima-máxima.

Las imágenes están en `public/icons/` (copiadas de `EditorMods\iconos\`, sin recortar nada en runtime).

## Qué falta

- **Marcas de grado** (`grade_*.png`): necesitan el `growthType` de la técnica y el grado evolucionado
  del jugador (1–5). La base de la app no guarda esos dos datos todavía; cuando se importen, el bloque
  solo tiene que añadir el `<img>` del grado.
- **Auras** (keshin, armadura, tótem, Mixi Max, poder, modo, vínculo): las placas ya están copiadas
  (`plate_fs`, `plate_fsa`, `plate_soul`, `plate_mixi`, `plate_power`, `plate_mode`, `plate_kizuna`) y
  los iconos `icon_sp_area05..11`, pero las técnicas de la app solo distinguen tiro/regate/bloqueo/parada.
- **Caras y escudos del juego**: `teameditor_data\faces` ocupa ~54 MB y `emblems` ~2 MB; no se copian al
  repo. Para usarlos haría falta servirlos desde Supabase Storage o un CDN, y guardar el `modelo`
  (`c01000100`) de cada carta. La app sigue con las caras de zukan y los escudos que ya tenía.

## Archivos

- `src/components/TechBlock.tsx`: el bloque.
- `src/components/CardInfo.tsx`: lo usa en la lista de supertécnicas.
- `src/app.css`: `.tblock`, placas y degradados por elemento.
- `src/i18n/translations.ts`: `tech.long` y `tech.blockShot`.


## Variantes de elemento

- Algunas técnicas existen en **dos fichas** con distinto elemento (p. ej. **Shadow Ray** de bosque y de montaña, **Fire Blizzard** de fuego y de viento). En la app son **ids distintos** (ShadowRay_Forest/ShadowRay_Mountain, FireBlizzard_Fire/FireBlizzard_Wind) y overrides.technique_elements les fija el elemento (wood/earth, ire/ir).
- Las que siguen sin un elemento de los cinco (elementos únicos de la wiki, {{PAGENAME}}, null…) caen al degradado de **Vacío** (	b-el5), que es el morado. Para quitarlo hay que asignarles un elemento con el mismo override.
