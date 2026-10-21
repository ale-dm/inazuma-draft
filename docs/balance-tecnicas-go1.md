# Técnicas de GO1 — bloqueos y regates (primer corte)

> **Aviso:** este documento incluye las 48 técnicas **usadas por cartas GO1**, aunque muchas son compartidas con IE/GO2/GO3. El alcance bueno, solo **originales de GO1**, está en [`balance-tecnicas-go1-originales.md`](./balance-tecnicas-go1-originales.md).
> **Estado:** revisión/propuesta. No se han aplicado los TP nuevos: el `balance_tp` es global. Se han corregido solo los elementos inválidos.
> **Base:** 23 bloqueos y 25 regates usados por cartas de GO1; coste GO1 de la ficha de la wiki.
> **Pendiente estructural:** separar el TP por saga (ver `docs/balance-tecnicas-ares-orion.md`, apartado Pendiente).

## 1. Punto de partida

| Tipo | Técnicas | Coste GO1 | `balance_tp` actual |
|---|---:|---:|---:|
| Bloqueos | 23 | 20–50 | 30–120 |
| Regates | 25 | 20–50 | 40–130 |

Problemas detectados:

- **No hay técnicas exclusivas de GO1** entre estos bloqueos/regates: todas aparecen también en otras sagas. Cambiar el TP global para GO1 rompería el balance de IE123, GO2, GO3, Ares u Orion.
- **Dos elementos inválidos**: `AcrobatKeep` (`acrobat keep`) y `SkyWalk` (`sky walk`). Corregidos a **air** en `overrides.technique_elements`.
- **Dos costes GO1 ausentes**: `LightningAccel` y `WarpDrive`; se mantienen sus valores actuales y se marcan como pendientes de ficha.
- Hay inversiones claras: `CardSplash` (coste 32, TP 30), `SpiralDraw` (28/40), `KillerWhale` (32/40), `KattobiDefense` (36/50), `AtlantisWall` (50/90), `NaminoriPierrot` (24/40), `BoomerangFeint` (28/50), `ShippuuDash` (32/50).

## 2. Escala propuesta

- **Bloqueos: 50–130**, en múltiplos de 10. Techo `VanishingCut` 130; `AirBullet`, `AtlantisWall` y `CrazySunlight` 120.
- **Regates: 50–140**, en múltiplos de 10. Techo `FuujinNoMai`, `SprintWarp` y `LightningAccel` 140.
- Es una escala **por debajo de GO2** (bloqueos 160, regates 150) y por encima de las básicas de GO1.
- Escalera de coste: 20→50, 24→60, 28→70, 32→80, 36→90, 40→100, 45→120, 50→130/140; los outliers de lore suben uno o dos niveles.
- Las combinadas no existen en este lote; no hay plus por jugadores.

## 3. Bloqueos (23)

| Propuesto | Actual | Técnica | ID | Coste GO1 | Elemento |
|---:|---:|---|---|---:|---|
| **130** | 120 | Salto dimensional | `VanishingCut` | 50 | void |
| **120** | 110 | Proyectil de ozono | `AirBullet` | 40 | air |
| **120** | 90 | Luz cegadora | `CrazySunlight` | 45 | fire |
| **120** | 90 | Muralla de Atlantis | `AtlantisWall` | 50 | earth |
| **110** | 100 | Campo torbellino | `Senpuujin` | 32 | air |
| **110** | 100 | Corte mágico | `DimensionCut` | 40 | wood |
| **100** | 80 | Gran torbellino | `Sargasso` | 36 | air |
| **100** | 80 | Pinzas cortantes | `BigScissors` | 36 | fire |
| **100** | 70 | Red de caza | `HuntersNet` | 40 | wood |
| **100** | 90 | Niebla mística | `DeepMist` | 40 | wood |
| **90** | 50 | Defensa propulsada | `KattobiDefense` | 36 | earth |
| **90** | 60 | Paisaje helado | `IceGround` | 36 | air |
| **90** | 60 | Espectro oscuro | `SaikyousanShoukan` | 40 | void |
| **80** | 70 | El muro | `TheWall` | 28 | earth |
| **80** | 40 | Ataque de la ballena | `KillerWhale` | 32 | air |
| **80** | 50 | La gran muralla | `VivaBanriNoChoujou` | 32 | earth |
| **80** | 50 | La niebla | `TheMist` | 32 | wood |
| **80** | 50 | Picadora | `TwinMixer` | 32 | fire |
| **70** | 40 | Fuerza centrífuga | `SpiralDraw` | 28 | air |
| **60** | 60 | Carga de elefantes | `ElephantPress` | 24 | earth |
| **60** | 30 | Coleccionista de cartas | `CardSplash` | 32 | fire |
| **50** | 40 | Mirada ladrona | `ThiefEye` | 20 | wood |
| **50** | 40 | A todo vapor | `DashTrain` | 20 | fire |

