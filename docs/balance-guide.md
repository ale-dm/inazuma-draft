# Guía de balance: cómo funciona todo y dónde tocarlo

Referencia única para equilibrar el juego. Cada sección dice **qué hace**, **con qué números** y **en qué archivo está
cada número** (`archivo` · `constante`). Si cambias un número, cambia también esta guía. Documentos de detalle:
[duelo.md](duelo.md) (Fatal clásico), [fatal-sim.md](fatal-sim.md) (Fatal Sim), [balance-tp.md](balance-tp.md)
(TP de técnicas), [tension-vr.md](tension-vr.md) (ideas), [plan-base-jugadores.md](plan-base-jugadores.md) (OVR).

Todo el estado del jugador (monedas, cartas, progreso) vive en el navegador (`localStorage`, clave `ffi-club-v1`,
`src/lib/club.ts`). La base (Supabase) solo guarda las cartas, técnicas y equipos.

---

## 1. Cartas: OVR, rareza y números de duelo

### 1.1 OVR y rareza (datos, no código de la app)
- El OVR sale del generador (`tools/db`, ver [plan-base-jugadores.md](plan-base-jugadores.md) §3): stats de los juegos
  → pesos por puesto → niveles S/A/B/C → ajustes (+0,5 × época, destacados de la comunidad). Mediana ≈ 61–64, p90 ≈ 79,
  máx. 92 (cartas base, techo 94).
- **Rareza** por OVR: Legendary 89–94 · Top 83–88 · Advanced 75–82 · Growing 65–74 · Common < 65. Se guarda en la carta
  (`category`). Colores en `src/lib/packs.ts` · `RARITY_CLASS`.
- Para cambiar un OVR concreto: CRUD de `#/admin` (cartas) o `data/overrides.json` + `build.py`.

### 1.2 Números de duelo (ataque / control / defensa) — `src/lib/duel.ts`
Se calculan de cada carta, sin guardarse (salvo valores manuales `duel_att/con/def` del CRUD, que mandan siempre):
1. **Perfil** (`duelProfile`): delantero de tiro `FW-st`, delantero de toque `FW-cr` (control > tiro), medio de ataque
   `MF-at`, medio defensivo `MF-df` (defensa > max(tiro, control)), central `DF-cb`, carrilero `DF-wb`
   (control + velocidad > 2·defensa + 6), portero `GK`.
2. **Plantilla** `TEMPLATE` (diferencia con el OVR, [ataque, control, defensa]): FW-st −2/−8/−44 · FW-cr −4/−3/−40 ·
   MF-at −5/−3/−30 · MF-df −8/−6/−3 · DF-cb −23/−20/−2 · DF-wb −15/−9/−4 · GK −50/−54/−1.
3. **Ajuste propio**: `round((stat afín − OVR) × 0,3)` entre −6 y +2 (tiro→ataque, control→control, defensa→defensa;
   portero: parada).
4. **Supertécnicas**: `+min(2, floor(nº de técnicas del tipo / 2))` (Tiro→ataque, Regate→control, Bloqueo→defensa,
   Parada→defensa solo en porteros).
5. **Tope**: nunca por encima de `OVR − 1`; mínimo 20.

Palancas: subir/bajar una fila de `TEMPLATE` mueve a todo un perfil; el 0,3 y el rango −6/+2 controlan cuánto separan
las stats individuales; el +2 de técnicas, cuánto pesan.

### 1.3 Química (`src/lib/chemistry.ts`)
- Tres grupos: **juego** (liga), **afinidad** (nación), **equipo** (club). Cada jugador del once suma 0–3 por grupo
  según cuántos del once comparten valor (el **capitán cuenta doble**); el total por jugador se limita a 3 (`MAX_PLAYER_CHEM`);
  equipo 0–33.
- Umbrales `THRESHOLDS` (jugadores para +1/+2/+3): juego 4/6/8 · afinidad 4/7/10 · equipo 2/4/7. Ajustados con 400
  onces al azar (media ≈ 10/33). Equipo sin nombre (`Unaffiliated`, `Sub Character`) no suma química de equipo.
- **Media del equipo** `teamRating`: `floor((suma + Σ máx(0, OVR − media)) / n)` (fórmula FUT; en el draft cuentan
  titulares + suplentes).

