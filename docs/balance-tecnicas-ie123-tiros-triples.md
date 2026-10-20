# Tiros de 3 jugadores (IE123) — propuesta B en múltiplos de 10

> **Estado:** propuesta, sin cambios aplicados (2026-10-19).
> **Base:** 25 tiros con `users = 3` en la wiki y TP de IE3, incluido **Jet Stream**.
> **Marco general:** [balance-tecnicas-ie123.md](./balance-tecnicas-ie123.md)
> **Baseline B pura:** [balance-tecnicas-ie123-tiros.md](./balance-tecnicas-ie123-tiros.md)

> **Corrección:** Jet Stream (TP 80, 3 jugadores) no está en el build porque no aparece en los movesets de PlayerData, pero la wiki sí lo recoge. Se incluye aquí. Con ella, el orden alto queda **Jet Stream > Grand Fire > Big Bang / Chaos Break > Doom Break > The Earth**.

## 1. Criterio

- **Escala B**: cada tipo ocupa el 50–200; en tiros, `tp_ie3` 20–76 → 50–200. Jet Stream (80) se queda en el tope 200.
- **Múltiplos de 10**: 50, 60, 70… 200. En triples se usan los 13 niveles de 80 a 200.
- **Sin jerarquía rígida entre grupos**: un individual puede superar a un doble y viceversa; un triple no está obligado a quedar por encima por tener 3 jugadores. Los rangos de abajo son orientativos.
- **Dentro de cada nivel**: el valor es el múltiplo de 10; el orden interno lo da el lore/potencia. Las colisiones dentro del nivel son inevitables.
- **Lore**: se usa la ficha de la wiki (`users`, `power`, `debut_game` y la sección Info).

### Reparto de rangos (orientativo)

| Grupo | Rango | Tope actual |
|---|---:|---|
| Individuales | 50–160 | Descenso estelar 160 |
| Dobles | 60–180 | Prime Legend 180 |
| Triples | 80–200 | Jet Stream 200 |

No es una jerarquía cerrada. En esta propuesta Jet Stream es 200 por su **TP 80** y por ser el gol que gana el Mundial, no por ser un triple. El mejor individual (160) y el mejor doble (180) pueden cruzarse entre ellos y con los triples según TP/lore.

## 2. Por qué no la B pura

La B pura (20–76 → 50–200) es una línea recta y tiene tres problemas:

1. **No distingue finales en el tramo alto**: Brave Shot (76) y Grand Fire (76) empatan en 200, Jet Stream (80) se sale de escala (211) y los 67 caen a 176. El lore de los finales no se refleja.
2. **Aplasta los tiros de 55**: 52 → 136 y 55 → 144; redondeado a 10, ambos caen en 140 y The Phoenix/Triangle Z/Tri-Pegasus se comen con Inazuma Break/Death Zone/Emperor Penguin No. 2.
3. **Infravalora finales**: The Earth, Neo Galaxy, The Galaxy, Grand Fenrir y Emperor Penguin No. 3 (64) quedan en 170, por debajo de Triple Boost (66) y cerca de los 61.

La propuesta corrige eso con múltiplos de 10 y un mínimo en 80: Jet Stream (80) a 200, Grand Fire (76) a 190, los 67 a 180, los 64 a 150–170, Triple Boost (66) a 140, los 61–62 a 120–150, los 55 a 110, los 52 a 90–100 y Slingshot (49) a 80. Así se usan los 13 niveles de 80 a 200.

### Comparativa de mínimos

| Mínimo | Niveles | Máx. por nivel | Slingshot | Comentario |
|---:|---:|---:|---:|---|
| 130 | 8 | 5 | 130 | Muy apelotonado: 25 triples en 70 puntos. |
| 100 | 11 | 4 | 100 | Mejora, pero aún hay 4 por nivel. |
| **80** | **13** | **3** | **80** | **Recomendado**: usa 80–200 y reparte los 25 sin pasar de 3 por nivel. |
| 60 | 15 | 2–3 | 60 | Máximo reparto, pero varios triples quedan por debajo de los dobles (90). |

Con 80 se usa todo el recorrido y el máximo por nivel es 3. El suelo queda por encima del mínimo real de VR (60), pero por debajo de los dobles (90). Es el punto medio entre «no apelotonar» y «no hacer que un triple barato parezca un individual».

