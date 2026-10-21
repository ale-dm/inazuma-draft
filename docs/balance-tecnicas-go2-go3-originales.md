# Técnicas originales de GO2 y GO3 — TP por saga

> **Estado:** aplicado en `data/technique_balance_go2.json`, `data/technique_balance_go3.json` y `supabase/technique_balance.sql` (2026-10-21). Falta cargarlo en Supabase.
> **Alcance:** solo técnicas **normales** (tiro, regate, bloqueo, parada). Quedan aparte, para más adelante: espíritus guerreros (keshin y armaduras), **Mixi Max** y tótems (*Soul Strikes*).
> **Marco:** TP por saga como en [balance-tecnicas-go1-originales.md](./balance-tecnicas-go1-originales.md). **GO2 va por encima de GO3**: Chrono Stone es canónicamente la parte más fuerte de GO.

## 1. Qué entra

- **Original de GO2**: coste de Chrono Stone (`CS`) en `Module:WazaData` y **sin** coste de IE1/IE2/IE3/GO1. **Original de GO3**: coste de Galaxy (`GX`) y sin coste de IE1/IE2/IE3/GO1/GO2. Con este mismo filtro salen las 127 de GO1.
- **Fuera**: 25 *Keshin hissatsu* de GO2, 56 *Soul Strikes* de GO3 y las **11 de Mixi Max** de GO2 (sección 6).

| Saga | Tipo | 1 jugador | 2 jugadores | 3 jugadores | Total |
|---|---|---:|---:|---:|---:|
| GO2 | Tiros | 23 | 6 | 4 | 33 |
| GO2 | Regates | 12 | — | 1 | 13 |
| GO2 | Bloqueos | 12 | — | 4 | 16 |
| GO2 | Paradas | 12 | — | — | 12 |
| GO3 | Tiros | 20 | 3 | 1 | 24 |
| GO3 | Regates | 18 | 1 | — | 19 |
| GO3 | Bloqueos | 14 | 3 | 1 | 18 |
| GO3 | Paradas | 15 | — | — | 15 |
| | **Total** | **126** | **13** | **11** | **150** |

## 2. Criterio: lore primero, números después

El TP no sale de una fórmula sobre el coste. Cada técnica se coloca leyendo su ficha en la wiki inglesa, con este orden de peso:

1. **Qué hace en el anime y en las películas**: en qué arco aparece (principio, mitad o final), contra quién marca, qué técnicas rompe y quién la para. Un choque directo ordena las dos técnicas (p. ej. la Jungla profunda para el Rizo de dragón con armadura, así que va arriba de los bloqueos).
2. **Trivia de la ficha**: «la más fuerte de CS/GX» sube a la técnica a la franja alta de su tipo.
3. **Quién la usa**: firmas de protagonistas y rivales (Tenma, Tsurugi, Shindou, Hakuryuu, Taiyou, SARU, Zanark, Fran, Ozrock…) por encima de las de rivales de un partido.
4. **Números**: potencia en CS/GX y en VR (`t_vr`: 100, 85/80, 70, 60, 50). Sirven para las técnicas que solo existen en los juegos.
5. **Combinadas**: no se castigan por serlo. Se colocan por lo que hacen en el anime y las películas, como las demás. Las de tiro suelen quedar arriba porque son remates de equipo.
6. **GO2 > GO3**: a igual papel en la historia, la de Chrono Stone queda por encima. Los techos de GO3 quedan 10 por debajo de los de GO2.

| Tipo | GO1 | GO3 | GO2 |
|---|---:|---:|---:|
| Tiros | 50–180 | 50–190 | 50–200 |
| Regates | 50–130 | 50–140 | 50–150 |
| Bloqueos | 50–120 | 50–140 | 50–150 |
| Paradas | 50–150 | 50–170 | 50–180 |

## 3. GO2 — Chrono Stone (74)

### Tiros (33)

