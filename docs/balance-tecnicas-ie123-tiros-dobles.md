# Tiros de 2 jugadores (IE123) — propuesta B en múltiplos de 10

> **Estado:** aplicada (2026-10-20): TP en `data/technique_balance.json` y `supabase/technique_balance.sql`.
> **Base:** 30 tiros con `users = 2` en la wiki y TP de IE3.
> **Marco general:** [balance-tecnicas-ie123.md](./balance-tecnicas-ie123.md)
> **Baseline B pura:** [balance-tecnicas-ie123-tiros.md](./balance-tecnicas-ie123-tiros.md)
> **Triples:** [balance-tecnicas-ie123-tiros-triples.md](./balance-tecnicas-ie123-tiros-triples.md)

> **Corrección:** falta **Cross Fire** en las 344 técnicas del build (no aparece en los movesets de PlayerData, pero sí en la wiki). La categoría de combinaciones da **30** tiros de 2 jugadores; Shadow Ray y Fire Blizzard tienen dos variantes cada uno.

## 1. Criterio

- **Escala B**: tiros 20–76 → 50–200; en dobles se usa el tramo **60–180**.
- **Múltiplos de 10**: 60, 70, 80… 180.
- **Reparto por jugadores**: no hay jerarquía rígida. En esta propuesta el mejor doble queda en 180 y el mejor individual en 160 por TP/lore, y el mejor triple en 200.
- **Dentro de cada nivel**: el valor es el múltiplo de 10; el orden interno lo da el lore/potencia. Las colisiones dentro del nivel se aceptan.
- **Lore**: ficha de la wiki (`users`, `power`, `debut_game` y la sección Info).

### Reparto de rangos

| Grupo | Rango | Mejor (provisional) |
|---|---:|---|
| Individuales | 50–160 | Descenso estelar 160 |
| **Dobles** | **60–180** | Prime Legend 180 |
| Triples | 80–200 | Jet Stream 200 |

No hay jerarquía rígida: en esta propuesta el mejor doble (180) queda 20 por encima del mejor individual (160), pero pueden cruzarse según TP/lore. El suelo de 60 sí llega al nivel de VR: hay dobles de 60 y hasta de 50 en Victory Road.

## 2. Los 30 dobles

| TP | Técnica | Debut | TP IE3 | VR TP | VR pot. | Recast | Notas |
|---:|---|---|---:|---:|---:|---:|---|
| **180** | Prime Legend | IE3 | 61 | 100 | 640 | 90 | Gouenji + Kidou; gol de la victoria vs Ogre |
| **170** | Cross Fire | IE2 | 67 | 100 | 640 | — | Gouenji + Fubuki; gol vs Genesis |
| **170** | The Dawn | IE3 | 58 | 80 | 540 | 90 | Hiroto + Fubuki; gol de la victoria vs The Kingdom |
| **160** | Fire Blizzard | IE2 | 64 | 80 | 540 | 90 | Burn + Gazel; gol 11 vs Raimon |
| **160** | Shadow Ray | IE3 | 67 | 70 | 440 | 90 | Desuta + Sein; gol vs Erabareta 11 |
| **150** | The Hurricane | IE3 | 58 | 140 | 840 | 110 | Fubuki + Kazemaru; gol vs Unicorn |
| **150** | Tiger Storm | IE3 | 58 | 80 | 540 | 90 | Gouenji + Toramaru; firma |
| **150** | Unicorn Boost | IE3 | 58 | 80 | 540 | 90 | Mark + Dylan; gol vs Inazuma Japan |
| **140** | Dragon Tornado | IE1 | 46 | 110 | 720 | 100 | Someoka + Gouenji; combo icónico |
| **140** | Twin Boost F | IE2 | 55 | 80 | 540 | 90 | Gouenji + Kidou; 3 goles vs Zeus |
| **140** | Wyvern Blizzard | IE2 | 55 | 110 | 720 | 100 | Someoka + Fubuki; gol vs Shin Teikoku |
| **130** | Butterfly Trance | IE2 | 49 | 60 | 360 | 90 | Reika + Rica; gol vs Raimon |
| **130** | Double Tornado | IE2 | 55 | 80 | 540 | 90 | Combo de dos tornados |
| **130** | Fire Rooster | IE1 | 62 | 60 | 360 | 90 | Kazemaru + Gouenji; combo de Daisuke |
| **120** | Cosmic Blast | IE2 | 52 | 70 | 440 | 90 | Reize + Diam; parado por Endou |
| **120** | Inazuma-1 | IE1 | 40 | 70 | 440 | 90 | Endou + Gouenji; combo icónico |
| **120** | Utter Gutsiness Club | IE2 | 55 | 70 | 440 | 90 | Combo cómico; poca relevancia |
| **110** | Revolution V | IE2 | 49 | 60 | 360 | 90 | Handa + Max; parado por Endou |
| **110** | Thunder Beast | IE3 | 49 | 70 | 440 | 90 | Fubuki + Hijikata; firma |
| **110** | Whirlwind Drop | IE3 | 49 | 80 | 540 | 90 | Kabeyama + Kazemaru; gol vs Fire Dragon |
| **100** | Dual Strike | IE2 | 46 | 60 | 360 | 90 | Yumuu + Ghoshu; parado por Endou |
| **100** | Inazuma Drop | IE1 | 37 | 70 | 440 | 90 | Kabeyama + Gouenji; combo icónico |
| **100** | Twin Boost | IE1 | 37 | 70 | 440 | 90 | Kidou + Sakuma; primer combo |
| **90** | Double Wrath Shot | IE2 | 43 | 110 | 720 | 100 | Combo de 200 toques |
| **90** | Security Shot | IE2 | 37 | 60 | 360 | 90 | Kagami + Kisoku; parado por Endou |
| **90** | Spectacle Crash | IE2 | 37 | 50 | 300 | 90 | Megane + Someoka; gol vs Shuuyou Meito |
| **80** | Leaping Thunder | IE2 | 34 | 60 | 360 | 90 | Kurimatsu + Shourin; firma |
| **80** | Utter Gutsiness Bat | IE1 | 34 | 60 | 360 | 90 | Gameki + Mangaka; gol vs Raimon |
| **70** | Hawk Shot | IE1 | 34 | 50 | 300 | 90 | Combo de halcón |
| **60** | Acrobat Bomber | IE2 | 34 | 60 | 360 | 90 | Kagami + Kisoku; parado por Endou |

