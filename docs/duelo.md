# Duelo

Modo de la fase 4 (rama `app`). La carta del duelo es `src/components/DuelCard.tsx` (la carta normal con los 3
números siempre a la vista y la diferencia por química/boost).

## Cómo funciona ahora: el Fatal de MADFUT

Reglas sacadas de la guía de Fatal de r/MADFUT (MADFUT 26). Código: `src/lib/fatal.ts` (reglas, máquina,
simulación), `src/lib/duel.ts` (números de cada carta), `src/components/modes/Duel.tsx` (pantallas).

### Números de cada carta (verde ataque, azul control, rojo defensa)
1. Mezcla de sus stats afines: ataque = tiro 70 % + velocidad 15 % + control 15 %; control = control 60 % +
   velocidad 25 % + físico 15 %; defensa = defensa 60 % + físico 30 % + velocidad 10 % (porteros: parada 70 % +
   defensa 15 % + físico 15 %).
2. × lo que aprovecha su puesto [ataque, control, defensa]: FW 1 / 0,92 / 0,68 · MF 0,92 / 1 / 0,86 ·
   DF 0,8 / 0,9 / 1 · GK 0,5 / 0,72 / 1. Así un defensa o un portero con mucho tiro ya no "ataca" como un delantero.
3. + sus supertécnicas: cada una suma a su número (tiro → ataque, regate → control, bloqueo y parada → defensa;
   parada solo en porteros) 1 + TP/40 (el coste como medida de potencia), +1 si es tiro largo o bloqueo de tiros;
   como mucho +6 por número.
4. Tope: media + 8 (y 25–99). Medias del catálogo: GK 31/44/70 · DF 53/61/72 · MF 65/73/60 · FW 73/62/45.
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
- **Simulación** (con una de Mis plantillas, sin tocar nada): 6 ocasiones. En cada una, 1 de 3 cartas de control al
  azar de cada equipo (medios, laterales y extremos) se disputan el balón (empate = fuera); quien gana ataca con 1 de 3
  atacantes (delanteros; si hay menos de 3, se completa con medios) contra 1 de 3 defensas del otro (centrales,
  laterales y portero). Gol si el ataque es mayor.
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

## Supertécnicas en el partido: qué se podría hacer (sin hacer todavía)

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
