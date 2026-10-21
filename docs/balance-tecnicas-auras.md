# Espíritus guerreros, armaduras, tótems y Mixi Max — puntos de aura

> **Estado:** aplicado (2026-10-21) en `data/technique_balance.json` (TP de sus técnicas), `data/aura_points.json`, `tools/db/build.py` (reservas por carta) y el Fatal Sim (`src/lib/tension.ts`, `SimMatch.tsx`).
> **Modelo:** el de **Aura Points** del mod Character Reforged de Victory Road (`mods/CharacterReforged/modules/AuraPoints`): estas técnicas **no gastan tensión**, sino una reserva propia del especial para todo el partido.

## 1. Cómo funciona (Aura Points)

| Especial | Reserva (por carta y partido) | Su técnica cuesta | Se acaba |
|---|---|---|---|
| **Espíritu guerrero** | **PEG** = KP de Galaxy a nivel 6 (`Module:KeshinData`) | su coste de Galaxy en PEG (sin tensión); invocar es gratis | PEG a 0: se retira el resto del partido |
| **Armadura** | la del keshin | las supertécnicas de ese turno son gratis; la del keshin no va con armadura | gasta (KP + ATK) × 0,025 × 0,75 PEG por segundo (10 s por turno en el Sim); la primera del partido recupera un 30 % |
| **Tótem** | **SP** = su SP al nivel máximo (`Module:SoulData`) | su coste en SP | SP a 0 |
| **Mixi Max** | **PE** (aguante): 100 en el Sim | +3 por turno, 25 PE | PE a 0 |

- Como en el mod, **siempre la escala de Galaxy** (KP y costes); la de Chrono Stone no cuadra (Corogaon tiene KP 10). Si falta Galaxy, Chrono Stone y luego GO.
- Los espíritus guerreros propios de VR (Victory, Victoria, Clara Bunny, Warborg, Entertainer) no tienen KP en la wiki: salen de la tabla del mod (`data/aura_points.json`).
- Los valores coinciden con la tabla del mod (`content/match_resources/peg.toml` / `sp.toml`): Atenea 250/90, Surtur 210/90, Lancelot 200/70, Pegaso Arc 200/90.
- Con reserva y coste, la técnica se puede usar **de 1 a 7 veces** por partido (mediana 4).
- Cada especial de carta (`specials` en `cards`) lleva `key`, `hyper_id`, `points`, `cost` y `atk`. El rival juega con las mismas reglas.

## 2. TP de las técnicas (nivel de potencia)

El coste lo pone la reserva; el **TP** solo mide la potencia (suma como una supertécnica: TP/40). Van **por encima de las normales de su saga** y la escala sube hasta **250** (potencia 210: 290–1130 … 250: 370–1330). Colocadas por lore de la wiki inglesa, como las normales.

| Grupo | Tiros | Regates | Bloqueos | Paradas |
|---|---:|---:|---:|---:|
| Espíritu guerrero GO1 | 210 | 160 | 140 | 200 |
| Espíritu guerrero GO2 | 230 | 170 | 170 | 210 |
| Espíritu guerrero VR | 230 | 170 | 170 | — |
| Tótem GO3 | 220 | 170 | 160 | 200 |

### Espíritu guerrero · GO1 (32)

