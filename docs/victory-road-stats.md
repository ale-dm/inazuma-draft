# Stats de Victory Road

## Las 7 stats

En la pantalla del jugador, cada stat lleva la posición para la que cuenta:

| Stat | Posiciones | Entra en |
|---|---|---|
| Kick | FW | Shoot AT, Focus AT (×0,5) |
| Control | FW, MF | Shoot AT, Focus AT |
| Technique | MF | Focus AT, Focus DF |
| Pressure | DF | Scramble DF, Castle Wall DF, KP (×2) |
| Physical | GK, DF | Scramble AT, Castle Wall DF, KP (×3) |
| Agility | GK | Focus DF (×0,5), KP (×4) |
| Intelligence | DF, MF | Focus DF, Scramble AT, Scramble DF |

## Fórmulas de los duelos

| Valor | Fórmula |
|---|---|
| Shoot AT (tiro) | Kick + Control |
| Focus AT (regate / duelo) | (Control + Technique) + Kick × 0,5 |
| Focus DF | (Intelligence + Technique) + Agility × 0,5 |
| Scramble AT (balón dividido) | Physical + Intelligence |
| Scramble DF | Pressure + Intelligence |
| Castle Wall DF (bloqueo de tiro) | Physical + Pressure |
| KP (portero) | Agility × 4 + Physical × 3 + Pressure × 2 |
| Final Shot AT | (Shot AT × buffs) + (potencia de la supertécnica × buffs de AT) |
| Final KP | KP + (potencia de la supertécnica × buffs de DF) *(sin verificar)* |

## No son stats individuales

Las stats de Victory Road son una **plantilla por posición y rareza**, no de cada personaje:

- Zukan (`vr_lv50` en `data/zukan/chara_param.json`): 5.289 fichas de jugador y solo 30 combinaciones distintas. Axel = Victor; Jude = Byron = Riccardo; Jack = Nathan.
- Los datos del juego (Azalée, azalee.rosegriffon.fr/chara: lv1 y lv99 por variante, con `zukanHash` = id de zukan) confirman lo mismo. Mark Evans con rareza Normal tiene el lv99 de cualquier portero Normal (133/146/137/164/157/166/150). Solo cambia con la rareza (Normal, Expérimenté…).

Lo que sí distingue a un jugador en Victory Road es su **rareza** y sus **supertécnicas** (su potencia).

## Equivalencia con las stats de la carta (propuesta)

| Carta | Victory Road |
|---|---|
| Tiro | Shoot AT = Kick + Control |
| Control | Focus AT = Control + Technique + Kick × 0,5 |
| Defensa | media de Focus DF, Scramble DF y Castle Wall DF |
| Físico | Scramble AT = Physical + Intelligence |
| Velocidad | Agility |
| Parada | KP = Agility × 4 + Physical × 3 + Pressure × 2 |
