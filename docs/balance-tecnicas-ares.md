# Técnicas exclusivas de Ares — regates, bloqueos y paradas

> **Estado:** TP del balance de Ares/Orion, ya aplicado al build (2026-10-20). Este documento es el detalle de **Ares**; el marco general está en [balance-tecnicas-ares-orion.md](./balance-tecnicas-ares-orion.md).
> **Nombres:** se usa el **nombre de la app** (`name_es`), que es la traducción antigua. La columna «wiki» es la traducción nueva.
> **Escala:** la de Ares/Orion, 50–200; regates y bloqueos topan en 150 y las paradas en 180.

## 1. Regates (4)

| TP | Técnica (app) | Wiki (nueva) | EN / JP | Debut | Usuarios | VR |
|---:|---|---|---|---|---|---:|
| **100** | Regate divino | Regate divino | Divine Dummy / エンジェルレイ | Ares, ep. 7 | Elior March, Raven Vale, Willow Proude, Cygnus Starkey, Oliver Golightly | 300 |
| **100** | Entrada relampagueante | Entrada Relámpago | Flash Dash / イナビカリ・ダッシュ | Ares, ep. 8 | Sonny Wright, Lus Kasim | 440 |
| **100** | Viento centelleante | Viento centelleante | Sparky Spin / スパークウィンド | Ares, ep. 12 | Maxime Dassier, Trevor Cook, Ari Zimmerman | 540 |
| **90** | Laberinto | Cortocircuito | Short Circuit / ザ・ラビリンス | Ares, ep. 25 | César Montalbán | 540 |

- **Flecha de hielo** (Koori no Ya / 氷の矢) está en la categoría de regate, pero es pase/tiro: en la base es `Shoot`.
- **Entrada relampagueante** y **Laberinto** también se usan como bloqueo (`type2=Block`).

## 2. Bloqueos (8 + 2)

| TP | Técnica (app) | Wiki (nueva) | EN / JP | Debut | Usuarios | VR / SD |
|---:|---|---|---|---|---|---:|
| **120** | Contragolpe doble | Contragolpe Doble | Counter Drive / カウンタードライブ | Ares, ep. 17 | Basile Hardy, Sonny Wright | SD 71 |
| **80** | Frankendefensa | Frankendefensa | Frankenstun / フランケン守タイン | Ares, ep. 4 | Lunk Ironbrow | 300 |
| **90** | Jaula gravitatoria | Jaula gravitatoria | Gravity Cage / グラビティケージ | Ares, ep. 10 | César Montalbán, Kiko Calavento, Nino Nango | 440 |
| **110** | Nudo atrapaosos | Abrazo del Oso | Ursa Binder / 必殺クマゴロシ縛 | Ares, ep. 16 | Aiden Froste | 440 |
| **80** | Cabezazo moái | Cabezazo Rapa Nui | Easter Island Header / もっこり丘のモアイ | Ares, ep. 4 | Hefton Bulk | — |
| **110** | Muro colectivo | Muro para uno | Wall for One / レンサ・ザ・ウォール | Ares, ep. 4 | Sebastian Fortwright, Jack Wallside, Barry Cade, Björn Brocken, Hefton Bulk, Lunk Ironbrow | 120 |
| **100** | Torbellino interceptor | Torbellino interceptor | Twister Trap / シューティングカット | Ares, ep. 8 | Kiko Calavento, Oleander Meadows, Lucian Skye, Reid Rivers, Faith Winter | 300 |
| **100** | Zona de contención | Zona de contención | Containment Field / ゾーン・オブ・ペンタグラム | Ares, ep. 6 | Acker Reese, Jimmy Nigh, Ari Zimmerman, Holt Northam, Caesar Pike | 540 |

- **Contragolpe doble** (`CounterdriveDF`, TP 120) va en Basile y Sonny; la parada *Close Counter* (`CounterdriveGK`) pasa a llamarse **«Rotación inversa»**.
- **Muro colectivo** (`es_muro-colectivo`, TP 110) va en los seis de Rampart. Es la traducción antigua de *Wall for One*.

## 3. Paradas (9)

| TP | Técnica (app) | Wiki (nueva) | EN / JP | Debut | Usuarios | VR |
|---:|---|---|---|---|---|---:|
| **110** | Brazo extensible | Casting Arm | Grabber Arm / キャスティングアーム | Ares, ep. 26 | Duske Grayling | 640 |
| **90** | Craterclismo | Death Crater | Desecrater / デスクレーター | Ares, ep. 15 | Mickey Way | 440 |
| **110** | Megamanos mágicas | Fuujin Raijin | Mega Majin / 風神雷神 | Ares, ep. 23 | Mark Evans | 540 |
| **120** | Colmillo salvaje | High Beast Fang | Savage Beast Fang / ハイビーストファング | Ares, ep. 10 | Joseph King | 440 |
| **110** | Velo de sirena | Mermaid Veil | Mermaid's Veil / マーメイドヴェール | Ares, ep. 17 | Sandra Fischer | 640 |
| **90** | Parada peliaguda | Moja Catch | Fur Trapper / もじゃキャッチ | Ares, ep. 7 | Mickey Way | 360 |
| **90** | Mar de lágrimas | Namida de Nami da | Flood of Feels / 涙で波だ | Ares, manga cap. 7 | Rolland Bowlby | — |
| **110** | Escudo lunar | Ouke no Tate | Lunar Eclipse / 王家の盾 | Ares, ep. 15 | Duske Grayling | 540 |
| **110** | Mano oceánica | Uzumaki The Hand | Maelstrom the Hand / ウズマキ・ザ・ハンド | Ares, ep. 8 | Sandra Fischer | 540 |

- **Sandra Fischer** tenía `Parada remolino` y `Velo de sirena` como técnicas sueltas; ahora son las de VR: `vr_whk01400` (Mano oceánica) y `vr_whk01410` (Velo de sirena).
- **Mar de lágrimas** (`es_mar-de-lagrimas`, TP 90) es del manga de Ares y solo la usa Rolland Bowlby.

## 4. Nombres corregidos (osos)

| Técnica | Id | Tipo | Nombre en la app |
|---|---|---|---|
| Remate cazaosos | `vr_whs02920` | Shoot | Remate cazaosos |
| Nudo atrapaosos | `vr_whd01540` | Block | Nudo atrapaosos |
| Rotación inversa | `CounterdriveGK` | Catch | Rotación inversa |

- El **tiro** es **Remate cazaosos** y conserva el TP 110/120–720 que tenía el «Nudo».
- El **bloqueo** es **Nudo atrapaosos** (`Ursa Binder`) y va en la carta de Aiden.
- En el seed se borra el duplicado viejo `es_remate-cazaosos` con `delete from public.techniques ...` y `card_techniques` cascadea.

## 5. Pendiente

- Los valores están aplicados en `data/technique_balance.json`, `build/`, `supabase/seed.sql` y `supabase/technique_balance.sql`.
- `balance_tp` sigue siendo único y también lo usan las cartas de VR; cuando el TP esté separado por saga, se moverán a su campo.
- El marco de Ares/Orion y las exclusivas de Orion están en [balance-tecnicas-ares-orion.md](./balance-tecnicas-ares-orion.md).
