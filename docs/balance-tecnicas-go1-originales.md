# Técnicas originales de GO1 — TP y colocación

> **Estado:** revisión. Lista completa de técnicas **originales de GO1** (debut GO1: coste GO1 y sin coste IE1/IE2/IE3), sacadas de `Module:WazaData` y contrastadas con la wiki inglesa.
> **Espíritus guerreros:** las 36 técnicas de keshin de esta lista ya no usan el TP de GO1; van por puntos de aura con su propio TP, ver [balance-tecnicas-auras.md](./balance-tecnicas-auras.md). Quedan 91 normales.
> **Aplicado** con TP por saga: las cartas GO1 leen `balance_tp_go1`; el `balance_tp` global de IE/GO2/GO3 no se toca.

## 1. Cobertura y rango de TP

| Tipo | Técnicas | TP GO1 mínimo | TP GO1 máximo | Mediana |
|---|---:|---:|---:|---:|
| Tiros | 50 | 25 | 150 | 60 |
| Regates | 26 | 20 | 50 | 32 |
| Bloqueos | 25 | 20 | 50 | 35 |
| Paradas | 26 | 20 | 80 | 45 |
| **Total** | **127** | **20** | **150** | — |

- **127** están ya en el catálogo; **0** pendientes.
- El rango útil para GO1 es **20–150 de TP**, no 50–200: los tiros llegan a 150, pero regates y bloqueos se quedan en 50 y las paradas en 80.

## 2. Escala propuesta

Propuesta de colocación por tipo, por debajo de GO2 y con los mismos escalones de la app (50–200):

| Tipo | Rango propuesto | Techo |
|---|---:|---|
| Tiros | 50-180 | `SwordExcalibur` / `SwordOfFire` 180 |
| Regates | 50-130 | `SprintWarp` y `OlympusHarmony` 130; `NoboriRyuu` / `RoundSpark` 120 |
| Bloqueos | 50-120 | `VanishingCut` 120 |
| Paradas | 50-150 | `GodHandV`, `MajinTheHand_K`, `GreatTheHand`, `HellsFist`, `KingFire` 150 |

Criterio:

- **TP GO1 manda**: a más TP, más nivel, con múltiplos de 10.
- **Potencia**: por ahora solo ajusta **±10** dentro del nivel de TP; no manda. El TP es la base.
- **Sin castigo por ser GO1**: no hay combinadas en esta lista; no se aplica el castigo de 2/3 jugadores.
- **Tiros**: 25→50, 30→60, 35→70, 40→80, 45→90, 50→100, 55→110, 60→120, 70→140/170, 75→150, 85→170, 150→180.
- **Regates**: 20→50/60, 24→60, 25→80, 28→70/80, 32→80/90, 35→100, 36→100/110, 40→110, 45→120, 50→130. La potencia solo ajusta ±10; no sube un nivel por sí sola.
- **Bloqueos**: 20→50, 24→60, 28→70, 32→80, 35/36→90, 40→100, 45→120, 50→120.
- **Paradas**: 20→50, 25→60, 30→70, 35→80, 40→90, 45→100, 50→120, 55→130/150, 70→150, 80→150.

## 3. Lista completa


### Tiro (50)

