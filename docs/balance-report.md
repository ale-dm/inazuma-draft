# Informe de equilibrio (generado)

Generado por `npm run balance` (`tools/balance`) con 400 partidos por escenario, catálogo de build/players.json y azar con semilla. Gana A = la parte que aparece primero. Rango de cada indicador entre paréntesis; fuera de rango se marca ⚠.

## 1. Duelo clásico: IA contra IA al mismo nivel

| Media | Gana A % | Empate % | Gana B % | Desempate % | con supertécnicas: A / E / B % |
|---|---|---|---|---|---|
| 60 | 41.5 | 8 | 50.5 | 23.5 | 47 / 8.8 / 44.3 |
| 68 | 44 | 8.3 | 47.8 | 25.8 | 47.3 / 7 / 45.8 |
| 75 | 41.5 | 9 | 49.5 | 27.3 | 49.3 / 7.8 / 43 |
| 82 | 47.8 | 10.8 | 41.5 | 26.5 | 39.5 / 10.8 / 49.8 |
| 88 | 45.3 | 11 | 43.8 | 25.5 | 47.3 / 8 / 44.8 |

## 2. Duelo clásico: tú contra la IA (media 75)

| Tú juegas… | Ganas % | Empate % | Pierdes % |
|---|---|---|---|
| como un humano fuerte (ve el número exacto de la IA) | 40.5 | 8 | 51.5 |
| sin criterio (al azar) | 0.5 | 0.8 | 98.8 |

## 3. Duelo clásico: sensibilidad a la media (IA contra IA, sin adaptar al rival; solo informativo)

| Media A / B | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| 75 / 75 | 45.5 | 10.5 | 44 |
| 78 / 75 | 87.5 | 5 | 7.5 |
| 81 / 75 | 98.8 | 0.8 | 0.5 |
| 87 / 75 | 100 | 0 | 0 |

## 4. Duelo clásico: sensibilidad a la química (un solo juego contra mezclado, misma media 75, sin adaptar; solo informativo)

| A | Gana A % | Empate % | Gana B % |
|---|---|---|---|
| solo IE1 | 95.8 | 1.5 | 2.8 |
| solo GO1 | 83.8 | 8 | 8.3 |
| solo VR | 88.5 | 5.5 | 6 |

## 5. Fatal Sim (12 ocasiones, 90 min)

| Escenario | Gana A % | Empate % | Gana B % | Goles/partido | Posesión A % |
|---|---|---|---|---|---|
| media 68, los dos usan tensión | 40.3 | 20.3 | 39.5 | 4.17 | 50.6 |
| media 82, los dos usan tensión | 40 | 20.8 | 39.3 | 4.29 | 49.9 |
| media 75, A no usa tensión (como «Saltar») | 24.8 | 19.8 | 55.5 | 4.51 | 42.4 |

## 5b. Duelo clásico en condiciones reales: tu equipo mezclado contra el rival que genera el juego

| Tu media | Rival | Juegas como | Ganas % | Empate % | Pierdes % | Química media por carta, tuya / rival antes de adaptarlo |
|---|---|---|---|---|---|---|
| 68 | IA (equipo real o generado) | IA | 51.8 | 7 | 41.3 | -0.5 / 2.6 |
| 68 | IA (equipo real o generado) | humano fuerte | 48 | 7 | 45 | -0.5 / 2.6 |
| 75 | IA (equipo real o generado) | IA | 48.5 | 13 | 38.5 | -0.4 / 2.6 |
| 75 | IA (equipo real o generado) | humano fuerte | 46.3 | 9.5 | 44.3 | -0.4 / 2.6 |
| 82 | IA (equipo real o generado) | IA | 48.8 | 9.8 | 41.5 | -0.5 / 2.6 |
| 82 | IA (equipo real o generado) | humano fuerte | 49.8 | 8 | 42.3 | -0.5 / 2.6 |

### Cuánto se adapta el rival del duelo (`DUEL_PULL`), media 75

| pull | Humano fuerte gana % | IA gana % | Equipo con más química (+1,5 de media) gana % |
|---|---|---|---|
| 1 | 43.8 | 41 | 79.3 |
| 0.9 | 36 | 37.5 | 77.8 |
| 0.75 | 24.3 | 27 | 70.8 |

## 6. Fatal Sim: ventaja de ir mejor equipado según cuánto se adapta la IA (`pull`)

| Media A / B | pull | Gana A % | Empate % | Gana B % |
|---|---|---|---|---|
| 80 / 72 | 1 | 42 | 17.3 | 40.8 |
| 80 / 72 | 0.8 | 55.5 | 15.8 | 28.8 |
| 80 / 72 | 0.7 | 63.3 | 16.8 | 20 |

## Indicadores fuera de rango

- ⚠ Duelo espejo (media 60): gana A 41.5 % (42–58)
- ⚠ Duelo espejo (media 75): gana A 41.5 % (42–58)
- ⚠ Duelo espejo con supertécnicas (media 82): gana A 39.5 % (42–58)

Tiempo: 76 s.