| TP | Técnica | Tipo | ID | Especial | Reserva / coste | Por qué |
|---:|---|---|---|---|---|---|
| **210** | Aliento blanco | Tiro | `WhiteBreath` | Dragón Heráldico, Guiverno blanco | 220/90 | Hakuryuu (Shining Dragon): en la película rompe la Barrera de Gaia y supera la defensa triple con keshin. |
| **210** | Caliburn | Tiro | `SwordExcalibur` | — | — | Arthur, keshin de fusión de Hakuryuu y Shuu: en la película supera a todo Raimon y marca el quinto gol de Zero. Sin carta. |
| **210** | Flamberge | Tiro | `SwordOfFire` | — | — | Gryphon, keshin de fusión de Tenma, Shindou y Tsurugi: rompe a Arthur y a Hebino y marca el quinto gol de Raimon. Sin carta. |
| **200** | Hacha del Azote negro | Tiro | `MaouNoOno` | Señor oscuro, Azote negro | 220/90 | Shuu (Dark Exodus): devuelve el Shoot Command 06 y marca a Sangoku en la película. |
| **200** | Golpe justiciero | Tiro | `JusticeWing` | Alado Archipegaso | 200/90 | Tenma (Pegasus Arc): marca a Zero en la película; Beta la para con el cuerpo. |
| **190** | Desolación eterna | Tiro | `SoulBringer` | Caballero misterioso, Pendragón | 180/90 | Pendragon; potencia 200 en GO, de las más altas. |
| **190** | Jaque mate | Tiro | `Checkmate` | Encantadora real, Reina blanca, Encantadora real, Reina negr | 160/80, 210/80 | Reina negra / blanca; potencia 200 en GO. |
| **190** | Tormenta de fuego | Tiro | `BakunetsuStorm_K` | Gigante de fuego, Surtur | 210/90 | Surtr (Gouenji / Ishido): la Tormenta de fuego en versión espíritu guerrero. |
| **180** | Estocada de Lancelot | Tiro | `LostAngel` | Caballero Lancelot | 200/70 | Tsurugi (Lancelot): 5 goles; rompe el Escudo guardián y la Presa titánica. |
| **180** | Llamarada solar | Tiro | `SunshineForce` | Apolo, dios del sol | 180/70 | Taiyou (Apolo): rompe la Barrera de Gaia; la para la Mano mágica. |
| **170** | Estocada samurai | Tiro | `BushinRenzan` | Bravo samurái Musashi | 180/70 | Nishiki (Musashi): 4 goles, rompe el Escudo guardián y el Rompetiros. |
| **170** | Lanza de carámbanos | Tiro | `IcicleRoad` | Chione, reina de la nieve, Hakugin no Joou Gerda | 140/70, 170/70 | Yukimura: marca a Sangoku; la desvía Tenma con Pegaso. |
| **170** | Movimientos armónicos | Tiro | `Harmonics` | Director Magister | 280/70 | Shindou (Maestro): 4 goles, entre ellos el de la victoria contra Tengawara. |
| **160** | Torpedo tridente | Tiro | `HeavyAquaLance` | Neptuno, señor de los mares, Rey de los mares, Poseidón | 150/50, 210/50 | Neptuno / Poseidón: la paran Titanius y la Mano celestial X. |
| **160** | Carga al galope | Tiro | `GallopBuster` | Caballo blanco, Caballo negro | 200/50, 250/50 | Caballero negro / blanco: rompe la Barrera de Gaia. |
| **160** | Asalto aéreo | Tiro | `RagingClaw` | Aoki Ryuuku, Cuervo alas negras | 140/60, 200/60 | Corvus / Aoki Ryuuku; sin partido destacado. |
| **150** | Alas de halcón | Tiro | `FalcoWing` | Plumas ardientes, Ave de fuego, Sobrenatural halcón de truen | 200/60, 220/60 | Hayabusa (Falco): un gol; luego la para Sangoku. |
| **150** | Magician's Box | Tiro | `MagiciansBox` | Doukeshi Phantam, Ilusionista Trickster, Yume Shinshi Dream  | 140/50, 210/50, 250/50 | Purim: rompe la Parada ardiente. |
| **160** | Rayo celeste | Regate | `PegasusBreak` | Pegaso alado | 200/60 | Tenma (Pegaso). |
| **150** | Zarpazo real | Regate | `ScratchRaid` | Adalid leonino, Jmet, Juuou Leon | 180/50, 240/50 | León / Khmet; potencia 180 en GO. |
| **150** | Lazos de oscuridad | Regate | `DancingGhost` | Garas, maestra de ilusiones, Sirena, la hechicera | 170/30, 190/30 | Mahoro: supera a Nishiki y gana el duelo de keshin a Musashi. |
| **150** | Carga hipersónica | Regate | `Overdrive` | Barius supersónico, Hipervelocista Tachión | 160/30, 230/30 | Wanda (Varius): supera a Tenma y Shindou y a Kurumada y Sangoku. |
| **120** | Puño metralleta | Regate | `MachineGunBeat` | Peón blanco, Peón negro | 120/30, 200/30 | Peón negro / blanco: los keshin de serie del Sector Quinto. |
| **140** | Golpe titánico | Bloqueo | `StrongTower` | Centinela vigía, Torre blanca, Centinela vigía, Torre negra | 170/40, 220/40 | Torre negra / blanca; potencia 180 en GO. |
| **140** | Espacio oscuro | Bloqueo | `DarkSpace` | Mensajero divino, Alfil blanco, Mensajero divino, Alfil negr | 160/40, 210/40 | Alfil negro / blanco; potencia 180 en GO. |
| **130** | Lanza tornado | Bloqueo | `DragonStorm` | Kyou Senshi Diavel, Ryuu Kishi Tedis | 160/30, 200/30 | Diavel / Tedis. |
| **200** | Mano mágica | Parada | `MajinTheHand_K` | Protector de la Tierra, Atlas | 180/60 | Shinsuke (Titanius / Atlas): la técnica «más fuerte que la Mano celestial»; muchas paradas. |
| **190** | Corona de fuego | Parada | `KingFire` | Sabio monarca, Rey blanco, Sabio monarca, Rey negro | 180/70, 220/70 | Senguuji (King Burn): para a Pegaso Arc y la Estocada de Lancelot. |
| **180** | Despeje demoníaco | Parada | `HellsFist` | Duque destructor, Demogorgo, Fumetsu no Gokuchou Oculot | 230/60, 240/60 | Demogorgon; potencia 200 en GO. |
| **160** | Presa titánica | Parada | `GiganticBomb` | Gargantúa, gigante metálico, Titán gigante | 160/40, 230/40 | Hyoudou (Gigantes): para el Cascabel; la rompen Pegaso y Lancelot. |
| **160** | Dados de la suerte | Parada | `LuckyDice` | Gran jugador Lot, Kouun no Last Vega, Serendipity, maestro d | 170/40, 190/40, 210/40 | Hakono (Diceman): para los Movimientos armónicos; la rompe Lancelot. |
| **150** | Escudo guardián | Parada | `GuardianShield` | Barron, coloso metálico, Kikai Hei Gareus | 180/40, 240/40 | Gareus / Baron: la rompen Lancelot y Musashi. |

