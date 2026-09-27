# Datos de Victory Road (Azalée)

Fuente: [Azalée — Wiki Rose Griffon](https://azalee.rosegriffon.fr/) (base de datos de fans de *Inazuma Eleven: Victory Road*, extraída del juego). No es oficial: si algo no cuadra, manda zukan.

- `ares.json` / `orion.json`: jugadores de zukan de Ares / Orion que cruzan con Azalée por el id de zukan (`zukanHash`). Traen rareza base, stats a nivel 1 y 99 y supertécnicas con el nivel al que las aprenden. Orion está guardado, **sin revisar**.
- `skills.json`: las 959 supertécnicas de Victory Road (código interno → nombre en/ja/fr, categoría, potencia mín/máx, elemento, nº de jugadores que la ejecutan, y `uses`: cuántos personajes del juego la tienen). El id hexadecimal que usa Azalée en los personajes es el CRC32 del código (`whs01230` → `0x…`).
- `wiki_moves_ares_orion.json`: nombre japonés y del doblaje de las técnicas de los módulos `PlayerData/AT` y `/OK` de la wiki inglesa que no estaban en la caché (para cruzarlas con `skills.json`).

Stats de Victory Road: ver [`docs/victory-road-stats.md`](../../docs/victory-road-stats.md). Son una plantilla por posición y rareza, no de cada personaje.
