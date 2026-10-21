# Análisis GO2 — Chrono Stone

> Estado: **P0 aplicado** (plantillas 2.0/3.0, duplicados base/versión y White Deer). El resto son propuestas.
> Fecha: 2026-10-21.

## 1. Resumen ejecutivo

- **GO2 ya es el pico de GO**: 90,45 de media en Mixi Max, 88,82 en Chrono Storm y 87,0 en los extras. GO3 se queda en 84,82 y GO1 en 84,73.
- **Protocol Omega 2.0** ya está completa: **16 cartas / 16 personajes** y **77,73** (Beta 83). Medam, Leiser, Einam y Minenne creados desde la wiki.
- **Protocol Omega 3.0** ya está completa: **11 cartas** y **79,55**. Medam, Leiser y Einam creados desde la wiki.
- Los **duplicados base + versión** se han limpiado: las bases quedan en `Unaffiliated` (fuera de los pools de draft) y los equipos usan la versión.
- Las cartas **Mixi Max y Chrono Storm** ya muestran su compañero (`mixi`); falta la herencia de Keshin y las formas que no existen.
- **White Deer** ya baja: Taian 90 → 88; el equipo queda en **77,82**.
- **Keshin Armed** está implementado como flag + hipertécnica; **Mixi Max** como cartas fijas + 19 recetas. Las dos cosas funcionan, pero tienen lagunas de lore (herencia de Keshin, reglas de Armed, Mixi Trans, recetas).

## 2. Rampa GO2

| Equipo | Objetivo | Real | Estrella | Notas |
|---|---:|---:|---|---|
| Protocol Omega | 76 | **76,00** | Alpha 90 | 13 cartas |
| Protocol Omega 2.0 | 77,5 | **77,73** | Beta 83 | 16 cartas |
| White Deer | 78 | **77,82** | Taian 88 | Ya rebajado |
| Protocol Omega 3.0 | 79,5 | **79,55** | Gamma 89 | 11 cartas |
| Terracotta Army | 80 | **80,91** | Terracotta 87 | 11 cartas |
| Zanark's Domain | 81 | **81,55** | Zanark 89 | 16 cartas |
| Perfect Cascade | 82 | **82,00** | Ar Ecks 90 | 16 cartas, 16 personajes (bases fuera) |
| Zan | 83 | **83,27** | Feduhm 89 | 15 cartas |
| Gihl | 83,5 | **83,64** | Mehr 89 | 16 cartas |
| Gahl | 84 | **84,09** | Chitoh 88 | 15 cartas |
| Ragnah | 85,5 | **85,55** | Simeon 90 | 14 cartas, Saryuu una vez |
| Despairadoes | 86,5 | **86,64** | Asta 90 | 13 cartas |
| Nosfanática | 87 | **87,18** | Desmodus 90 | 11 cartas |
| Aullido Lunar | 87 | **87,00** | Lee Canthrup 90 | 11 cartas |
| Raimon | — | **86,09** | Goldie 90 | protagonista |
| Chrono Storm | — | **88,82** | Bailong 92 | final de historia |
| Inazuma Legend Japan | — | **88,36** | Axel 91 | extra |
| Mixi Max | — | **90,45** | Bailong 92 | pico GO2 |
| Sherwinds | — | **85,55** | Vladimir 89 | extra |

Comparación de picos por saga:

| Saga | Mejor once | Estrella |
|---|---:|---|
| GO1 | 84,73 | Team Zero |
| **GO2** | **90,45** | Mixi Max |
| GO3 | 84,82 | Supernova |

GO3 ya queda por debajo de GO2 sin tocar nada. Si queremos que GO3 sea “algo menos fuerte”, el margen actual es suficiente; no hace falta subir GO2 más.

## 3. Lore de Chrono Stone

### 3.1 Premisa

Chrono Stone es la segunda entrega de GO. **El Dorado**, una organización del futuro, decide borrar el fútbol de la historia. Para ello envía a **Protocol Omega** (Alpha), después a **Protocol Omega 2.0** (Beta) y a **Protocol Omega 3.0** (Gamma). Tenma y Raimon viajan en la Inazuma Caravan por distintas épocas para reunir al **“once más fuerte de la historia”**, el Chrono Storm, y enfrentarse a El Dorado, Zanark y los Second Stage Children.

Es la saga con más contenido de la serie: épocas históricas, figuras reales, formas Mixi Max, Keshin Armed, versiones adultas/jóvenes, equipos future/alternativos y un catálogo enorme de cartas.

### 3.2 Épocas y figuras

