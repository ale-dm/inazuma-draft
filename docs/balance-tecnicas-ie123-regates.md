# Regates (IE123) — propuesta B en múltiplos de 10 (50–150)

> **Estado:** aplicada (2026-10-20): TP en `data/technique_balance.json` y `supabase/technique_balance.sql`.
> **Base:** 65 regates con TP de IE3: 54 individuales, 9 de dos jugadores y 2 de tres.
> **Marco general:** [balance-tecnicas-ie123.md](./balance-tecnicas-ie123.md)
> **Tiros:** [individuales](./balance-tecnicas-ie123-tiros-individuales.md) · [dobles](./balance-tecnicas-ie123-tiros-dobles.md) · [triples](./balance-tecnicas-ie123-tiros-triples.md)

## 1. Criterio

- **Escala B**: regates 20–57 de TP de IE3 → **50–150**, en múltiplos de 10. El techo es 150, no 200: es el 75% del tiro máximo, la misma proporción que en IE3 (57 frente a 76) y en el balance de VR (150 frente a 200).
- **Top 1**: **Hora celestial** (150). El resto de individuales fuertes queda en 140: Súper elástico, Balón diabólico y Bomba géiser.
- **Sin bandas por jugadores**: todos los regates compiten en la misma escala. Las combinadas **no reciben un plus** por ser de 2 o 3 jugadores; al contrario, se les aplica el coste de necesitar más jugadores. Por eso no son las más fuertes.
- **Dentro de cada nivel**: el valor es el múltiplo de 10; el orden interno lo da el TP, el lore y el balance de VR. Las colisiones dentro del nivel se aceptan.
- **TP IE3** manda; `balance_tp` y la potencia de VR se usan como contraste; debut y anime desempatan.
- **Cobertura**: la wiki da **65** regates con TP de IE3 (54 / 9 / 2). En el build están 63; **Air Ride** (2 jugadores, TP 57) y **Angel Ball** (1 jugador, TP 56) solo aparecen en la wiki y se añaden aquí.

## 2. Distribución

| Jugadores | Regates | TP IE3 | Niveles que ocupa | Mejor |
|---|---:|---:|---|---|
| 1 | 54 | 20–56 | 50–150 | Hora celestial 150 |
| 2 | 9 | 46–57 | 90–130 | Ícaro 130 |
| 3 | 2 | 57 | 110–120 | Sprint triple 120 |
| **Total** | **65** | **20–57** | **50–150** | |

Las combinadas no son las más fuertes: el mejor doble es **Ícaro 130** y el mejor triple **Sprint triple 120**, por debajo de **Hora celestial 150** y de los individuales de **140**. No hay una banda que las empuje arriba; el castigo por necesitar 2/3 jugadores las deja donde las pone su TP/lore.

## 3. Los 65 regates