**3 jugadores (4)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **200** | Impulso del equipo definitivo | `SaikyouElevenHadou` | 70 | 200 | 100 | 180 | Remate final de Chrono Storm contra The Lagoon (ep. 50): atraviesa a todo The Lagoon, el Reverse World 絶 de Hos y la volea de SARU. |
| **190** | Tornado de fuego DT | `FireTornadoTC` | 70 | 200 | 100 | 200 | La más fuerte de CS y GX (trivia). En la película rompe el Ciclón oscuro de Lotus. |
| **190** | Triángulo letal final | `LastDeathZone` | 70 | 200 | 100 | 200 | La más fuerte de CS y GX (trivia); la usan Someoka, Fubuki y Hiroto (Inazuma Legend Japan). |
| **180** | Ataque Omega | `OmegaAttack` | 70 | 200 | 100 | 180 | Alpha, Beta y Gamma juntos (ep. 43); marca dos veces. Antagonistas, arco medio-final. |

**2 jugadores (6)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **170** | Escena nocturna | `TheMonsters` | 70 | 185 | 100 | 170 | Doble de los equipos extra (Nosfanática / Aullido Lunar). Potencia 185 y VR 100; sin anime. |
| **160** | Gran explosión | `GreatBlaster` | 70 | 170 | 100 | 140 | Doble de potencia 170 y VR 100; solo en juegos. |
| **160** | Superremate rebotado | `ExtremeRabbit` | 60 | 165 | 70 | 140 | Combinada de Tenma y Fei creada en el ep. 34; marca. |
| **150** | Doble trallazo planetario | `SouhiYuuseidan` | 60 | 150 | 70 | 130 | Bull y Gra (Perfect Cascade): 5 goles, rompe la Red de caza V2 y a Shinsuke con Liubei. |
| **150** | Futuro negativo | `DeadFuture` | 55 | 160 | 80 | 140 | Meia y Giris (Giru): rompe la Muralla de Atlantis y el KC07; la para la Mano de pingüinos. |
| **110** | Tiro de arcabuz | `HinawaBullet` | 50 | 110 | 60 | 100 | Shiroshika Gumi (ep. 13): dos goles a Shinsuke, luego lo para con Titanius. Arco temprano. |

**1 jugador (23)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **170** | Cañonazo de fragmentos | `ShellbitBurst` | 70 | 185 | 80 | 140 | SARU, jefe final: 3 goles a Chrono Storm en la final; rompe el Romance de los tres reinos 改. |
| **170** | Tiro supermasivo | `ChaosMeteor` | 70 | 170 | 100 | 160 | Fran (película): solo la para la Bimano celestial con todo el equipo, los LBX y Digitonias. VR 100. |
| **160** | Aullido de licántropo | `BeastLord` | 70 | 185 | 100 | 140 | Wolfram (Aullido Lunar, equipo extra). Potencia 185 y VR 100; sin anime. |
| **160** | Mordisco de vampiro | `VampireLord` | 70 | 185 | 100 | 140 | Desmodus (Nosfanática, equipo extra). Potencia 185 y VR 100; sin anime. |
| **160** | Rizo de dragón | `DragonBlaster` | 60 | 140 | 70 | 160 | Hakuryuu con armadura de Shining Dragon: tiro de uno de los grandes rivales. La para la Jungla profunda (Legend Japan), pero solo con tres leyendas. VR beta 120. |
| **160** | Viento celestial | `GodWind` | 60 | 165 | 70 | 110 | Firma de Tenma: en la final rompe el Reverse World de Hos; en GX marca varias veces. |
| **150** | Golpe cataclismo | `DisasterBreak` | 55 | 140 | 70 | 140 | Zanark: 5 goles; rompe la volea combinada de Tenma (armadura) y Fei (Mixi Max). |
| **150** | Tormenta solar | `SunshineStorm` | 60 | 140 | 80 | 130 | Técnica estrella de Taiyou, rival de Tenma (película, junto al Ciclón blanco). |
| **140** | Fulgor majestuoso | `GloriousRay` | 60 | 180 | 80 | 120 | Ikaros Zero (LBX) en la película; potencia 180/190 pero sin partido. |
| **140** | Tormenta dimensional | `DimensionStorm` | 60 | 150 | 80 | 130 | Asta (Destructchers): dos goles a Shinsuke, una vez con Liubei. |
| **130** | Disparo doble | `DoubleShot` | 50 | 130 | 60 | 110 | Beta: 6 goles; rompe la defensa combinada con keshin y a Titanius. |
| **130** | Doble hélice | `SpringArrow` | 55 | 140 | 60 | 100 | Jips (Zan) marca a Sangoku; Dak marca en la final con armadura. |
| **130** | Giro atómico | `GammaStrike` | 55 | 160 | 70 | 110 | Gamma; la detiene el grito de Zanark. |
| **120** | Caída planetaria | `OgreBlade` | 55 | 120 | 60 | 100 | Rasetsu: un gol con armadura; dos veces parado por Shinsuke. |
| **110** | Cabezazo gigatón | `GigatonHead` | 50 | 80 | 70 | 140 | Endou (Legend Japan) como cadena del Onda chispeante; marca. |
| **110** | Onda chispeante | `SparkleWave` | 50 | 110 | 70 | 140 | Tsunami (Legend Japan) en cadena con el Cabezazo gigatón; marca. |
| **110** | Polen devastador | `FloralDespair` | 50 | 130 | 80 | 130 | Zinnias (película); la para el Romance de los tres reinos. |
| **90** | Engranajes aceleradores | `GearDrive` | 50 | 120 | 60 | 60 | Karakuri: cuatro veces parada por Liubei; un gol. |
| **90** | Flecha de Cupido | `LoveArrow` | 50 | 130 | 60 | 110 | Neira; la bloquea Fortaleza nocturna (combinada temprana). |
| **90** | Tiro magnético | `GaussShot` | 50 | 80 | 70 | 80 | Einam: un gol (Nippon Daihyou, 10.º). |
| **80** | Balón de plasma | `PlasmaBall` | 50 | 80 | 50 | 70 | Einam, arco temprano: 2 goles y 4 paradas. VR 50. |
| **70** | Remate rebotado | `BouncerRabbit` | 30 | 60 | 60 | 50 | Primera técnica de Fei (ep. 1). |
| **60** | Tiro rotativo | `SpinningTransam` | 30 | 60 | 50 | 50 | Alpha (ep. 1): la paran Captura excelente y la Mano grandiosa. |

