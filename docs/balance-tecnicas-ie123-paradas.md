# Paradas (IE123) — propuesta B en múltiplos de 10 (50–180)

> **Estado:** aplicada (2026-10-20): TP en `data/technique_balance.json` y `supabase/technique_balance.sql`.
> **Base:** 70 paradas únicas con TP de IE3: 65 individuales, 1 de dos jugadores y 4 de tres.
> **Marco general:** [balance-tecnicas-ie123.md](./balance-tecnicas-ie123.md)
> **Bloqueos:** [balance-tecnicas-ie123-bloqueos.md](./balance-tecnicas-ie123-bloqueos.md)

> **Variantes:** el build tiene 73 filas de parada; las 3 de más son **God Hand Blue**, **Majin The Hand Blue** y **Majin The Hand K**. Comparten página con God Hand / Majin The Hand, pero no los mismos valores de VR: la ficha base de God Hand marca balance 50 y la de Majin The Hand 100; Blue/K suben a 60/130/120. Aquí se usa la ficha base y se cuentan una sola vez.

## 1. Criterio

- **Escala B**: paradas 20–60 de TP de IE3 → **50–180**, en múltiplos de 10. El techo es 180: el máximo de IE3 es 60 frente a 76 del tiro (79%) y el balance de VR es 180 frente a 200 (90%). En portería casi no hay combinadas, así que la jerarquía por jugadores importa poco.
- **Top 1**: **Mano espiritual** (Soul Hand, 180). Es la parada con más TP (60) y balance máximo (180). **Parada celestial** (God Catch, 170) es la alternativa por lore: la evolución final de Endou.
- **Sin bandas por jugadores**: las combinadas no reciben un plus. Se aplica un castigo moderado (**-10 dobles / -15 triples**) porque en portería casi todas las técnicas son individuales.
- **Dentro de cada nivel**: el valor es el múltiplo de 10; el orden interno lo da el TP, el lore y el balance de VR. Las colisiones dentro del nivel se aceptan.
- **TP IE3** manda; `balance_tp` y la potencia de VR se usan como contraste; debut y anime desempatan.
- **Cobertura**: 70 paradas únicas. El build tiene 73 por las 3 variantes de God Hand / Majin The Hand.

## 2. Distribución

| Jugadores | Paradas | TP IE3 | Niveles que ocupa | Mejor |
|---|---:|---:|---|---|
| 1 | 65 | 20–60 | 50–180 | Mano espiritual 180 |
| 2 | 1 | 47 | 120 | Bloqueo doble 120 |
| 3 | 4 | 47–60 | 110–150 | Voltaje dual 150 |
| **Total** | **70** | **20–60** | **50–180** | |

Las combinadas no son las más fuertes: el mejor triple es **Voltaje dual 150**, por debajo de Mano espiritual (180), Parada celestial / Mano Omega / Mano diabólica (170) y del bloque de 160. El único doble, **Bloqueo doble**, queda en 120.

## 3. Las 70 paradas