| TP | Técnica (ES) | EN | Debut | Jug. | TP IE3 | Balance | VR TP | VR pot. | Recast | Nota |
|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| **150** | Hora celestial | Heaven's Time | IE1 | 1 | 50 | 150 | 80 | 540 | 60 | balance 150 y VR 80/540; TP 50 |
| **140** | Balón angelical | Angel Ball | IE3 | 1 | 56 | 90 | 70 | 440 | 60 | Uinel; supera a Fidio |
| **140** | Balón diabólico | Devil Ball | IE3 | 1 | 56 | 100 | 70 | 440 | 60 | Arachnes y Satanatos; supera a Kidou y Fudou |
| **140** | Bomba géiser | Water Veil | IE2 | 1 | 53 | 100 | 60 | 360 | 60 | Droll y Lionne; rompe The Wall y The Tower |
| **140** | Súper elástico | Super Elastico | IE3 | 1 | 56 | 100 | 60 | 360 | 60 | Gato; rompe el Blade Attack de Hijikata |
| **130** | Carrera relámpago | Lightning Sprint | IE2 | 1 | 47 | 120 | — | — | — | Creada por Midorikawa; sin ficha de VR |
| **130** | Danza del viento | Wind God's Dance | IE3 | 1 | 53 | 90 | 70 | 440 | 60 | IE3; buen balance (90) |
| **130** | Engaño torero | Matador Feint | IE3 | 1 | 47 | 90 | 50 | 300 | 60 | Querardo; supera a Someoka |
| **130** | Campo de fuerza | Field of Force | IE3 | 2 | 57 | 150 | 80 | 540 | 60 | TP 57 y balance 150; sin Info |
| **130** | Ícaro | The Ikaros | IE3 | 2 | 57 | 100 | 70 | 440 | 60 | Domon + Mark; superan a Hiroto y Someoka |
| **120** | Amago de tiro | Liar Shot | IE3 | 1 | 44 | 90 | 60 | 360 | 60 | IE3; balance 90 |
| **120** | Cruz del Sur | Southern Cross | IE2 | 1 | 49 | 110 | 70 | 440 | 60 | balance 110; VR 70/440 |
| **120** | Entrada tormenta | Dash Storm | IE1 | 1 | 46 | 90 | 70 | 440 | 60 | Demeter la usa cinco veces contra Raimon |
| **120** | Inmersión | Sub-Terfuge | IE3 | 1 | 47 | 90 | 60 | 360 | 60 | Sin Info · VR bajo |
| **120** | Pantalla ígnea | Flame Veil | IE2 | 1 | 53 | 100 | 50 | 300 | 60 | Sin Info · VR bajo |
| **120** | Coz 3 | Breakthrough 3 | IE3 | 2 | 48 | 140 | — | — | — | Mantis + Crow; superan a Tsunami; sin VR |
| **120** | Patín aéreo | Air Ride | IE3 | 2 | 57 | 90 | 70 | 440 | 60 | 2 jugadores; sin Info |
| **120** | Sprint triple | Triple Dash | IE2 | 3 | 57 | 130 | 120 | 800 | 80 | VR 120/800; el mejor de los triples |
| **110** | Balón galgo | Dog Run | IE3 | 1 | 39 | 80 | 50 | 300 | 60 | Roberto; supera a Tsunami |
| **110** | Cúpula sónica | Echo Ball | IE3 | 1 | 44 | 90 | 60 | 360 | 60 | Sin Info · VR bajo |
| **110** | Descarte | Card Slap | IE3 | 1 | 44 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **110** | Regate múltiple | Clone Faker | IE1 | 1 | 42 | 80 | 50 | 300 | 60 | Kouga; supera a Domon |
| **110** | Ultra lunar | Ultra Moon | IE3 | 1 | 44 | 90 | 70 | 440 | 60 | Sin Info |
| **110** | Aikido | Aikido | IE2 | 2 | 47 | 130 | 70 | 440 | 60 | Mai + Gokuhi; superan a Kabeyama |
| **110** | Carrera a tres piernas | Three-Legged Rush | IE2 | 2 | 50 | 120 | 60 | 360 | 60 | Shika + Matsubayashi; superan a Touko, Kogure y Domon |
| **110** | Potenciación | Boost Glider | IE1 | 3 | 57 | 140 | 70 | 440 | 60 | 3 jugadores de IE1; VR 70/440 |
| **100** | Avance flamígero | Gale Dash | IE2 | 1 | 42 | 80 | 70 | 440 | 60 | Sin Info |
| **100** | Coz 2 | Breakthrough 2 | IE2 | 1 | 42 | 90 | — | — | — | Sin Info |
| **100** | Descodificación | Invisible Fake | IE2 | 1 | 42 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **100** | Prima donna | Prima Donna | IE2 | 1 | 39 | 80 | 60 | 360 | 60 | Reika; supera a Kazemaru |
| **100** | Regate espejismo | Deceptor Dribble | IE2 | 1 | 39 | 80 | 60 | 360 | 60 | Kurimatsu; supera a la defensa rival |
| **100** | Tacón infernal | Abaddon Drop | IE3 | 1 | 33 | 80 | — | — | — | Chang-soo; sin ficha de VR |
| **100** | Armadillo circense | Armadillo Circus | IE2 | 2 | 47 | 90 | 110 | 720 | 70 | VR 110/720; sin Info |
| **100** | Tuya-mía doble | Dual Pass | IE2 | 2 | 53 | 100 | 70 | 440 | 60 | Sin Info |
| **90** | Espejismo | Afterimage | IE1 | 1 | 31 | 70 | 60 | 360 | 60 | Kirigakure; supera a Kazemaru |
| **90** | Ignición | Bewilder Blast | IE3 | 1 | 39 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **90** | Lluvia de meteoros | Meteor Shower | IE2 | 1 | 38 | 90 | 70 | 440 | 60 | Sin Info |
| **90** | Paipay gigante | Big Fan | IE2 | 1 | 41 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **90** | Patada canguro | Kangaroo Kick | IE3 | 1 | 31 | 60 | 50 | 300 | 60 | Summer; supera a Kogure |
| **90** | Regate aurora | Aurora Dribble | IE2 | 1 | 39 | 80 | 70 | 440 | 60 | Sin Info |
| **90** | Sorteo de balón | Mole Shuffle | IE2 | 1 | 42 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **90** | Rueda infernal | Rolling Hell (EU) | IE1 | 2 | 46 | 100 | 110 | 720 | 60 | VR 110/720; sin Info |
| **80** | Confusión | Bewildered | IE1 | 1 | 27 | 40 | 50 | 300 | 60 | Mangaka, Cosplay y compañía |
| **80** | Regate rítmico | Ribbon Shower | IE2 | 1 | 31 | 70 | 50 | 300 | 60 | Sin Info · VR bajo |
| **80** | Regate topo | Mole Fake | IE1 | 1 | 33 | 40 | 50 | 300 | 60 | Ikui; supera a Kazemaru |
| **80** | Remolino cortante | Whirlwind Cut | IE1 | 1 | 36 | 70 | 60 | 360 | 60 | Sin Info · VR bajo |
| **80** | Superarmadillo | Super Armadillo | IE1 | 1 | 24 | 60 | 50 | 300 | 60 | Lion; el balón sale fuera |
| **80** | Teleportación | Warp Drive | IE2 | 1 | 36 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **80** | Tornado venenoso | Dark Whirlwind | IE2 | 1 | 35 | 70 | 50 | 300 | 60 | Sin Info · VR bajo |
| **80** | Zigzag explosivo | Zigzag Spark | IE1 | 1 | 27 | 90 | 50 | 300 | 60 | Handa; regate de entrenamiento |
| **70** | Coz | Breakthrough | IE1 | 1 | 25 | 60 | — | — | — | Sin Info · sin VR |
| **70** | Entrada de llamas | Heat Tackle | IE1 | 1 | 27 | 60 | — | — | — | Sin Info · sin VR |
| **70** | Escáner ataque | Attack Scan | IE1 | 1 | 25 | 60 | 50 | 300 | 60 | Sin Info · VR bajo |
| **70** | Espejismo de balón | Illusion Ball | IE1 | 1 | 28 | 50 | — | — | — | Sin Info · sin VR |
| **70** | Giro de mono | Monkey Turn | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Saru; supera a Kurimatsu |
| **70** | Pompa de chicle | Bubble Gum | IE2 | 1 | 25 | 60 | 50 | 300 | 60 | Sin Info · VR bajo |
| **70** | Superaceleración | Dash Accelerator | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Cheetah; supera a Kazemaru |
| **60** | Equilibrismo | Rodeo Clown | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Kouko; roba el balón |
| **60** | Luna creciente | Moonsault | IE1 | 1 | 25 | 60 | 50 | 300 | 60 | Sin Info · VR bajo |
| **60** | Pared solitaria | Double Touch | IE2 | 1 | 20 | 60 | 60 | 360 | 60 | Sin Info · VR bajo |
| **60** | Torbellino dragón | Whirlwind Twister | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Shourin; supera a Henmi |
| **60** | Truco de magia | Magic | IE1 | 1 | 21 | 50 | 50 | 300 | 60 | Sin Info · VR bajo |
| **50** | Entrada huracán | Flurry Dash | IE1 | 1 | 20 | 50 | 60 | 360 | 60 | Sin Info · VR bajo |
| **50** | Maldición | Black Magic | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Sin Info · VR bajo |
| **50** | Niebla venenosa | Poison Fog | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Sin Info · VR bajo |

