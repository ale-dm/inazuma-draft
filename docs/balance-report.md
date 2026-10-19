# Informe de equilibrio (generado)

Generado por `npm run balance` (`tools/balance`) con 1500 partidos por escenario, catálogo de build/players.json y azar con semilla. Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.

## 1. Duelo clásico: IA contra IA al mismo nivel

| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |
|---|---|---|---|---|---|
| 60 | 47 | 6.1 | 46.9 | 25 | 46.4 / 6.7 / 46.9 |
| 68 | 46.3 | 6.9 | 46.8 | 25.5 | 46.9 / 9 / 44.1 |
| 75 | 42.7 | 10.9 | 46.4 | 27.8 | 44.3 / 8.3 / 47.5 |
| 82 | 48.3 | 7.9 | 43.7 | 25.8 | 44.8 / 8.9 / 46.3 |
| 88 | 45 | 10.7 | 44.3 | 26.9 | 43.4 / 9.2 / 47.4 |

## 2. Duelo clásico: tú contra la IA (media 75)

| Tú juegas… | Ganas % | Empate % | Pierdes % |
|---|---|---|---|
| como un humano fuerte (ve el número exacto de la IA) | 37.7 | 7.3 | 55 |
| sin criterio (al azar) | 0.7 | 0.6 | 98.7 |

## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)

| Media A / B | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| 75 / 75 | 46.5 | 9.4 | 44.1 |
| 78 / 75 | 91.6 | 2.6 | 5.8 |
| 81 / 75 | 99.5 | 0.2 | 0.3 |
| 87 / 75 | 100 | 0 | 0 |

## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)

| A | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| solo IE1 | 73.1 | 5.1 | 21.7 |
| solo GO1 | 89.3 | 4.4 | 6.3 |
| solo VR | 82.5 | 7.5 | 10.1 |

## 5. Fatal Sim (12 ocasiones, 90 min)

| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |
|---|---|---|---|---|---|
| media 68, los dos usan tensión | 40.6 | 17.5 | 41.9 | 4.24 | 49.9 |
| media 82, los dos usan tensión | 39.7 | 17.7 | 42.6 | 4.37 | 49.4 |
| media 75, A no usa tensión (como «Saltar») | 26.7 | 17.4 | 55.9 | 4.21 | 41.4 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 39.1 | 8.6 | 52.3 | -0.5 / 2.6 |
| 68 | IA (equipo real o generado) | humano fuerte | 30.9 | 6.1 | 62.9 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | IA | 37 | 10.2 | 52.8 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | humano fuerte | 27.2 | 8.5 | 64.3 | -0.5 / 2.5 |
| 82 | IA (equipo real o generado) | IA | 32.6 | 9.9 | 57.5 | -0.5 / 2.5 |
| 82 | IA (equipo real o generado) | humano fuerte | 28.8 | 7.8 | 63.4 | -0.5 / 2.6 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 34.6 | 42.4 | 78.9 |
| 0.9 | 28.3 | 37.5 | 76.3 |
| 0.75 | 22.6 | 25.2 | 67.3 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 40.7 | 19.5 | 39.8 |
| 80 / 72 | 0.8 | 58.1 | 16.3 | 25.7 |
| 80 / 72 | 0.7 | 65.2 | 13.3 | 21.5 |


Química media por carta: equipo base 2.2, rival de 70 2.2, rival de 88 2.0.


| Paso (media del rival) | Gana con 0 victorias previas | con 1 | con 2 |
|---|---|---|---|
| 1 (68) | 86.8 | 90.5 | 98.8 |
| 2 (70) | 74.5 | 79.8 | 95 |
| 3 (71) | 32.5 | 41 | 70.3 |
| 4 (73) | 9.3 | 11.8 | 39 |
| 5 (75) | 7.5 | 9.8 | 34.5 |
| 6 (77) | 4.3 | 4 | 21.5 |
| 7 (78) | 0 | 0.5 | 7.5 |
| 8 (80) | 0 | 0 | 4.8 |
## 7. Expedición: un jugador razonable (fichaje si mejora su peor carta, si no refuerzo), contra los 8 rivales (68 → 80)

| Victorias medias de 8 | Llega a 8 victorias | Se queda en 0–2 | Se queda en 3–5 |
|---|---|---|---|
| 4.17 | 9.1 | 32 | 31.8 |

| Victorias | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| % | 2.2 | 15.2 | 14.7 | 15.4 | 4.9 | 11.5 | 14 | 13.3 | 9.1 |

## Indicadores fuera de rango

- ⚠ Condiciones reales (media 75, humano fuerte): gana 27.2 % (28–65; química media -0.5 contra 2.5)

Tiempo: 192 s.
