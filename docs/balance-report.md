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
| media 68, los dos usan tensión | 38.3 | 19.3 | 42.4 | 4.02 | 50 |
| media 82, los dos usan tensión | 42 | 18.1 | 39.9 | 4.02 | 49.8 |
| media 75, A no usa tensión (como «Saltar») | 26.1 | 18.7 | 55.2 | 4.10 | 42 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 46.5 | 6.4 | 47.1 | -0.5 / 2.1 |
| 68 | IA (equipo real o generado) | humano fuerte | 39.9 | 6.3 | 53.7 | -0.5 / 2.1 |
| 75 | IA (equipo real o generado) | IA | 37.5 | 11.1 | 51.4 | -0.4 / 2.1 |
| 75 | IA (equipo real o generado) | humano fuerte | 30.3 | 6.7 | 63.1 | -0.4 / 2.1 |
| 82 | IA (equipo real o generado) | IA | 39.1 | 9.8 | 51.1 | -0.5 / 2.2 |
| 82 | IA (equipo real o generado) | humano fuerte | 32.1 | 8.8 | 59.1 | -0.5 / 2.3 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 37.1 | 43.3 | 81.3 |
| 0.9 | 31 | 36.4 | 78.6 |
| 0.75 | 21.7 | 27.7 | 70.7 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 43.6 | 17.6 | 38.8 |
| 80 / 72 | 0.8 | 56.3 | 18.1 | 25.6 |
| 80 / 72 | 0.7 | 62.3 | 16.3 | 21.3 |

## Indicadores fuera de rango

Ninguno.

Tiempo: 245 s.