| TP GO1 | Potencia GO1 | Técnica | ID | TP app actual | Propuesto | En app |
|---:|---:|---|---|---:|---:|---|
| 25 | 40 | Trayectoria perfecta | `PerfectCourse` | 40 | **50** | sí |
| 30 | 60 | Bomba saltarina | `BoundFlame` | 70 | **60** | sí |
| 30 | 60 | Cabezazo bazuca | `HeadBazooka` | 40 | **60** | sí |
| 35 | 80 | Salto incandescente | `ButtobiJump` | 40 | **70** | sí |
| 35 | 80 | Proyectil letal | `DeathSword` | 60 | **70** | sí |
| 35 | 80 | Tiro vendaval | `MachWind` | 60 | **70** | sí |
| 35 | 80 | Cascabel | `Sidewinder` | 50 | **70** | sí |
| 35 | 80 | Tiro sónico | `SonicShot` | 40 | **70** | sí |
| 40 | 100 | Remate dinosaurio | `DinosaurBreak` | 70 | **80** | sí |
| 40 | 100 | Pentagrama | `Fortissimo` | 60 | **80** | sí |
| 40 | 120 | Cabezazo cohete | `RocketHead` | 60 | **80** | sí |
| 45 | 140 | Alas de halcón | `FalcoWing` | — | **90** | sí |
| 45 | 100 | Peces voladores | `FlyingFish` | 50 | **90** | sí |
| 45 | 140 | Magician's Box | `MagiciansBox` | — | **90** | sí |
| 45 | 100 | Burbujas arcoíris | `RainbowBubbleShot` | 60 | **90** | sí |
| 50 | 120 | Tale of the Dragon | `DragonsTail` | 60 | **100** | sí |
| 50 | 120 | Tiro espectral | `MaboroshiShot` | 70 | **100** | sí |
| 55 | 140 | Aguijón letal | `DeathDrop` | 70 | **110** | sí |
| 55 | 140 | Estrella oscura | `ExtendZone` | 90 | **110** | sí |
| 55 | 160 | Carga al galope | `GallopBuster` | — | **110** | sí |
| 55 | 160 | Movimientos armónicos | `Harmonics` | — | **110** | sí |
| 55 | 160 | Estocada de Lancelot | `LostAngel` | — | **110** | sí |
| 55 | 140 | Leopardo de la ventisca | `PantherBlizzard` | 110 | **110** | sí |
| 55 | 160 | Asalto aéreo | `RagingClaw` | — | **110** | sí |
| 55 | — | Tiro amasado | `YakimochiScrew` | 80 | **110** | sí |
| 60 | 150 | Tiro balista | `BallistaShot` | 70 | **120** | sí |
| 60 | 160 | Chut ancestral | `DenraiHoutou` | 70 | **120** | sí |
| 60 | 160 | Furia de los elementos | `FuurinkazanDestroyer` | 110 | **120** | sí |
| 60 | 180 | Lluvia de azufre | `JokerRains` | 120 | **120** | sí |
| 60 | 140 | Pingüino emperador 7 | `KouteiPenguin7` | 90 | **120** | sí |
| 60 | 160 | Aguijones escarlata | `ThousandArrow` | 150 | **120** | sí |
| 60 | 200 | Triángulo ZZ | `TriangleZZ` | 100 | **120** | sí |
| 70 | 180 | Ceniza negra | `BlackAsh` | 120 | **130** | sí |
| 70 | 180 | Tiro sobrenatural | `DevilBurst` | 140 | **130** | sí |
| 70 | 220 | Triple amenaza | `Evolution` | 170 | **180** | sí |
| 70 | 200 | Fire Tornado DD | `FireTornadoDD` | 140 | **170** | sí |
| 70 | 180 | Ciclón blanco | `WhiteHurricane` | 150 | **140** | sí |
| 70 | 200 | Zero Magnum | `ZeroMagnum` | 170 | **180** | sí |
| 75 | 180 | Tormenta de fuego | `BakunetsuStorm_K` | 110 | **150** | sí |
| 75 | 180 | Estocada samurai | `BushinRenzan` | — | **150** | sí |
| 75 | 180 | Torpedo tridente | `HeavyAquaLance` | — | **150** | sí |
| 75 | 180 | Lanza de carámbanos | `IcicleRoad` | — | **150** | sí |
| 75 | 180 | Llamarada solar | `SunshineForce` | — | **150** | sí |
| 85 | 200 | Jaque mate | `Checkmate` | — | **170** | sí |
| 85 | 200 | Golpe justiciero | `JusticeWing` | — | **170** | sí |
| 85 | 200 | Hacha del Azote negro | `MaouNoOno` | — | **170** | sí |
| 85 | 200 | Desolación eterna | `SoulBringer` | — | **170** | sí |
| 85 | 200 | Aliento blanco | `WhiteBreath` | — | **170** | sí |
| 150 | 250 | Caliburn | `SwordExcalibur` | — | **180** | sí |
| 150 | 250 | Flamberge | `SwordOfFire` | — | **180** | sí |

### Regate (26)

