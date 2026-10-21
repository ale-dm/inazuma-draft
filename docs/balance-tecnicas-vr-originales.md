# Técnicas originales de Victory Road — TP

> **Estado:** aplicado en `data/technique_balance.json` y `supabase/technique_balance.sql` (2026-10-21). Falta cargarlo en Supabase.
> **Alcance:** solo técnicas **normales** que se estrenan en Victory Road. Fuera, para más adelante: espíritus guerreros, Mixi Max y tótems.
> **Dónde va el TP:** en el `balance_tp` global, como Ares y Orion. Las 49 solo las llevan cartas de VR (o ninguna), así que no cambian ninguna otra saga y el mod las lee igual.

## 1. Qué entra

- **Originales de VR**: las supertécnicas con código interno `wh?1xxxx` en los datos del juego (`data/azalee/skills.json`); los códigos más bajos son técnicas que ya existían. Fuera las básicas (`rh*`: Power Shot, Dust Kick…).
- **49 aplicadas**: las 43 que llevan cartas de la app y 6 sin carta que se añaden al catálogo desde `data/technique_vr_extra.json` (Deflectores divinos, Kraken Seaquake, Gota de la quietud, Mano celestial EV, Parada celestial TURBO y Mano matriarcal). La lista sale de la categoría *Victory Road hissatsu* de la wiki (debut en VR).
- **Fuera**:
  - Espíritu guerrero: Fortress of Despair, Dazzling Carnival, Shadow Empress, Meteoric Fire Tornado V y Luminous Impact.
  - Técnicas antiguas con código nuevo de VR: Inazuma Break y Fireball Storm.
  - Variantes internas: Icy Grace (otra copia), Swirly Shot de Mixi Max, Fireball Storm (otra copia) y la de Cosmic Blaster de Orion.

## 2. Criterio

Victory Road no tiene anime y las fichas de la wiki son casi todas esbozos, así que el lore sale de **quién usa la técnica y en qué punto de la historia está su equipo** (la curva de rivales del repo, `team_tuning.VR`):

1. **Rival de la final y equipos de después**: el Raimon de Harper Evans (Endou Haru), Royal Academy… arriba.
2. **Protagonistas (Nagumohara / South Cirrus)**: las firmas de los titulares (Sakurazaki, Raika, Shisendou, Kodoukai) por encima de las de secundarios; si salen en el manga, un poco más.
3. **Rivales de la historia**: según su orden (West Manor 4.º, Northbright 6.º, Eastwind 9.º, Stormridge 13.º…).
4. **Potencia de VR** (50 / 60 / 70 / 85 / 100) para colocar dentro de cada grupo.

Techos: tiros 180, regates 130, bloqueos 140, paradas 160.

## 3. Tiros (14)

| TP | Técnica | EN | ID | Jug. | VR | Antes | Por qué |
|---:|---|---|---|---:|---:|---:|---|
| **180** | Tornado de fuego meteoro | Meteoric Fire Tornado | `vr_whs10110` | 1 | 85 | 180 | Ace de Harper Evans (Endou Haru), el mejor jugador del juego y el rival de la final con Raimon; evolución definitiva del Tornado de fuego, con animación propia al marcar. VR 85. |
| **170** | Trueno de primavera | Spring Thunderclap | `vr_whs10010` | 2 | 100 | 140 | Combinada de los protagonistas (Raika y Sakurazaki, Nagumohara): iba a dar nombre a la canción del juego; sale en el manga (cap. 9). VR 100. |
| **140** | Desfile de pingüinos | Royal Penguin Parade | `vr_whs10100` | 1 | 85 | 110 | Royal Academy (Senjutsu no Teikoku), equipo de después de la final. VR 85. |
| **130** | Remate Bahamut | Bahamut Crash | `vr_whs10120` | 1 | 70 | 120 | Tiro del Raimon de la final (Haru, Tsukikage, Arashi…). VR 70. |
| **110** | Destello de fuerza | Force Flash | `vr_whs10040` | 1 | 60 | 90 | Sakurazaki, delantero protagonista; abre el manga (cap. 1). VR 60. |
| **110** | Tiro tramposo | Cheat Blaster | `vr_whs10060` | 1 | 70 | 80 | Eastwind (Toufuu Ikokukan), 9.º rival de la historia. VR 70. |
| **100** | Trueno celestial | Heavenly Thunder | `vr_whs10130` | 1 | 60 | 70 | Yagyuu (Nagumohara); sale en el manga (cap. 14). VR 60. |
| **100** | Espada solar | Sunshine Splitter | `vr_whs10020` | 1 | 60 | 80 | Soramiya Sei, capitán de Northbright (6.º rival); también Nikas en versión héroe. VR 60. |
| **90** | Tiro rotatorio | Swirly Shot | `vr_whs10050` | 1 | 50 | 70 | Raika (protagonista); básica del principio, 70 con Mixi Max. VR 50. |
| **90** | Impulso de resolución | Solution Boost | `vr_whs10140` | 1 | 60 | 70 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Marlín volador | Flying Marlin | `vr_whs10150` | 1 | 60 | 70 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Aullido de lobo argénteo | Legendary Silver Wolf | `vr_whs10170` | 1 | 60 | 80 | Jugador secundario de Nagumohara. VR 60. |
| **80** | Unificar | Unify | `vr_whs10030` | 1 | 50 | 50 | La técnica de nivel 1 de Haru: firma del mejor jugador, pero potencia baja. VR 50. |
| **70** | Tiro de francotirador | Sniper Shot | `vr_whs10080` | 1 | 50 | 60 | Seagull FC y West Manor, rivales 2.º y 4.º. VR 50. |

