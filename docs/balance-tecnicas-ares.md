# Técnicas exclusivas de Ares — regates, bloqueos y paradas

> **Estado:** TP aplicado a `data/technique_balance.json`, al build y a `supabase/technique_balance.sql` (2026-10-20).
> **Fuente:** wiki inglesa, `Category:Ares hissatsu` ∩ `Category:Dribble hissatsu` / `Category:Block hissatsu` / `Category:Catch hissatsu`; tipo y debut de la ficha; usuarios de `PlayerData/AT` y de las cartas de Ares.
> **Nombres:** se usa el **nombre de la app** (`name_es` de `build/players.json`, `es_techniques.json` y `overrides.tech_es_fix` / `tech_id_es`), que es la traducción antigua. La columna «wiki» es la traducción nueva, solo como referencia.
> **Escala:** la de Ares, **50–200**; regates y bloqueos topan en **150** y las paradas en **180**, igual que en IE123.

## 1. Regates (4)

| TP nuevo | Técnica (app) | Wiki (nueva) | EN / JP | Debut | Usuarios | VR | TP antes |
|---:|---|---|---|---|---|---:|---:|
| **100** | **Regate divino** | Regate divino | Divine Dummy / エンジェルレイ | Ares, ep. 7 | Elior March, Raven Vale, Willow Proude, Cygnus Starkey, Oliver Golightly | 300 | 100 |
| **120** | **Entrada relampagueante** | Entrada Relámpago | Flash Dash / イナビカリ・ダッシュ | Ares, ep. 8 | Sonny Wright, Lus Kasim | 440 | 100 |
| **130** | **Viento centelleante** | Viento centelleante | Sparky Spin / スパークウィンド | Ares, ep. 12 | Maxime Dassier, Trevor Cook, Ari Zimmerman | 540 | 100 |
| **130** | **Laberinto** | Cortocircuito | Short Circuit / ザ・ラビリンス | Ares, ep. 25 | César Montalbán | 540 | 90 |

- **Flecha de hielo** (Koori no Ya / 氷の矢) aparece en la categoría de regate, pero es un **pase/tiro**: en la base está como `Shoot`. Se queda fuera.
- **Entrada relampagueante** y **Laberinto** también se usan como bloqueo (`type2=Block`); su TP es el mismo en los dos tipos.

## 2. Bloqueos (8)

| TP nuevo | Técnica (app) | Wiki (nueva) | EN / JP | Debut | Usuarios | VR / SD | TP antes |
|---:|---|---|---|---|---|---:|---:|
| **120** | **Contragolpe doble** | Contragolpe Doble | Counter Drive / カウンタードライブ | Ares, ep. 17 | Basile Hardy, Sonny Wright | SD 71 | — |
| **90** | **Frankendefensa** | Frankendefensa | Frankenstun / フランケン守タイン | Ares, ep. 4 | Lunk Ironbrow | 50 | 80 |
| **100** | **Jaula gravitatoria** | Jaula gravitatoria | Gravity Cage / グラビティケージ | Ares, ep. 10 | César Montalbán, Kiko Calavento, Nino Nango | 70 | 90 |
| **110** | **Nudo atrapaosos** | Abrazo del Oso | Ursa Binder / 必殺クマゴロシ縛 | Ares, ep. 16 | Aiden Froste | 70 | — |
| **90** | **Cabezazo moái** | Cabezazo Rapa Nui | Easter Island Header / もっこり丘のモアイ | Ares, ep. 4 | Hefton Bulk | 70 | 80 |
| **130** | **Muro para uno** | Muro para uno | Wall for One / レンサ・ザ・ウォール | Ares, ep. 4 | Sebastian Fortwright, Jack Wallside, Barry Cade, Björn Brocken, Hefton Bulk, Lunk Ironbrow | 110 | — |
| **100** | **Torbellino interceptor** | Torbellino interceptor | Twister Trap / シューティングカット | Ares, ep. 8 | Kiko Calavento, Oleander Meadows, Lucian Skye, Reid Rivers, Faith Winter | 50 | 100 |
| **120** | **Zona de contención** | Zona de contención | Containment Field / ゾーン・オブ・ペンタグラム | Ares, ep. 6 | Acker Reese, Jimmy Nigh, Ari Zimmerman, Holt Northam, Caesar Pike | 80 | 100 |

