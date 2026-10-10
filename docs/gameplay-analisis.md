# Análisis de jugabilidad: reglas, números y lo que hay que decidir

Profundiza en los minijuegos de [gameplay-variedad.md](gameplay-variedad.md). Cada mecánica tiene: reglas exactas, lo
que se ha medido (con simulaciones sobre el código real, `src/lib/minigames`), problemas encontrados, la recomendación
y la prueba que falta con personas de verdad. Las cifras son de simulación: lo que de verdad importa se confirma en
playtest (§6).

---

## 1. Calibrar (barra de tiempo)

### 1.1 Reglas
- La aguja sube de 0 a 1 y vuelve a 0. Un ciclo completo = **periodo** (ms).
- Al parar, la posición decide el tier: **perfecto** (dentro de un cuarto de la zona, centrada), **bueno** (dentro de la
  zona), **flojo** (hasta 0,1 fuera de la zona), **fallo** (el resto). La potencia es 1 / 0,75 / 0,4 / 0.
- La zona es el ancho del 50 % central menos o más según el parámetro `zone`.

### 1.2 Qué se ha medido
Modelo del jugador: apunta al centro y para con un **error normal de σ milisegundos** (tiempo de reacción visual).
Porcentajes perfecto / bueno / flojo / fallo, sobre 20 000 paradas:

| Periodo | Zona | σ 60 ms | σ 100 ms | Potencia media (σ 60 / σ 100) |
|---|---|---|---|---|
| 1400 | 0,15 | 34 / 28 / 34 / 4 | 21 / 19 / 38 / 22 | 0,69 / 0,50 |
| 1800 | 0,15 | 43 / 31 / 25 / 1 | 27 / 24 / 38 / 11 | 0,76 / 0,60 |
| **1800** | **0,20** | **55 / 32 / 13 / 0** | **35 / 29 / 29 / 7** | **0,84 / 0,68** |
| 2000 | 0,20 | 60 / 31 / 9 / 0 | 38 / 31 / 27 / 4 | 0,87 / 0,72 |

**Lectura**: a 1400 ms (el actual del prototipo) un jugador normal falla un 4 % con σ 60 y un 22 % con σ 100; la zona
de 0,15 es demasiado estrecha para el móvil. Las zonas de 0,2 con periodo 1800 dan un reparto razonable: la mayoría
acierta algo, perfecto no es lo normal (~35–55 %).

### 1.3 Recomendación
- **Periodo 1800 ms, zona 0,20** como valor por defecto. Un periodo más lento sube las tasas de perfecto sin cambiar la
  zona.
- **Latencia del móvil**: el tacto añade 30–80 ms. Antes de jugar, un «test de latencia» de tres toques ajusta un
  desplazamiento por dispositivo (`latencyOffsetMs`), guardado en el club. Sin esto, el móvil falla más que el PC.
- **Accesibilidad**: opción de barra lenta (periodo 2600) y de zona ancha (0,3). Las dos aparecen en Ajustes, no en el
  modo.
- **Parada sin reloj**: mostrar la aguja, nunca la zona exacta en el último medio segundo, para no dar la respuesta.

### 1.4 Riesgos
- Que cuente como habilidad pura y el azar desaparezca: por eso el premio es una **potencia**, no un resultado seco.
- Que se juegue a tope en el móvil con las manos sudadas (no se mide, solo se nota en playtest).

---

## 2. Farol (técnica boca abajo)

### 2.1 Reglas
- Atacas: juegas una técnica **de tipo** (Tiro, Regate, Bloqueo, Parada) sin decir el tipo.
- La máquina adivina un tipo. Si acierta, la técnica se **bloquea** (no hace efecto) y el que defiende gana la tensión
  del choque. Si no, la técnica **pasa** y cuenta.
- La máquina adivina así: la mitad de las veces el tipo **más usado en las últimas 12 técnicas** del partido (lee el
  patrón); la otra mitad al azar. Implementado en `aiBluffGuess`.

### 2.2 Problema encontrado (y arreglado en el análisis)
Simulando 20 000 técnicas con cada estrategia del jugador:

| Estrategia del jugador | Desempate actual (por orden de aparición) | Desempate al azar |
|---|---|---|
| siempre el mismo tipo | 62 % bloqueadas | 62 % |
| **rotar en orden** | **62 % bloqueadas** | **26 %** |
| al azar | 25 % | 25 % |

La causa: rotar en orden deja las cuatro clases empatadas en la ventana de 12. El desempate por orden de aparición
elige siempre la técnica que lleva más tiempo sin salir, que es **justo la siguiente que tocaba**. La máquina leía
rotaciones sin querer: el jugador que rotaba era el más castigado.
**Corrección**: desempate al azar entre los empatados (`aiBluffGuess`). Con esto, repetir sigue costando (62 %) y
rotar ya no se castiga (26 %), que es lo que se quiere: repetir es la única jugada mala clara.

### 2.3 Recomendación
- Aplicar el desempate al azar (pendiente en el código; el análisis ya lo prueba).
- **Objetivo de diseño**: un jugador que varía tiene que ver bloqueado entre el 20 % y el 35 % de sus técnicas. Hoy
  el aleatorio da 25 %: está en rango.
- Lo que el jugador **aprende**: no repetir el mismo tipo tres veces seguidas. Mostrar un aviso tras dos repeticiones
  («la máquina ya te conoce») da la pista sin explicar la regla.
- **Bloqueo y tensión**: el que bloquea recupera la tensión del choque (la misma ganancia que el balón ganado,
  `TENSION_GAIN.ballWon`); el que pierde la técnica no gana nada. No se gasta tensión extra.