`Balance` es el `balance_tp` actual de Victory Road; `VR TP` y `VR pot.` son sus números de VR. `—` significa que la técnica no tiene ficha de VR. `Jug.` es el número de jugadores de la wiki.

## 4. Escalera propuesta

| TP | Técnicas |
|---:|---|
| **150** | Hora celestial |
| **140** | Balón angelical, Balón diabólico, Bomba géiser, Súper elástico |
| **130** | Carrera relámpago, Danza del viento, Engaño torero, Campo de fuerza, Ícaro |
| **120** | Amago de tiro, Cruz del Sur, Entrada tormenta, Inmersión, Pantalla ígnea, Coz 3, Patín aéreo, Sprint triple |
| **110** | Balón galgo, Cúpula sónica, Descarte, Regate múltiple, Ultra lunar, Aikido, Carrera a tres piernas, Potenciación |
| **100** | Avance flamígero, Coz 2, Descodificación, Prima donna, Regate espejismo, Tacón infernal, Armadillo circense, Tuya-mía doble |
| **90** | Espejismo, Ignición, Lluvia de meteoros, Paipay gigante, Patada canguro, Regate aurora, Sorteo de balón, Rueda infernal |
| **80** | Confusión, Regate rítmico, Regate topo, Remolino cortante, Superarmadillo, Teleportación, Tornado venenoso, Zigzag explosivo |
| **70** | Coz, Entrada de llamas, Escáner ataque, Espejismo de balón, Giro de mono, Pompa de chicle, Superaceleración |
| **60** | Equilibrismo, Luna creciente, Pared solitaria, Torbellino dragón, Truco de magia |
| **50** | Entrada huracán, Maldición, Niebla venenosa |