## 3. Paradas (9)

| TP nuevo | Técnica (app) | Wiki (nueva) | EN / JP | Debut | Usuarios | VR | TP antes |
|---:|---|---|---|---|---|---:|---:|
| **140** | **Brazo extensible** | Casting Arm | Grabber Arm / キャスティングアーム | Ares, ep. 26 | Duske Grayling | 640 | 110 |
| **110** | **Craterclismo** | Death Crater | Desecrater / デスクレーター | Ares, ep. 15 | Mickey Way | 440 | 90 |
| **120** | **Megamanos mágicas** | Fuujin Raijin | Mega Majin / 風神雷神 | Ares, ep. 23 | Mark Evans | 540 | 110 |
| **110** | **Colmillo salvaje** | High Beast Fang | Savage Beast Fang / ハイビーストファング | Ares, ep. 10 | Joseph King | 440 | 120 |
| **140** | **Velo de sirena** | Mermaid Veil | Mermaid's Veil / マーメイドヴェール | Ares, ep. 17 | Sandra Fischer | 640 | 110 |
| **100** | **Parada peliaguda** | Moja Catch | Fur Trapper / もじゃキャッチ | Ares, ep. 7 | Mickey Way | 360 | 90 |
| **90** | **Mar de lágrimas** | Namida de Nami da | Flood of Feels / 涙で波だ | Ares, manga cap. 7 | Rolland Bowlby | 45 | — |
| **120** | **Escudo lunar** | Ouke no Tate | Lunar Eclipse / 王家の盾 | Ares, ep. 15 | Duske Grayling | 540 | 110 |
| **120** | **Mano oceánica** | Uzumaki The Hand | Maelstrom the Hand / ウズマキ・ザ・ハンド | Ares, ep. 8 | Sandra Fischer | 540 | 110 |

- **Sandra Fischer** tenía dos paradas creadas solo con el nombre en castellano: `es_parada-remolino` y `es_velo-de-sirena`. Se sustituyen por `vr_whk01400` (Mano oceánica) y `vr_whk01410` (Velo de sirena), con su potencia de VR.
- **Mar de lágrimas** (`vr_whk01430`) es del manga de Ares y solo la usa Rolland Bowlby; se añade a su carta.
- Las demás paradas ya estaban en la carta de su portero; solo se les ajusta el TP.

## 4. Cruce con los nombres de la app