### 1.4 Modificadores en el partido (`src/lib/fatal.ts`)
- **Química** → `CHEM_MOD = [−3, 0, +1, +2]` (0, 1, 2, 3 rombos) a los 3 números.
- **Boost semanal** `weeklyBoost`: +2 a las cartas de un juego o de una afinidad; alterna y rota cada lunes
  (semana ISO). Cantidad: `amount: 2`.
- Los números finales se limitan a 1–99.

---

## 2. Modos de partido

### 2.1 Fatal clásico (Mi club y Draft «Fatal Classic») — `src/lib/fatal.ts`, `Duel.tsx`
- `FATAL_ROUNDS = 10` rondas; quien lleva alterna (el primero, al azar). Llevar: carta + número; responder: carta
  viendo solo la pista (afinidad/juego/escudo al azar). Pares: ataque↔defensa, control↔control. Empate de número →
  suma de los 3; si sigue igual, nadie puntúa.
- **Desempate** si la diferencia final es ≤ 1: carta restante de cada uno, suma de los 3, gana quien saque más de
  `TIEBREAK_MARGIN = 5`; si no, empate.
- **IA al llevar** (`aiLead`): carta de «clase media» con su mejor número. **IA al responder** (`aiRespond`): estima tu
  número con la media de tus cartas que comparten la pista, juega la más floja que la supera (margen aleatorio ±3) o
  tira la peor.
- **Rival** (`rivalTeam`): 50 % equipo real del catálogo (su mejor once, media a ±4 de la tuya; si no hay, los 5 más
  cercanos) y 50 % generado «Fatal IA» (`generatedRival`: formación al azar, 11 del mismo juego, mismo elemento si puede,
  OVR de cada carta a ±3 de tu media, escalando a ±7 y sin límite).
  Ojo: el equipo generado tiene química a tope (+2), por eso suele ser algo más fuerte que un equipo tuyo medio.

### 2.2 Fatal Sim — `fatal.ts` (`simulate`, `adaptRival`, `goalChance`), `SimMatch.tsx`
Detalle en [fatal-sim.md](fatal-sim.md). Resumen de números:
- `SIM_CHANCES = 12` ocasiones (`SIM_PER_HALF = 6` por parte), minutos al azar 1–44 y 46–89.
- Control: 3 cartas al azar de controladores de cada equipo, juega 1 al azar; más control gana el balón, empate =
  fuera.
- Ataque: 3 atacantes vs 3 defensas, 1 de cada; **gol con probabilidad** `goalChance(att, def) = clamp(0,08–0,8,
  1/(1+e^(−(att−def−5)/9)))`: igualados ≈ 35 %, +10 ≈ 65 %, −10 ≈ 12 %.
- **IA** `adaptRival(me, opp, pull = 1)`: suma/resta a todas sus cartas la diferencia entre tus medias de
  ataque/control/defensa y las suyas (`pull` 1 = las iguala; 0,75 = deja algo de ventaja a quien sea mejor).
- Puestos: atacantes ST/RW/LW/FW (+CM/MF si hay < 3), controladores CM/MF/LB/RB/LW/RW, defensas CB/GK/DF/LB/RB.
- Muestra media de ataque/control/defensa (`simTeamStats`) en el marcador.
- Medida de referencia (25 partidos de prueba con un equipo de OVR ~68): ≈ 3,4 goles/partido, reparto parejo.

### 2.3 Copas de draft (`src/lib/cups.ts`, `Cups.tsx`) — usan el motor antiguo `src/engine/sim.ts`
- Eliminatorias con tu último draft: por saga (8 equipos → `rounds: 3`) o diaria (`rounds: 2`, una vez al día,
  mismos rivales para todos: semilla `cup-<fecha>`, rivales de ≈ 80 de media).
- **Rivales**: de los equipos jugables de los juegos de la copa, `want = media − 3 + 3·ronda` (final +3 sobre la
  semifinal…); la diaria usa 80 fijo; tolerancia ±3.
- **Boost de copa** `CupBoost`: si el once tiene ≥ `min` (4) cartas de los juegos de la copa (o ≥ 4 juegos distintos en
  la diaria) → `+4` de química (máx. 33).