## 3. Los 25 triples

| Técnica | EN | IE3 | IE2 | Potencia IE3 | Debut | VR | B pura | **TP propuesto** |
|---|---|---:|---:|---:|---|---:|---:|---:|
| Tiro a reacción | Jet Stream | 80 | — | 120 | IE3 | 100 | 211* | **200** |
| Fuego total | Grand Fire | 76 | — | 113 | IE3 | 180 | 200 | **190** |
| Big Bang | Big Bang | 67 | — | 120 | IE3 | 200 | 176 | **180** |
| Remate caótico | Chaos Break | 67 | — | 120 | IE3 | 180 | 176 | **180** |
| Mangual letal | Doom Break | 67 | — | 120 | Strikers 2011 | 180 | 176 | **180** |
| La Tierra | The Earth | 64 | 70 | — | IE2 | 180 | 168 | **170** |
| Pingüino emperador n.º 3 | Emperor Penguin No. 3 | 64 | — | 113 | IE3 | 160 | 168 | **160** |
| Gran lobo | Grand Fenrir | 64 | — | 113 | IE3 | 150 | 168 | **160** |
| Fénix oscuro | Dark Phoenix | 61 | 66 | — | IE1 | 150 | 160 | **150** |
| Tiro galáctico | The Galaxy | 64 | 66 | — | IE1 | 120 | 168 | **150** |
| Neo tiro galáctico | Neo Galaxy | 64 | 70 | — | IE2 | 170 | 168 | **150** |
| Remate triple | Triple Boost | 66 | 64 | — | IE2 | 90 | 173 | **140** |
| Pingüino espacial | Space Penguin | 61 | 35 | — | IE2 | 150 | 160 | **140** |
| Supernova | Supernova | 61 | 35 | — | IE2 | 170 | 160 | **140** |
| Triángulo letal 2 | Death Zone 2 | 61 | 64 | — | IE2 | 140 | 160 | **130** |
| Remate de Gaia | Gaia Break | 61 | 31 | — | IE2 | 140 | 160 | **130** |
| Remate del águila | Eagle Buster | 62 | 59 | — | IE2 | 130 | 162 | **120** |
| Supertrampolín relámpago | Inazuma-1 Drop | 61 | 66 | — | IE2 | 90 | 160 | **120** |
| Fénix | The Phoenix | 55 | 62 | — | IE1 | 110 | 144 | **110** |
| Triángulo Z | Triangle Z | 55 | 59 | — | IE1 | 80 | 144 | **110** |
| Tri-Pegaso | Tri-Pegasus | 55 | 62 | — | IE2 | 120 | 144 | **110** |
| Ruptura relámpago | Inazuma Break | 52 | 46 | — | IE1 | 130 | 136 | **100** |
| Triángulo letal | Death Zone | 52 | 59 | — | IE1 | 80 | 136 | **90** |
| Pingüino emperador n.º 2 | Emperor Penguin No. 2 | 52 | 56 | — | IE1 | 120 | 136 | **90** |
| Tirachinas | Slingshot | 49 | — | — | IE3 | 60 | 128 | **80** |

`Potencia IE3` solo se rellena si la ficha da potencia de Inazuma Eleven 3; si no, `—` (la potencia de VR/GO/SD no se mezcla). `VR` es el `balance_tp` actual. `*` Jet Stream (80) se sale de la B pura (20–76): su valor lineal sería 211, por encima del tope 200; se queda en 200.

## 4. Escalera propuesta

| TP | Técnicas |
|---:|---|
| **200** | Jet Stream |
| **190** | Grand Fire |
| **180** | Big Bang, Chaos Break, Doom Break |
| **170** | The Earth |
| **160** | Emperor Penguin No. 3, Grand Fenrir |
| **150** | Dark Phoenix, The Galaxy, Neo Galaxy |
| **140** | Triple Boost, Space Penguin, Supernova |
| **130** | Death Zone 2, Gaia Break |
| **120** | Eagle Buster, Inazuma-1 Drop |
| **110** | The Phoenix, Triangle Z, Tri-Pegasus |
| **100** | Inazuma Break |
| **90** | Death Zone, Emperor Penguin No. 2 |
| **80** | Slingshot |