- **Sengoku / Japón feudal**: Oda Nobunaga, Okita Souji, Sakamoto Ryouma, Shuu.
- **Tres Reinos**: Zhuge Kongming, Liu Xuande, Cao Cao.
- **Francia**: Jeanne d’Arc.
- **Camelot**: Rey Arturo.
- **Dinosaurios**: Big, Tyranno.
- **Futuro / El Dorado**: Zanark, Saryuu, Clara Jane, los Idenshi, Kuroi Bara.
- **Otras auras**: Master Dragon, Toh-chan, Queen of Dragons.

Las figuras históricas no son cartas jugables en la app: son **auras de Mixi Max** (compañero). La app las representa con el tag `mixi` en la carta del jugador y con la versión `Mixi Max (compañero)` cuando existe.

### 3.3 Keshin y Keshin Armed

- **Keshin**: espíritu guerrero; se invoca y da una hipertécnica propia.
- **Keshin Armed**: introducido en Chrono Stone. El usuario se “viste” con el Keshin:
  - Restaura KP y no puede volver al Keshin normal hasta agotar el Armed.
  - Mientras está Armed, sus técnicas normales no gastan TP/KP; gana velocidad y potencia en combate.
  - **No puede usar la hipertécnica ni las skills del Keshin** mientras está Armed.
  - El KP baja con los pasos; al llegar a 0 se desactiva.
  - En Galaxy el coste de técnicas con Armed es el 70 % y el bonus es menor.
- **Mixi Max + Armed**: se pueden combinar; si el usuario no puede usar Armed, no puede usar Armed con el Keshin heredado.

Usuarios de Armed en el anime: Alpha, Yuuichi, Tenma, Beta, Tsurugi, Shinsuke, Shindou, Zanark, Nishiki, Fei, los Perfect Cascade (Rei, Lau, Bado, Lin, Donel, Emi, Fani, Kay, Dai, Bull, Gra), Kinako, Amemiya, Kirino, Torb y SARU.

### 3.4 Mixi Max

- Fusión de dos auras; el usuario cambia de aspecto y gana stats.
- En CS: **75 %** en los stats favorecidos y **50 %** en el resto; si es **Best Match**, **100 %** en los favorecidos y 50 % en el resto.
- En Galaxy: **10 %** y **5 %**; el Best Match no da extra.
- Permite heredar **técnicas, skills y Keshin** del aura, con restricciones:
  - Si el aura tiene Keshin pero el usuario no, no puede invocarlo.
  - Si el aura puede usar Armed pero el usuario no, no puede usar Armed con ninguno de los dos.
  - El Keshin heredado y sus técnicas no se pueden subir más.
- **Mixi Trans / Mix ’n’ Match**: transformación posterior a la Mixi Max.
- Límite: 3 Keshin y 3 Mixi Max por partido.
- La GP se vacía al terminar la Mixi Max; si se activa Armed, la Mixi Max se mantiene hasta que termine el Armed.

Usuarios principales:

- **Ultimate Eleven**: Shindou/Nobunaga, Kirino/Jeanne, Taiyou/Zhuge, Hakuryuu/Zhuge (manga/Raimei), Nishizono/Liu Xuande, Nishiki/Sakamoto, Tsurugi/Okita, Torb/Toh-chan, Fei/Big, Nanobana/Master Dragon, Matsukaze/Arthur, Zanark/Clara Jane.
- **Otros**: Fei/Tyranno, Yuuichi/Kyousuke, Matsukaze/Shuu, Protocol Omega 3.0/Zanark, Zanark/Cao Cao, Saryuu/S Idenshi, Garshah/G Idenshi, Vampheny/V Idenshi, Fran/Kuroi Bara, Kodoukai/Shinohara Raika, Zanark Strangers/Zanark.

### 3.5 Souls

Los **Souls / tótems** son de **Galaxy (GO3)**, no de GO2. En la app están en `specials` con `type: "soul"` y solo aparecen en GO3/VR. No mezclar con las “armaduras” de GO2: en GO2 la armadura es **Keshin Armed**.

## 4. Versiones de personaje en GO2

`Module:PlayerData/CS` tiene **441 entradas** y **70 formas** declaradas:

| Forma | Entradas | Qué es |
|---|---:|---|
| Mixi Max | **31** | 20 genéricas + 11 con compañero nombrado |
| Hyper Dive Mode | **16** | Perfect Cascade |
| Adult | **15** | Inazuma Legend Japan / adultos |
| GO form | **2** | Kudou Michiya, Kakuma Oushou |
| Alternate | **1** | Tsurugi Yuuichi |
| Jouou-sama Mode | **1** | Beta |
| as Benigiku | **1** | Beta disfrazada |
| Inazuma Legend Japan | **1** | Gouenji |
| Ishido form | **1** | Gouenji |
| Teen | **1** | Gouenji Yuuka |