- **Resultado** `simulateMatch` (motor `engine/sim.ts`): fuerza = `Σ OVR del once × (1 + bonus afinidad + bonus
  química)`. Bonus de química `((química − 16,5)/16,5) × 5 %`; bonus de afinidad ±1,5 % por cada par con ventaja (tope
  ±12 %): Fuego > Bosque > Aire > Montaña > Fuego. Goles esperados `2,2 × proporción × 1,5` + ruido `±0,6`, tope 4–6.
  Eliminatoria: empate → penaltis (probabilidad por tirador `0,48 + (tiro − parada)/120 ± 0,06`, entre 0,18 y 0,82).
- **Premios**: `perRound` monedas por ronda ganada (diaria 300, sagas 250); campeón: `prize` (diaria 1000 + oro; saga
  1000 + su sobre de saga); XP: campeón 200, eliminado `40 × rondas jugadas`.

### 2.4 Otros modos
- **Higher/Lower** (`HigherLower.tsx`): compara OVR/ataque/control/defensa (aleatorio) de dos cartas; premio `racha ×
  HL_COINS (50)`.
- **Puzzles de draft** (`puzzles.ts`): `PUZZLE_COUNT = 30` + uno diario, `PUZZLE_REWARD = 500`, `DECOYS = 6`.
- **SBC** (`sbc.ts`): retos de entrega de cartas (tabla `SBCS`) con premio de monedas y/o sobre.

---

### 2.5 Tensión (Fatal Sim) — `src/lib/tension.ts`
- Barra 0–400 (`TENSION_MAX`), inicio 80, ganancias `TENSION_GAIN` (balón ganado 50 · perdido 25 · gol 50 · parada 25).
- Elegir carta: `PICK_COST` 100. Supertécnica: coste `TP × 2`, bonus `max(2, round(TP/17))` (+2 si coincide la afinidad).
- Táctica del descanso `TACTIC_MOD` 3 (`SimMatch.tsx`); IA: `AI_TECH_PROB` 0,35.
- Con TP 30–200: coste 60–400, bonus +2…+12. Para que las técnicas pesen más o menos: `techBonus` (divisor 17); para
  que se usen más o menos: `techCost` (factor 2) y `TENSION_GAIN`.

## 3. Progresión por modo de Fatal (`src/lib/fatal-series.ts`)

| Concepto | Valor |
|---|---|
| Partido contra la IA (Mi club, Sim por series) | victoria 3 · empate 1 · derrota 1 (`MATCH_POINTS`) |
| Series | 7 por modo; meta `SERIES_GOAL = 9` puntos |
| Mi club: medias máx. | 70, 75, 80, 84, 87, 90, X |
| Mi club: premios | ficha plata, sobre plata, ficha 80, sobre oro, ficha 85, sobre ×2, ficha 90 |
| Sim por series: medias máx. | 68, 74, 80, 84, 88, 91, X |
| Sim por series: premios | sobre plata, ficha 80, oro, ficha 85, ×2, ficha 88, leyenda |
| Fatal Draft (divisiones 3→2→1→élite) | victoria 3 · empate 1 · derrota 0 (`DRAFT_POINTS`); meta `DIV_GOAL = 9` |
| Premio al subir | 3→2: oro · 2→1: ×2 aleatorio · 1→élite: ficha 90 · en élite: 1500 monedas por victoria |
| Temporada | semana ISO (`isoWeek`); el progreso se reinicia cada lunes |

**Premio de cada partido** (`duelReward` en `duel.ts`, aplicado en `Duel.tsx`): victoria 400 monedas + 60 XP · empate
150 + 30 · derrota 50 + 15. Se suma también el contador `duels` / `duelWins` para objetivos.

Ritmo: una serie son 3 victorias (9 pts) como mínimo, 9 partidos si solo se pierde. Para ir más lento/rápido: cambiar
`SERIES_GOAL`/`DIV_GOAL` o los puntos por resultado.

---

## 4. Draft MADFUT (`src/lib/fut-draft.ts`, `src/components/futdraft/`)
- Formación (1 de `OPTIONS = 6` al azar de `FORMATIONS`), capitán (6 cartas Leyenda/Élite, pesos 1:2), cada puesto (1 de
  6 de esa posición), `BENCH = 7` suplentes (cuentan para la media) y `RESERVES = 5` (no cuentan).