### Regates (13)

**3 jugadores (1)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **120** | Estampida en línea | `MueiSouha` | 40 | 130 | 60 | 150 | Rei, Gra y Bull (Perfect Cascade) en Hyper Dive: superan a Kinako. |

**1 jugador (12)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **150** | El ojo del huracán | `StormZone` | 50 | 180 | 70 | 140 | SARU en la final: supera a Tenma. |
| **140** | Formateo de disco | `AllDelete` | 45 | 160 | 70 | 150 | Inspirada en los poderes de Fran; la más fuerte de GX (trivia). |
| **140** | Túnel tornado | `KazaanaDrive` | 50 | 180 | 70 | 130 | Regate de Tenma; lo usa en todo GX (Teikoku, Fire Dragon, Faram Dite). Potencia 180. |
| **120** | Despliegue de señuelos | `DecoyRelease` | 40 | 140 | 80 | 130 | Yuuchi (Garu) y SARU (supera a Tenma en el juego). VR 80. |
| **110** | Avance chispeante | `SparkEdgeDribble` | 40 | 140 | 60 | 110 | Taiyou (película). |
| **100** | Brisa encabritada | `SoyoyagiStep` | 40 | 140 | 70 | 100 | Tenma la crea contra Ancient Dark para salvar a un niño. |
| **100** | Salto explosivo | `BungeeThrust` | 36 | 120 | 60 | 90 | Meizu (Zanark Domain): supera a Nishiki y a Fei. |
| **90** | Ataque de garza | `TsubameGaeshi` | 36 | 100 | 60 | 80 | Taian (Shiroshika Gumi), arco temprano. |
| **80** | Ritmo agresivo | `AggressiveBeat` | 32 | 100 | 70 | 60 | Tenma la crea en el ep. 2; regate básico del principio. |
| **70** | Barrena voladora | `SpinningUpper` | 32 | 90 | 60 | 70 | Quorth (Protocol Omega); Kirino la rompe con keshin. |
| **70** | Choque directo | `LinearDrive` | 32 | 80 | 50 | 60 | Dhanna (Protocol Omega 3.0), solo en el juego. |
| **60** | Rematerialización | `Transmove` | 28 | 70 | 60 | 60 | Un miembro de Karakuri Bingmayong. |