`Debut` es el juego de la ficha. `VR TP` y `VR pot.` son el TP y la potencia máxima actuales en Victory Road; `Recast` es el tiempo de recarga (menos es mejor). La columna de potencia IE3 desaparece porque muchas fichas no la traen; se usa el dato de VR como referencia secundaria.

## 3. Escalera propuesta

| TP | Técnicas |
|---:|---|
| **180** | Prime Legend |
| **170** | Cross Fire, The Dawn |
| **160** | Fire Blizzard, Shadow Ray |
| **150** | The Hurricane, Tiger Storm, Unicorn Boost |
| **140** | Dragon Tornado, Twin Boost F, Wyvern Blizzard |
| **130** | Butterfly Trance, Double Tornado, Fire Rooster |
| **120** | Cosmic Blast, Inazuma-1, Utter Gutsiness Club |
| **110** | Revolution V, Thunder Beast, Whirlwind Drop |
| **100** | Dual Strike, Inazuma Drop, Twin Boost |
| **90** | Double Wrath Shot, Security Shot, Spectacle Crash |
| **80** | Leaping Thunder, Utter Gutsiness Bat |
| **70** | Hawk Shot |
| **60** | Acrobat Bomber |

Se usan los **13 niveles de 60 a 180**, sin huecos, con **máximo 3 técnicas por nivel**.

## 4. Revisión de lore y jugadores

Tabla de todas las dobles, con quién la hace y qué pesa en la decisión: lore, debut y números de VR.

