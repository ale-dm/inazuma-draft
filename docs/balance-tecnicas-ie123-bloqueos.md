# Bloqueos (IE123) — propuesta B en múltiplos de 10 (50–150)

> **Estado:** propuesta, sin cambios aplicados (2026-10-20).
> **Base:** 71 bloqueos con TP de IE3: 55 individuales, 9 de dos jugadores y 7 de tres.
> **Marco general:** [balance-tecnicas-ie123.md](./balance-tecnicas-ie123.md)
> **Regates:** [balance-tecnicas-ie123-regates.md](./balance-tecnicas-ie123-regates.md)

## 1. Criterio

- **Escala B**: bloqueos 12–57 de TP de IE3 → **50–150**, en múltiplos de 10. El techo es 150, igual que regates: el máximo de IE3 es 57 frente a 76 del tiro (75%) y el balance de VR es 150 frente a 200 (75%).
- **Top 1**: **La montaña** (The Mountain) y **Muro de hierro** (Iron Wall), los dos en **150**. La montaña manda por TP (56), balance (140) y lore (Kabeyama la crea contra Fire Dragon); Muro de hierro entra en el top por decisión de diseño.
- **Sin bandas por jugadores**: todos los bloqueos compiten en la misma escala. Las combinadas **no reciben un plus** por ser de 2 o 3 jugadores; al contrario, se les aplica el coste de necesitar más jugadores. Por eso no son las más fuertes.
- **Dentro de cada nivel**: el valor es el múltiplo de 10; el orden interno lo da el TP, el lore y el balance de VR. Las colisiones dentro del nivel se aceptan.
- **TP IE3** manda; `balance_tp` y la potencia de VR se usan como contraste; debut y anime desempatan.
- **Cobertura**: la wiki y el build coinciden en **71** bloqueos. No falta ninguno.

## 2. Distribución

| Jugadores | Bloqueos | TP IE3 | Niveles que ocupa | Mejor |
|---|---:|---:|---|---|
| 1 | 55 | 12–56 | 50–150 | La montaña / Muro de hierro 150 |
| 2 | 9 | 44–53 | 70–120 | Presa 120 |
| 3 | 7 | 52–57 | 80–120 | Escudo corporal 120 |
| **Total** | **71** | **12–57** | **50–150** | |

Las combinadas no son las más fuertes: el mejor doble es **Presa 120** y el mejor triple **Escudo corporal 120**, por debajo de **La montaña / Muro de hierro 150** y de los individuales de **140/130**. El castigo es -12 para dobles y -20 para triples.

## 3. Los 71 bloqueos