### Bloqueos (16)

**3 jugadores (4)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **150** | Jungla profunda | `DeepJungle` | 40 | 160 | 100 | 160 | Kazemaru, Kabeyama y Sakuma (Legend Japan) paran el Rizo de dragón de Hakuryuu con armadura. VR 100. |
| **140** | Acrobacia robótica | `MueiRanbu` | 45 | 180 | 80 | 110 | Perfect Cascade (Hyper Dive + armadura): roba a Fei y frena a Kinako. La más fuerte de CS (trivia). |
| **80** | Fortaleza nocturna | `Ichiyajou` | 27 | 80 | 80 | 60 | Combinada de Oda Gun: para la Flecha de Cupido; el tiro de Fei la arrasa. VR 80. |
| **70** | Presa fractal | `FractalHouse` | 27 | 100 | 70 | 100 | Combinada de Tenmas: la rompen Alpha y Tsurugi. |

**1 jugador (12)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **140** | Campo minado | `GrandSweeper` | 45 | 170 | 60 | 120 | Dak en la final: le roba a Tenma con Mixi Max de Arturo. |
| **140** | Caída prehistórica | `KodaiNoTsubasa` | 45 | 180 | 80 | 100 | La más fuerte de CS (trivia). Potencia 180. |
| **120** | Estrella de roca | `AsteriskRock` | 40 | 160 | 70 | 80 | Asta bloquea un tiro de Hakuryuu; lo rompe el Viento celestial. |
| **100** | Fiesta floral | `MagicalFlower` | 35 | 140 | 80 | 90 | Potencia 140, VR 80; sin anime. |
| **100** | Grumo pegapasta | `MochimochiKinakoMochi` | 35 | 130 | 60 | 90 | Kinako: bloquea el Gear Drive, roba a Okita y para un tiro de Zanark Domain. |
| **90** | Barreno de fuego | `Screwdriver` | 31 | 100 | 60 | 80 | Yaksha: le roba a Fei (Mixi Max) y a Tenma. |
| **90** | Muralla de las montañas | `OkehazamaWall` | 35 | 130 | 60 | 80 | Ashiguro (Shiroshika Gumi) frena a Shishimaru. |
| **80** | Bobina eléctrica | `CoilUpper` | 27 | 80 | 60 | 70 | Dhanna con Mixi Max de Zanark le roba a Kirino y lo lesiona. |
| **80** | Magnetismo | `MagnetDraw` | 31 | 120 | 50 | 70 | Medam le roba a Tsurugi. |
| **80** | Pirueta rascacielos | `SkytreeFall` | 31 | 120 | 70 | 60 | Potencia 120; sin anime. |
| **60** | Obstrucción eléctrica | `BlitzBridge` | 27 | 80 | 50 | 70 | Soccer Robots; Tenma la esquiva. |
| **60** | Robo fantástico | `WonderTrap` | 19 | 50 | 60 | 50 | Primer bloqueo de Tenma (ep. 2). |

### Paradas (12)

**1 jugador (12)**

