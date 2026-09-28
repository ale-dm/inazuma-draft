# TODO de la app (rama `app`)

Control de lo que falta por hacer. Plan y referencia de MADFUT: [plan-app.md](plan-app.md) · Diario de trabajo: [app-log.md](app-log.md).
Leyenda: `[x]` hecho · `[~]` en curso · `[ ]` pendiente.

## Fase 1 · Base
- [x] PWA instalable (manifest, iconos, service worker; caché de catálogo, fotos y fuentes)
- [x] Manifest con credenciales (instalable en las previews protegidas de Vercel)
- [x] Pantalla principal de 3 páginas deslizables + barra de nivel, cartas y monedas; en el orden de MADFUT (1 Sobres · 2 Draft · 3 Club)
- [x] Carta con estilo propio (nada de FIFA): media, icono de puesto, foto, afinidad y equipo; color por rareza de Victory Road (Common verde · Growing azul · Advanced morado · Top amarillo · Legendary naranja; sin Hero)
- [x] Iconos de Victory Road: puestos, afinidades, tipos de supertécnica, espíritu guerrero, Mixi Max, tótem
- [x] Fuera los emojis de la interfaz: iconos de línea (lucide) y moneda propia
- [x] Escudos de los equipos en la carta (Category:Team emblem images de la wiki: 171/187 equipos)
- [x] Iconos de Tiro largo y Bloqueo de tiros (rasgos `traits` de la técnica, del campo `chr` de WazaData: 40 tiros largos, 48 bloqueos)
- [x] Paneles inferiores: modo de juego y ajustes (idioma, sonido, tema)
- [x] Tema oscuro por defecto; fuera la portada antigua
- [x] Textos en inglés, español, francés e italiano

## Fase 2 · Draft MADFUT
- [x] Química nueva (estilo FC actual): mismo juego 4/6/8, misma afinidad 4/7/10, mismo equipo 2/4/7 → +1/+2/+3; 0–3 por jugador, 33 el equipo; capitán doble; ventana "Cómo funciona la química"
- [x] ~~Química por enlaces entre vecinos~~ (sustituida)
- [x] Química por jugador (0–3), del equipo (0–100) y bonus de capitán
- [x] Media del equipo (fórmula FUT)
- [x] Elegir formación (1 de 5) y capitán (1 de 5)
- [x] Tocar un hueco → elegir 1 de 5 jugadores de ese puesto (sin repetir personaje)
- [x] Campo con líneas de química de colores
- [x] Resumen (media y química) → jugar el torneo FFI con ese once
- [x] Banquillo (5 suplentes, 1 de 5 de cualquier puesto; entran al campo si el puesto coincide)
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
- [x] Duelo: Mi club, Simulación y Draft; solo números (ataque/control/defensa) y portero. Supertécnicas y afinidad: ideas en [duelo.md](duelo.md)
- [ ] Duelo con supertécnicas y ventaja de afinidad (ver duelo.md)
- [x] Higher/Lower (media o un número de duelo; 50 monedas por acierto; récord)
- [x] Copas por saga (8 equipos: IE, GO, Ares/Orión, VR) y copa diaria de 4 equipos (mismos rivales para todos, 1 al día)
- [x] Puzzles de draft: diario + 30 numerados; 17 cartas fijas → química objetivo (siempre con solución)

## Herramientas
- [x] CRUD oculto (`#/admin` o 7 toques en el logo): cartas, stats, números de duelo, técnicas; crear/borrar; exportar a `data/card_edits.json` (build.py lo aplica)

## Fase 5 · Retos y evoluciones
- [ ] Retos (SBC) con duplicados
- [ ] Evoluciones con las formas reales (Mixi Max, espíritu guerrero, armadura)
- [ ] Insignias (escudos de equipos) y logros

## Fase 6 · Cuentas y nube (Supabase)
- [ ] Inicio de sesión
- [ ] Colección y monedas en la nube; sobres tirados en el servidor
- [ ] Códigos canjeables; copia de seguridad

## Fase 7 · Social
- [ ] Intercambios con lista de deseos y mensajes predefinidos
- [ ] Ranking semanal de draft; copas online
