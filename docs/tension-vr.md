# Tensión e hiperenergía en Victory Road (recopilación)

Solo información, sin implementar todavía. Idea: usarlo para las supertécnicas del Duelo (ver [duelo.md](duelo.md)).
Fuentes al final.

## 1. Tensión (テンション) · la "barra de PT" del equipo
- **Sustituye a los PT** (TP) de los juegos anteriores. Ya no es de cada jugador: **una sola barra para todo el
  equipo**.
- **Máximo: 300.**
- **Cómo se gana**:
  - **Focus** (duelo cuerpo a cuerpo con el balón): el que gana **+60**, el que pierde **+30** (sin modificadores).
  - Se gana algo al defender cuando el rival cae en **fuera de juego**.
  - En la versión final, la **Scramble** (balón dividido) ya no da tensión: en la beta sí, y se abusaba de ella.
  - Ganar un Focus **con una supertécnica no da tensión** (lo mismo al terminar con un pase o con un tiro lejano).
  - **No hay objetos** que den tensión. Sí la cambian algunas **habilidades pasivas** (Tension_001…004, Knockout_004)
    y algunas **tácticas** (FUJIYAMA, Crescent Moon).
  - Si se **retiene el balón** mucho tiempo, el público abuchea y **baja la tensión**.
  - Desde la final del torneo β, los dos equipos **empiezan con un poco** de tensión.
- **Cómo se gasta**: cada supertécnica cuesta tensión **según su potencia** (en nuestros datos está el coste `cost`
  de cada técnica, que viene de los PT de los juegos anteriores).
  - El dilema de la barra compartida: gastarla en el tiro del delantero o guardarla para que el portero pueda parar.
- **Combo de técnica** (技巧コンボ): cada Focus ganado **con** supertécnica suma 1 nivel (máximo 3). Cada nivel sube
  el ataque del siguiente tiro y **abarata** su coste si es de tiro. Se pierde al perder el balón o al tirar.
- **Umbral del 30 %**: con 30 % de tensión o más se activan dos efectos al parar el portero:
  - **Knockout** ("Breach", 10 %): el % de tensión se suma al ataque del tiro, medido sobre el aguante del portero.
    Si entra, se gasta tensión.
  - **Shout** ("Save", 10 %): el portero para seguro y sin perder aguante.

## 2. Barra de "hype" de cada jugador
- Es aparte de la tensión y **cada jugador tiene la suya**: se llena con sus acciones buenas (regates, pases,
  entradas, paradas).
- Al usar una supertécnica, cuanto más llena está la barra, **más potencia y más probabilidad** de ganar el choque.
  - Llena del todo, sale **la versión más fuerte** (con la animación especial).

## 3. Hiperenergía: la barra hiperdimensional (超次元ゲージ)
- En inglés, **Hyper Power-Up** (超次元強化). Es una **barra** que se llena durante el partido. Llena, permite
  **2 potenciaciones** antes de tener que volver a llenarla. En las guías inglesas, "barra azul de tensión".
- **Tipos** (7):
  - Espíritu guerrero (Keshin)
  - Armadura (Keshin Armed), que cambia su hipertécnica por otra
  - Mixi Max
  - Tótem (Soul)
  - Kizuna Trans, nuevo: te transformas en un compañero y usas sus técnicas
  - Despertar (Awakening Power), nuevo
  - Mode Change
- **Despertar** (efectos del juego, para calibrar números):

  | Despertar | Efecto |
  |---|---|
  | Nekketsu Overdrive | AT/DF +30 %, tiro +20 %, Focus +20 %, más velocidad |
  | Keeper Konjou (portero) | AT/DF +40 %, +20 % de aguante |
  | Teppeki Guardian | AT +30 %, DF +50 %, muro +30 % |
  | Element Accel | AT/DF +30 %, Focus +20 %, ventaja de afinidad +20 % |
  | Time Boost | AT/DF +30 %, Focus +20 %, enfriamiento de técnicas −50 % |

## 4. Otros datos útiles
- **Aguante del portero** (Keeper Power, KP): es su barra de "vida".
  - Cada tiro parado le resta el ataque del tiro.
  - Si el tiro supera el aguante que le queda, es gol.
  - Se recarga cuando su equipo encaja.
- **Afinidades**: Fuego > Bosque > Aire > Montaña > Fuego. Si la técnica es de la misma afinidad que el jugador,
  sube mucho su potencia.
- **Tiro encadenado** (Shoot Chain): cualquier tiro puede encadenarse sobre otro, con su coste de tensión cada vez.

## 5. Cómo podría encajar en nuestro Duelo (propuesta, sin hacer)
1. **Barra de tensión por equipo** (0–300) en la barra fija de abajo del Duelo:
   - Empieza con 60.
   - Por ronda: **+60** a quien la gana y **+30** a quien la pierde (como en el Focus). En empate, +30 los dos.
2. **Usar supertécnica** al jugar una carta, si hay tensión suficiente.
   - Coste: el TP de la técnica. Técnicas de 20–60 PT → coste de 30 a 90, por ejemplo coste = PT × 1,5.
   - Efecto: **+4 a +8** al número de esa ronda según el coste (tiro → ataque, regate → control, bloqueo o parada →
     defensa).
   - Si la técnica es de la afinidad de la carta: **+2 extra**.
3. **Combo**: ganar una ronda con técnica abarata la siguiente (−10 % por nivel, hasta 3).
4. **Hiperenergía** (1 o 2 usos por partido): se llena con los puntos ganados.
   - Llena, una carta con espíritu guerrero, Mixi Max o tótem (`specials` en la base) sube **+5 sus 3 números** en
     esa ronda.
   - Con armadura (Keshin Armed), +7.
5. **Umbral del 30 %**: con 90 de tensión o más, un 10 % de "Knockout" (+3 al atacar) o de "Shout" (+3 al defender).

## Fuentes
- [Tension · Inazuma Eleven Wiki](https://inazuma-eleven.fandom.com/wiki/Tension)
- [Focus](https://inazuma-eleven.fandom.com/wiki/Focus) ·
  [Scramble](https://inazuma-eleven.fandom.com/wiki/Scramble) ·
  [Zone](https://inazuma-eleven.fandom.com/wiki/Zone)
- [Knockout](https://inazuma-eleven.fandom.com/wiki/Knockout) ·
  [Shout](https://inazuma-eleven.fandom.com/wiki/Shout) ·
  [Keeper Power](https://inazuma-eleven.fandom.com/wiki/Keeper_Power)
- [Awakening Power](https://inazuma-eleven.fandom.com/wiki/Awakening_Power) ·
  [Kizuna Trans](https://inazuma-eleven.fandom.com/wiki/Kizuna_Trans) ·
  [Victory Road (juego)](https://inazuma-eleven.fandom.com/wiki/Inazuma_Eleven_Eiyuutachi_no_Victory_Road_(game))
- [How Special Moves Work in Victory Road · Operation Sports](https://www.operationsports.com/how-special-moves-work-in-inazuma-eleven-victory-road/)
- [Inazuma Eleven: Victory Road Hissatsu · allthings.how](https://allthings.how/inazuma-eleven-victory-road-hissatsu-and-every-new-special-move/)
- [Keshin Armed · Steam discussions](https://steamcommunity.com/app/2799860/discussions/0/685237458700496563/)