En la app, GO2 tiene **459 cartas**: 339 base y 120 versiones. Las etiquetas más repetidas son Perfect Cascade (16), Raimon (16), Chrono Storm (12), Inazuma Legend Japan (11), Mixi Max (Zanark) (9), Protocol Omega 2.0 (13), Adult (6), Protocol Omega 3.0 (6) y luego muchas versiones únicas.

### 4.1 Cobertura de versiones

- **Mixi Max**: 29 cartas en el grupo `Mixi Max` + 12 en Chrono Storm. El PlayerData CS declara 31 formas; muchas de las que no están en el grupo son las de Chrono Storm (Taiyou, Kinako, Nishizono, Nishiki, Torb…), que sí existen como carta Chrono Storm pero **sin el tag de compañero**.
- **Hyper Dive**: las 16 versiones de Perfect Cascade parecen ser la forma Hyper Dive, aunque la etiqueta diga solo “Perfect Cascade”.
- **Adult / Inazuma Legend Japan**: 17 cartas entre las dos etiquetas; cubre las 15 formas adultas y algún extra.
- **Beta**: solo base y Protocol Omega 2.0. **Faltan Jouou-sama Mode y Benigiku.**
- **Tsurugi Yuuichi**: base, Mixi Max (Victor) y Child. **Falta la forma alternativa.**
- **Gouenji**: ILJ y Mixi Max (Shawn). **Falta la forma Ishido** (y la base GO2 no está como carta suelta).
- **Real Inazuma, Chara Change, modos y disfraces**: quedan fuera por diseño; no son un olvido.

## 5. Cómo está implementado ahora

### 5.1 `specials`

Cada carta tiene un array `specials` con:

```json
{
  "type": "keshin" | "soul" | "mixi",
  "name": "...",
  "name_es": "...",
  "armed": true,
  "hyper": "...",
  "hyper_es": "..."
}
```

- Se genera desde `PlayerData_CS.lua` + `KeshinData.lua` (y `SoulData.lua` para GO3).
- `armed` viene del campo `keshin` de PlayerData.
- `hyper` es la hipertécnica del Keshin, sacada de `KeshinData`.
- Los nombres en castellano salen de la wiki española (`es_keshin.json`, `es_souls.json`).
- En la ficha (`PlayerDetail`) se muestran los poderes, la etiqueta “Armadura” y la hipertécnica.
- En el simulador, cualquier carta con `specials` puede usar **Hiperenergía**: +5 normal y **+7 si lleva Keshin Armed**, una vez por partido. Sigue sin distinguir Keshin normal, Mixi ni Soul a nivel de reglas.

### 5.2 Cobertura actual de GO2

| Métrica | Valor |
|---|---:|
| Cartas GO2 | 459 |
| Con algún special | 175 |
| Keshin | 122 |
| Keshin Armed | 78 |
| Keshin sin Armed | 44 |
| Keshin únicos | 69 |
| Mixi (tag) | 73 |
| Souls | 0 (son GO3) |
| Sin specials | 284 |

Cartas con combinaciones:

- **Keshin + Mixi**: 20.
- **Solo Mixi**: 53 (29 Mixi Max + 12 Chrono Storm + 12 bases con compañero).
- **Solo Keshin**: 102.

Para comparar, el `PlayerData/CS` declara **392 entradas de Keshin**, **82 Keshin únicos** y **249 entradas marcadas Armed**. La app solo materializa las que tienen carta en GO2 (122 / 69 únicos / 78 Armed). GO1 tiene 83 Keshin y ninguno Armed; GO3 tiene 78 Keshin, 7 Armed y 71 Souls.

Por equipo (Keshin / Armed / Mixi):

| Equipo | Keshin | Armed | Mixi |
|---|---:|---:|---:|
| Perfect Cascade | 16 | 15 | 0 |
| Mixi Max | 0 | 0 | 29 |
| Chrono Storm | 0 | 0 | 12 |
| Raimon | 7 | 7 | 8 |
| Despairadoes | 5 | 3 | 0 |
| Nosfanática | 6 | 3 | 0 |
| Ragnah | 5 | 2 | 0 |
| Gihl | 6 | 4 | 0 |
| Aullido Lunar | 6 | 2 | 0 |
| Zan | 4 | 3 | 0 |
| Sherwinds | 3 | 3 | 3 |
| Protocol Omega | 3 | 2 | 2 |
| Protocol Omega 2.0 | 3 | 2 | 3 |
| Protocol Omega 3.0 | 3 | 3 | 8 |
| Zanark’s Domain | 6 | 2 | 1 |
| Gahl | 4 | 2 | 0 |
| White Deer | 2 | 1 | 0 |
| Inazuma Legend Japan | 3 | 0 | 5 |
| Terracotta Army | 4 | 0 | 0 |