| TP | Técnica | ID | Coste CS | Pot. CS | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **180** | Bimano celestial | `GodHandW` | 55 | 180 | 80 | 150 | Tenma con todo el equipo, los LBX y Digitonias para el Tiro supermasivo de Fran (Mixi Max + armadura). |
| **160** | Agujero blanco | `ShiningHole` | 55 | 180 | 100 | 140 | Lotus para un tiro de Taiyou. La más fuerte de CS y GX. VR 100. |
| **160** | Ciclón oscuro | `DestinyCloud` | 55 | 180 | 100 | 140 | Lotus (película) para el Tiro sobrenatural de Tsurugi; lo rompe Tornado de fuego DT. La más fuerte de CS y GX. |
| **160** | Despeje medialuna | `KogetsuJuujishou` | 55 | 180 | 70 | 100 | Lau (Keeper Command 16) desvía la Katana crisantemo; la rompe el Colmillo retorcido. La más fuerte de CS. |
| **160** | Mano de pingüinos | `PenguinTheHand` | 40 | 180 | 70 | 130 | ENDOU con lo mejor de Endou: para el Futuro negativo. La más fuerte de CS. |
| **120** | Corte de arena | `SandCutter` | 40 | 120 | 70 | 80 | Shuten para el Sunshine Force de Apolo y desvía el Tiro sobrenatural y el Chut prehistórico. |
| **120** | Repulsión | `Rejection` | 50 | 160 | 70 | 130 | Boofuu: la rompen tres veces. La más débil de CS, la más fuerte de GX. |
| **110** | Parada en plancha | `ButtobiPunch` | 35 | 100 | 60 | 80 | Shinsuke: para el Gear Drive; en GX desvía el Amplificador mágico y la Roca volcánica. |
| **100** | Rayo de puño | `BeamKobushi` | 45 | 140 | 70 | 90 | Heiba: desvía un Chut ancestral; la rompe Taiyou. |
| **90** | Giroparada | `GyroSaving` | 40 | 130 | 60 | 80 | Lugic: la rompen una y otra vez. |
| **70** | Aplastamiento | `DoonShout` | 30 | 80 | 60 | 50 | Zanou (Protocol Omega): casi siempre la rompen. |
| **70** | Captura excelente | `ExcellentBreast` | 25 | 60 | 50 | 60 | Machos para tiros de Alpha al principio. |


## 4. GO3 — Galaxy (76)

### Tiros (24)

**3 jugadores (1)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **190** | La Tierra: Infinito | `TheEarthInfinity` | 85 | 200 | 100 | 200 | Última técnica del anime de GX: gol de la victoria contra Ixal Fleet. La más fuerte de GX. |

**2 jugadores (3)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **170** | Alba oscura | `BlackDawn` | 70 | 170 | 100 | 130 | Tsurugi y Matatagi la crean contra Ixal Fleet; marcan a Phobos. |
| **170** | Caída galáctica | `GalacticaFall` | 85 | 200 | 100 | 150 | La más fuerte de GX (trivia); solo en juegos. |
| **160** | Grito del Edén | `ScreamOfEden` | 85 | 180 | 100 | 140 | Hermanos Baran: rompen la Parada mate, el Zarpazo poderoso y una defensa combinada. |

**1 jugador (20)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **170** | ¡Tormenta, tornado, huracán! | `ArashiTatsumakiHurricane` | 85 | 190 | 100 | 140 | Tenma la crea en la final contra Ixal Fleet: rompe a Ozrock con alma y el Cometiros. |
| **160** | Tormenta estelar | `Stargazer` | 85 | 190 | 100 | 160 | Ozrock, rival final: 4 goles; rompe el Zarpazo poderoso. |
| **140** | Relámpago volcánico | `Kazanrai` | 85 | 190 | 100 | 120 | Rodan: un gol; la para el Mate del dragón. |
| **140** | Remate orbital | `OrbitalDrive` | 85 | 190 | 100 | 130 | Potencia 190, VR 100; solo en juegos. |
| **140** | Tiro del corazón real | `LoyalHeartShot` | 85 | 190 | 100 | 130 | Potencia 190, VR 100; solo en juegos. |
| **130** | Amplificador mágico | `MagicAmp` | 85 | 190 | 100 | 130 | Despina; la desvía la Parada en plancha con armadura. |
| **130** | Tijera fulminante | `BicycleSword` | 40 | 100 | 70 | — | Firma de Tsurugi en GX: 8 goles. |
| **120** | Taconazo parkour | `ParkourAttack` | 40 | 110 | 70 | 60 | Firma de Matatagi: 6 goles. |
| **110** | Golpe kabuki | `KabukiBreak` | 55 | 120 | 70 | 80 | Zanakurou la crea con Endou; marca en su presentación. |
| **110** | Misil arenoso | `DustJavelin` | 55 | 120 | 80 | 70 | Kazerma: rompe la Parada mate. |
| **110** | Tiro efervescente | `BubbleBoil` | 55 | 130 | 80 | 80 | Sevan: un gol; la desvía el Zarpazo poderoso. |
| **100** | Cabezazo catapulta | `KyoubouHead` | 20 | — | 50 | 50 | Kusaka: 6 goles; rompe la Trampa vegetal, la Parada de codo y el Golpe abrasador. |
| **100** | Contra | `DeadStraight` | 40 | 100 | 70 | — | Contra de Tetsukado: devuelve la Roca volcánica y marca. |
| **100** | Habichuelas mágicas | `GigantVine` | 55 | 130 | 50 | 60 | Potencia 130, VR 50; sin anime. |
| **100** | Roca volcánica | `Kazangan` | 55 | 130 | 80 | 90 | Horne: un gol, pero la desvían tres veces. |
| **90** | La fiebre del oro | `GoldFever` | 40 | 90 | 70 | 80 | Maksim rompe la Parada mate; la desvía el Zarpazo poderoso. |
| **80** | Balón de petróleo | `OilRush` | 40 | 90 | 70 | 90 | Said: dos goles a Ibuki. |
| **80** | Tiro elefante | `IvoryCrash` | 30 | 80 | 60 | 70 | Thamgan: 4 goles en la fase asiática. |
| **60** | Choque de sirena | `MermaidSmash` | 30 | 70 | 50 | 70 | Potencia 70, VR 50; sin anime. |
| **60** | Fuego rápido | `RapidFire` | 20 | — | 50 | 60 | Choon-yoon; la para la Clave de sol. |

