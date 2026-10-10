# TODO de la app (rama `app`)

Control de lo que falta por hacer. Plan y referencia de MADFUT: [plan-app.md](plan-app.md) · Diario de trabajo: [app-log.md](app-log.md).
Leyenda: `[x]` hecho · `[~]` en curso · `[ ]` pendiente.

## Fase 1 · Base
- [x] PWA instalable (manifest, iconos, service worker; caché de catálogo, fotos y fuentes)
- [x] Manifest con credenciales (instalable en las previews protegidas de Vercel)
- [x] Pantalla principal de 3 páginas deslizables + barra de nivel, cartas y monedas; en el orden de MADFUT (1 Sobres · 2 Draft · 3 Club)
- [x] Carta con estilo propio (nada de FIFA): media, icono de puesto, foto, afinidad y equipo; color por rareza de Victory Road (Common verde · Growing azul · Advanced morado · Top amarillo · Legendary naranja; sin Hero)
- [x] Rediseño con la distribución de MADFUT: columna izquierda (media, puesto, afinidad, escudo), foto, nombre abajo y, a la derecha, los 3 números de duelo (botón en Mis cartas, Plantillas, Colecciones y Draft) o el juego de la carta
- [x] Iconos de Victory Road: puestos, afinidades, tipos de supertécnica, espíritu guerrero, Mixi Max, tótem
- [x] Fuera los emojis de la interfaz: iconos de línea (lucide) y moneda propia
- [x] Escudos de los equipos en la carta (Category:Team emblem images de la wiki: 171/187 equipos)
- [x] Escudo de la época de cada carta (Raimon de GO, Inazuma Japan de Orión, los de Victory Road…): 94 equipos cambian
- [x] Iconos de Tiro largo y Bloqueo de tiros (rasgos `traits` de la técnica, del campo `chr` de WazaData: 40 tiros largos, 48 bloqueos)
- [x] Paneles inferiores: modo de juego y ajustes (idioma, sonido, tema)
- [x] Tema oscuro por defecto; fuera la portada antigua
- [x] Textos en inglés, español, francés e italiano

## Fase 2 · Draft MADFUT
- [x] Química nueva (estilo FC actual): mismo juego 4/6/8, misma afinidad 4/7/10, mismo equipo 2/4/7 → +1/+2/+3; 0–3 por jugador, 33 el equipo; capitán doble; ventana "Cómo funciona la química"
- [x] ~~Química por enlaces entre vecinos~~ (sustituida)
- [x] Química por jugador (0–3), del equipo (0–100) y bonus de capitán
- [x] Media del equipo (fórmula FUT)
- [x] Elegir formación (1 de 6) y capitán (1 de 6)
- [x] Tocar un hueco → elegir 1 de 6 jugadores de ese puesto (sin repetir personaje)
- [x] Campo con líneas de química de colores
- [x] Resumen (media y química) → jugar el torneo FFI con ese once
- [x] Banquillo: 7 suplentes (cuentan para la media) y 5 reservas (no cuentan), 1 de 6 de cualquier puesto; entran al campo si el puesto coincide
- [x] Cambiar jugadores de sitio en el campo (mismo puesto; el capitán va con su carta)
- [x] La química influye en la simulación del partido (−5 % a +5 % de fuerza; 50 = neutro)
- [x] Guardar un draft y jugarlo más tarde (se guarda a cada paso; "Seguir el draft guardado" en Modos de draft)
- [x] Texto del panel grande válido para los dos modos

