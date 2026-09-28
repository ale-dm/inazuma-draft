# Duelo

Modo de la fase 4 (rama `app`). Código: `src/lib/duel.ts` (reglas y números), `src/components/modes/Duel.tsx`
(pantalla), `src/components/DuelCard.tsx` (carta con la columna de 3 números).

## Cómo funciona ahora (solo números y campos)

- **Números de cada carta** (columna de flechas a la derecha, como en MADFUT/FC):
  - verde **ataque** = tiro
  - azul **control** = control
  - rojo **defensa** = defensa (porteros: media de defensa y parada)
  - Se pueden poner a mano por carta en el CRUD oculto (`#/admin`, columnas `duel_att`, `duel_con`, `duel_def`;
    en blanco = se calculan).
- **Equipo**: un once. El portero no se juega como carta: se queda para los tiros. Las otras 10 son la mano.
- **Partido**: 7 jugadas. En cada una, los dos equipos juegan una carta de campo (cada carta, una vez):
  1. **Medio campo**: control contra control. Quien gana se lleva el balón (empate: la media; empate total: nadie).
  2. **Tiro**: el ataque de quien tiene el balón contra la media de la **defensa de la carta rival** y la **parada
     de su portero**. Gol si el ataque es mayor.
- La elección importa: una carta con mucho control gana el balón, pero si pierde el medio campo su defensa es la que
  tiene que parar el tiro.
- **La máquina** elige con peso en el control (0,5) y algo de ataque y defensa (0,25 cada uno) más azar.
- **Rival**: un equipo jugable del catálogo (mejor once de su plantilla) con la media a ±4 de la tuya.
- **Modos**: *Mi club* (una de Mis plantillas, eliges tú), *Simulación* (misma plantilla, juega la máquina por ti,
  resultado al momento) y *Draft* (draft MADFUT nuevo y a jugar).
- **Premio**: victoria 400 monedas + 60 XP · empate 150 + 30 · derrota 50 + 15. Cuenta para objetivos semanales y
  de carrera (`duelWins`).

## Supertécnicas: qué se podría hacer (sin hacer todavía)

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