Se usan los **13 múltiplos de 10** de 80 a 200, sin huecos. Como hay 25 triples para 13 niveles, hay colisiones: el valor no distingue técnicas del mismo nivel; el orden dentro del nivel lo da el lore. El máximo por nivel es 3.

> **Nota:** todos los TP son múltiplos de 10. Las colisiones dentro de cada nivel son inevitables con esta rejilla; si más adelante quieres desempatar, se puede sumar 1–2 puntos por lore, pero entonces se sale de los múltiplos exactos.

### Criterio de orden (ejemplos)

El TP de IE3 fija el bloque; dentro del bloque, el orden es **lore**, no una fórmula automática. Los pesos que estoy usando:

- **Final/ultimate de saga** o técnica que cierra un arco → arriba.
- La wiki la declara **«la más fuerte» de su equipo** → arriba.
- **Equipo fuerte** (Dark Emperors, Genesis, Teikoku, Epsilon) → arriba.
- **Marca en la historia** → arriba.
- Combo que **no marca** o equipo flojo → abajo.
- **TP de IE3** → desempate dentro del bloque.

**Triple Boost vs Eagle Buster:**

| Dato | Triple Boost | Eagle Buster |
|---|---|---|
| TP IE3 | 66 | 62 |
| TP IE2 | 64 | 59 |
| Equipo | Dark Emperors | Oumihara |
| Usuarios | Kurimatsu, Shishido y Kazemaru | Gibo, Shark y Koja |
| Papel en la historia | Combo del equipo oscuro; no marca | Combo de Oumihara; no marca |
| Potencia wiki | Max. 132 (SD) | 60 (VR) |
| Decisión | **140** | **120** |

Triple Boost tiene 4 puntos más de TP y pertenece a un equipo mucho más fuerte (Dark Emperors), así que va 20 puntos por encima. Eagle Buster, aunque tiene 62 de TP, es de Oumihara y la paran varias veces; por eso queda por debajo de Death Zone 2 y Gaia Break (130), que son de Teikoku/Epsilon, y empatado con Inazuma-1 Drop (120), que compensa su -1 de TP marcando en la historia.

La potencia de la wiki en estos dos casos es de SD/VR, no de IE3; se usa solo como contexto, no para ordenar.

Otro ejemplo del mismo criterio: **Triple Boost (66) está por debajo de Dark Phoenix (61, 150)** porque la wiki declara a Dark Phoenix «el tiro más fuerte de Dark Emperors». El TP manda en el bloque, pero el lore puede adelantar una técnica dentro del bloque y en el bloque inmediatamente superior.

Si no compartes ese peso del lore, se puede subir Eagle Buster a 130 y bajar Death Zone 2/Gaia Break a 120, o dejar el orden solo por TP. Dímelo y lo ajusto.

**Top 6 corregido (con Jet Stream):**

| # | Técnica | TP IE3 | Potencia IE3 | Papel |
|---:|---|---:|---:|---|
| 1 | Jet Stream | **80** | 120 | Gol final del Mundial: Endou, Gouenji y Toramaru vs Little Gigant |
| 2 | Grand Fire | **76** | 113 | Combo insignia de Inazuma Japan; varias apariciones y evolución G2 |
| 3 | Big Bang | **67** | 120 | Final vs Little Gigant; rompe la God Hand X verdadera |
| 4 | Chaos Break | **67** | 120 | Fire Dragon; marca a Endou (Seigi no Tekken G5) |
| 5 | Doom Break | **67** | 120 | Ogre Gakuen; parada por Omega The Hand; Strikers 2011 |
| 6 | The Earth | **64** | — | Final de IE2; el tiro de Daisuke |

**1. Jet Stream.** Es el único 80 de TP y el gol que gana el Mundial de IE3: Endou se suma a Gouenji y Toramaru, completan la técnica y rompen la Tamashii The Hand G2 de Rococo. Nace para superar el Tiger Storm y tiene evolución G2–G5. Por TP y por canon, es el nº1. En internet suele estar infravalorada porque es un tiro largo y menos vistoso, pero los datos y el final del juego la ponen arriba.

**2. Grand Fire.** 76 de TP, el combo insignia de Inazuma Japan: se usa contra The Empire, Unicorn, Dark Angel, Team Garshield y Little Gigant, y tiene G2. Es el combo con más recorrido narrativo. En el partido final lo para la God Hand X 改, y eso lo deja por debajo del gol que sí gana Jet Stream.