- **Pesos de rareza por opción** (`RARITY_WEIGHT`): Legendary 8 · Top 22 · Advanced 35 · Growing 25 · Common 10.
- Sin personajes repetidos; las 6 opciones salen ordenadas por OVR. La semilla (`run-rng`) hace repetible una partida.
- **Resumen** (`src/lib/last-draft.ts`): puntos de draft = `Σ máx(0, OVR − 50)` del once `+ 5 × química`; niveles
  `TIERS`: bronce desde 0, plata 300, oro 400, élite 480; estrellas por media (66/74/82/90).
  Si cambias `RARITY_WEIGHT`, revisa estos umbrales.
- Se guarda siempre como «último draft» y alimenta Fatal Draft y las copas.

---

## 5. Economía (`src/lib/club.ts`, `packs.ts`, `store-extra.ts`, `objectives.ts`)

### 5.1 Entradas y salidas de monedas
- **Inicial**: `STARTER_COINS = 5000` + sobre `starter` (8 cartas, garantía Top).
- **Diario** (`DAILY`, racha de 7 días): 300, 400, 500, 700, 900, 1200, sobre oro.
- **Objetivos diarios** (`DAILY_OBJECTIVES`): draft 300 · 2 sobres 300 · química ≥ 24 500 · 1 victoria de duelo 400 ·
  1 victoria de copa → oro.
- **Semanales** (`WEEKLY_OBJECTIVES`): 5 drafts 1000 · 10 sobres 1000 · 3 victorias oro · 3 copas 1500 · 5 H/L 800 · 2
  copas ganadas 2000 + oro.
- **Carrera** (`CAREER_OBJECTIVES`): 10/50 drafts, 25/100 sobres, 10/50 duelos, 5 copas, 5 puzzles → monedas o
  sobres de oro/leyenda.
- **Colecciones** `COLLECTION_REWARD`: 2000 + oro. **Códigos** `CODES` (una vez cada uno). **Venta rápida** `QUICK_SELL`:
  Legendary 1000 · Top 400 · Advanced 150 · Growing 60 · Common 25 (nunca la última copia).
- **Sobre gratis** (`pack: free`, ilimitado): 9 cartas flojas; sus «puntos» (`Σ máx(0, OVR − 50)`) llenan una barra
  de `BONUS_GOAL = 500` → sobre oro. Es la única fuente sin tope: ver riesgo abajo.
- **Nivel**: `XP_PER_LEVEL = 200` (`progress.ts`).

### 5.2 Sobres (`PACKS` en `packs.ts`)
Probabilidades por rareza (%), garantías y precios:

| Sobre | Precio | Cartas | Rarezas (Com/Gro/Adv/Top/Leg) | Garantía |
|---|---|---|---|---|
| bronce | 500 | 5 | 60/35/5/–/– | – |
| plata | 1500 | 5 | –/55/38/6/1 | – |
| oro | 3500 | 5 | –/–/62/32/6 | Top |
| leyenda | 12000 | 3 | –/–/–/70/30 | Leyenda |
| saga (IE/GO/Ares-Orion/VR) | 2500 | 4 | como oro, solo esos juegos | – |
| afinidad (fuego/aire/bosque/montaña) | 2000 | 4 | como oro, solo esa afinidad | – |
| equipo de la semana | 3000 | 4 | –/20/45/28/7 | – |
| inicial (premio) | – | 8 | –/30/50/18/2 | Top |
| recompensa (premio) | – | 3 | –/40/45/13/2 | – |
| gratis | – | 9 | 62/30/7/0,9/0,1 | – |
| fichas: one-80/85/88/90, one-top, one-bronze, one-silver, ×2 | – | 1–2 | ver `PACKS` (OVR mín./máx.) | – |

- La rareza se sortea por carta y luego se elige una carta de esa rareza con foto, sin repetir personaje en el mismo
  sobre. La mejor carta se revela la última (walkout).
- **Sobres de hoy** (`OFFERS` en `store-extra.ts`): 4 de 7 al día (semilla = fecha), con stock; precios 0–4000.
- **Fichas**: 1 gratis al día (`FREE_TOKEN = one-80`); el resto sale de premios de Fatal/objetivos.

### 5.3 Riesgo conocido
El sobre gratis ilimitado + venta rápida puede generar monedas sin fin (cada sobre da cartas que se venden). Si hace
falta, topes: por día, cooldown (`freePack.last` ya se guarda) o quitar venta de sus cartas.

---