## 5. Lectura rápida

- **150**: Hora celestial (top 1; TP 50, balance 150 y VR 80/540). Es el techo de los regates.
- **140**: Súper elástico (Gato; rompe el Blade Attack de Hijikata), Balón diabólico (Arachnes y Satanatos), Bomba géiser (Droll y Lionne; rompe The Wall y The Tower) y Angel Ball (Uinel; supera a Fidio).
- **130**: Carrera relámpago (creada por Midorikawa), **Ícaro** (Domon + Mark; la mejor combinada), Campo de fuerza (doble, TP 57 y balance 150), Engaño torero (Querardo) y Danza del viento (IE3).
- **120**: Entrada tormenta (Demeter), Pantalla ígnea, Amago de tiro, Cruz del Sur, Coz 3 (doble), Inmersión, **Sprint triple** (el mejor triple) y Air Ride (doble; sin Info).
- **110**: Potenciación (triple), Aikido (doble), Carrera a tres piernas (doble), Balón galgo, Ultra lunar, Regate múltiple, Cúpula sónica y Descarte.
- **100–70**: el bloque medio y los clásicos de IE1/IE2.
- **60–50**: básicos de IE1.

### Dobles y triples

- **130**: Ícaro (Domon + Mark; la mejor combinada) y Campo de fuerza (TP 57 y balance 150; sin Info).
- **120**: Coz 3 (Mantis + Crow), Sprint triple (triple, VR 120/800; el mejor triple) y Air Ride (2 jugadores; sin Info).
- **110**: Potenciación (triple, VR 70/440), Aikido (Mai + Gokuhi) y Carrera a tres piernas (Shika + Matsubayashi).
- **100**: Tuya-mía doble (TP 53) y Armadillo circense (VR 110/720; sin Info).
- **90**: Rueda infernal (VR 110/720; sin Info).

Ninguna combinada pasa de **130** y los dos triples se quedan en **110–120**, por debajo de Hora celestial (150) y de los individuales de 140. Si alguna combinada tiene que subir, tendría que hacerlo por TP/lore, no por ser combinada.

## 6. Casos a revisar

- **Hora celestial top 1**: TP 50, pero `balance_tp` 150 y VR 80/540. Se queda en 150 por decisión de diseño; Súper elástico y Balón diabólico bajan a 140 aunque tengan más TP (56).
- **Súper elástico vs Balón diabólico**: los dos tienen TP 56 y quedan en 140. Súper elástico va por delante por el golpe de Gato a Hijikata; Balón diabólico tiene mejor VR (70/440 frente a 60/360). Si manda VR, se intercambian.
- **Bomba géiser vs Pantalla ígnea**: las dos tienen TP 53. Bomba géiser tiene lore (rompe The Wall y The Tower) y queda en 140; Pantalla ígnea no tiene Info y baja a 120.
- **Carrera relámpago**: TP 47, pero balance 120 y es creación de Midorikawa; 130. No tiene ficha de VR.
- **Ícaro vs Campo de fuerza**: los dos tienen TP 57 y quedan en 130. Ícaro es la mejor combinada por lore de anime; Campo de fuerza tiene mejor balance (150 frente a 100) y VR (80/540 frente a 70/440). Si manda el balance, se intercambian.
- **Combinadas**: el mejor doble es Ícaro 130 y el mejor triple Sprint triple 120. El castigo es -12 para dobles y -20 para triples en la ponderación. Sin él, los 57 de Ícaro/Campo de fuerza/Sprint triple se irían arriba.
- **Armadillo circense y Rueda infernal**: TP 47 y 46, pero VR 110/720. Se quedan en 100 y 90 por el castigo de combinadas; si la potencia de VR pesa más, deberían subir.
- **Air Ride y Angel Ball**: no estaban en el build. Angel Ball (TP 56, lore vs Fidio) entra en 140; Air Ride (2 jugadores, TP 57, sin Info) entra en 120. Si el lore de Angel Ball pide más, podría subir a 150, pero Hora celestial se queda como top 1.
- **Techo**: Hora celestial 150; ningún regate pasa de 150. El máximo de IE3 es 57 y el de VR 150, así que el 200 anterior era demasiado alto.

## 7. Pendiente

- Validar el techo 150 y que Hora celestial sea el top 1.
- Después: bloqueos y defensa con techo 150; portería con techo 180.
- **Aplicado el 2026-10-20:** TP nuevo en `data/technique_balance.json` y `supabase/technique_balance.sql` (se carga con `db-load`, opción `balance_only`).