| TP | Técnica (ES) | EN | Debut | Jug. | TP IE3 | Balance | VR TP | VR pot. | Recast | Nota |
|---:|---|---|---|---:|---:|---:|---:|---:|---:|---|
| **180** | Mano espiritual | Soul Hand | IE3 | 1 | 60 | 180 | 100 | 640 | 60 | Rococo; parada final de Little Gigant |
| **170** | Mano Omega | Omega Hand | IE3 | 1 | 60 | 170 | 100 | 640 | 60 | Endou; película vs Ogre |
| **170** | Mano diabólica | Fiend Hand | IE3 | 1 | 60 | 170 | 100 | 640 | 60 | Maou The Hand; parada oscura |
| **170** | Parada celestial | God Catch | IE3 | 1 | 57 | 180 | 100 | 640 | 60 | Endou; evolución final de God Hand |
| **160** | Colmillo de pantera | Beast Fang | IE2 | 1 | 52 | 170 | 80 | 540 | 60 | Creada por Kageyama; TP 52 y balance 170 |
| **160** | Mano celestial X | God Hand X | IE3 | 1 | 45 | 160 | 80 | 540 | 60 | Endou; evolución de God Hand |
| **160** | Muro dimensional | Temporal Wall | IE2 | 1 | 60 | 130 | 80 | 540 | 60 | TP 60; balance 130 |
| **150** | El olvido | The End | IE3 | 1 | 60 | 110 | 80 | 540 | 60 | Astaroth; Makai Gundan Z |
| **150** | Mano ultradimensional | Dimensional Hand | IE3 | 1 | 52 | 110 | 70 | 440 | 60 | Ijigen The Hand; TP 52 |
| **150** | Manos infinitas | Mugen The Hand | IE2 | 1 | 50 | 130 | 80 | 540 | 60 | Endou; evolución de Majin The Hand |
| **150** | Millón de manos | Million Hands | IE3 | 1 | 55 | 100 | 70 | 440 | 60 | Jorge; The Empire |
| **150** | Zona sagrada | Celestial Zone | IE3 | 1 | 60 | 110 | 80 | 540 | 60 | Enolel; Tenkuu no Shito |
| **150** | Voltaje dual | High Voltage | IE3 | 3 | 60 | 160 | 100 | 640 | 60 | Zagomel, Gevoh y Buvo; Ogre |
| **140** | Combustión | Burnout | IE2 | 1 | 50 | 90 | 60 | 360 | 60 | Grent; Chaos |
| **140** | Constelación estelar | Procyon Net | IE2 | 1 | 52 | 100 | 70 | 440 | 60 | Sin Info |
| **140** | Destrozataladros | Drill Smasher | IE2 | 1 | 50 | 100 | 80 | 540 | 60 | Sin Info |
| **140** | Electrotrampa | Electrap | IE3 | 1 | 47 | 100 | — | — | — | Medio |
| **140** | Parada múltiple | Clone Block | IE2 | 1 | 45 | 120 | 80 | 540 | 60 | Sin Info |
| **140** | Puños voladores | Double Rocket | IE2 | 1 | 47 | 110 | 70 | 440 | 60 | Medio |
| **130** | Araña gigante | Giant Spider | IE3 | 1 | 47 | 90 | 60 | 360 | 60 | Fox; Team Garshield |
| **130** | Bloque de hielo | Ice Block | IE2 | 1 | 50 | 90 | 60 | 360 | 60 | Beluga; Diamond Dust |
| **130** | Martillo defensor | Needle Hammer | IE3 | 1 | 45 | 100 | 60 | 360 | 60 | Medio · VR bajo |
| **130** | Muralla gigante | Gigant Wall | IE1 | 1 | 50 | 70 | 70 | 440 | 60 | Top |
| **130** | Parada de capoeira | Capoeira Grab | IE3 | 1 | 45 | 80 | 60 | 360 | 60 | Falcão; The Kingdom |
| **130** | Trimano celestial | Triple God Hand | IE2 | 3 | 57 | 140 | 120 | 720 | 110 | 3 jugadores; TP 57 |
| **120** | Escudo protector | Table-Turner | IE2 | 1 | 40 | 70 | 60 | 360 | 60 | Bajo · VR bajo |
| **120** | Golpes de luz | Flash Upper | IE3 | 1 | 45 | 80 | 60 | 360 | 60 | Kid; Unicorn |
| **120** | Guardia del coliseo | Colosseum Guard | IE3 | 1 | 42 | 90 | 60 | 360 | 60 | Blasi; Orpheus |
| **120** | Muralla de escudos | Safety First | IE2 | 1 | 40 | 110 | 50 | 300 | 60 | Tetsukabe; SP Fixers |
| **120** | Simún | Storm Rider | IE3 | 1 | 42 | 80 | 60 | 360 | 60 | Nasser; Desert Lion |
| **120** | Bloqueo doble | Dual Smash | IE2 | 2 | 47 | 100 | 60 | 360 | 60 | 2 jugadores; TP 47 |
| **120** | Muralla infinita | Infinite Wall | IE1 | 3 | 55 | 150 | 80 | 540 | 60 | 3 jugadores; TP 55 |
| **110** | Baraja fugaz | Card Protector | IE3 | 1 | 42 | 70 | 60 | 360 | 60 | Sin Info · VR bajo |
| **110** | Espada defensora | Galatyn | IE3 | 1 | 37 | 80 | 60 | 360 | 60 | Freddie; Knights of Queen |
| **110** | Lanzallamas | Flame Breath | IE2 | 1 | 37 | 80 | 50 | 300 | 60 | Kakita; Manyuuji |
| **110** | Mano mágica | Majin The Hand | IE1 | 1 | 32 | 100 | 80 | 540 | 60 | Endou; icónica, pero TP 32 y balance 100 |
| **110** | Puño de furia | Hammer of Fury | IE3 | 1 | 42 | 90 | 70 | 440 | 60 | Sin Info |
| **110** | Rechace de fuego | Nitro Slap | IE3 | 1 | 42 | 70 | 60 | 360 | 60 | Sin Info · VR bajo |
| **110** | Defensa triple | Triple Defence (EU) | IE1 | 3 | 47 | 130 | 70 | 440 | 60 | 3 jugadores; TP 47 |
| **100** | Agujero de gusano | Wormhole | IE2 | 1 | 40 | 70 | 70 | 440 | 70 | TP 40; balance 70 |
| **100** | Agujero negro | Black Hole | IE2 | 1 | 35 | 70 | 60 | 360 | 60 | Gorleo; Gemini Storm |
| **100** | Gran barrera de coral | Barrier Reef | IE3 | 1 | 37 | 80 | 60 | 360 | 60 | TP 37; balance 80 |
| **100** | Malla letal | Shot Trap | IE3 | 1 | 40 | 50 | 60 | 360 | 60 | Sin Info · VR bajo |
| **100** | Muralla tsunami | Tsunami Wall | IE1 | 1 | 42 | 90 | 70 | 440 | 60 | Sin Info |
| **100** | Puño vengativo | Counter Strike | IE1 | 1 | 40 | 70 | 70 | 440 | 60 | TP 40; balance 70 |
| **100** | Super puño invencible | Fist of Justice | IE2 | 1 | 37 | 80 | 70 | 440 | 60 | TP 37; balance 80 |
| **90** | Aguijón | The Stinger | IE3 | 1 | 37 | 70 | 60 | 360 | 60 | TP 37; balance 70 |
| **90** | Cortina aurora | Aurora Curtain | IE2 | 1 | 35 | 70 | 60 | 360 | 60 | TP 35; balance 70 |
| **90** | Deslizamiento de portería | Sliding Goal | IE1 | 1 | 32 | 70 | 60 | 360 | 60 | TP 32; balance 60 |
| **90** | Despeje explosivo | Blazing Knuckle | IE1 | 1 | 35 | 70 | 60 | 360 | 60 | TP 35; balance 70 |
| **90** | Escudo de fuerza total | Full Power Shield | IE1 | 1 | 32 | 60 | 70 | 440 | 60 | Genda; Teikoku |
| **90** | Torbellino | Whirlwind | IE1 | 1 | 32 | 60 | 50 | 300 | 60 | TP 32; balance 60 |
| **90** | Tormenta de pétalos | Flower Power | IE2 | 1 | 30 | 50 | 50 | 300 | 60 | TP 30; balance 80 |
| **80** | Cabezonería | Fireball Head | IE2 | 1 | 30 | 60 | 50 | 300 | 60 | TP 30; balance 60 |
| **80** | Despeje cohete | Rocket Kobushi | IE1 | 1 | 25 | 60 | 60 | 360 | 60 | Takeshi; Mikage Sennou |
| **80** | Escudo de fuerza | Power Shield | IE1 | 1 | 25 | 50 | 60 | 360 | 60 | Genda; Teikoku |
| **80** | Garra salvaje | Wild Claw | IE1 | 1 | 25 | 60 | 50 | 300 | 60 | Inoshishi; Nose |
| **80** | Mandril | Utter Gutsiness Catch | IE2 | 1 | 35 | 40 | 50 | 300 | 60 | TP 35; balance 40 |
| **80** | Uñas afiladas | Claw Slash | IE2 | 1 | 32 | 70 | 50 | 300 | 60 | TP 32; balance 70 |
| **70** | Campo de fuerza defensivo | Shot Pocket | IE1 | 1 | 30 | 50 | 50 | 300 | 60 | TP 30; balance 50 |
| **70** | Despeje de fuego | Fireball Knuckle | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | TP 20; balance 50 |
| **70** | Despeje de leñador | Wood Chopper | IE1 | 1 | 21 | 50 | 60 | 360 | 60 | TP 21; balance 90 |
| **70** | Hojarasca | Mistral | IE1 | 1 | 27 | 50 | 50 | 300 | 60 | TP 27; balance 80 |
| **70** | Mano celestial | God Hand | IE1 | 1 | 22 | 50 | 60 | 360 | 60 | Endou; icónica, pero TP 22 y balance 50 |
| **60** | Atajo tornado | Tornado Catch | IE1 | 1 | 22 | 50 | 50 | 300 | 60 | TP 22; balance 50 |
| **60** | Bloque dureza | Toughness Block | IE1 | 1 | 20 | 50 | 60 | 360 | 60 | Nanzan; Kidokawa |
| **60** | Despeje a presión | Pressure Punch | IE1 | 1 | 21 | 50 | 50 | 300 | 60 | TP 21; balance 50 |
| **60** | Espiral de distorsión | Warp Space | IE1 | 1 | 22 | 60 | 50 | 300 | 60 | TP 22; balance 60 |
| **50** | Cuchilla asesina | Killer Blade | IE1 | 1 | 20 | 50 | 50 | 300 | 60 | TP 20; balance 50 |
| **50** | Salto del cisne | Swan Dive | IE2 | 1 | 20 | 40 | 50 | 300 | 60 | TP 20; balance 40 |

