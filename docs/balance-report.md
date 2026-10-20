# Informe de equilibrio (generado)

Generado por `npm run balance` (`tools/balance`) con 1500 partidos por escenario, catálogo de build/players.json y azar con semilla. Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.

## 1. Duelo clásico: IA contra IA al mismo nivel

| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |
|---|---|---|---|---|---|
| 60 | 48.7 | 7.8 | 43.5 | 26.7 | 46.5 / 7.4 / 46.1 |
| 68 | 46.2 | 8 | 45.8 | 27.3 | 48.5 / 7.3 / 44.1 |
| 75 | 45.1 | 10.2 | 44.7 | 27 | 46.5 / 9 / 44.5 |
| 82 | 44.3 | 9.1 | 46.6 | 26.7 | 45.6 / 8.9 / 45.5 |
| 88 | 43.1 | 10.5 | 46.5 | 23.9 | 43.3 / 9.9 / 46.8 |

## 2. Duelo clásico: tú contra la IA (media 75)

| Tú juegas… | Ganas % | Empate % | Pierdes % |
|---|---|---|---|
| como un humano fuerte (ve el número exacto de la IA) | 39.3 | 8.1 | 52.7 |
| sin criterio (al azar) | 0.5 | 0.4 | 99.1 |

## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)

| Media A / B | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| 75 / 75 | 44.1 | 10.6 | 45.3 |
| 78 / 75 | 90.6 | 3.7 | 5.7 |
| 81 / 75 | 99.7 | 0.1 | 0.1 |
| 87 / 75 | 100 | 0 | 0 |

## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)

| A | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| solo IE1 | 76.7 | 3.3 | 20 |
| solo GO1 | 89.5 | 4.7 | 5.8 |
| solo VR | 82.7 | 8.3 | 9.1 |

## 5. Fatal Sim (12 ocasiones, 90 min)

| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |
|---|---|---|---|---|---|
| media 68, los dos usan tensión | 39.3 | 19.9 | 40.7 | 4.15 | 49.6 |
| media 82, los dos usan tensión | 40.6 | 18.5 | 40.9 | 4.28 | 49.4 |
| media 75, A no usa tensión (como «Saltar») | 29.3 | 16.7 | 54 | 4.28 | 41.8 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 36.5 | 8.4 | 55.1 | -0.5 / 2.6 |
| 68 | IA (equipo real o generado) | humano fuerte | 27.7 | 6.4 | 65.9 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | IA | 37.1 | 10.3 | 52.6 | -0.5 / 2.5 |
| 75 | IA (equipo real o generado) | humano fuerte | 29.3 | 9.2 | 61.5 | -0.5 / 2.5 |
| 82 | IA (equipo real o generado) | IA | 38.9 | 10 | 51.1 | -0.6 / 2.5 |
| 82 | IA (equipo real o generado) | humano fuerte | 30.4 | 9.5 | 60.1 | -0.5 / 2.5 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 34.9 | 44.1 | 80.3 |
| 0.9 | 29 | 40.6 | 77.9 |
| 0.75 | 21.7 | 26.3 | 69.2 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 39.4 | 17.9 | 42.7 |
| 80 / 72 | 0.8 | 59.9 | 16.1 | 24.1 |
| 80 / 72 | 0.7 | 63.3 | 15.2 | 21.5 |


Química media por carta: equipo base 2.4, rival de 70 4.0, rival de 88 2.0.


| Paso (media del rival) | Gana con 0 victorias previas | con 1 | con 2 |
|---|---|---|---|
| 1 (68) | 76 | 76.5 | 95.8 |
| 2 (70) | 56.3 | 61 | 90.3 |
| 3 (71) | 17.5 | 19.5 | 58.3 |
| 4 (73) | 5 | 5 | 22.3 |
| 5 (75) | 1 | 2.8 | 14.5 |
| 6 (77) | 0.5 | 0 | 7 |
| 7 (78) | 0 | 0 | 0.5 |
| 8 (80) | 0 | 0 | 0.3 |
## 7. Expedición: un jugador razonable (fichaje si mejora su peor carta, si no refuerzo), contra los 8 rivales (68 → 80)

| Victorias medias de 8 | Llega a 8 victorias | Se queda en 0–2 | Se queda en 3–5 |
|---|---|---|---|
| 2.61 | 4 | 63.1 | 21.9 |

| Victorias | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| % | 7.5 | 34.5 | 21.2 | 10.4 | 7.4 | 4.2 | 6.7 | 4.4 | 4 |

## Indicadores fuera de rango

- ⚠ Condiciones reales (media 68, humano fuerte): gana 27.7 % (28–65; química media -0.5 contra 2.6)

Tiempo: 192 s.