### Espíritu guerrero · GO2 (29)

| TP | Técnica | Tipo | ID | Especial | Reserva / coste | Por qué |
|---:|---|---|---|---|---|---|
| **230** | Asalto mortal | Tiro | `MortalSmash` | Gran señor de los demonios, Evera | 200/90 | Evera, el keshin de SARU (jefe final de Chrono Stone); potencia 200, la más alta. |
| **210** | Fiebre de luna llena | Tiro | `MangetsuRush` | Caballero ultraveloz Robin | 220/90 | Fei (Robin); la para el Géiser gigante. |
| **210** | Golpe de Atenea | Tiro | `AthenaAssault` | Dueña del aire, Atenea, Señora del ingenio, Metis | 200/90, 250/90 | Beta (Atenea): rompe la defensa de Musashi y la Repulsión. |
| **200** | Prisión escarlata | Tiro | `RedPrison` | Príncipe del caos, Astaroth, Príncipe del plano astral, Zodí | 100/90, 220/90 | Zodiac / Astaroth (Zanark Domain): marca a Raimon. |
| **200** | Ataque de corazón | Tiro | `HeartRapier_F` | Almas encadenadas, Los enamorados ♂ | 160/50 | Meia (Lovers): rompe el Keeper Command 07. |
| **200** | Ataque de corazón | Tiro | `HeartRapier_M` | Almas encadenadas, Los enamorados ♂ | 160/50 | Giris (Lovers): pareja de la anterior. |
| **200** | Vuelo de fénix | Tiro | `HououRekka` | Cazador de gloria, Asura, Tenkuu no Shihaisha Houou | 180/70, 210/70 | Alpha (Houou) / Asura. |
| **180** | Tiro sombrío | Tiro | `ShadowLeg` | Guerrero artificial Sombra de plasma DE, Jinkou Keshin Plasm | 128/32 | Androides de Perfect Cascade (Plasma Shadow): marca. |
| **170** | Garras llameantes | Regate | `BurningEdge` | Can infernal, Huargo | 180/60 | Dire Wolf; potencia 200 en CS. |
| **170** | Rayo demoníaco | Regate | `DemonsBolt` | Byakuya no Senkou Raimeiza | 180/60 | Raimeiza; potencia 200 en CS. |
| **170** | La tempestad | Regate | `Tempest` | Dragón enjoyado Cychr, Guerrero del este, Qinglong | 200/50 | Seiryuu / Cychr, guerrero del este. |
| **170** | Relámpago bestial | Regate | `ShippuuJinrai` | Guerrero del oeste, Baihu, Lobo maldito Licaón | 200/40, 220/40 | Lycaon / Byakko, guerrero del oeste. |
| **160** | Hoz de remolino | Regate | `TsumujiNoYaiba` | Garras de hoz Comadreja | 220/40 | Taian (Kamaitachi): supera a Shindou y gana el duelo de keshin a Maestro. |
| **150** | Espada sombría | Regate | `ShadowSword` | Jinkou Keshin Plasma Shadow OF | 128/32 | Androides de Perfect Cascade (Plasma Shadow). |
| **170** | Sentencia final | Bloqueo | `BloodyEncore` | Juez supremo | 200/60 | Judge; potencia 300 en Galaxy. |
| **170** | Espinas insidiosas | Bloqueo | `MysticThorn` | Bruja de la discordia Eris | 170/60 | Eris; potencia 200 en CS. |
| **170** | Escudo caparazón | Bloqueo | `SeikenKikkouha` | Guerrero del norte Xuan-Wu, Señor de las tormentas, Raiden | 130/50, 170/50 | Genbu / Raiden, guerrero del norte; potencia 200 en CS. |
| **160** | Lanza de cazador | Bloqueo | `HuntingLance` | Guerrero prehistórico Jaguar | 190/50 | Torb (Jagwarrior): le roba a Dai. |
| **160** | Flecha del alba | Bloqueo | `KourinNoYa` | Guerrera del amanecer Amaterasu | 190/60 | Kinako (Amaterasu): le roba a Fani. |
| **160** | Ráfaga de tiros | Bloqueo | `HakaiDanmaku` | Tirador sombrío | 180/40 | Trigger; potencia 200. |
| **160** | Estandarte de valquiria | Bloqueo | `ValkyrieFlag` | Valquiria abanderada Brunilda | 140/50 | Kirino (Brünhilde). |
| **150** | Danza de plumas | Bloqueo | `TenkuuNoMai` | Guerrera del sur, Zhuque, Serpiente emplumada, Kukulkán | 120/40, 130/40 | Suzaku, guerrero del sur. |
| **150** | Guardia sombría | Bloqueo | `ShadowGuard` | Jinkou Keshin Plasma Shadow DF | 128/32 | Androides de Perfect Cascade (Plasma Shadow). |
| **210** | Géiser gigante | Parada | `GigabiteScrew` | Dragón despiadado, Vritrá, Shinen no Agillaus | 220/60, 240/60 | Fadam (Agillaus): para a Lancelot y Musashi con armadura y la Fiebre de luna llena. |
| **210** | Mano grandiosa | Parada | `GreatTheHand` | Mágico gigante, Grandius | 220/70 | Endou (Majin Great): para el Shoot Command 01; en la película frena el poder de Fran con Legend Japan. |
| **190** | Defensa de muñecos | Parada | `ShikigamiLines` | Colablanca explosiva, Amorosa | 200/50 | Chet (Tamazusa): para a Rei con armadura; la rompe Soy todopoderoso. |
| **190** | Cúpula carmesí | Parada | `CrimsonSphere` | Ryuujin Corogaon | 290/50 | Corogaon; potencia 200 en CS. |
| **180** | Descarga de colores | Parada | `HisshouGamusharan` | Eichi no Ou Bungu Oh | 200/50 | ENDOU (Bunguoh): desvía a duras penas la combinada de los Lovers. |
| **170** | Mano sombría | Parada | `ShadowHand` | Guerrero artificial Sombra de plasma PA, Jinkou Keshin Plasm | 128/32 | Androides de Perfect Cascade (Plasma Shadow). |