### 5.3 Mixi Max

- **29 cartas** en el grupo `Mixi Max`; **12** en Chrono Storm.
- **19 recetas** en `src/data/fusions.json`.
- **10 cartas Mixi Max no tienen receta**: Shuu/Tezlong, Tsurugi/Baivic, Fubuki/Shaxel, Kidou/Juleb, Endou/Markion, Tsurugi/Victarion, Zanark/Zeta, Fei/Tyranno, Kirino/Aitriel y Kirino/Gabardo (algunas son la dirección inversa de una pareja o formas de historia).
- Las 29 cartas Mixi Max y las 12 Chrono Storm ya muestran un **tag `mixi` con el compañero**; siguen **sin heredar Keshin** (no llevan Keshin/Armed).
- La fusión es una **receta fija**: dos personajes del mismo juego, una vez por cuenta, y da la carta Mixi Max ya existente. No calcula stats a partir de los ingredientes; no hay Best Match, Mixi Trans ni herencia de Keshin.
- El grupo `Mixi Max` queda fuera de los pools del draft; es colección/endgame.

### 5.4 Keshin Armed

- Es un **flag** en el Keshin, no una carta aparte. Es lo correcto: en el juego es un modo, no un personaje nuevo.
- En la ficha se muestra “Armadura” y la hipertécnica; en el simulador la Hiperenergía es genérica (+4).
- La Hiperenergía ya da **+5 normal y +7 con Armed** en el simulador. Faltan KP, coste 0 de técnicas y bloquear la hipertécnica del Keshin mientras está Armed.

### 5.5 “Armaduras” de Victory Road

En VR hay **24 Keshin, 17 Armed y 13 únicos**. El informe de sprites lista 36 versiones con sprite de VR sin carta, entre ellas “Surtur (Armadura)” y “Grandius (Armadura)”. Son formas de **Victory Road**, no de GO2; si se añaden, irían como cartas/modo de VR, no en la rampa GO2.

## 6. Lagunas concretas

### 6.1 Mixi Max

Formas de GO2 que no están en la app (o no tienen tag):

| Forma | Compañero | Estado |
|---|---|---|
| Medam | Zanark | Sin carta base; falta Mixi Max |
| Leiser | Zanark | Sin carta base; falta Mixi Max |
| Einam | Zanark | Sin carta base; falta Mixi Max |
| Saryuu Evan | S Idenshi | Falta Mixi Max |
| Fran | Kuroi Bara | Falta Mixi Max |
| Garshah Wolfein | G Idenshi | Falta Mixi Max |
| Vampheny Vamp | V Idenshi | Falta Mixi Max |
| Tsurugi Yuuichi | Tsurugi Kyousuke | Falta; la app tiene Yuuichi/Victor |
| Matsukaze Tenma | Shuu | Falta; la app tiene Mark/Victor/Tezcat |
| Zanark Avalonic | Cao Cao | Falta; la app tiene Zeta |
| Fei / Hakuryuu / Nanobana / Nishizono / Nishiki / Torb / Shindou / Kirino / Tsurugi / Matsukaze / Zanark | Big / Zhuge / Dragon / Liu Bei / Sakamoto / Toh-chan / Nobunaga / Jeanne / Okita / Arthur / Clara Jane | Existen como **Chrono Storm**, pero sin tag de compañero |

También sobra **Mike (Tez Beyan) con Zanark**: no está en la lista de 11 formas Zanark del PlayerData (Lugic, Medam, Ward, Galling, Bahamus, Quorth, Orca, Dhanna, Leiser, Gamma, Einam). Hay que revisar si es una forma oficial o un emparejamiento manual.

### 6.2 Keshin Armed

- La hipertécnica del Keshin se muestra también cuando `armed: true`, pero el lore dice que Armed **no puede usar** la hipertécnica/skills del Keshin.
- El simulador ya distingue Armed en Hiperenergía (+5 normal / +7 Armed); siguen faltando KP, coste 0 y bloqueo de la hipertécnica.
- Las cartas Mixi Max no heredan el Keshin del aura, así que no se puede probar la combinación Mixi Max + Armed.

### 6.3 Versiones

