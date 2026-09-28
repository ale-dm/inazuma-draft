# Plan de la app (rama `app`): interfaz y modos al estilo MADFUT

Referencia: MADFUT 26 (Trivela Games, oct. 2025) y anteriores (MADFUT 24). Se copia la **estructura** (menús, flujo, sistemas),
no sus gráficos ni su marca.

## Qué tiene MADFUT

| Sistema | Cómo funciona en MADFUT | Versión Inazuma |
|---|---|---|
| **Pantalla principal** | 3 páginas que se deslizan; barra con nivel, monedas (MF), fichas LTM, escudo | Hecha (fase 1): nivel, títulos, cartas |
| **Draft** | Formación: 1 de 5 al azar. Capitán: 1 de 5. Resto: 1 de 5 por puesto. Nota del equipo + **química** (líneas rojo/amarillo/verde entre vecinos por liga, país o idioma) | Nuestro draft sortea equipo+juego. Añadir: elegir entre 5, capitán, **química por equipo / juego / elemento** |
| **Draft Cups** | Torneos cortos de draft con premios por ronda; recompensa en cuanto ya es matemáticamente tuya | El torneo FFI; añadir copas por saga (IE, GO, Ares/Orion, VR) |
| **Fatal** | 10 rondas: eliges jugador y si ataca, controla o defiende; el rival responde; gana la estadística | Muy Inazuma: jugador + **supertécnica** (tiro/regate/bloqueo/parada) contra la del rival |
| **Higher/Lower** | ¿La siguiente carta tiene más o menos nota/estadística? | Minijuego fácil con nuestro catálogo |
| **Sobres y tienda** | Sobres con monedas; varios guardados se abren a la vez | Sobres por saga/rareza; monedas ganadas jugando |
| **SBC (retos)** | Entregar cartas que cumplan condiciones (nota, química, liga, país) a cambio de premios | Retos: "11 de Fuego", "equipo del Raimon", "media 85"… |
| **Objetivos** | Tareas (nuevas / completadas / pendientes) con premio | Ganar el FFI, draftear 3 leyendas, completar un equipo… |
| **Evolutions** | Mejorar cartas jugando; Elite (semanales) y Standard (eliges tú) | Las formas: Mixi Max, espíritu guerrero, armadura (ya están en los datos) |
| **Mis cartas / Plantillas** | Club con filtros (puesto, país, liga, club, rareza, nota); plantillas propias | Club con filtros por juego, equipo, elemento y categoría |
| **Colecciones** | Conjuntos de cartas con % de progreso | Equipos completos (Raimon IE1, Orfeo…) y sagas |
| **Insignias** | Escudo del jugador: especiales, países, clubes | Escudos de los equipos de Inazuma |
| **Intercambios** | Desde el nivel 5; al azar, amigos o por usuario; lista de deseos y mensajes predefinidos | Necesita cuentas y servidor (Supabase Auth + Realtime) |
| **Códigos** | Códigos que dan premios | Fácil con una tabla en Supabase |
| **LTM** | Modos por tiempo limitado con cartas propias (Draft Duos, Fatal RTG) | Eventos por saga o personaje |

## Fases

1. **Base** (hecha en la rama): PWA instalable, pantalla principal de 3 páginas, carta FUT, ajustes.
2. **Draft y torneo con la nueva interfaz**: elegir 1 de 5, capitán, química por equipo/juego/elemento, nota del equipo.
3. **Club y progreso local**: monedas, sobres, mis cartas, colecciones, objetivos (guardado en el dispositivo).
4. **Modos**: Fatal (con supertécnicas) y Higher/Lower.
5. **Cuentas**: Supabase Auth, colección en la nube, sobres tirados en el servidor, códigos.
6. **Social**: intercambios y lista de deseos (Realtime).

## Fuentes

- [MADFUT 26 en App Store (descripción e historial de versiones)](https://apps.apple.com/us/app/madfut-26/id6752884808)
- [MADFUT 26 en Google Play](https://play.google.com/store/apps/details?id=com.trivela.madfut)
- [Madfut 24 – guía de juego (Talk Android)](https://www.talkandroid.com/33186-madfut-24-gameplay-guide/)
- [FUT Draft explicado (formación, capitán, 1 de 5)](https://fifauteam.com/draft-football-club-24/)