| TP GO1 | Potencia GO1 | Técnica | ID | TP app actual | Propuesto | En app |
|---:|---:|---|---|---:|---:|---|
| 20 | 40 | Mirada al futuro | `FutureEye` | 50 | **50** | sí |
| 20 | 60 | Rodillazos atómicos | `MadJuggler` | 50 | **60** | sí |
| 20 | 140 | Carga hipersónica | `Overdrive` | — | **60** | sí |
| 24 | 80 | Piroquinesis | `BurningSummer` | 60 | **60** | sí |
| 24 | 60 | Remolino acuático | `NaminoriPierrot` | 40 | **60** | sí |
| 25 | 160 | Lazos de oscuridad | `DancingGhost` | — | **80** | sí |
| 25 | 160 | Puño metralleta | `MachineGunBeat` | — | **80** | sí |
| 25 | 160 | Rayo celeste | `PegasusBreak` | — | **80** | sí |
| 28 | 80 | Finta boomerang | `BoomerangFeint` | 50 | **70** | sí |
| 28 | 80 | Brisa deslizante | `SoyokazeStep` | 60 | **70** | sí |
| 28 | 100 | Sello gigante | `TheStamp` | 60 | **80** | sí |
| 32 | 120 | Mina terrestre | `Claymore` | 80 | **90** | sí |
| 32 | 100 | Visto y no visto | `PrestoTurn` | 60 | **80** | sí |
| 32 | 100 | Arrancada | `Zeroyon` | 60 | **80** | sí |
| 35 | 180 | Zarpazo real | `ScratchRaid` | — | **100** | sí |
| 36 | 120 | Guardia acrobática | `AcrobatKeep` | 80 | **100** | sí |
| 36 | 140 | Cruce explosivo | `BritanniaCross` | 120 | **110** | sí |
| 36 | 140 | Remolino ígneo | `EndlessSummer` | 100 | **110** | sí |
| 36 | 120 | Truco balonazo | `TrickBall` | 70 | **100** | sí |
| 36 | 140 | Círculo de hielo | `WhiteBlade` | 100 | **110** | sí |
| 40 | 140 | Trance melódico | `MelodyWave` | 80 | **110** | sí |
| 40 | 140 | Pasos aéreos | `SkyWalk` | 100 | **110** | sí |
| 45 | 160 | Dragón ascendente | `NoboriRyuu` | 100 | **120** | sí |
| 45 | 160 | Esferas luminosas | `RoundSpark` | 120 | **120** | sí |
| 50 | 180 | Himno de Atenea | `OlympusHarmony` | 120 | **130** | sí |
| 50 | 180 | Regate supersónico | `SprintWarp` | 130 | **130** | sí |

### Bloqueo (25)

| TP GO1 | Potencia GO1 | Técnica | ID | TP app actual | Propuesto | En app |
|---:|---:|---|---|---:|---:|---|
| 20 | 60 | A todo vapor | `DashTrain` | 40 | **50** | sí |
| 20 | 140 | Lanza tornado | `DragonStorm` | — | **50** | sí |
| 20 | 40 | Mirada ladrona | `ThiefEye` | 40 | **50** | sí |
| 24 | 100 | Carga de elefantes | `ElephantPress` | 60 | **60** | sí |
| 28 | 80 | Fuerza centrífuga | `SpiralDraw` | 40 | **70** | sí |
| 32 | 100 | Coleccionista de cartas | `CardSplash` | 30 | **60** | sí |
| 32 | 100 | Ataque de la ballena | `KillerWhale` | 40 | **80** | sí |
| 32 | 100 | La niebla | `TheMist` | 50 | **80** | sí |
| 32 | 120 | Picadora | `TwinMixer` | 50 | **80** | sí |
| 32 | 100 | La gran muralla | `VivaBanriNoChoujou` | 50 | **80** | sí |
| 35 | 180 | Sentencia final | `BloodyEncore` | — | **90** | sí |
| 35 | 180 | Espacio oscuro | `DarkSpace` | — | **90** | sí |
| 35 | 180 | Golpe titánico | `StrongTower` | — | **90** | sí |
| 36 | 160 | Pinzas cortantes | `BigScissors` | 80 | **90** | sí |
| 36 | 140 | Defensa propulsada | `KattobiDefense` | 50 | **90** | sí |
| 36 | 140 | Gran torbellino | `Sargasso` | 80 | **90** | sí |
| 40 | 160 | Proyectil de ozono | `AirBullet` | 110 | **120** | sí |
| 40 | 140 | Niebla mística | `DeepMist` | 90 | **100** | sí |
| 40 | 140 | Corte mágico | `DimensionCut` | 100 | **110** | sí |
| 40 | 200 | Ráfaga de tiros | `HakaiDanmaku` | — | **100** | sí |
| 40 | 140 | Red de caza | `HuntersNet` | 70 | **100** | sí |
| 40 | 160 | Espectro oscuro | `SaikyousanShoukan` | 60 | **100** | sí |
| 45 | 160 | Luz cegadora | `CrazySunlight` | 90 | **120** | sí |
| 50 | 180 | Muralla de Atlantis | `AtlantisWall` | 90 | **120** | sí |
| 50 | 180 | Salto dimensional | `VanishingCut` | 120 | **120** | sí |