- Beta: faltan **Jouou-sama Mode** y **Benigiku**.
- Tsurugi Yuuichi: falta la **forma alternativa**.
- Gouenji: falta **Ishido**; la base GO2 no está como carta suelta.
- Perfect Cascade: las 16 versiones se llaman “Perfect Cascade”; podrían etiquetarse **Hyper Dive Mode**.
- Real Inazuma / Chara Change / modos / disfraces: fuera por diseño; no urgentes.

### 6.4 Plantillas y duplicados

- **Protocol Omega 2.0**: 16 cartas, 16 personajes, 77,73. Medam, Leiser, Einam y Minenne creados desde la wiki.
- **Protocol Omega 3.0**: 11 cartas, 79,55. Medam, Leiser y Einam creados desde la wiki.
- **Perfect Cascade**: 16 cartas para 16 personajes; las bases están en `Unaffiliated`.
- **Ragnah**: 14 cartas, 14 personajes; Saryuu una vez.
- **Despairadoes / Nosfanática / Aullido Lunar / Chrono Storm**: bases en `Unaffiliated`; el equipo usa solo la versión.

## 7. Propuesta por prioridad

### P0 - Datos y plantillas (aplicado)

1. **2.0**: `beta--go2--base` fuera; versiones 2.0 de Zanou, Gaura, Quorth, Neira, Laszlo, Cople, Finik y Mechius; Medam, Leiser, Einam y Minenne creados. **16/16**. `compress: 0.5` y Beta 83.
2. **3.0**: versiones de Ward, Quorth y Orca; Medam, Leiser y Einam creados. **11/11**. `compress: 0.5`.
3. **Duplicados**: bases de Perfect Cascade, Ragnah, Despairadoes, Nosfanática, Aullido Lunar, Chrono Storm y 2.0 movidas a `Unaffiliated` (fuera de los pools de draft). Retuneado.
4. **White Deer**: hecho (Taian 88; equipo 77,82).

### P1 — Mixi Max

5. **Tag de compañero aplicado** a las 12 cartas Chrono Storm y a las 29 Mixi Max. No hace falta crear cartas nuevas para esas.
6. Añadir las formas que faltan de verdad:
   - Medam, Leiser, Einam (Zanark).
   - Saryuu (S Idenshi), Fran (Kuroi Bara), Garshah (G Idenshi), Vampheny (V Idenshi).
   - Yuuichi/Kyousuke, Matsukaze/Shuu, Zanark/Cao Cao.
7. Revisar **Mike/Zanark** y decidir si se queda o se cambia por una forma oficial.
8. Decidir si las 10 cartas sin receta son solo de historia o deben tener receta. Hoy la fusión es una receta fija de 19; el juego permite muchas más combinaciones, pero la app eligió un catálogo corto.

### P2 — Keshin Armed

9. Mantener Armed como **modo** (flag), no como carta.
10. **Hecho**: Armed da **+7** en Hiperenergía (frente a +5 normal). Queda desactivar la hipertécnica del Keshin, permitir técnicas normales a coste 0 y consumir KP.
11. Mixi Max + Armed: permitir la combinación y aplicar la restricción de que un Keshin heredado no puede ir Armed si el usuario no puede.

### P3 — Versiones y lore

12. Beta Jouou-sama / Benigiku; Tsurugi Yuuichi alternativo; etiquetar Perfect Cascade como Hyper Dive; valorar Ishido/GO forms.
13. No mezclar los **43 Mixi Max de GO3/VR** (Sierra Mone, Kierry Reese, etc.) con el catálogo GO2: son otra tanda.

### P4 — Balance

14. Después de P0, volver a mirar la rampa: 2.0 queda en 77,73 y 3.0 en 80,00. Si los 90 de Alpha/Taian/Gamma siguen chirriando, aplicar `compress_above: 86` con factor 0,5 o topes de capitán por equipo.
15. GO3 no se toca: ya está por debajo de GO2 (84,82 vs 90,45).

## 8. Fuentes

- [Mixi Max — Inazuma Eleven Wiki](https://inazuma-eleven.fandom.com/wiki/Mixi_Max)
- [Keshin Armed — Inazuma Eleven Wiki](https://inazuma-eleven.fandom.com/wiki/Keshin_Armed)
- [Inazuma Eleven GO 2: Chrono Stone — Inazuma Eleven Wiki](https://inazuma-eleven.fandom.com/wiki/Inazuma_Eleven_GO_2:_Chrono_Stone)
- `Module:PlayerData/CS`, `Module:KeshinData`, `Module:SoulData` (cache local `tools/.cache/db`).
- `build/players.json`, `data/overrides.json`, `src/data/fusions.json`, `docs/tension-vr.md`.