---

## 3. Pronóstico de jornada

### 3.1 Reglas actuales
Dices gano, empato o pierdo antes del partido. Acertar da **2 puntos**; fallar, 0.

### 3.2 Problema: las cuotas no funcionan con puntos fijos
Con las probabilidades medidas en el balance (equipos de la misma media: gana 44 %, empata 12 %, pierde 44 %; con +3 de
media: gana 82 %, empata 3 %, pierde 16 %), el valor esperado de cada pronóstico con 2 puntos fijos es:

| Partido | Valor esperado de «gano» | «empato» | «pierdo» |
|---|---|---|---|
| Igualados | 0,88 | 0,24 | 0,88 |
| Tú +3 | **1,64** | 0,06 | 0,32 |

Con 2 puntos fijos, **siempre se elige el favorito**: el pronóstico se vuelve trivial en cuanto hay diferencia. Si se
quiere premiar lo improbable (cuotas), hay otro problema: con un 3 % de empate, las cuotas dan 33 puntos, y con un
favorito de +3 se gana más apostando contra él (pierdo: 0,93 de valor esperado frente a gano 0,81). Es decir, las cuotas
premian **apostar en contra**, justo lo contrario de lo que se quiere.

### 3.3 Recomendación
- **Puntos fijos** (2) y **racha**: 3 aciertos seguidos suman +2 extra, 5 suman +5. La racha da una razón para volver
  sin cuotas.
- **Mostrar el favorito**: cada partido enseña «favorito: tú» o «favorito: rival» según la diferencia de media (ya
  calculada en el duelo). Así el pronóstico es una lectura de la plantilla, no un volado.
- **Empate**: el empate sale poco (12 % igualados); dar **3 puntos** al empate para que no sea una opción muerta.
- No se pierde nada al fallar, nunca. El pronóstico es un extra, no una apuesta (sin monedas en juego).

---

## 4. Tablero de fusiones

### 4.1 Reglas
- Una receta pide una lista de **personajes** (una carta de cada uno, sin reusar carta). Se cumple si se pueden
  asignar cartas distintas a cada petición (`matchRecipe`).
- Al fusionar, las cartas usadas salen del tablero y entra la carta resultante.

### 4.2 Lo que dice la base
- 5 378 cartas, 4 974 personajes. **Solo 266 personajes tienen dos o más cartas** (versiones). Por eso una receta que
  pide dos copias del mismo personaje es rara: casi todas las recetas deben pedir personajes **distintos**.
- Hay 43 cartas Mixi Max de 38 personajes: el catálogo de fusiones de la serie cabe en una lista corta, pero las recetas
  hay que escribirlas a mano (no se deducen de la base).

### 4.3 Recomendación
- Recetas de **dos o tres personajes distintos**, de juegos distintos (así cuesta reunirlas y la colección cuenta).
- Pocas recetas (≈30) y bien elegidas, en vez de una combinatoria abierta: la fusión es un hito, no una máquina de
  cartas.
- En pantalla, al tocar una carta se iluminan las recetas que **podrían** completarse con lo que tienes: el jugador no
  tiene que adivinar.

---

## 5. Cómo se relacionan (economía y tensión)

| Mecánica | Lo que da | Lo que cuesta | Donde se mide |
|---|---|---|---|
| Calibrar | potencia de 0 a 1 | nada | tier y potencia |
| Farol | bloqueo o paso; tensión del choque | tensión de la técnica | % bloqueadas |
| Pronóstico | 2 puntos (+ racha) | nada | aciertos y racha |
| Tablero | carta nueva | dos o tres cartas que ya tienes | recetas hechas |

Ninguna de las cuatro cambia monedas por sí sola: el premio fuerte sigue viniendo de los modos (Expedición, Liga…).
Esto evita que un minijuego sea la forma más rápida de conseguir monedas.

---

## 6. Qué probar con personas (playtest)

Antes de dar nada por bueno, cinco personas, quince minutos cada una, con la pantalla `#/minijuegos`:
1. **Calibrar**: pedir diez paradas seguidas y anotar el tier. Si la mayoría de personas acierta el perfecto más de un
   70 % de las veces, la zona es demasiado ancha; si ninguna lo acierta, demasiado estrecha.
2. **Farol**: pedir veinte jugadas libres y anotar cuántas se bloquean y si la gente nota el patrón. El objetivo es que
   lo noten sin que se les explique.
3. **Pronóstico**: pedir diez pronósticos con el favorito visible. Ver si se elige siempre el favorito (esperado) y si
   lo encuentran entretenido.
4. Preguntar: «¿qué has notado?», sin enseñar la regla. Lo que digan sin preguntar pesa más que lo que contesten.

Cada resultado se anota en `docs/playtest-minijuegos.md` (fecha, personas, cifras, cambios decididos).

---

## 7. Lo que hay que decidir antes de programar

1. **Periodo y zona** de la calibración: 1800 / 0,20 (recomendado) o los valores del prototipo.
2. **Latencia**: ¿test de tres toques al entrar (recomendado) o un ajuste manual?
3. **Farol**: ¿aplicamos el desempate al azar ya (recomendado, es un arreglo) y el aviso de repetición?
4. **Pronóstico**: ¿puntos fijos con racha (recomendado) o cuotas? Las cuotas están descartadas por §3.2 salvo que
   quieras otra cosa.
5. **Penalti del Sim**: ¿pasa a calibrar (pregunta 4 de `gameplay-variedad.md`)? Con la calibración en 1800 / 0,20 es
   el primer uso real.