`Balance` es el `balance_tp` actual de Victory Road; `VR TP` y `VR pot.` son sus números de VR. `—` significa que la técnica no tiene ficha de VR. `Jug.` es el número de jugadores de la wiki.

## 4. Escalera propuesta

| TP | Técnicas |
|---:|---|
| **180** | Mano espiritual |
| **170** | Mano Omega, Mano diabólica, Parada celestial |
| **160** | Colmillo de pantera, Mano celestial X, Muro dimensional |
| **150** | El olvido, Mano ultradimensional, Manos infinitas, Millón de manos, Zona sagrada, Voltaje dual |
| **140** | Combustión, Constelación estelar, Destrozataladros, Electrotrampa, Parada múltiple, Puños voladores |
| **130** | Araña gigante, Bloque de hielo, Martillo defensor, Muralla gigante, Parada de capoeira, Trimano celestial |
| **120** | Escudo protector, Golpes de luz, Guardia del coliseo, Muralla de escudos, Simún, Bloqueo doble, Muralla infinita |
| **110** | Baraja fugaz, Espada defensora, Lanzallamas, Mano mágica, Puño de furia, Rechace de fuego, Defensa triple |
| **100** | Agujero de gusano, Agujero negro, Gran barrera de coral, Malla letal, Muralla tsunami, Puño vengativo, Super puño invencible |
| **90** | Aguijón, Cortina aurora, Deslizamiento de portería, Despeje explosivo, Escudo de fuerza total, Torbellino, Tormenta de pétalos |
| **80** | Cabezonería, Despeje cohete, Escudo de fuerza, Garra salvaje, Mandril, Uñas afiladas |
| **70** | Campo de fuerza defensivo, Despeje de fuego, Despeje de leñador, Hojarasca, Mano celestial |
| **60** | Atajo tornado, Bloque dureza, Despeje a presión, Espiral de distorsión |
| **50** | Cuchilla asesina, Salto del cisne |

