# Duelo

Todos los números y dónde cambiarlos: [balance-guide.md](balance-guide.md).

Modo de la fase 4 (rama `app`). La carta del duelo es `src/components/DuelCard.tsx` (la carta normal con los 3
números siempre a la vista y la diferencia por química/boost).

## Cómo funciona ahora: el Fatal de MADFUT

Reglas sacadas de la guía de Fatal de r/MADFUT (MADFUT 26). Código: `src/lib/fatal.ts` (reglas, máquina,
simulación), `src/lib/duel.ts` (números de cada carta), `src/components/modes/Duel.tsx` (pantallas).

### Números de cada carta (verde ataque, azul control, rojo defensa)
Con la escala de MADFUT: el número fuerte queda 1–3 por debajo de la media y **nunca la supera**; el flojo, muy por
debajo (Mbappé 91: 89/83/42 · De Bruyne 90: 86/89/64 · Guijarro 88: 84/83/86 · van Dijk 89: 67/70/87 ·
Donnarumma 89: 39/34/88).
1. **Perfil** según puesto y stats, con su plantilla (diferencia con la media [ataque, control, defensa]):
   delantero −2/−8/−44 · delantero de toque (más control que tiro) −4/−3/−40 · medio de ataque −5/−3/−30 · medio
   defensivo (más defensa que tiro y control) −8/−6/−3 · central −23/−20/−2 · carrilero (control + velocidad muy por
   encima de la defensa) −15/−9/−4 · portero −50/−54/−1.
2. **Ajuste propio**: (su stat afín − media) × 0,3, entre −6 y +2 (tiro → ataque, control → control, defensa →
   defensa; porteros: parada).
3. **Supertécnicas**: +1 por cada 2 del tipo del número (tiro, regate, bloqueo; parada solo en porteros), +2 como mucho.
4. **Tope**: media − 1; mínimo 20. Diferencia media con la media en el catálogo: delanteros 0/−9/−42 ·
   medios −5/−2/−31 · centrales −24/−21/0 · porteros −42/−43/0.
5. Si la carta tiene valores puestos a mano en el CRUD oculto (`duel_att/con/def`), mandan esos.

### En el partido
- **Química**: 3 rombos +2 a los 3 números, 2 → +1, 1 → 0, 0 → −3 (en la carta sale la diferencia).
- **Boost de la semana**: +2 a las cartas de un juego o de una afinidad (cambia cada lunes).
- **Mi club** (una de Mis plantillas) y **Draft** (draft nuevo; solo cuenta el once): 10 rondas. En cada una lleva
  un equipo (se alterna; el primero, al azar): elige carta y número. El otro responde viendo solo la **pista** de la
  carta (afinidad, escudo y juego, como la nación y el club en MADFUT): ataque contra defensa, defensa contra ataque,
  control contra control. Empate → suma de los 3 números; si sigue igual, nadie puntúa.
- **Desempate**: si tras las 10 rondas hay empate o 1 punto de diferencia, se enfrentan las cartas que quedan (suma de
  los 3): gana quien saque más de 5; si no, empate.
- **Simulación** (Fatal Sim y series de Simulación): partido pasivo de 90 minutos con 12 ocasiones; ver [fatal-sim.md](fatal-sim.md).
- **Pantalla** (como la batalla de MADFUT): el campo con tu once y sus números; deslizando (o con los botones de
  abajo) el del rival con las cartas **boca abajo**, cada una con una sola pista al azar (afinidad, juego o escudo, en
  lugar de bandera, liga o club). Las cartas jugadas se quedan en gris (las del rival, ya descubiertas). Arriba, los
  10 puntos de ronda en verde (tuya), rojo (del rival) o gris (nadie).
- **Rival**: la mitad de las veces un equipo real del catálogo (su mejor once, media a ±4 de la tuya) y la otra mitad
  uno generado, "Fatal IA": formación al azar y los 11 del mismo juego (química a tope), media cerca de la tuya y, si
  puede, de la misma afinidad.
- **La máquina**: cuando lleva, juega una carta de "clase media" con su mejor número (como aconseja la guía); cuando
  responde, estima tu número por la pista de tu carta (tus cartas que comparten esa afinidad, juego o equipo) y juega la carta más floja que lo supera, o "tira" la peor.