### Regates (19)

**2 jugadores (1)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **120** | Remolino de hojas | `KonohaRendezvous` | 70 | 150 | 100 | 160 | Doble, solo en juegos; VR 100. |

**1 jugador (18)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **140** | Diffuse Chord | `DiffuseChord` | 85 | 200 | 100 | 160 | Shindou la crea contra Ixal Fleet. La más fuerte de GX. |
| **140** | Espada de Atlas | `AtlasSword` | 85 | 200 | 100 | 150 | La más fuerte de GX; VR 100. |
| **130** | Arco psíquico | `PsychicBow` | 85 | 200 | 100 | 150 | La más fuerte de GX; VR 100; sin anime. |
| **130** | Plumas brillantes | `ShinyFeather` | 85 | 200 | 80 | 140 | La más fuerte de GX; VR 80; sin anime. |
| **120** | Bofetón látigo | `Jackknife` | 70 | 150 | 100 | 120 | Hilary supera a Kusaka, Sakura y Minaho. VR 100. |
| **120** | Defensa holográfica | `HologramLock` | 70 | 170 | 100 | 120 | Lotz (Faram Dite) supera dos veces a Kusaka. VR 100. |
| **100** | Chorro rebotante | `LiquidFlow` | 55 | 140 | 80 | 100 | Potencia 140; sin anime. |
| **100** | Excavación | `DigThrough` | 55 | 130 | 80 | 100 | Zaba supera a Manabe y a Shindou. |
| **100** | Lecho de lava | `MagmaCarpet` | 55 | 140 | 80 | 100 | Etuna supera a Tetsukado. |
| **100** | Salto champiñón | `MushroomHop` | 55 | 140 | 80 | 100 | Stag supera a Minaho. |
| **100** | ¡Mirad, un platillo volante! | `AsokoNiUFO` | 55 | 120 | 80 | 80 | Minaho engaña tres veces a los hermanos Baran. |
| **90** | Z Slash | `ZSlash` | 30 | 80 | 60 | 70 | Regate de Tenma en GX; lo usa en casi todos los partidos. |
| **80** | Deriva desértica | `DesertDrift` | 40 | 100 | 70 | 80 | Potencia 100; sin anime. |
| **80** | Ruta de la seda | `SilkRoad` | 40 | 110 | 70 | 80 | Rolan (Storm Wolf) supera a Sakura y a Minaho. |
| **70** | Aro-Alehop | `BeautifulHoop` | 20 | 50 | 50 | 50 | Sakura: la usa hasta la final contra Ixal Fleet. |
| **70** | Mirada intimidante | `OraoraMenchi` | 30 | 80 | 60 | 70 | Potencia 80; sin anime. |
| **70** | Siega baja | `DeathScytheLow` | 40 | 90 | 70 | 90 | Thamgan supera a Konoha. |
| **50** | Bolea ígnea | `Doukasen` | 20 | — | 50 | 60 | Potencia 50; sin anime. |

### Bloqueos (18)