### Espíritu guerrero · VR (5)

| TP | Técnica | Tipo | ID | Especial | Reserva / coste | Por qué |
|---:|---|---|---|---|---|---|
| **230** | Meteoric Fire Tornado V | Tiro | `MeteoddFireTornadoV` | Niké, Mágico gigante | 240/90 | Harper Evans (Majin Victory), el mejor jugador del juego: la evolución máxima del Tornado de fuego. |
| **220** | Impacto luminoso | Tiro | `LuminousImpact` | Victoria, diosa del triunfo | 230/90 | Victorio (diosa Victoria). |
| **210** | Emperatriz oscura | Tiro | `EmpressShadow` | Conejo de cristal, lanza sagrada | 200/70 | Clara Bunny. |
| **170** | Carnaval centelleante | Regate | `SunriseCarnival` | Animador | 220/50 | Entertainer (Kisoji). |
| **170** | Fortaleza desesperada | Bloqueo | `DespairFortress` | Warborg, muralla titánica | 220/50 | Warborg (Govin Castlehoven). |

### Tótem · GO3 (43)

| TP | Técnica | Tipo | ID | Especial | Reserva / coste | Por qué |
|---:|---|---|---|---|---|---|
| **220** | Ixaal Cannon | Tiro | `IxaalCannon` | Ixaal | 250/50 | Ozrock, rival final: rompe la defensa combinada con tótems y la Presión de mamut. |
| **210** | Ookami Strike | Tiro | `OokamiStrike` | Lobo | 230/50 | Tsurugi (Lobo): rompe el Acorde difuso; lo para Gigiras. |
| **200** | Lion Assault | Tiro | `LionAssault` | León | 250/50 | Zanakurou (León): 3 goles, entre ellos el de la victoria contra Sazanaara. |
| **200** | Hayabusa Glide | Tiro | `HayabusaGlide` | Hayabusa | 200/50 | Matatagi (Halcón): 6 goles, rompe el Aliento del mar dos veces. |
| **190** | Dorouga Assault | Tiro | `DorougaAssault` | Dorouga | 200/50 | Rodan (Dorouga): marca a Ibuki. |
| **180** | Belion Whip | Tiro | `BelionWhip` | Hiena negra | 230/50 | Gandares: rompe a Tetsukado con Búfalo; la desvía el Acorde difuso. |
| **180** | Pelion Whip | Tiro | `PelionWhip` | Hiena blanca | 230/50 | Ryugel: rompe a Konoha con Zorro; la para Shinsuke. |
| **180** | Dragnova Strike | Tiro | `DragnovaStrike` | Dragnova | 230/50 | Dragnova; potencia 300. |
| **180** | Goliger Assault | Tiro | `GoligerAssault` | Ligre | 230/50 | Goliger; potencia 300. |
| **180** | Gooma Inferno | Tiro | `GoomaInferno` | Lagarto rojo | 250/50 | Gooma; potencia 300. |
| **170** | Begiran Whip | Tiro | `BegiranWhip` | Escorpión Oscuro | 200/50 | Loge: la desvía el Acorde difuso. |
| **170** | Vairaas Cannon | Tiro | `VairaasCannon` | Vairas | 200/50 | Vairaas; potencia 300. |
| **170** | Pegasus Brave | Regate | `PegasusBrave` | Pegaso | 250/70 | Tenma (Pegaso, evolución de Caballo) en la final contra Ixal Fleet. |
| **160** | Gussphee Bomb | Regate | `GusspheeBomb` | Gussphee | 220/50 | Stag y Junior: superan a Tsurugi y a Phobos. |
| **160** | Kujaku Blind | Regate | `KujakuBlind` | Pavo Real | 220/50 | Shindou (Pavo real): gana el choque a Gouryuu. |
| **160** | Redio Cabriole | Regate | `RedioCabriole` | Antílope oscuro | 270/50 | Ishigashi (Ixal Fleet). |
| **150** | Dohma Driller | Regate | `DohmaDriller` | Dohma | 250/50 | Kazerma: supera a Minaho y a Tenma. |
| **150** | Univolt Sprint | Regate | `UnivoltSprint` | Unicornio | 270/50 | Univolt; combinada. |
| **150** | Brachias Blind | Regate | `BrachiasBlind` | Brachias | 250/50 | Brachias. |
| **150** | Gryphbang Press | Regate | `GryphbangPress` | Gryphbang | 250/50 | Gryphbang. |
| **140** | Pamerio Cabriole | Regate | `PamerioCabriole` | Pamerio | 250/50 | Pamerio. |
| **140** | Zooma Driller | Regate | `ZoomaDriller` | Zooma | 270/50 | Zooma. |
| **160** | Buffalo Crusher | Bloqueo | `BuffaloCrusher` | Búfalo | 220/40 | Tetsukado (Búfalo): le roba a Rodan. |
| **160** | Fox Mirage | Bloqueo | `FoxMirage` | Zorro | 270/40 | Konoha (Zorro): 4 robos. |
| **160** | Gandran Crusher | Bloqueo | `GandranCrusher` | Gandran | 250/40 | Varga (Faram Dite): le roba a Sakura. |
| **150** | Ratel Claw | Bloqueo | `RatelClaw` | Tejón | 220/40 | Manabe (Ratel): le roba a Stag. |
| **150** | Fukurou Steal | Bloqueo | `FukurouSteal` | Búho | 270/40 | Minaho (Búho): le roba a Hilary. |
| **140** | Clupe Claw | Bloqueo | `ClupeClaw` | Clupe | 250/40 | Clupe. |
| **140** | Dandorl Crusher | Bloqueo | `DandorlCrusher` | Dandorl | 220/40 | Dandorl. |
| **140** | Dolphanus Splash | Bloqueo | `DolphanusSplash` | Dolfinus | 270/40 | Dolphanus. |
| **140** | Flamey Mirage | Bloqueo | `FlameyMirage` | Zorro rojo | 250/40 | Flamey. |
| **140** | Garyuu Bounce | Bloqueo | `GaryuuBounce` | Garyu | 220/40 | Garyuu. |
| **140** | Gyorom Claw | Bloqueo | `GyoromClaw` | Salamandra | 270/40 | Gyorom. |
| **140** | Jinryuu Bounce | Bloqueo | `JinryuuBounce` | Pangolín verde | 250/40 | Jinryuu. |
| **200** | Gigiras Shield | Parada | `GigirasShield` | Calamar oscuro | 230/40 | Phobos, portero de Ixal Fleet: para el Ookami Strike y desvía el Grito del Edén. |
| **200** | Gouryuu Swing | Parada | `GouryuuSwing` | Gorius | 200/40 | Alvega (Gouryuu): desvía el Ixaal Cannon. |
| **180** | Mammoth Pressure | Parada | `MammothPressure` | Mamut | 230/40 | Ibuki (Mamut): para la Roca volcánica; la rompe el Ixaal Cannon. |
| **170** | Angydra Combo | Parada | `AngydraCombo` | Angydra | 250/40 | Angydra. |
| **170** | Delpinus Echo | Parada | `DelpinusEcho` | Delfinus | 250/40 | Delpinus. |
| **170** | Grimron Shield | Parada | `GrimronShield` | Calamar | 250/40 | Grimron. |
| **170** | Magnatas Pressure | Parada | `MagnatasPressure` | Tortuga caimán roja | 250/40 | Magnatas. |
| **170** | Mossphee Burst | Parada | `MosspheeBurst` | Mossphee | 230/40 | Mossphee. |
| **160** | Saranarja Combo | Parada | `SaranarjaCombo` | Hydra azul | 200/40 | Saranarja. |

