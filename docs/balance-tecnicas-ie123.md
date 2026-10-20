# Balance de técnicas de la saga original (IE1 · IE2 · IE3)

> **Estado:** análisis, sin cambios aplicados (2026-10-20).
> **Objetivo:** separar el balance de IE123 del de Victory Road, con una escala propia de **50–200** basada en el TP de IE3.
> **Detalle de tiros:** [balance-tecnicas-ie123-tiros.md](./balance-tecnicas-ie123-tiros.md)
> **Detalle de regates:** [balance-tecnicas-ie123-regates.md](./balance-tecnicas-ie123-regates.md)
> **Detalle de bloqueos:** [balance-tecnicas-ie123-bloqueos.md](./balance-tecnicas-ie123-bloqueos.md)
> **Detalle de paradas:** [balance-tecnicas-ie123-paradas.md](./balance-tecnicas-ie123-paradas.md)

## 1. Alcance y fuentes

| Dato | Fuente |
|---|---|
| Coste IE1 / IE2 / IE3 | `costs` de `build/players.json` (campos `tp_ie`, `tp_ie2`, `tp_ie3` de la ficha de la wiki) |
| Jugadores necesarios | campo `users` de la ficha de la wiki inglesa (consultado el 2026-10-19) |
| Balance actual | `balance_tp` de Supabase / `data/technique_balance.json` |
| Tipo | `type` de la técnica |

**Cobertura:** **346 técnicas únicas** con coste de IE3 en la wiki. El build tiene 344 filas; las diferencias están en la nota.

| Tipo | Técnicas | 1 jugador | 2 jugadores | 3 jugadores | TP IE3 mín–máx |
|---|---:|---:|---:|---:|---:|
| Tiros | 140 | 85 | 30 | 25 | 20–80 |
| Regates | 65 | 54 | 9 | 2 | 20–57 |
| Bloqueos | 71 | 55 | 9 | 7 | 12–57 |
| Paradas | 70 | 65 | 1 | 4 | 20–60 |
| **Total** | **346** | **259** | **49** | **38** | **12–80** |

**Diferencias wiki/build:** en tiros faltan en el build **Jet Stream, Cross Fire, Astro Gate, Almighty Cannon, Clone Death Zone y Clone Penguin**; los seis ya están en los docs de tiros. En regates faltan **Air Ride y Angel Ball**, añadidos al doc de regates. En paradas el build tiene 3 variantes de más (**God Hand Blue, Majin The Hand Blue y K**) que comparten página en la wiki. Bloqueos: 71 en ambos.

## 2. Punto de partida: el balance de VR

El `balance_tp` actual viene de la hoja de Victory Road y usa **18 escalones** (30, 40, 50… 200). Al aplicarlo a IE123, muchas técnicas distintas caen en el mismo número:

| Tipo | Técnicas | Valores distintos de `balance_tp` | Rango actual |
|---|---:|---:|---:|
| Tiros | 140 | 16 | 40–200 |
| Regates | 65 | 12 | 40–150 |
| Bloqueos | 71 | 12 | 40–150 |
| Paradas | 70 | 15 | 40–180 |
| **Total** | **346** | **16** | **40–200** |

En tiros, los 137 se reparten así (los valores más repetidos):

| `balance_tp` actual | Nº de tiros | Ejemplos |
|---:|---:|---|
| 50 | 21 | Grenade Shot, Comet Shot, Rolling Kick, Spiral Shot… |
| 60 | 17 | Inazuma Drop, Fire Rooster, Run Ball Run, Freeze Shot… |
| 120 | 14 | Atomic Flare, Northern Impact, Wyvern Blizzard, Pegasus Shot… |
| 80 | 14 | Dragon Tornado, Wyvern Crash, Kung Fu Fighting, Double Grenade… |
| 70 | 11 | Fire Tornado, Dragon Crash, Revolution V, Double Wrath Shot… |
| 110 | 11 | Fireball Storm, Fireball Storm, Whirlwind Drop, The Phoenix… |