## 5. Lectura rápida

- **180**: Mano espiritual (Soul Hand; TP 60 y balance 180). Es el techo de las paradas.
- **170**: Parada celestial (God Catch; Endou), Mano Omega (película vs Ogre) y Mano diabólica (Maou The Hand).
- **160**: Colmillo de pantera, Muro dimensional y Mano celestial X (balance alto).
- **150**: Zona sagrada, El olvido, Millón de manos, Manos infinitas, Mano ultradimensional y **Voltaje dual** (mejor combinada).
- **140–100**: bloque medio-alto; aquí caen Mano mágica (110), Muralla infinita (120), Trimano celestial (130), Bloqueo doble (120), Defensa triple (110)…
- **90–50**: clásicos y básicos; Mano celestial (God Hand) queda en 70 por su TP 22 y balance 60 en IE3.

### Combinadas

- **150**: Voltaje dual (3 jugadores; Ogre; TP 60 y balance 160). Es la mejor combinada.
- **130**: Trimano celestial (3 jugadores; TP 57, balance 140, VR 120/720).
- **120**: Bloqueo doble (2 jugadores; TP 47) y Muralla infinita (3 jugadores; TP 55, balance 150).
- **110**: Defensa triple (3 jugadores; TP 47).

Ninguna combinada pasa de **150**; los mejores individuales están en 160–180. Si alguna combinada tiene que subir, tendría que hacerlo por TP/lore, no por ser combinada.