### Parada (26)

| TP GO1 | Potencia GO1 | Técnica | ID | TP app actual | Propuesto | En app |
|---:|---:|---|---|---:|---:|---|
| 20 | 40 | Parada en pirueta | `MoonsaultStamp` | 40 | **50** | sí |
| 20 | 60 | Puños certeros | `RapidWhip` | 50 | **50** | sí |
| 25 | 60 | Parada ardiente | `BurningCatch` | 40 | **60** | sí |
| 30 | 80 | Ultrasonidos | `BatAttack` | 30 | **70** | sí |
| 30 | 100 | Ancla de navío | `HydroAnchor` | 60 | **70** | sí |
| 35 | 100 | Despeje de fuerza | `PowerSpike` | 40 | **80** | sí |
| 40 | 120 | Rotación inversa | `CounterdriveGK` | 50 | **90** | sí |
| 40 | 120 | Barrera de cristal | `CrystalBarrier` | 70 | **90** | sí |
| 40 | 140 | Barrera de Gaia | `FenceOfGaia` | 90 | **90** | sí |
| 40 | 140 | Escudo guardián | `GuardianShield` | — | **90** | sí |
| 40 | 140 | Estrella reflectante | `StarReflection` | 70 | **90** | sí |
| 45 | 140 | Presa de sombras | `KageTsukami` | 50 | **100** | sí |
| 45 | — | Recepción negativa | `ReverseWorld` | 90 | **100** | sí |
| 45 | 140 | Rompetiros | `ShootBreak` | 90 | **100** | sí |
| 50 | 160 | Dados de la suerte | `LuckyDice` | — | **120** | sí |
| 50 | 160 | Mordisco de serpiente | `SerpentFang` | 60 | **120** | sí |
| 55 | 180 | Manos liberadas | `BuraiHand` | 110 | **120** | sí |
| 55 | 180 | God Hand V | `GodHandV` | 170 | **150** | sí |
| 55 | 180 | Centro de gravedad | `GravityPoint` | 100 | **130** | sí |
| 55 | 180 | Puente sin final | `KillBridge` | 100 | **130** | sí |
| 70 | 180 | Cúpula carmesí | `CrimsonSphere` | — | **150** | sí |
| 70 | 180 | Presa titánica | `GiganticBomb` | — | **150** | sí |
| 80 | 200 | Mano grandiosa | `GreatTheHand` | — | **150** | sí |
| 80 | 200 | Despeje demoníaco | `HellsFist` | — | **150** | sí |
| 80 | 200 | Corona de fuego | `KingFire` | — | **150** | sí |
| 80 | 200 | Mano mágica | `MajinTheHand_K` | 110 | **150** | sí |

## 4. Técnicas que faltan en la app (0)



## 5. Aplicación

1. Las **127 originales** están en el catálogo de técnicas (819 en total); las 34 que faltaban se añadieron.
2. El **TP por saga** está implementado en `balance_tp_go1`, `balance_power_min_go1` y `balance_power_max_go1`; el frontend los usa solo en cartas GO1.
3. La columna **Propuesto** es la aplicada en `data/technique_balance_go1.json` y `supabase/technique_balance.sql`.
4. El `balance_tp` global de IE/GO2/GO3/Ares/Orion no se toca.

## 6. Fuentes

- `Module:WazaData` (cache local) para la lista de originales (coste GO1 y sin IE).
- Wiki inglesa: fichas de técnica y `Module:PlayerData/GO`.
- `build/players.json` para el TP actual.