## 4. Regates (25)

| Propuesto | Actual | Técnica | ID | Coste GO1 | Elemento |
|---:|---:|---|---|---:|---|
| **140** | 130 | Danza del viento | `FuujinNoMai` | 36 | air |
| **140** | 130 | Regate supersónico | `SprintWarp` | 50 | void |
| **140** | 130 | Carrera relámpago | `LightningAccel` | — | fire |
| **130** | 120 | Esferas luminosas | `RoundSpark` | 45 | fire |
| **130** | 120 | Himno de Atenea | `OlympusHarmony` | 50 | wood |
| **120** | 120 | Cruce explosivo | `BritanniaCross` | 36 | fire |
| **110** | 100 | Dragón ascendente | `NoboriRyuu` | 45 | earth |
| **100** | 100 | Círculo de hielo | `WhiteBlade` | 36 | air |
| **100** | 100 | Remolino ígneo | `EndlessSummer` | 36 | fire |
| **100** | 100 | Pasos aéreos | `SkyWalk` | 40 | air |
| **90** | 80 | Guardia acrobática | `AcrobatKeep` | 36 | air |
| **90** | 70 | Truco balonazo | `TrickBall` | 36 | wood |
| **90** | 80 | Trance melódico | `MelodyWave` | 40 | wood |
| **90** | 80 | Teleportación | `WarpDrive` | — | wood |
| **80** | 60 | Arrancada | `Zeroyon` | 32 | air |
| **80** | 80 | Mina terrestre | `Claymore` | 32 | earth |
| **80** | 60 | Visto y no visto | `PrestoTurn` | 32 | wood |
| **80** | 70 | Espejismo de balón | `IllusionBall` | 32 | wood |
| **80** | 50 | Entrada huracán | `ShippuuDash` | 32 | air |
| **70** | 60 | Brisa deslizante | `SoyokazeStep` | 28 | air |
| **70** | 50 | Finta boomerang | `BoomerangFeint` | 28 | earth |
| **60** | 60 | Piroquinesis | `BurningSummer` | 24 | fire |
| **60** | 40 | Remolino acuático | `NaminoriPierrot` | 24 | air |
| **50** | 50 | Mirada al futuro | `FutureEye` | 20 | wood |
| **50** | 50 | Rodillazos atómicos | `MadJuggler` | 20 | fire |

## 5. Cómo aplicarlo

1. **Recomendado:** añadir `balance_tp_go1`, `balance_power_min_go1` y `balance_power_max_go1` a `techniques`; el frontend elige el valor GO1 cuando la carta es GO1. Así no se toca IE/GO2/GO3.
2. Alternativa rápida: cambiar el `balance_tp` global de estas 48 técnicas; **no recomendado** porque arrastra a todas las sagas.
3. Antes de aplicar, confirmar los costes GO1 de `LightningAccel` y `WarpDrive`.

## 6. Fuentes

- `build/players.json` (técnicas usadas por cartas GO1, coste GO1, tipo, elemento).
- `data/technique_balance.json` (TP actual).
- Wiki inglesa, fichas de técnica y `Module:PlayerData/GO`.