## Arreglos y revisiones
- [x] Imágenes de la wiki (Fandom) bloqueadas por el Referer → `<meta name="referrer" content="no-referrer">`
- [x] Llevar ese arreglo también a `main` (PR #53)
- [x] Revisar las cartas con iniciales: las 6.074 URL de imagen responden bien (eran fotos aún cargando en el navegador de pruebas)

## Fase 3 · Economía local
- [x] Monedas y XP por jugar (torneo: grupos 250 · semis 500 · final 800 + sobre · campeón 1.500 + sobre Oro)
- [x] Sobres con probabilidades por rareza (Bronce, Plata, Oro, Leyenda y por saga) y apertura animada
- [x] Sobres por afinidad (4) y del equipo de la semana (rota entre los 30 equipos con más cartas)
- [x] Mis cartas: colección con filtros, repetidas (×N) y venta rápida
- [x] Colecciones: cada equipo de cada juego, % y premio al 100 % (2.000 + sobre Oro)
- [x] Premio diario con racha de 7 días y 5 objetivos del día
- [x] Objetivos semanales (6, se reinician el lunes) y de carrera (10, por escalones)
- [x] Draft FFI, alineación, torneo, resultado y jugadores dentro del marco nuevo (fuera la barra y el pie antiguos; créditos en Ajustes)
- [x] Torneo, alineación y explorador con el estilo nuevo (paneles, cabeceras, botones y colores dentro del marco)
- [x] Tabla de clasificación (PJ G E P +/- Pts, clasificados en verde) y cuadro de semis y final con diseño propio

- [x] Mis plantillas: onces con tus cartas, con química y media
- [x] Estadísticas de duelo (ataque/control/defensa) calculadas y listas en `DuelCard` (falta el modo en sí, fase 4)

## Fase 4 · Modos
- [x] Duelo = Fatal de MADFUT: Mi club y Draft (10 rondas por turnos, pista, desempate), Simulación (6 ocasiones por puestos), química y boost semanal. Ver [duelo.md](duelo.md)
- [x] Números de duelo por puesto y con las supertécnicas (tipo, TP, tiro largo / bloqueo)
- [ ] Duelo con supertécnicas y ventaja de afinidad (ver duelo.md); tensión e hiperenergía de Victory Road recopiladas en [tension-vr.md](tension-vr.md)
- [x] Higher/Lower (media o un número de duelo; 50 monedas por acierto; récord)
- [x] Copas por saga (8 equipos: IE, GO, Ares/Orión, VR) y copa diaria de 4 equipos (mismos rivales para todos, 1 al día)
- [x] Puzzles de draft: diario + 30 numerados; 17 cartas fijas → química objetivo (siempre con solución)

## Como MADFUT (capturas del 29/09)
- [x] Fatal: pantalla propia con Mi club y Simulación por 7 series (media máxima del once, 9 puntos, premio) y Draft por divisiones (3 → 2 → 1 → élite); temporada semanal
- [x] Tienda con pestañas: Sobres de hoy (4 ofertas diarias con unidades y temporizador) + a la venta, Mis sobres, Fichas (ficha gratis al día)
- [x] Sobre básico gratis sin límite (panel Sobres y botón de arriba), 9 cartas flojas, barra de bonus (500 pts → sobre oro) y récord
- [x] Walkout en todos los sobres: la mejor carta sale poco a poco (afinidad → puesto → escudo → carta); al tocar, todas
- [x] Códigos canjeables y copia de seguridad (exportar / importar el club)
- [x] Números de duelo con la escala de MADFUT (el fuerte, media − 1 a − 3; nunca por encima)
- [ ] Intercambios (necesita cuentas, fase 6/7)

## Flujo de MADFUT (draft → resumen → Fatal Draft / copas)
- [x] Fuera el modo clásico (Draft FFI, Memoria, alineación, torneo, resultado, semillas y sus estadísticas)
- [x] «Draft» (inicio) va directo al draft; si hay uno a medias pregunta si seguirlo o empezar otro
- [x] Resumen del draft: media con estrellas, química, puntos de draft con récord y rango, juegos/equipos/afinidades, y abajo Fatal Draft y Copas de draft
- [x] El último draft queda guardado y se juega en Fatal Draft y en las copas hasta hacer otro
- [x] Fatal Draft: división, temporada, boost de la semana, escalera de divisiones con premios, Fatal Classic (duelos) y Fatal Sim (pronto)
- [x] Copas de draft con el último draft: tarjetas con rondas, premio y boost (si el once lo cumple, +4 de química)
- [x] Fatal Sim: partido pasivo de 6 ocasiones (control → ataque/defensa → gol) desde el Fatal Draft; ver [fatal-sim.md](fatal-sim.md)

## Técnicas: TP balanceado
- [x] Hoja «Sheet2» cruzada con la tabla `techniques`: `balance_tp` + potencias por la escala TP→potencia ([balance-tp.md](balance-tp.md))
- [x] La app enseña el TP balanceado (ficha de la carta) y el CRUD lo edita
- [ ] Revisar a mano en [balance-tp.md](balance-tp.md): los casos dudosos y 2 técnicas de la hoja que no existen en la tabla (Tiro a reacción, Tornado de pingüinos)
- [ ] Usar TP y potencia en el Duelo cuando se hagan las supertécnicas (ver [duelo.md](duelo.md) y [tension-vr.md](tension-vr.md))

## Herramientas
- [x] Nombres FR/IT: técnicas 740/513, equipos 133/107, espíritus 212/55 de 289 (wikis fr/it + enlaces entre idiomas de la inglesa). Sin fuente para las descripciones en FR/IT (zukan solo en inglés/japonés)
- [x] Carga más rápida: cada pantalla en su propio archivo (el inicial pasa de 514 a 355 kB)
- [x] Diseño unificado: explorador con la carta nueva, alineación del FFI con el mismo campo, colores de rareza de Victory Road en todas partes
- [x] CRUD (`#/admin` o 7 toques en el logo) **en tiempo real contra Supabase** (`supabase/admin.sql`): contraseña de admin, cartas (datos, stats, duelo, supertécnicas, textos), equipos (nombres en 4 idiomas, escudos), técnicas y cuerpo técnico; crear, cambiar y borrar; historial; los cambios se vuelven a aplicar tras cada recarga del catálogo

## Fase 5 · Retos e insignias
- [x] Retos (SBC) con repetidas: 8 retos (4 repetibles); media, mismo juego/equipo/afinidad, rarezas, juegos
- ~~Evoluciones~~ (descartadas: se hicieron y se quitaron a petición; ver app-log.md)
- [x] Insignias: escudo de cada colección completada (uno como escudo del club en la barra) y 17 logros

## Fase 6 · Cuentas y nube (Supabase)
- [ ] Inicio de sesión
- [ ] Colección y monedas en la nube; sobres tirados en el servidor
- [ ] Códigos canjeables; copia de seguridad

## Fase 7 · Social
- [ ] Intercambios con lista de deseos y mensajes predefinidos
- [ ] Ranking semanal de draft; copas online

- [x] Guía de balance con todos los números del juego y dónde tocarlos: [balance-guide.md](balance-guide.md)

- [x] Historial de Fatal (partidos, racha, forma, filtro por modo) en este dispositivo
- [ ] Retos semanales de Fatal (p. ej. «gana usando 3 supertécnicas», «gana sin gastar tensión») con premio