**3. Big Bang.** 67 de TP y 120 de potencia; en el partido final rompe la God Hand X verdadera e incluso lesiona a Kane. Es el favorito de mucha gente por espectáculo, pero es de una sola aparición y luego lo para la Tamashii The Hand. Por TP y recorrido, va detrás de Grand Fire; por visuales, podría ser nº1.

**4. Chaos Break.** 67 de TP y 120 de potencia; es el as del Fire Dragon (Aphrodi, Nagumo y Suzuno) y marca a Endou con la Seigi no Tekken G5. Es de la saga principal y de un rival importante, así que adelanta a Doom Break. Doom Break tiene los mismos 67/120, pero es de Ogre Gakuen/Strikers 2011 y lo para la Omega The Hand; por eso queda fuera del top 4. The Earth es el final de IE2 y tiene más legado, pero en IE3 cuesta 64; en un ranking solo de legado entraría en el top 4 y saldría Doom Break.

**Opiniones de internet:**

- En [este hilo de Reddit](https://www.reddit.com/r/inazumaeleven/comments/1b6nqm3/what_is_the_best_s3_trio_hissatsu/) un comentario pone a **Big Bang** como nº1 por «visuals, players that perform it, and concept», y coloca a Chaos Break, Grand Fire, Gran Fenrir y Jet Stream en el grupo de arriba.
- En [este otro](https://www.reddit.com/r/inazumaeleven/comments/vjbyd8/which_of_inazuma_japans_strongest_hissatsus_is/) el ranking de un usuario es **Big Bang > Grand Fire > Koutei Penguin 3gou > Jet Stream**. Es la opinión más común: Big Bang por espectáculo y Grand Fire por icono.
- En [GameFAQs](https://gamefaqs.gamespot.com/boards/739560-inazuma-eleven-3-team-ogre-attacks/71655760?page=1) dicen que, contando la evolución, **Jet Stream está empatada como el tiro más fuerte con Death Break, Big Bang y Grand Fire**. Eso respalda el nº1 por datos.
- En [este hilo de co-op](https://www.reddit.com/r/inazumacaravan/comments/1p0q464/what_is_your_favorite_coop_hissatsu_thats/) la gente duda entre **Grand Fire y Big Bang**, y otro usuario se queda con **Chaos Break**.
- En [Tiermaker](https://tiermaker.com/categories/anime-and-manga/combination-shoot-hissatsu---inazuma-eleven--1463553) hay una clasificación comunitaria de combinaciones de tiro (6 listas); no he podido extraer el orden exacto, pero es otra muestra de que el debate está entre Big Bang, Grand Fire y Chaos Break.

**Mi opinión:** con el criterio de TP + canon, **Jet Stream > Grand Fire > Big Bang > Chaos Break**. Si puntuara solo por momento/visuales, pondría **Big Bang > Grand Fire > Jet Stream > Chaos Break**. The Earth es el gran tapado por legado, pero en IE3 cuesta 64 y no entra en el top 4 por datos. La comunidad tiende a sobrevalorar a Big Bang e infravalorar a Jet Stream porque el gol final es menos llamativo, pero es el que gana el Mundial y el que más TP cuesta.

La escalera de la sección 4 ya incluye Jet Stream (25 técnicas): Jet Stream 200, Grand Fire 190, los 67 a 180 y el resto recolocado. El orden interno de cada nivel sigue el lore.

## 5. Lore de cada triple

- **Jet Stream** (200): Endou, Gouenji y Toramaru; gol de la victoria contra Little Gigant; rompe la Tamashii The Hand G2 de Rococo.
- **Grand Fire** (190): Gouenji, Hiroto y Toramaru; contra The Empire. Combo insignia de Inazuma Japan.
- **Big Bang** (180): Hiroto, Fubuki y Kidou; contra Little Gigant, final de IE3.
- **Chaos Break** (180): Aphrodi, Nagumo y Suzuno; Fire Dragon contra Inazuma Japan.
- **Doom Break** (180): Baddap, Mistre y Eskaba; Ogre Gakuen contra Raimon. Debuta en Strikers 2011.
- **The Earth** (170): Endou, Gouenji y Fubuki; el tiro definitivo de Daisuke, final de IE2.
- **Emperor Penguin No. 3** (160): Kidou, Fudou y Sakuma; Orpheus, las tres dimensiones (largo, ancho y alto).
- **Grand Fenrir** (160): Mark, Dylan e Ichinose; Unicorn contra Inazuma Japan.
- **Dark Phoenix** (150): Kazemaru, Someoka y Max; los Dark Emperors la declaran su tiro más fuerte.
- **The Galaxy** (150): Combo exclusivo de juego/manga de IE2; sin aparición en el anime.
- **Neo Galaxy** (150): Combo exclusivo de juego de IE2; no aparece en el anime.
- **Triple Boost** (140): Kurimatsu, Shishido y Kazemaru; Dark Emperors. No es un final de saga.
- **Space Penguin** (140): Ulvida, Gran y Wheeze; los Genesis la declaran su técnica más fuerte.
- **Supernova** (140): Gran, Ulvida y Wheeze; Genesis, segundo gol contra Raimon.
- **Death Zone 2** (130): Kidou, Endou y Domon; evolución asíncrona de Death Zone para el Teikoku.
- **Gaia Break** (130): Macure, Metron y Zel; Epsilon la usa contra Raimon.
- **Eagle Buster** (120): Gibo, Shark y Koja; Oumihara contra Raimon.
- **Inazuma-1 Drop** (120): Kabeyama, Gouenji y Endou; mezcla de Inazuma Otoshi e Inazuma-1.
- **The Phoenix** (110): Ichinose, Endou y Domon; nace de combinar Tri-Pegasus con el Spinning Cut de Nishigaki.
- **Triangle Z** (110): Los trillizos Mukata (Masaru, Tsutomu y Tomo); contra Endou en el río.
- **Tri-Pegasus** (110): Domon, Ichinose y Nishigaki; después pasa a Raimon.
- **Inazuma Break** (100): Kidou, Endou y Gouenji; primer gol de Raimon contra Senbayama. Megane le puso el nombre.
- **Death Zone** (90): Creada por el Teikoku de Kidou; los tres jugadores rotan en el aire y sincronizan el disparo.
- **Emperor Penguin No. 2** (90): Versión más segura del No. 1, creada por Kidou para el Teikoku; la usan Kidou, Gouenji e Ichinose.
- **Slingshot** (80): Red Matador (Queraldo, Samuel y Davi) contra Inazuma Japan; debuta en IE3. Es el combo de 3 más barato.

## 6. Mejoras frente a la B pura

- **Jet Stream entra en 200**: es el 80 de TP y el gol que gana el Mundial; Grand Fire baja a 190 y los 67 a 180.
- **El mejor individual ya no manda**: el techo individual es 160 (Descenso estelar); el 200 es para Jet Stream por TP/lore, no por ser triple.
- **The Earth sube a 170**; Emperor Penguin No. 3 y Grand Fenrir a 160; Neo Galaxy, The Galaxy y Dark Phoenix a 150. Son finales o técnicas de equipo fuerte y quedan por encima de Triple Boost por lore, no por ser triples.
- **Triple Boost se queda en 140**: su TP de IE3 es alto (66), pero el lore no lo respalda como final; no adelanta a The Earth ni a los 64 de Orpheus/Unicorn/Genesis.
- **Los 55 se separan de los 52**: The Phoenix, Triangle Z y Tri-Pegasus van a 110; Inazuma Break a 100, y Death Zone/Emperor Penguin No. 2 a 90.
- **Dark Phoenix sube a 150 y Space Penguin/Supernova a 140**: la wiki las presenta como el tiro más fuerte de Dark Emperors/Genesis.
- **Slingshot se queda abajo (80)**: es el combo de 3 más barato; queda por encima del suelo real de VR (60) pero por debajo de los dobles (90).
- **Rejilla de 10**: todos los TP son múltiplos de 10 (80–200); las colisiones se quedan dentro de cada nivel y el lore ordena.

## 7. Pendiente

- Validar la relajación de la jerarquía: individuales y dobles pueden cruzarse; los triples no están obligados a quedar por encima.
- Revisar el orden interno de los 180 (Big Bang / Chaos Break / Doom Break) y de los 150 (Dark Phoenix / The Galaxy / Neo Galaxy).
- Después: bloqueos y paradas.
- **No se ha tocado ninguna técnica ni dato del juego.**