**3 jugadores (1)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **130** | Formación defensiva | `Phalanx` | 70 | 200 | 100 | 130 | Combinada de 3; potencia 200, VR 100. |

**2 jugadores (3)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **100** | Defensa radial | `RollingCutter` | 40 | 130 | 80 | 120 | Sergei y Mitya roban cuatro veces. |
| **80** | Lógica ganadora | `WinningLogic` | 40 | 130 | 70 | 80 | Doble; potencia 130; solo en juegos. |
| **80** | Siega central | `DeathScytheMiddle` | 30 | 90 | 70 | 90 | Yam y Napa bloquean el Taconazo parkour y roban a Matatagi y a Tsurugi. |

**1 jugador (14)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **140** | Rayo del juicio | `JudgmentRay` | 55 | 170 | 100 | 120 | Ishigashi (Ixal Fleet) para a Matatagi y a Rodan. VR 100. |
| **130** | Bloqueo telequinético | `FatalLift` | 70 | 200 | 100 | 140 | Potencia 200, VR 100; solo en juegos. |
| **130** | Stealth Walk | `StealthWalk` | 70 | 200 | 100 | 110 | Potencia 200, VR 100; solo en juegos. |
| **120** | Maza rocosa | `RockHammer` | 55 | 170 | 80 | 100 | Varga roba a Tenma, Shindou y Matatagi. |
| **110** | Gran catarata | `Waterfall` | 55 | 150 | 80 | 110 | Biicha roba tres veces (Sakura, Matatagi). |
| **110** | Presa de zarcillo | `TentacleHold` | 55 | 150 | 100 | 110 | Banda le roba a Matatagi. VR 100. |
| **100** | Tuneladora | `DigUp` | 55 | 150 | 80 | 100 | Duff le roba a Sakura. |
| **100** | Vuelo volcánico | `VolcanicFly` | 55 | 150 | 70 | 100 | Potencia 150, VR 70; sin anime. |
| **90** | Bola de hojas | `KonohaRoll` | 40 | 130 | 70 | 90 | Konoha: varios robos en la fase asiática. |
| **90** | Juego de piernas | `FootworkDraw` | 30 | 110 | 70 | 70 | Tetsukado: roba a Sergei, Sharqi y a Etuna (Lecho de lava). |
| **70** | Clave de sol | `Einsatz` | 20 | 70 | 60 | 60 | Shindou: bloquea el Fuego rápido y roba varias veces. |
| **60** | Copia y corta | `TracePress` | 15 | 60 | 50 | 40 | Minaho, fase asiática. |
| **60** | Ecuación defensiva | `DefenseHouteishiki` | 15 | 60 | 50 | 50 | Manabe, fase asiática. |
| **60** | Remolino polvoriento | `WillyWilly` | 30 | 100 | 50 | 60 | Oyster le roba a Sakura. |

### Paradas (15)

**1 jugador (15)**

| TP | Técnica | ID | Coste GX | Pot. GX | VR | Antes | Por qué |
|---:|---|---|---:|---:|---:|---:|---|
| **170** | Acorde difuso | `GingaRocket` | 70 | 180 | 100 | 120 | Shinsuke la crea en la recta final: desvía la Tijera fulminante, el Pingüino emperador n.º 2 y el Belion Whip con alma. |
| **150** | Mate del dragón | `GekirinDunk` | 55 | 160 | 100 | 100 | Ibuki la crea y para el Relámpago volcánico; la rompe el Ixaal Cannon con alma. |
| **150** | Portón del castillo | `CastleGate` | 70 | 180 | 100 | 140 | Potencia 180, VR 100; solo en juegos. |
| **150** | Sacrifice | `Sacrifice` | 70 | 180 | 100 | 140 | Potencia 180, VR 100; solo en juegos. |
| **140** | Cometiros | `ShootEater` | 70 | 180 | 80 | 140 | Phobos; la rompen Alba oscura y ¡Tormenta, tornado, huracán! |
| **120** | Despeje virtual | `ReboundLayer` | 55 | 150 | 100 | 110 | Argo desvía la Contra; la rompen Soy todopoderoso y el Hayabusa Glide. |
| **120** | Zarpazo poderoso | `RisingSlash` | 40 | 120 | 80 | 80 | Ibuki desvía la Fiebre del oro y el Tiro efervescente; la rompe la Tormenta estelar. |
| **110** | Cabezazo volcánico | `VolcanoHead` | 55 | 150 | 80 | 110 | Potencia 150; sin anime. |
| **110** | Puño de arena | `SandKnock` | 55 | 150 | 80 | 110 | Badai desvía la Tijera fulminante; luego la rompen. |
| **110** | Trampa vegetal | `BigMouth` | 55 | 170 | 80 | 90 | Longa para el Cabezazo catapulta; luego lo rompe. |
| **80** | Golpe abrasador | `DryBlow` | 30 | 110 | 70 | 70 | Sultan para el Viento celestial; la rompen tres veces. |
| **80** | Parada de codo | `KillerElbow` | 30 | 110 | 70 | 60 | Udom para el Pentagrama; la rompen dos veces. |
| **70** | Parada mate | `WildDunk` | 10 | 40 | 50 | 40 | Primera parada de Ibuki: muchas paradas y muchos goles encajados. |
| **60** | Colmillo de cocodrilo | `CrocodileFang` | 20 | 80 | 60 | 70 | Dugong; la rompe el Taconazo parkour. |
| **60** | Despeje retorcido | `TwistReach` | 20 | — | 60 | 50 | Karnov desvía el Mach Wind; luego la rompen. |