## 6. Casos a revisar

- **Mano espiritual vs Parada celestial**: las dos tienen balance 180 y VR 100/640. Mano espiritual tiene TP 60 y es la parada de Rococo en Little Gigant; Parada celestial tiene TP 57 y es la evolución final de Endou. Se pone arriba Mano espiritual por TP; si manda el lore de Endou, se intercambian el 180 y el 170.
- **Mano Omega y Mano diabólica**: TP 60 y balance 170; quedan en 170. Mano Omega es de la película vs Ogre; Mano diabólica es la parada oscura de Maou The Hand.
- **Zona sagrada / El olvido**: TP 60, pero balance 110; bajan a 150. **Muro dimensional** (balance 130) se queda en 160.
- **Colmillo de pantera**: TP 52, pero balance 170 y VR 80/540; sube a 160. Es el caso donde el balance más empuja.
- **Voltaje dual**: TP 60 y balance 160, pero es 3 jugadores; con el castigo se queda en 150. Sin castigo, estaría en el top.
- **Manos infinitas**: TP 50 y balance 130; 150 por lore (evolución de Endou).
- **Mano celestial X**: TP 45, pero balance 160 y VR 80/540; sube a 160.
- **Mano mágica**: TP 32, pero balance 100 y VR 80/540; 110 por lore. Si el TP manda, bajaría a 90–100.
- **Mano celestial (God Hand)**: TP 22 y balance 50; 70. Es icónica, pero en IE3 es la parada básica. Si el lore pesa más, podría subir a 90–100.
- **Variantes del build**: God Hand Blue, Majin The Hand Blue y K comparten valores con God Hand / Majin The Hand; no se cuentan como técnicas nuevas.

## 7. Pendiente

- Validar el top 1 (Mano espiritual vs Parada celestial) y los casos de Mano mágica / God Hand.
- Con esto quedan revisados tiros, regates, bloqueos y paradas. El siguiente paso sería aplicar los valores a `data/technique_balance.json` / Supabase.
- **Aplicado el 2026-10-20:** TP nuevo en `data/technique_balance.json` y `supabase/technique_balance.sql` (se carga con `db-load`, opción `balance_only`).