## 4. Regates (13)

| TP | Técnica | EN | ID | Jug. | VR | Antes | Por qué |
|---:|---|---|---|---:|---:|---:|---|
| **130** | Marshal's Light | Marshal's Light | `vr_who10080` | 1 | 85 | 100 | Royal Academy, después de la final. VR 85. |
| **120** | Mirada asesina | Ghoulish Glare | `vr_who10070` | 1 | 70 | 100 | Stormridge (Keizen Arashiyama), 13.º rival, el último antes de la final; también Govin en versión héroe. VR 70. |
| **100** | Niagara Falls | Niagara Falls | `vr_who10060` | 1 | 60 | 90 | Eastwind (9.º); sale en el manga (cap. 12). VR 60. |
| **100** | Contragolpe de halcón | Falcon Counter | `vr_who10120` | 1 | 60 | 110 | Koteuchi Nanami (Nagumohara). VR 60. |
| **100** | Ritmo eléctrico | Amp Beat | `vr_who10170` | 1 | 60 | 110 | Hoshi Mikana (Nagumohara); sale en el manga (cap. 15). VR 60. |
| **90** | Visión de matriz | Matrix Eye | `vr_who10110` | 1 | 60 | 90 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Brisa de la cúspide | Peaky Breezy | `vr_who10100` | 1 | 60 | 90 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Círculo elegante | Frost Finesse | `vr_who10130` | 1 | 60 | 90 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Aro hula hoop | Hoopsie-Loop | `vr_who10140` | 1 | 60 | 90 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Regate fantasmal | Phantasm Dribble | `vr_who10150` | 1 | 60 | 80 | Nagumohara; sale en el manga (cap. 9). VR 60. |
| **90** | ¡Hala! ¡Una bola de arroz! | Look! A Rice Ball | `vr_who10160` | 1 | 60 | 90 | Nagumohara; técnica de broma, como ¡Mirad, un platillo volante! VR 60. |
| **80** | Grand Glow | Grand Glow | `vr_who10050` | 1 | 50 | 90 | Northbright (6.º rival). VR 50. |
| **70** | Endeavor Rush | Endeavor Rush | `vr_who10040` | 1 | 50 | 80 | West Manor (4.º rival). VR 50. |

## 5. Bloqueos (10)

| TP | Técnica | EN | ID | Jug. | VR | Antes | Por qué |
|---:|---|---|---|---:|---:|---:|---|
| **140** | El fuerte | The Stronghold | `vr_whd10060` | 3 | 85 | 140 | Combinada de 3 de Royal Academy, después de la final. VR 85. |
| **120** | Kraken Seaquake | Kraken Seaquake | `vr_whd10080` | 1 | 70 | — | Kodoukai Kameo (Nagumohara), defensa titular: su mejor bloqueo. Sin carta. VR 70. |
| **110** | Tortuga danzarina | Twirling Turtle | `vr_whd10010` | 1 | 60 | 110 | Kodoukai Kameo (Nagumohara), uno de los defensas titulares. VR 60. |
| **100** | Niebla sombría | Dark Mist | `vr_whd10120` | 1 | 60 | 110 | Kurohara Remon (Nagumohara). VR 60. |
| **100** | Deep Diver | Deep Diver | `vr_whd10040` | 1 | 60 | 90 | Eastwind (9.º rival). VR 60. |
| **100** | Robo teatral | Dramatic Swipe | `vr_whd10130` | 1 | 60 | 90 | Nagumohara; sale en el manga (cap. 12). VR 60. |
| **90** | Maza metálica | Metal Hammer | `vr_whd10110` | 1 | 60 | 80 | Nagumohara; sale en el manga (cap. 12). VR 60. |
| **90** | Toro a la fuga | Runaway Bull | `vr_whd10100` | 1 | 60 | 90 | Jugador secundario de Nagumohara. VR 60. |
| **90** | Pisotón vigoroso | Vigorous Stomp | `vr_whd10090` | 1 | 60 | 80 | Jugador secundario de Nagumohara. VR 60. |
| **80** | Fórmula matemática | Foil Formula | `TheMatrix` | 1 | 50 | 80 | Técnica de muchos equipos de mitad de historia (AI Academy, Northbright, Lawcrest). VR 50. |