Eso es lo que hace que las finales parezcan «skins»: comparten TP con técnicas genéricas. La escala de IE123 tiene que ser independiente y con más granularidad: con la escala A propuesta, las 344 técnicas pasan de **16 a 45 valores distintos**; en tiros, de **16 a 25**.

## 3. Jugadores necesarios: wiki vs Supabase

En Supabase, `vr_participants` no coincide con el campo `users` de la wiki en **12 de las 344** técnicas de IE123. Todas las discrepancias son de tipo **parada**; en tiros no hay ninguna (82 / 31 / 24).

| Técnica | Tipo | Wiki `users` | Supabase `vr_participants` |
|---|---|---:|---:|
| Baraja fugaz (Card Protector) | Paradas | 1 | 3 |
| Uñas afiladas (Claw Slash) | Paradas | 1 | 2 |
| Bloqueo doble (Dual Smash) | Paradas | 2 | 1 |
| Voltaje dual (High Voltage) | Paradas | 3 | 1 |
| Muralla infinita (Infinite Wall) | Paradas | 3 | 1 |
| Mano mágica (Majin The Hand) | Paradas | 1 | 3 |
| Mano mágica (Majin The Hand) | Paradas | 1 | 3 |
| Mano mágica (Majin The Hand) | Paradas | 1 | 3 |
| Deslizamiento de portería (Sliding Goal) | Paradas | 1 | 3 |
| Salto del cisne (Swan Dive) | Paradas | 1 | 3 |
| Defensa triple (Triple Defence) | Paradas | 3 | 1 |
| Trimano celestial (Triple God Hand) | Paradas | 3 | 1 |

Las tres filas de «Mano mágica» son las variantes `MajinTheHand`, `MajinTheHand_Blue` y `MajinTheHand_K`; las tres figuran con 1 jugador en la wiki.

**Decisión:** para IE123 se usa `users` de la wiki. `vr_participants` se puede quedar como dato de VR, pero no debe mandar en esta escala. Hay además 13 técnicas sin `vr_participants`; para esas no hay contraste con VR.

## 4. Escala propuesta

Rango real de IE3: **12** (Killer Slide) a **80** (Jet Stream; en el build, 76 con Brave Shot y Grand Fire). Rango nuevo: **50–200**.

### Escala B — por tipo (elegida)

Cada tipo ocupa el 50–200, pero con **múltiplos de 10** y reparto por número de jugadores:

| Grupo | Rango | Mejor (provisional) |
|---|---:|---|
| Individuales | 50–160 | Descenso estelar 160 |
| Dobles | 60–180 | Prime Legend 180 |
| Triples | 80–200 | Jet Stream 200 |

Los topes actuales son **200 / 180 / 160**, pero no es una jerarquía rígida: un individual puede superar a un doble y viceversa, y un triple no tiene que quedar por encima por tener 3 jugadores. El orden lo da el TP/lore. Los niveles son 50, 60, 70… 200; dentro de cada nivel, el orden lo da el lore/potencia (las colisiones dentro del nivel se aceptan). El detalle de triples está en [balance-tecnicas-ie123-tiros-triples.md](./balance-tecnicas-ie123-tiros-triples.md).

La fórmula lineal por tipo sigue siendo la base (para tiros, 20–76):

```
nuevo = round(50 + (tp_ie3 - 20) × 150 / 56)
```

La B pura da a Brave Shot (individual, 76) 200 y a Shadow Ray (doble, 67) 176; el problema no es que un individual supere a un doble, sino que la línea recta no distingue finales, aplasta los tiros de 55 y deja los 64 en 170. Por eso se reparte por grupos y se usan múltiplos de 10.

### Escala A — global (alternativa)

Una sola escala para los cuatro tipos, para que un bloqueo o una parada sigan siendo más baratos que un tiro del mismo nivel:

```
nuevo = round(50 + (tp_ie3 - 12) × 150 / 64)
```

### Equivalencias (B pura, referencia)

| TP IE3 | Escala A (global) | Escala B pura (tiros) |
|---:|---:|---:|
| 12 | 50 | — |
| 16 | 59 | — |
| 20 | 69 | 50 |
| 21 | 71 | 53 |
| 25 | 80 | 63 |
| 30 | 92 | 77 |
| 37 | 109 | 96 |
| 46 | 130 | 120 |
| 52 | 144 | 136 |
| 58 | 158 | 152 |
| 64 | 172 | 168 |
| 67 | 179 | 176 |
| 76 | 200 | 200 |

**Decisión:** se aplica la **B en múltiplos de 10**. La A queda como alternativa si se prefiere una escala única para los cuatro tipos.

### Regates, bloqueos y defensa

En estos tipos se usa también una **escala única por tipo**, sin bandas por número de jugadores. El techo depende del tipo: **regates y bloqueos topan en 150** (75% del tiro máximo, la misma proporción que en IE3 y en el balance de VR) y **portería topa en 180**. Las combinadas no reciben un plus por ser de 2 o 3 jugadores; al contrario, se les aplica el coste de necesitar más jugadores, así que **no son las más fuertes**. El orden lo da el TP/lore, no el número de jugadores.

En **portería** casi no cambia nada porque casi todas las paradas son de 1 jugador; la regla se aplica igual para las pocas combinadas.

## 5. Resumen por tipo

| Tipo | Técnicas | TP IE3 | Escala A | B pura (referencia) |
|---|---:|---:|---:|---:|
| Tiros | 140 | 20–80 | 69–200 | 50–200 |
| Regates | 65 | 20–57 | 69–155 | 50–200 |
| Bloqueos | 71 | 12–57 | 50–155 | 50–200 |
| Paradas | 70 | 20–60 | 69–162 | 50–200 |

La columna «B pura» es la línea recta. En tiros se queda la propuesta cerrada (techo 200). En regates y bloqueos el techo es **150**; en portería, **180**. No hay bandas por número de jugadores: las combinadas no son las más fuertes.

## 6. Siguiente paso

- **Tiros individuales**: [85 propuesta](./balance-tecnicas-ie123-tiros-individuales.md) en 50–160 (hecho).
- **Tiros de dos jugadores**: [30 propuesta](./balance-tecnicas-ie123-tiros-dobles.md) en 60–180 (pendiente de validar el orden).
- **Tiros de tres jugadores**: [25 propuesta final](./balance-tecnicas-ie123-tiros-triples.md) en 80–200, con Jet Stream (hecho).
- **Regates**: [65 propuesta](./balance-tecnicas-ie123-regates.md) en 50–150 (54 individuales, 9 dobles y 2 triples; incluye Air Ride y Angel Ball; Hora celestial top 1; hecho).
- **Bloqueos**: [71 propuesta](./balance-tecnicas-ie123-bloqueos.md) en 50–150 (La montaña y Muro de hierro top 1; mejor doble Presa 120 y mejor triple Escudo corporal 120; hecho).
- **Paradas**: [70 propuesta](./balance-tecnicas-ie123-paradas.md) en 50–180 (Mano espiritual top 1; mejor combinada Voltaje dual 150; hecho).
- Validar la relajación de la jerarquía: individuales y dobles pueden cruzarse; los triples no están obligados a quedar por encima.
- El documento de [tiros](./balance-tecnicas-ie123-tiros.md) sigue siendo la B pura de referencia para las 137 del build; los docs de individuales/dobles/triples cubren las 140 de la wiki.
- Con esto quedan revisados tiros, regates, bloqueos y paradas. Siguiente: aplicar los valores a `data/technique_balance.json` / Supabase.
- **No se ha tocado ninguna técnica, ni `data/technique_balance.json`, ni Supabase.**