| TP | Técnica (ES) | EN | Debut | Jug. | TP IE3 | Balance | VR TP | VR pot. | Recast | Nota |
|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| **150** | La montaña | The Mountain | IE3 | 1 | 56 | 140 | 70 | 440 | 60 | Kabeyama la crea; contra Fire Dragon |
| **150** | Muro de hierro | Iron Wall | IE3 | 1 | 44 | 100 | 70 | 440 | 60 | Sin Info |
| **140** | Caída a los infiernos | Hell's Descent | IE3 | 1 | 56 | 100 | — | — | — | TP 56; sin Info |
| **140** | Gran seísmo | Ground Quake | IE3 | 1 | 56 | 120 | 80 | 540 | 60 | Walter; final vs Inazuma Japan |
| **140** | Subida a los cielos | Heaven's Ascent | IE3 | 1 | 56 | 100 | — | — | — | TP 56; sin Info |
| **130** | Cortafuegos | Ignite Steal | IE2 | 1 | 53 | 100 | — | — | — | Bomba; Chaos |
| **130** | Corte diabólico | Diabolical Cut | IE3 | 1 | 53 | 110 | 70 | 440 | 60 | Crow; roba el balón a Tsunami |
| **130** | Escudo bárbaro | Barbarian Shield | IE3 | 1 | 53 | 100 | 70 | 440 | 60 | Sin Info |
| **130** | Rompehielos | Frozen Steal | IE2 | 1 | 53 | 100 | 60 | 360 | 60 | Gokka; Diamond Dust |
| **130** | Ángel de nieve | Snow Angel | IE3 | 1 | 47 | 100 | 60 | 360 | 60 | TP 47; sin Info |
| **120** | Aplanadora | Road Roller | IE2 | 1 | 50 | 110 | 60 | 360 | 60 | Sin Info · VR bajo |
| **120** | Entrada rodante | Rolling Slide | IE3 | 1 | 42 | 90 | 60 | 360 | 60 | Medio · VR bajo |
| **120** | Jaula de piedra | Stone Prison | IE3 | 1 | 42 | 90 | 60 | 360 | 60 | Medio · VR bajo |
| **120** | Robo planeta | Planet Shield | IE2 | 1 | 50 | 100 | 70 | 440 | 60 | Sin Info |
| **120** | Presa | Stone Wall | IE2 | 2 | 53 | 140 | 60 | 360 | 60 | 2 jugadores; sin Info |
| **120** | Escudo corporal | Body Shield | IE2 | 3 | 57 | 150 | 80 | 540 | 60 | Smith y Hayate; SP Fixers |
| **110** | Cinto astral | Asteroid Belt | IE2 | 1 | 46 | 90 | 70 | 440 | 70 | Sin Info |
| **110** | Corte volcánico | Volcano Cut | IE2 | 1 | 42 | 80 | 60 | 360 | 70 | Medio · VR bajo |
| **110** | Defensa múltiple | Clone Defence | IE2 | 1 | 42 | 80 | 60 | 360 | 60 | Medio · VR bajo |
| **110** | Mega terremoto | Mega Quake | IE1 | 1 | 44 | 90 | 70 | 440 | 60 | Medio |
| **110** | Zona de seguridad | Perimeter Zone | IE2 | 1 | 42 | 80 | 50 | 300 | 60 | Medio · VR bajo |
| **110** | Torre perfecta | Perfect Tower | IE2 | 3 | 57 | 130 | 80 | 540 | 60 | Touko; The Genesis |
| **110** | Tren loco | Mad Express | IE2 | 3 | 57 | 140 | 70 | 440 | 60 | Sin Info; TP 57 |
| **110** | Zona sigma | Sigma Zone | IE2 | 3 | 57 | 150 | 80 | 540 | 70 | Sin Info; TP 57 |
| **100** | Apisonadora | Divine Stamp | IE1 | 1 | 43 | 80 | 70 | 440 | 60 | Sin Info |
| **100** | Baile de llamas | Flame Dance | IE2 | 1 | 39 | 80 | 70 | 440 | 60 | Ichinose; Gemini Storm |
| **100** | Campo torbellino | Whirlwind Force | IE2 | 1 | 44 | 50 | 60 | 360 | 70 | Sin Info · VR bajo |
| **100** | Golpe de vacío | Vac Attack | IE3 | 1 | 44 | 90 | 70 | 440 | 60 | Sin Info |
| **100** | Gravitación | Gravitation | IE2 | 1 | 38 | 90 | 70 | 440 | 70 | Bajo |
| **100** | Torre inexpugnable | The Tower | IE2 | 1 | 42 | 70 | 60 | 360 | 70 | Touko; Nara |
| **100** | Bloqueo ballena | Whale Guard | IE2 | 2 | 50 | 90 | 60 | 360 | 60 | Tsunami y Kabeyama; Little Gigant |
| **100** | Ciclón doble | Double Cyclone | IE2 | 2 | 46 | 110 | 70 | 440 | 60 | Gouin y Jimon; Neo Japan |
| **100** | Trama trama | Bamboo Pattern | IE1 | 3 | 57 | 140 | 70 | 440 | 60 | Sin Info; TP 57 |
| **90** | Ataque de las sombras | Shadow Stitch | IE1 | 1 | 39 | 70 | 60 | 360 | 60 | Medio · VR bajo |
| **90** | Ciclón | Cyclone | IE1 | 1 | 38 | 70 | 60 | 360 | 60 | Bajo · VR bajo |
| **90** | Dientes de roca | Gravestone | IE3 | 1 | 36 | 70 | 60 | 360 | 60 | Bajo · VR bajo |
| **90** | Gravedad grave | Heavy Mettle | IE2 | 1 | 42 | 90 | 50 | 300 | 60 | Sin Info · VR bajo |
| **90** | Zigzag de fuego | Zigzag Flame | IE3 | 1 | 36 | 80 | 60 | 360 | 60 | Bajo · VR bajo |
| **90** | Estrella fugaz | Shooting Star | IE2 | 2 | 47 | 90 | 60 | 360 | 60 | Shourin y Shishido; Dark Emperors |
| **90** | Segadora | Harvest | IE1 | 2 | 48 | 110 | 60 | 360 | 60 | Gouin y Zohan; Neo Japan |
| **90** | Voltereta circense | Circus Block | IE2 | 2 | 47 | 90 | 60 | 360 | 60 | Ishiyama y Chik; Yokato |
| **90** | Flecha huracán | Hurricane Arrows | IE1 | 3 | 57 | 90 | 60 | 360 | 60 | Mitsumune y Nishigaki; Kidokawa |
| **80** | Engaño yoyó | Yo-Yo Ball | IE3 | 1 | 36 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **80** | Olor embriagador | Sleeping Dust | IE2 | 1 | 39 | 60 | 70 | 440 | 60 | Sin Info |
| **80** | Placaje extremo | Power Charge | IE3 | 1 | 39 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **80** | Telaraña | Spider Web | IE1 | 1 | 33 | 50 | 60 | 360 | 60 | Bajo · VR bajo |
| **80** | Terremoto | Earthquake | IE1 | 1 | 32 | 70 | 50 | 300 | 60 | Bajo · VR bajo |
| **80** | Tormenta de arena | Desert Blast | IE3 | 1 | 36 | 70 | 70 | 440 | 60 | Sin Info |
| **80** | Dúo magma | Dual Storm | IE2 | 2 | 46 | 90 | 70 | 440 | 60 | Sin Info |
| **80** | Gran Sabio | Mega Wall | IE2 | 2 | 50 | 90 | 60 | 360 | 60 | Sin Info · VR bajo |
| **80** | Emboscada defensiva | No Escape | IE2 | 3 | 52 | 110 | 80 | 540 | 60 | 3 jugadores; TP 52 |
| **70** | Bola falsa | Fake Ball | IE1 | 1 | 30 | 60 | 50 | 300 | 60 | Hero; Shuuyou Meito |
| **70** | Bomba falsa | Fake Bomber | IE1 | 1 | 29 | 60 | 60 | 360 | 60 | Los hermanos Kamezaki |
| **70** | Corte giratorio | Spinning Cut | IE1 | 1 | 32 | 70 | 50 | 300 | 70 | Sin Info · VR bajo |
| **70** | El muro | The Wall | IE1 | 1 | 30 | 40 | 60 | 360 | 70 | Icónico, pero flojo en IE3 |
| **70** | Estela ígnea | Racing Flame | IE3 | 1 | 33 | 50 | 60 | 360 | 60 | Sin Info · VR bajo |
| **70** | Flash de fotones | Photon Crash | IE2 | 1 | 25 | 70 | 60 | 360 | 70 | Básico · VR bajo |
| **70** | Super pisotón de sumo | Super Sumo Stomp | IE2 | 1 | 28 | 60 | 60 | 360 | 60 | Básico · VR bajo |
| **70** | Emboscada | Am-Bush | IE3 | 2 | 44 | 80 | 60 | 360 | 60 | Sin Info · VR bajo |
| **60** | Ataque cortante | Blade Attack | IE1 | 1 | 24 | 60 | 50 | 300 | 60 | Hijikata; The Empire |
| **60** | Escáner ataque | Defence Scan (EU) | IE1 | 1 | 28 | 60 | 50 | 300 | 60 | Sin Info · VR bajo |
| **60** | Giro bobina | Coil Turn | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Básico · VR bajo |
| **60** | Gravedad | Ghost Pull | IE1 | 1 | 22 | 50 | 60 | 360 | 60 | Sin Info · VR bajo |
| **60** | Paisaje helado | Land Of Ice | IE2 | 1 | 28 | 50 | 60 | 360 | 60 | Sin Info · VR bajo |
| **60** | Pisotón de sumo | Sumo Stomp | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Básico · VR bajo |
| **60** | Robo veloz | Quick Draw | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Básico · VR bajo |
| **50** | Barrido defensivo | Killer Slide | IE1 | 1 | 12 | 40 | 50 | 300 | 60 | El bloqueo más barato (TP 12) |
| **50** | Doppelgänger | Doppelganger | IE1 | 1 | 21 | 70 | 50 | 300 | 60 | Sin Info · VR bajo |
| **50** | Embestida | Horn Train | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | Sin Info · VR bajo |
| **50** | Sorpresa | About Face | IE1 | 1 | 16 | 50 | 50 | 300 | 60 | Sin Info · VR bajo |
| **50** | Superpeonza | Supreme Spin | IE2 | 1 | 20 | 50 | 50 | 300 | 60 | Sin Info · VR bajo |