## 6. Técnicas y TP (`docs/balance-tp.md`, `data/technique_balance.json`)
- Tabla `techniques` (Supabase): `balance_tp`, `balance_power_min`, `balance_power_max` vienen de la hoja «Sheet2» del
  Excel. La app muestra `balance_tp` como el TP de la técnica (`CardInfo.tsx`).
- Escala TP → (potencia mín., máx.): 30→20/140 · 40→30/200 · 50→50/300 · 60→60/360 · 70→70/440 · 80→85/540 · 90→95/600 ·
  100→100/640 · 110→120/720 · 120→140/800 · 130→160/880 · 140→170/890 · 150→180/900 · 160→195/930 · 170→215/980 ·
  180→230/1000 · 190→250/1030 · 200→270/1080.
- Hoy las supertécnicas solo cuentan en los números de duelo (§1.2 punto 4). Ideas para usarlas con el nuevo TP y la
  tensión: [duelo.md](duelo.md) y [tension-vr.md](tension-vr.md).
- Regenerar: `python3 tools/db/balance_xlsx.py hoja.xlsx` → carga con `db-load.yml` (`balance_only`). Casos dudosos en
  `docs/balance-tp.md`.

---

## 7. Cómo medir un cambio (receta)
1. `npm run build && npx vite preview --port 4173`.
2. Seed de un «último draft» en `localStorage` (`ffi-last-draft-v1`) y repetir `#/duelo/draftsim` pulsando «Saltar»;
   leer el marcador (`.sim-score`). Los scripts de prueba están en el historial de la sesión (`sim-many.mjs`):
   25 partidos dan una idea de goles/partido y de reparto.
3. Objetivos de referencia: Sim ≈ 3–4 goles por partido, reparto parejo con un equipo medio; Fatal clásico: 10 rondas con
   victoria ≈ 50 % contra un equipo de media parecida; Draft: puntos medios ≈ 350 (plata/oro).
4. Para economía: sumar monedas/día de los objetivos (diarios ≈ 1500 + diario ≈ 300–1200) y compararlo con precios de
   sobres (§5.2).

## 8. Índice rápido de «mandos»

| Quiero cambiar… | Archivo · constante |
|---|---|
| Números de una carta por puesto | `duel.ts` · `TEMPLATE`, 0,3, −6/+2, +2 técnicas |
| Cuánto pesa la química | `fatal.ts` · `CHEM_MOD`; `chemistry.ts` · `THRESHOLDS` |
| Boost semanal | `fatal.ts` · `weeklyBoost` (`amount`) |
| Dificultad de la IA clásica | `fatal.ts` · `rivalTeam` (±4), `generatedRival`, `aiRespond` |
| Goles y equilibrio del Sim | `fatal.ts` · `goalChance`, `adaptRival(pull)`, `SIM_CHANCES`, `draw3` |
| Tensión, técnicas y táctica del Sim | `tension.ts` · `TENSION_*`, `PICK_COST`, `techCost`, `techBonus`; `SimMatch.tsx` · `TACTIC_MOD`, `AI_TECH_PROB`, `DECIDE_MS` |
| Duración del Sim | `SimMatch.tsx` · `TICK_MS`, `CONTROL_MS`, `SHOT_MS`, `HALF_MS` |
| Puntos y premios de Fatal | `fatal-series.ts` · `MATCH_POINTS`, `SERIES_GOAL`, `CLUB_SERIES`, `SIM_SERIES`, `DIVISION_REWARD` |
| Monedas/XP por partido | `duel.ts` · `duelReward` |
| Copas | `cups.ts` · `CUPS`, `cupOpponents`; motor `engine/sim.ts` |
| Rareza de las opciones del draft | `fut-draft.ts` · `RARITY_WEIGHT`, `OPTIONS`, `BENCH` |
| Puntos/niveles del draft | `last-draft.ts` · `draftPoints`, `TIERS` |
| Sobres y precios | `packs.ts` · `PACKS`; `store-extra.ts` · `OFFERS` |
| Premios diarios/objetivos | `objectives.ts` · `DAILY`, `*_OBJECTIVES`, `COLLECTION_REWARD` |
| Venta rápida | `club.ts` · `QUICK_SELL` |
| Sobre gratis | `store-extra.ts` · `BONUS_GOAL`, `packPoints`; `packs.ts` · `free` |
| TP/potencia de técnicas | Supabase + `data/technique_balance.json` |
