# Informe de equilibrio (generado)

Generado por `npm run balance` (`tools/balance`) con 1500 partidos por escenario, catálogo de build/players.json y azar con semilla. Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.

## 1. Duelo clásico: IA contra IA al mismo nivel

| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |
|---|---|---|---|---|---|
| 60 | 46.2 | 7.1 | 46.7 | 26.5 | 44.9 / 9.2 / 45.9 |
| 68 | 46.9 | 8.1 | 45 | 28.2 | 46.5 / 6.3 / 47.2 |
| 75 | 44.6 | 10.1 | 45.3 | 27.1 | 43.9 / 10.3 / 45.8 |
| 82 | 45.1 | 9.7 | 45.3 | 27.9 | 45.6 / 9.7 / 44.7 |
| 88 | 45.5 | 8.5 | 46 | 23.8 | 45.3 / 11.2 / 43.5 |

## 2. Duelo clásico: tú contra la IA (media 75)

| Tú juegas… | Ganas % | Empate % | Pierdes % |
|---|---|---|---|
| como un humano fuerte (ve el número exacto de la IA) | 38.1 | 8.4 | 53.5 |
| sin criterio (al azar) | 0.9 | 0.8 | 98.3 |

## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)

| Media A / B | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| 75 / 75 | 44.7 | 9.1 | 46.2 |
| 78 / 75 | 84.3 | 5.3 | 10.4 |
| 81 / 75 | 99.3 | 0.3 | 0.4 |
| 87 / 75 | 100 | 0 | 0 |

## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)

| A | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| solo IE1 | 96.2 | 1.1 | 2.7 |
| solo GO1 | 86.9 | 5 | 8.1 |
| solo VR | 87.7 | 6 | 6.3 |

## 5. Fatal Sim (12 ocasiones, 90 min)

| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |
|---|---|---|---|---|---|
| media 68, los dos usan tensión | 38.3 | 19.7 | 41.9 | 4.30 | 49.4 |
| media 82, los dos usan tensión | 41.3 | 18.7 | 40 | 4.37 | 50.8 |
| media 75, A no usa tensión (como «Saltar») | 26.9 | 16.5 | 56.6 | 4.43 | 41.7 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 45.7 | 6.3 | 48 | -0.5 / 2.1 |
| 68 | IA (equipo real o generado) | humano fuerte | 39.5 | 6.1 | 54.5 | -0.5 / 2.1 |
| 75 | IA (equipo real o generado) | IA | 40.3 | 11 | 48.7 | -0.4 / 2.2 |
| 75 | IA (equipo real o generado) | humano fuerte | 30.5 | 7.1 | 62.4 | -0.5 / 2.1 |
| 82 | IA (equipo real o generado) | IA | 39.9 | 9.7 | 50.4 | -0.5 / 2.2 |
| 82 | IA (equipo real o generado) | humano fuerte | 33.7 | 9.5 | 56.7 | -0.5 / 2.2 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 38.3 | 44.9 | 81.9 |
| 0.9 | 33.1 | 38 | 78.4 |
| 0.75 | 20.5 | 29.6 | 70.4 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 39.1 | 20 | 40.9 |
| 80 / 72 | 0.8 | 57.6 | 15.3 | 27.1 |
| 80 / 72 | 0.7 | 63 | 15.7 | 21.3 |


| Paso (media del rival) | Gana con 0 victorias previas | con 1 | con 2 |
|---|---|---|---|
| 1 (70) | 43.3 | 40 | 52.3 |
| 2 (73) | 16 | 10.3 | 10 |
| 3 (75) | 4.8 | 1.5 | 3 |
| 4 (78) | 0.3 | 0.5 | 0.3 |
| 5 (80) | 0 | 0 | 0 |
| 6 (83) | 0 | 0 | 0 |
| 7 (85) | 0 | 0 | 0 |
| 8 (88) | 0 | 0 | 0 |
## 7. Expedición: un jugador razonable (fichaje si mejora su peor carta, si no refuerzo), contra los 8 rivales (70 → 88)

| Victorias medias de 8 | Llega a 8 victorias | Se queda en 0–2 | Se queda en 3–5 |
|---|---|---|---|
| 0.61 | 0 | 100 | 0 |

| Victorias | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|---|
| % | 44.8 | 49.4 | 5.9 | 0 | 0 | 0 | 0 | 0 | 0 |

## Indicadores fuera de rango

- ⚠ Expedición: victorias medias 0.61 (2–5: un jugador razonable llega a la mitad, sin ser trivial)
- ⚠ Expedición: completa 0 % (2–20 %: el premio grande debe ser raro)

Tiempo: 392 s.
