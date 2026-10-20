# Informe de equilibrio (generado)

Generado por `npm run balance` (`tools/balance`) con 1500 partidos por escenario, catálogo de build/players.json y azar con semilla. Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.

## 1. Duelo clásico: IA contra IA al mismo nivel

| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |
|---|---|---|---|---|---|
| 60 | 50.1 | 6.8 | 43.1 | 26.8 | 44.4 / 7.1 / 48.5 |
| 68 | 45.6 | 8.7 | 45.7 | 27.9 | 44.1 / 9.3 / 46.5 |
| 75 | 44.7 | 9.7 | 45.7 | 27 | 44.5 / 10.3 / 45.1 |
| 82 | 46.1 | 8.9 | 45 | 26.3 | 45.7 / 8.1 / 46.3 |
| 88 | 45.5 | 8.7 | 45.8 | 23.8 | 45.5 / 8.7 / 45.8 |

## 2. Duelo clásico: tú contra la IA (media 75)

| Tú juegas… | Ganas % | Empate % | Pierdes % |
|---|---|---|---|
| como un humano fuerte (ve el número exacto de la IA) | 38.5 | 7.5 | 53.9 |
| sin criterio (al azar) | 1 | 0.3 | 98.7 |

## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)

| Media A / B | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| 75 / 75 | 45.7 | 9.9 | 44.3 |
| 78 / 75 | 91.5 | 2.4 | 6.1 |
| 81 / 75 | 99.4 | 0.2 | 0.4 |
| 87 / 75 | 100 | 0 | 0 |

## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)

| A | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| solo IE1 | 75.6 | 4.4 | 20 |
| solo GO1 | 90.2 | 3.9 | 5.9 |
| solo VR | 83.6 | 8.3 | 8.1 |

## 5. Fatal Sim (12 ocasiones, 90 min)

| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |
|---|---|---|---|---|---|
| media 68, los dos usan tensión | 39.1 | 19.6 | 41.3 | 4.18 | 49.6 |
| media 82, los dos usan tensión | 40.1 | 18.7 | 41.1 | 4.31 | 50.4 |
| media 75, A no usa tensión (como «Saltar») | 25.7 | 17.4 | 56.9 | 4.37 | 41.4 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 40 | 8.1 | 51.9 | -0.5 / 2.5 |
| 68 | IA (equipo real o generado) | humano fuerte | 32 | 6.3 | 61.7 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | IA | 35.5 | 11.2 | 53.3 | -0.5 / 2.5 |
| 75 | IA (equipo real o generado) | humano fuerte | 27.9 | 7.3 | 64.7 | -0.5 / 2.5 |
| 82 | IA (equipo real o generado) | IA | 36.8 | 9.3 | 53.9 | -0.5 / 2.5 |
| 82 | IA (equipo real o generado) | humano fuerte | 30.7 | 8.2 | 61.1 | -0.5 / 2.5 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 35.8 | 40.2 | 80.5 |
| 0.9 | 28.4 | 32.7 | 75.5 |
| 0.75 | 20.5 | 27.5 | 67.5 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 38.9 | 19.1 | 42 |
| 80 / 72 | 0.8 | 57.7 | 17.6 | 24.7 |
| 80 / 72 | 0.7 | 64.4 | 15.5 | 20.1 |


Química media por carta: equipo base 2.5, rival de 70 2.5, rival de 88 3.8.


| Paso (media del rival) | Gana con 0 victorias previas | con 1 | con 2 |
|---|---|---|---|
| 1 (68) | 96.8 | 95.3 | 100 |
| 2 (70) | 87.8 | 92.3 | 100 |
| 3 (71) | 62.3 | 66 | 92.5 |
| 4 (73) | 21 | 31 | 65.3 |
| 5 (75) | 20.5 | 18.8 | 54.3 |
| 6 (77) | 3.3 | 6 | 29 |
| 7 (78) | 1.5 | 0.8 | 20.8 |
| 8 (80) | 0 | 1.3 | 11.8 |
## 7. Expedición: un jugador razonable (fichaje si mejora su peor carta, si no refuerzo), contra los 8 rivales (68 → 80)

| Victorias medias de 8 | Llega a 8 victorias | Se queda en 0–2 | Se queda en 3–5 |
|---|---|---|---|
| 7.02 | 57.2 | 5.7 | 5.9 |

| Victorias | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| % | 0 | 2.9 | 2.8 | 1.2 | 2 | 2.7 | 7.7 | 23.6 | 57.2 |

## Indicadores fuera de rango

- ⚠ Condiciones reales (media 75, humano fuerte): gana 27.9 % (28–65; química media -0.5 contra 2.5)
- ⚠ Expedición: victorias medias 7.02 (2–5: un jugador razonable llega a la mitad, sin ser trivial)
- ⚠ Expedición: completa 57.2 % (2–20 %: el premio grande debe ser raro)

Tiempo: 235 s.