`Balance` es el `balance_tp` actual de Victory Road; `VR TP` y `VR pot.` son sus números de VR. `—` significa que la técnica no tiene ficha de VR. `Jug.` es el número de jugadores de la wiki.

## 4. Escalera propuesta

| TP | Técnicas |
|---:|---|
| **150** | La montaña, Muro de hierro |
| **140** | Caída a los infiernos, Gran seísmo, Subida a los cielos |
| **130** | Cortafuegos, Corte diabólico, Escudo bárbaro, Rompehielos, Ángel de nieve |
| **120** | Aplanadora, Entrada rodante, Jaula de piedra, Robo planeta, Presa, Escudo corporal |
| **110** | Cinto astral, Corte volcánico, Defensa múltiple, Mega terremoto, Zona de seguridad, Torre perfecta, Tren loco, Zona sigma |
| **100** | Apisonadora, Baile de llamas, Campo torbellino, Golpe de vacío, Gravitación, Torre inexpugnable, Bloqueo ballena, Ciclón doble, Trama trama |
| **90** | Ataque de las sombras, Ciclón, Dientes de roca, Gravedad grave, Zigzag de fuego, Estrella fugaz, Segadora, Voltereta circense, Flecha huracán |
| **80** | Engaño yoyó, Olor embriagador, Placaje extremo, Telaraña, Terremoto, Tormenta de arena, Dúo magma, Gran Sabio, Emboscada defensiva |
| **70** | Bola falsa, Bomba falsa, Corte giratorio, El muro, Estela ígnea, Flash de fotones, Super pisotón de sumo, Emboscada |
| **60** | Ataque cortante, Escáner ataque, Giro bobina, Gravedad, Paisaje helado, Pisotón de sumo, Robo veloz |
| **50** | Barrido defensivo, Doppelgänger, Embestida, Sorpresa, Superpeonza |