| Técnica | Id en la app | Nombre en la app | Nota |
|---|---|---|---|
| Regate divino | `vr_who01420` | Regate divino | Coincide |
| Entrada relampagueante | `vr_who01400` | Entrada relampagueante | La wiki nueva dice «Entrada Relámpago» |
| Viento centelleante | `vr_who01410` | Viento centelleante | Coincide |
| Laberinto | `vr_who01470` | Laberinto | La wiki nueva dice «Cortocircuito»; `es_techniques.json` lo cruza mal con King's Lance |
| Contragolpe doble (bloqueo) | `CounterdriveDF` | Contragolpe doble | Nueva; la parada *Close Counter* pasa a «Rotación inversa» |
| Frankendefensa | `vr_whd01510` | Frankendefensa | Coincide |
| Jaula gravitatoria | `vr_whd01470` | Jaula gravitatoria | Coincide |
| Nudo atrapaosos (bloqueo) | `vr_whd01540` | Nudo atrapaosos | Ahora es el bloqueo `Ursa Binder`; antes la app lo usaba para el tiro |
| Remate cazaosos (tiro) | `vr_whs02920` | Remate cazaosos | Es el tiro `Ursa Rager`; conserva el TP 110/120–720 que tenía el «Nudo» |
| Cabezazo moái | `MokkoriOkaNoMoai` | Cabezazo moái | La wiki nueva dice «Cabezazo Rapa Nui» |
| Muro para uno | `vr_whd01530` | Muro para uno | Nueva; va en los seis jugadores de Rampart |
| Torbellino interceptor | `vr_whd01460` | Torbellino interceptor | Coincide |
| Zona de contención | `vr_whd01490` | Zona de contención | Coincide |
| Brazo extensible | `vr_whk01470` | Brazo extensible | Coincide |
| Craterclismo | `vr_whk01450` | Craterclismo | Coincide |
| Megamanos mágicas | `vr_whk01490` | Megamanos mágicas | Coincide |
| Colmillo salvaje | `vr_whk01480` | Colmillo salvaje | Coincide |
| Velo de sirena | `vr_whk01410` | Velo de sirena | Sustituye a `es_velo-de-sirena` |
| Parada peliaguda | `vr_whk01440` | Parada peliaguda | Coincide |
| Mar de lágrimas | `vr_whk01430` | Mar de lágrimas | Nueva; solo Rolland Bowlby |
| Escudo lunar | `vr_whk01460` | Escudo lunar | Coincide |
| Mano oceánica | `vr_whk01400` | Mano oceánica | Sustituye a `es_parada-remolino` |

- **Contragolpe doble** es el **bloqueo** (`CounterdriveDF`, TP 120) y va en Basile Hardy y Sonny Wright. La parada *Close Counter* (`CounterdriveGK`) pasa a llamarse **«Rotación inversa»** para no duplicar el nombre.
- **Nudo atrapaosos** es el **bloqueo** (`Ursa Binder`, `vr_whd01540`, TP 110) y está vinculado a Aiden Froste. El **tiro** es **Remate cazaosos** (`Ursa Rager`, `vr_whs02920`), que conserva el TP 110/120–720 que antes tenía el «Nudo».
- **Muro para uno** es `vr_whd01530` (TP 130) y va en los seis de Rampart: Sebastian Fortwright, Jack Wallside, Barry Cade, Björn Brocken, Hefton Bulk y Lunk Ironbrow.
- **Velo de sirena** y **Mano oceánica** ya no son técnicas sueltas: son las de VR (`vr_whk01410` / `vr_whk01400`) en la carta de Sandra Fischer.

## 5. Criterio del TP

- **90–100:** técnicas de un solo usuario y potencia VR baja (Frankendefensa, Cabezazo moái, Torbellino interceptor, Jaula gravitatoria, Regate divino, Parada peliaguda, Mar de lágrimas).
- **110–120:** firmas de un jugador o combinadas de VR 70–80 (Nudo atrapaosos, Zona de contención, Entrada relampagueante, Contragolpe doble, Craterclismo, Colmillo salvaje, Megamanos mágicas, Escudo lunar, Mano oceánica).
- **130–140:** el techo de Ares (Viento centelleante, Laberinto, Muro para uno, Brazo extensible, Velo de sirena), por debajo del 150–180 de IE123.

## 6. Pendiente

- Los valores ya están aplicados en `data/technique_balance.json`, en el build y en `supabase/technique_balance.sql`. `balance_tp` sigue siendo único y también lo usan las cartas de VR; cuando el TP esté separado por saga, se moverán a su campo.
- Las técnicas que faltaban ya están creadas: `CounterdriveDF` (bloqueo), `vr_whd01530` (Muro para uno) y `vr_whk01430` (Mar de lágrimas).
- El seed lleva una limpieza puntual para el duplicado viejo: `delete from public.techniques where id = 'es_remate-cazaosos'`. El resto sigue siendo solo upserts.
- El cruce de nombres está corregido de forma persistente en `data/overrides.json` (`tech_es_fix`, `tech_defs`, `tech_id_es`, `tech_extra`, `tech_remove`) y `tools/db/build.py`.
