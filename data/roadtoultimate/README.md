# Datos de Victory Road (Road to Ultimate)

Fuente: [roadtoultimate.com](https://roadtoultimate.com/es/characters) (web de fans de *Inazuma Eleven: Victory Road*). No es oficial: si algo no cuadra, manda zukan.

- `stat_tables.json`:
  - Plantillas de stats por `stat_key` (niveles 1/30/50/99, rareza Normal).
  - Multiplicadores por rareza: Normal ×1,00 · Grimpant ×1,10 · Expérimenté ×1,20 · Émérite ×1,30 · Légendaire ×1,40 · Héros / Basara ×1,40 con rango superior.
  - La clave de stats de cada personaje (`chara_stat_key`, por su código interno `c01000010`…).
  - El último dígito de la clave es el **tier de potencial** (0–3).
- `ares.json` / `orion.json`: jugadores de zukan de Ares / Orion con su tipo (normal / hero / basara), estilo, clave y stats a nivel 50, y técnicas por ramas. Orion está guardado, **sin revisar**.

Equivalencia de rarezas con las categorías de la carta: Común = Normal, Creciente = Grimpant, Avanzado = Expérimenté, Top = Émérite, Legendario = Légendaire.