| TP | Técnica | Jugadores | Lore | Nota |
|---:|---|---|---|---|
| 180 | Prime Legend | Gouenji + Kidou | Gol de la victoria vs Ogre Gakuen | Final |
| 170 | Cross Fire | Gouenji + Fubuki | Goles vs Genesis, Dark Emperors y Orpheus | Canon principal |
| 170 | The Dawn | Hiroto + Fubuki | Gol de la victoria vs The Kingdom | Final |
| 160 | Fire Blizzard | Burn + Gazel (luego Nagumo + Suzuno) | Gol 11 vs Raimon | Fusión Chaos; VR 80/540 |
| 160 | Shadow Ray | Desuta + Sein | Gol vs Erabareta 11 | Jefe, pero VR 70/440 |
| 150 | The Hurricane | Fubuki + Kazemaru | Goles vs Unicorn y Garshield | VR 140/840, pero no es final |
| 150 | Tiger Storm | Gouenji + Toramaru | Gol de la victoria vs Fire Dragon | Final |
| 150 | Unicorn Boost | Mark + Dylan | Gol vs Inazuma Japan | VR 80/540 |
| 140 | Wyvern Blizzard | Someoka + Fubuki | Gol vs Shin Teikoku | VR 110/720 |
| 140 | Dragon Tornado | Someoka + Gouenji | Goles vs Occult y Mikage | IE1, pero VR 110/720 |
| 140 | Twin Boost F | Gouenji + Kidou | 3 goles vs Zeus | Icono IE2; VR 80/540 |
| 130 | Fire Rooster | Kazemaru + Gouenji | Gol vs Sengoku Igajima | IE1; VR 60/360 |
| 130 | Butterfly Trance | Reika + Rica | Gol vs Raimon | VR 60/360 |
| 130 | Double Tornado | Sin Info en la wiki | Sin lore | Sin lore; VR 80/540 |
| 120 | Cosmic Blast | Reize + Diam | Parado por Endou | Parado; VR 70/440 |
| 120 | Inazuma-1 | Endou + Gouenji | Gol vs Mikage; victoria vs Teikoku | Icono IE1; VR 70/440 |
| 120 | Utter Gutsiness Club | Sin Info en la wiki | Sin lore | Sin lore; VR 70/440 |
| 110 | Thunder Beast | Fubuki + Hijikata | Gol vs Fire Dragon | Gol; VR 70/440 |
| 110 | Whirlwind Drop | Kabeyama + Kazemaru | Gol vs Fire Dragon | Gol; VR 80/540 |
| 110 | Revolution V | Handa + Max | Parado 3 veces por Endou | Parado; VR 60/360 |
| 100 | Inazuma Drop | Kabeyama + Gouenji | Icónico; gol vs Nose | Icono IE1; VR 70/440 |
| 100 | Twin Boost | Kidou + Sakuma | Primer combo; crea Twin Boost F | Icono IE1; VR 70/440 |
| 100 | Dual Strike | Yumuu + Ghoshu | Parado por Endou | Parado; VR 60/360 |
| 90 | Security Shot | Kagami + Kisoku | Parado por Endou | Parado; VR 60/360 |
| 90 | Spectacle Crash | Megane + Someoka | Gol vs Shuuyou Meito | Gol menor; VR 50/300 |
| 90 | Double Wrath Shot | Sin Info en la wiki | Sin lore | Sin lore, pero VR 110/720 |
| 80 | Leaping Thunder | Kurimatsu + Shourin | No llega a completarla | Fracaso; VR 60/360 |
| 80 | Utter Gutsiness Bat | Gameki + Mangaka | Gol vs Raimon | Gol menor; IE1 |
| 70 | Hawk Shot | Sin Info en la wiki | Sin lore | Sin lore; VR 50/300 |
| 60 | Acrobat Bomber | Kagami + Kisoku | Parado por Endou | Parado; VR 60/360 |
**Ajustes aplicados:** The Hurricane baja a 150 (no es un final; los números de VR no compensan), Wyvern Blizzard a 140 y The Dawn sube a 170 por su gol de la victoria vs The Kingdom. Para cuadrar los niveles, Fire Rooster baja a 130, Utter Gutsiness Club a 120, Revolution V a 110, Dual Strike a 100, Double Wrath Shot a 90 y Utter Gutsiness Bat a 80. El top queda en Prime Legend 180; Cross Fire y The Dawn 170.

## 5. Top de dobles

| # | Técnica | TP IE3 | Potencia | Papel |
|---:|---|---:|---|---|
| 1 | Prime Legend | 61 | 100 (VR) | Gouenji + Kidou; gol de la victoria vs Ogre |
| 2 | Cross Fire | 67 | 100 (VR) | Gouenji + Fubuki; goles vs Genesis, Dark Emperors y Orpheus |
| 2 | The Dawn | 58 | 80 (VR) | Hiroto + Fubuki; gol de la victoria vs The Kingdom |
| 4 | Fire Blizzard | 64 | 80 (VR) | Burn + Gazel; gol 11 vs Raimon; fusión Chaos |
| 4 | Shadow Ray | 67 | 70 (VR) | Desuta + Sein; gol vs Erabareta 11; VR 70/440 |

**Prime Legend** pasa a ser el 180: es el gol de la victoria vs Ogre (Gouenji + Kidou) y, como pediste, queda por encima de Cross Fire. **Cross Fire y The Dawn** se quedan en 170: el primero por canon y goles vs Genesis/Dark Emperors/Orpheus, el segundo por el gol de la victoria vs The Kingdom. **The Hurricane** se queda en 150: no es un final y, aunque en VR tenga 140/840, sus dos goles no lo ponen por encima de los finales. **Shadow Ray** se queda en 160: en IE3 es un 67 con 120 de potencia y lore de jefe, pero en VR solo tiene 70/440.

**Fire Blizzard** es la fusión de Prominence y Diamond Dust (Burn + Gazel): marca el gol 11 contra Raimon y cierra la pelea interna de Chaos. **Fire Rooster** es el combo de Daisuke que usan Kazemaru y Gouenji; es más de firma que de final. **Prime Legend** es el gol de la victoria de Raimon contra Ogre Gakuen, con Gouenji y Kidou encadenando con Ryuusei Blade.

## 6. Pendiente

- Validar el suelo de **60** para dobles (ya llega al nivel bajo de VR) y decidir si el mejor individual baja a 170 para que el 180 del mejor doble quede por encima.
- Revisar el empate Cross Fire / The Dawn en 170 y el grupo de 160 (Fire Blizzard, Shadow Ray).
- Después: individuales.
- **Aplicado el 2026-10-20:** TP nuevo en `data/technique_balance.json` y `supabase/technique_balance.sql` (se carga con `db-load`, opción `balance_only`).

