# Informe de equilibrio (generado)

Generado por `npm run balance` (`tools/balance`) con 1000 partidos por escenario, catálogo de build/players.json y azar con semilla. Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.

## 1. Duelo clásico: IA contra IA al mismo nivel

| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |
|---|---|---|---|---|---|
| 60 | 47.6 | 6 | 46.4 | 25.2 | 46.3 / 7.1 / 46.6 |
| 68 | 44.5 | 8.1 | 47.4 | 27.8 | 45.1 / 7.4 / 47.5 |
| 75 | 45 | 10.7 | 44.3 | 26.6 | 45 / 10.7 / 44.3 |
| 82 | 42.7 | 10.6 | 46.7 | 25.3 | 44.6 / 11.5 / 43.9 |
| 88 | 46 | 8 | 46 | 20.4 | 44.4 / 9.3 / 46.3 |

## 2. Duelo clásico: tú contra la IA (media 75)

| Tú juegas… | Ganas % | Empate % | Pierdes % |
|---|---|---|---|
| como un humano fuerte (ve el número exacto de la IA) | 37.6 | 8.4 | 54 |
| sin criterio (al azar) | 1.2 | 0.6 | 98.2 |

## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)

| Media A / B | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| 75 / 75 | 45.4 | 8.5 | 46.1 |
| 78 / 75 | 86.2 | 4.9 | 8.9 |
| 81 / 75 | 99.5 | 0.4 | 0.1 |
| 87 / 75 | 100 | 0 | 0 |

## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)

| A | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| solo IE1 | 94.5 | 1.9 | 3.6 |
| solo GO1 | 86.8 | 4.6 | 8.6 |
| solo VR | 87.1 | 6.5 | 6.4 |

## 5. Fatal Sim (12 ocasiones, 90 min)

| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |
|---|---|---|---|---|---|
| media 68, los dos usan tensión | 39.7 | 16.8 | 43.5 | 4.33 | 49.8 |
| media 82, los dos usan tensión | 41.1 | 18.2 | 40.7 | 4.31 | 49.8 |
| media 75, A no usa tensión (como «Saltar») | 28.5 | 15.2 | 56.3 | 4.49 | 41.5 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 40.2 | 8.2 | 51.6 | -0.5 / 2.6 |
| 68 | IA (equipo real o generado) | humano fuerte | 33.9 | 6.1 | 60 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | IA | 34.5 | 12.6 | 52.9 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | humano fuerte | 30.7 | 8.8 | 60.5 | -0.4 / 2.6 |
| 82 | IA (equipo real o generado) | IA | 35.8 | 11.1 | 53.1 | -0.5 / 2.6 |
| 82 | IA (equipo real o generado) | humano fuerte | 29.7 | 9.2 | 61.1 | -0.5 / 2.6 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 35.7 | 44.6 | 79.3 |
| 0.9 | 28.3 | 36.3 | 77.9 |
| 0.75 | 20.1 | 28.1 | 72.2 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 42.4 | 17.4 | 40.2 |
| 80 / 72 | 0.8 | 54.8 | 17.3 | 27.9 |
| 80 / 72 | 0.7 | 63.2 | 15.7 | 21.1 |

## Indicadores fuera de rango

Ninguno.

Tiempo: 172 s.