## 5. Mixi Max (aparte, sin TP de saga)

Técnicas que el jugador obtiene al fusionarse con el aura. Ahora tienen TP de GO2 por lore (son técnicas normales que se pagan con tensión; la fusión va por puntos): ver [balance-tecnicas-auras.md](./balance-tecnicas-auras.md) §3. La columna de la derecha es el TP global de antes.

| Técnica | ID | Tipo | Fusión | TP global anterior |
|---|---|---|---|---:|
| Chut prehistórico | `KodaiNoKiba` | Tiro | Fei × Tyranno | 120 |
| Colmillo retorcido | `OujaNoKiba` | Tiro | Fei × Big | 100 |
| Impulso efímero | `SetsunaBoost` | Tiro | Shindou × Oda Nobunaga | 140 |
| Katana crisantemo | `KikuIchimonji` | Tiro | Tsurugi × Okita Souji | 140 |
| Soy todopoderoso | `GreatMaxNaOre` | Tiro | Zanark × Clara Jane | 160 |
| Tormenta eléctrica | `TenchiRaimei` | Tiro | Taiyou × Zhuge Kongming | 140 |
| Corriente negra | `KuroshioRide` | Regate | Nishiki × Sakamoto Ryouma | 130 |
| Espada real | `OuNoTsurugi` | Regate | Tenma × Rey Arturo | 120 |
| Ilusión deslumbrante | `KirakiraIllusion` | Bloqueo | Kinako × Master Dragon | 120 |
| La flamme | `LaFlamme` | Bloqueo | Kirino × Juana de Arco | 100 |
| Romance de los tres reinos | `TaikokuOuka` | Parada | Shinsuke × Liu Bei | 100 |

## 6. Aplicación

1. Columnas `balance_tp_go2/go3`, `balance_power_min_go2/go3` y `balance_power_max_go2/go3` (`supabase/schema.sql`). `supabase/technique_balance.sql` también las crea si faltan, así que basta el workflow `db-load` con `balance_only`.
2. `tools/db/output.py` lee `data/technique_balance_<saga>.json` (GO1, GO2, GO3) y escribe un `update` por saga; `tools/db/build.py` mete en el catálogo las originales de cualquier saga.
3. El frontend (`src/data/catalog.ts`) usa el TP por saga (`sagaTp`) solo en las cartas de esa saga. El `balance_tp` global no se toca.

## 7. Pendiente

- Espíritus guerreros, armaduras, Mixi Max y tótems.
- Decidir si las cartas de GO3 deben usar el TP de GO2 para las originales de GO2 que llevan; ahora usan el global.

## 8. Fuentes

- Fichas de la wiki inglesa (infobox, Info de anime y películas, Trivia), consultadas el 2026-10-21.
- `Module:WazaData` (caché `tools/.cache/db/WazaData.lua`) para costes y potencias por juego.
- `build/players.json` para el TP global actual.