## 5. Lectura rápida

- **150**: La montaña (Kabeyama la crea; contra Fire Dragon; TP 56 y balance 140) y Muro de hierro (TP 44 y balance 100; entra en el top por decisión de diseño).
- **140**: Gran seísmo (Walter; final vs Inazuma Japan; VR 80/540), Subida a los cielos y Caída a los infiernos (TP 56, sin VR).
- **130**: Corte diabólico (Crow), Rompehielos (Gokka), Cortafuegos (Bomba), Escudo bárbaro y Ángel de nieve.
- **120**: Muro de hierro, **Presa** (mejor doble), Robo planeta, Aplanadora, **Escudo corporal** (mejor triple), Entrada rodante y Jaula de piedra.
- **110–100**: bloque medio (Mega terremoto, Torre perfecta, Zona sigma, Tren loco, Trama trama, Torre inexpugnable, Golpe de vacío, Bloqueo ballena, Ciclón doble…).
- **90–50**: clásicos y básicos (Flecha huracán, Emboscada defensiva, El muro, Ataque cortante, Barrido defensivo…).

### Dobles y triples

- **120**: Presa (2 jugadores, TP 53) y Escudo corporal (3 jugadores, TP 57; Smith y Hayate, SP Fixers).
- **110**: Torre perfecta, Zona sigma y Tren loco (3 jugadores; TP 57).
- **100**: Trama trama (3 jugadores) y Bloqueo ballena / Ciclón doble (2 jugadores).
- **90**: Flecha huracán (3 jugadores) y Segadora / Voltereta circense / Estrella fugaz (2 jugadores).
- **80**: Emboscada defensiva (3 jugadores) y Gran Sabio / Dúo magma (2 jugadores).
- **70**: Emboscada (2 jugadores).

Ninguna combinada pasa de **120**; los mejores individuales están en 130–150. Si alguna combinada tiene que subir, tendría que hacerlo por TP/lore, no por ser combinada.

## 6. Casos a revisar

- **La montaña y Muro de hierro top 1**: La montaña tiene TP 56, balance 140 y VR 70/440 (Kabeyama la crea contra Fire Dragon); Muro de hierro tiene TP 44, balance 100 y VR 70/440, pero se sube a 150 por decisión de diseño. Si se prefiere VR, Gran seísmo (80/540) podría entrar arriba.
- **Gran seísmo**: TP 56, balance 120 y VR 80/540; Walter la usa en el final contra Inazuma Japan. Queda en 140.
- **Subida a los cielos / Caída a los infiernos**: TP 56, pero sin ficha de VR y sin Info. Quedan en 140 por TP; si el lore no las respalda, bajarían.
- **Presa vs Escudo corporal**: mejor doble y mejor triple, ambos en 120. Presa tiene TP 53 y balance 140; Escudo corporal TP 57, balance 150 y lore de SP Fixers. Si manda el TP, Escudo corporal debería subir.
- **El muro**: icónico, pero en IE3 solo tiene TP 30 y balance 40; se queda en 70. Si el lore pesa más, podría subir a 80–90.
- **Torre perfecta / Zona sigma / Tren loco / Trama trama**: TP 57, pero combinadas y sin Info; quedan en 110/100.
- **Barrido defensivo (Killer Slide)**: TP 12, el más barato; se queda en el suelo 50.
- **Techo**: La montaña y Muro de hierro 150; ningún bloqueo pasa de 150. El máximo de IE3 es 57 y el de VR 150, así que el 200 de los tiros no aplica.

## 7. Pendiente

- Validar el top 1 (La montaña vs Gran seísmo) y el castigo a combinadas (-12 dobles / -20 triples).
- Después: paradas con techo 180 (máximo IE3 60 y balance VR 180).
- **No se ha tocado ninguna técnica ni dato del juego.**