- **Premio**: victoria 400 monedas + 60 XP · empate 150 + 30 · derrota 50 + 15.

## Supertécnicas y flujo de cada ronda (hecho)
Cada ronda tiene pasos con pausa y animaciones (ventana `ds-*` en `Duel.tsx`):
1. **Elegir** carta en el campo (y el número si llevas tú).
2. **Preparar**: ventana con tu carta, el número y, si la carta tiene supertécnicas de ese tipo, botones para usar una
   (gasta tensión; el número sube en amarillo). «¡Jugar!» confirma, «Cambiar carta» vuelve.
3. **El rival elige** (puntos animados 1,4 s); si lleva el rival, también «piensa» 1,3 s antes de enseñar su pista.
4. **Revelación** en 3 tiempos: cartas sobre la mesa (rival boca abajo) → se da la vuelta → supertécnicas y números
   finales → veredicto (la ganadora se ilumina, la otra se apaga) con la tensión ganada. «Siguiente ronda» continúa;
   tocar fuera o «Saltar» adelanta la animación.
Reglas de tensión, combo y costes: [balance-guide.md](balance-guide.md) §2.6.

## Sonido, vibración y guía (hecho)
- **Sonidos** (`src/lib/sfx.ts`, mismo interruptor que el resto): al dar la vuelta la carta (`flip`), al subir supertécnicas
  (`tech`), al ganar o perder el punto (`win`/`lose`, `tick` en empate), y en el Sim el gol (`goal`/`lose`), el grito del
  portero (`shout`) y la parada (`tick`).
- **Vibración** (`buzz`): gol, encajar gol, empate y grito. En dispositivos sin vibración (iPhone, escritorio) no hace nada.
- **Guía** (`Tutorial.tsx`): tres pasos la primera vez que entras a cada modo (`ffi-tut-fatal-v1`, `ffi-tut-sim-v1`). Se
  puede saltar y no vuelve a salir.

## Otras ideas (sin hacer todavía)

Ya cuentan en los **números** de la carta (punto 3 de arriba); lo de abajo serían efectos dentro del partido.

Datos que ya tenemos por técnica: tipo (Tiro, Regate, Bloqueo, Parada), afinidad, coste de TP, rasgos (`traits`:
tiro largo, bloqueo de tiros, encadenable, despeje de puños) y, en los juegos, su potencia (`power` en WazaData, aún
sin importar). Ideas, de menos a más cambio:

1. **Bonus plano por tipo**: si la carta tiene una técnica del tipo que toca, +N al número de esa fase
   (Regate → control en el medio campo, Tiro → ataque, Bloqueo → defensa de la carta, Parada → portero).
   N fijo (p. ej. +5) o según el coste de TP (más TP, más bonus).
2. **Usar la técnica = gastar algo**: cada equipo tiene una barra de TP por partido; usar la supertécnica en una
   jugada da el bonus y gasta TP. Decisión extra: guardar TP para el final.
3. **Rasgos**: el **tiro largo** permite tirar aunque pierdas el medio campo (con −10); el **bloqueo de tiros** deja
   a la carta que defiende sumar su bloqueo aunque no sea defensa; **encadenable** permite que la siguiente carta
   remate el balón suelto; **despeje de puños** evita el rebote.
4. **Ventaja de afinidad** (Fuego > Bosque > Aire > Montaña > Fuego, como en `engine/sim.ts`): ±5 al número que se
   compara si la técnica o la carta tiene ventaja. Es barato de hacer y encaja con los iconos que ya se ven.
5. **Espíritus guerreros, Mixi Max y tótems** (`specials`): una vez por partido, "armadura" o "fusión" que sube los
   3 números de una carta durante una jugada.
6. **Cartas de técnica** coleccionables en sobres, que se equipan a las cartas del club (más adelante, con
   evoluciones).

Propuesta para empezar cuando toque: 1 + 4 (bonus por tipo según TP y ventaja de afinidad), porque no cambian la
interfaz: solo suman a los números que ya se comparan y se pueden enseñar en la línea de la jugada.
