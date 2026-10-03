# TP balanceado de las técnicas (hoja «Sheet2» → Supabase)

Generado por `tools/db/balance_xlsx.py`. Se carga con `supabase/technique_balance.sql` (columnas `balance_tp`, `balance_power_min`, `balance_power_max` de `techniques`); la app enseña `balance_tp` como el TP de la técnica.

## Resumen

- Filas de la hoja: 792 · técnicas de la tabla con valor nuevo: 765 (de ellas, con TP distinto al anterior: 248)
- Filas con la potencia sin actualizar y corregida por la escala: 145
- Filas de la hoja sin pareja en la tabla: 2 · técnicas de la tabla sin fila en la hoja (se quedan como estaban): 13

## Escala TP → potencia

| TP | Mínima | Máxima | Filas de la hoja que la cumplen |
|---|---|---|---|
| 30 | 20 | 140 | 2 de 2 |
| 40 | 30 | 200 | 19 de 21 |
| 50 | 50 | 300 | 68 de 77 |
| 60 | 60 | 360 | 56 de 70 |
| 70 | 70 | 440 | 51 de 70 |
| 80 | 85 | 540 | 66 de 83 |
| 90 | 95 | 600 | 104 de 117 |
| 100 | 100 | 640 | 56 de 71 |
| 110 | 120 | 720 | 53 de 70 |
| 120 | 140 | 800 | 34 de 49 |
| 130 | 160 | 880 | 21 de 40 |
| 140 | 170 | 890 | 43 de 48 |
| 150 | 180 | 900 | 25 de 25 |
| 160 | 195 | 930 | 18 de 18 |
| 170 | 215 | 980 | 13 de 13 |
| 180 | 230 | 1000 | 11 de 11 |
| 190 | 250 | 1030 | 1 de 1 |
| 200 | 270 | 1080 | 6 de 6 |

## Casos dudosos (revisar)

- **Bala de cañón**: la hoja la repite con TP [130, 90]; elegido 130 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Búnker**: la hoja la repite con TP [160, 90]; elegido 160 (la de más TP); en la tabla tenía 130
- **Cabezazo fiero**: la hoja la repite con TP [90, 50]; elegido 50 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 130
- **Carrera relámpago**: cruzada por tipo y coste: la tabla la llama «Acelerrelámpago»
- **Chut al rojo vivo**: la hoja la repite con TP [110, 90]; elegido 110 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Colmillo de pantera**: la hoja la repite con TP [170, 90]; elegido 170 (la que ya tenía la tabla); en la tabla tenía 170
- **Electrotrampa**: cruzada por tipo y coste: la tabla la llama «Malla eléctrica»
- **Flecha de hielo**: la hoja la repite con TP [90, 70]; elegido 70 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Granizado de fuego alto**: la hoja la repite con TP [130, 90]; elegido 130 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Impulso de resolución**: la hoja la repite con TP [90, 70]; elegido 70 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Lanza polar**: la hoja la repite con TP [90, 70]; elegido 70 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Lluvia oscura**: una fila de la hoja para 2 variantes (ShadowRay_Forest, ShadowRay_Mountain): TP 170 en todas
- **Mano celestial**: 2 filas y 2 variantes: emparejadas por orden de TP (GodHand_Blue→60, GodHand→50)
- **Mano mágica**: 3 filas y 3 variantes: emparejadas por orden de TP (MajinTheHand_Blue→130, MajinTheHand_K→120, MajinTheHand→100)
- **Nudo atrapaosos**: tipo distinto en la hoja (Bloqueo) y en la tabla
- **Tiro teledirigido**: cruzada por tipo y coste: la tabla la llama «Tiro radiocontrol»
- **Tormenta de fuego**: una fila de la hoja para 2 variantes (BakunetsuStorm, BakunetsuStorm_K): TP 110 en todas
- **Trance temporal**: la hoja la repite con TP [130, 90]; elegido 130 (la fila con la potencia sin actualizar (editada)); en la tabla tenía 90
- **Ventisca de fuego**: una fila de la hoja para 2 variantes (FireBlizzard_Fire, FireBlizzard_Wind): TP 150 en todas

## Filas de la hoja sin pareja en la tabla (no se ha cambiado nada)

- Tiro a reacción (Tiro, coste —) · TP 180
- Tornado de pingüinos (Tiro, coste —) · TP 110

## Técnicas de la tabla sin fila en la hoja (se quedan como estaban)

- `AcrobatKeep` · Guardia acrobática (Regate) · TP 90
- `BicycleSword` · Chilena fulminante (Tiro) · TP 90
- `ColosseoGuard` · Guardia del coliseo (Parada) · TP 90
- `DeadStraight` · Contra (Tiro) · TP 90
- `DeepMist` · Niebla mística (Bloqueo) · TP 90
- `DokonjouBat` · Bateo total (Tiro) · TP 90
- `FuujinNoMai` · Danza del viento (Regate) · TP 90
- `TsubameGaeshi` · Ataque de garza (Regate) · TP 90
- `TsunamiWall` · Muralla tsunami (Parada) · TP 90
- `vr_whd00360` · Super pisotón de sumo (Bloqueo) · TP 90
- `vr_whk00800` · Presa de sombras (Parada) · TP 90
- `vr_whs00630` · Golf total (Tiro) · TP 90
- `vr_whs00920` · Tiro torre de Osaka (Tiro) · TP 80