## 6. Paradas (12)

| TP | Técnica | EN | ID | Jug. | VR | Antes | Por qué |
|---:|---|---|---|---:|---:|---:|---|
| **160** | Abrazo divino | Sacred Embrace | `vr_whk10080` | 1 | 100 | 150 | Portero del Raimon de la final; la mayor potencia de VR (100). |
| **160** | Parada celestial TURBO | God Catch FT | `vr_GodCatchFT` | 1 | 100 | — | Endou: la God Catch G5 llevada al máximo; para el Gladius Arch 真 de Toramaru en el último episodio. Sin carta. VR 100. |
| **150** | Deflectores divinos | Divine Deflectors | `vr_whk10090` | 1 | 100 | — | Shisendou, portero protagonista (Nagumohara): su mejor parada (rama nueva, nv 30). Sin carta. VR 100. |
| **140** | Mano celestial del tigre | Tiger God Hand | `vr_whk10070` | 1 | 85 | 120 | Portero del Raimon de la final; heredera de la Mano celestial. VR 85. |
| **140** | Royal Shield | Royal Shield | `vr_whk10060` | 1 | 85 | 110 | Portero de Royal Academy, después de la final. VR 85. |
| **140** | Mano celestial EV | God Hand EV | `vr_GodHandEV` | 1 | 85 | — | Endou: evolución de la Mano celestial; para el Fénix oscuro y el Fire Tornado 改. Sin carta. VR 80. |
| **110** | Gracia glacial | Icy Grace | `vr_whk10010` | 1 | 60 | 110 | Shisendou, portero protagonista (Nagumohara); sale en el manga (cap. 7). VR 60. |
| **110** | Extramundo | Cyber Realm | `vr_whk10020` | 1 | 70 | 90 | Portero de Eastwind (9.º rival); sale en el manga (cap. 13). VR 70. |
| **110** | Mano matriarcal | Mama's Helping Hand | `vr_OkanTheHand` | 1 | 85 | — | Técnica de broma, ganadora de un concurso de CoroCoro (se consigue con contraseña). Sin carta. VR 80. |
| **100** | Pincelada silenciosa | Silent Inkstroke | `vr_whk10050` | 1 | 60 | 80 | Portero de Stormridge (13.º rival). VR 60. |
| **90** | Duna gravitacional | Gravity Dune | `vr_whk10040` | 1 | 60 | 90 | Portero de Northbright (6.º rival); en la película Haru le marca antes de que la saque. VR 60. |
| **70** | Gota de la quietud | Stillness Drip | `vr_whk10030` | 1 | 50 | — | Konomachi (Nishinomiya), equipo menor. Sin carta. VR 50. |

## 7. Duplicados que no son de VR

Cinco técnicas del catálogo con id `vr_` son de la serie original y ya existen con su id de la wiki. No se tocan aquí; habría que fusionarlas con la original:

| ID | Técnica | Original |
|---|---|---|
| `vr_whs00920` | Tiro torre de Osaka (Steeple Shot) | IE2, ep. 60 |
| `vr_whs01160` | Cañón de agua (The Tube) | IE3, ep. 99 |
| `vr_whk00280` | Escudo protector (Table-Turner) | IE2, ep. 49 |
| `vr_whk00400` | Muralla de escudos (Safety First) | IE2, ep. 29 |
| `vr_whk00130` | Despeje de leñador (Wood Chopper) | IE1, ep. 18 |

## 8. Fuentes

- `data/azalee/skills.json` (datos del juego: código, potencia, nº de jugadores).
- Wiki inglesa: fichas de técnica (consultadas el 2026-10-21) y `Module:PlayerData/VR` (quién la aprende y su equipo).
- `data/overrides.json` → `team_tuning.VR` (orden de la historia) y `build/players.json` (cartas).