## 3. Mixi Max

Sus 11 técnicas (las que el jugador obtiene con el aura) son **técnicas normales**: se pagan con tensión y tienen TP de GO2 por lore (`data/technique_balance_go2.json`). Lo que va por puntos es la fusión (PE).

| TP | Técnica | Fusión |
|---:|---|---|
| 180 | Soy todopoderoso | Zanark × Clara Jane |
| 170 | Impulso efímero | Shindou × Oda Nobunaga |
| 170 | Colmillo retorcido | Fei × Big |
| 170 | Romance de los tres reinos | Shinsuke × Liu Bei |
| 160 | Katana crisantemo | Tsurugi × Okita |
| 160 | Tormenta eléctrica | Taiyou × Zhuge Kongming |
| 150 | Espada real | Tenma × Rey Arturo |
| 150 | Ilusión deslumbrante | Kinako × Master Dragon |
| 140 | Corriente negra | Nishiki × Sakamoto |
| 140 | La flamme | Kirino × Juana de Arco |
| 130 | Chut prehistórico | Fei × Tyranno |

## 4. Cambios

- Las 36 de espíritu guerrero que tenían TP de GO1 (`technique_balance_go1.json`) salen de ahí: ahora tienen su TP global de aura.
- Caliburn y Flamberge (keshin de fusión de la película de GO1, sin carta) se mantienen en el catálogo (`aura_points.json → tecnicas_sin_carta`).
- El Fatal Sim deja la «hiperenergía» (200 de tensión, una vez por partido) y usa los puntos de aura.

## 5. Fuentes

- Mod Character Reforged › Aura Points (`config.toml`, `peg.toml`, `sp.toml`) y Aura Reworked (tótems, Mixi Max), leídos en la instalación local.
- `Module:KeshinData`, `Module:SoulData`, `Module:WazaData` (caché `tools/.cache/db`) y fichas de la wiki inglesa (2026-10-21).
