# TODO de la app (rama `app`)

Control de lo que falta por hacer. Plan y referencia de MADFUT: [plan-app.md](plan-app.md) · Diario de trabajo: [app-log.md](app-log.md).
Leyenda: `[x]` hecho · `[~]` en curso · `[ ]` pendiente.

## Fase 1 · Base
- [x] PWA instalable (manifest, iconos, service worker; caché de catálogo, fotos y fuentes)
- [x] Manifest con credenciales (instalable en las previews protegidas de Vercel)
- [x] Pantalla principal de 3 páginas deslizables + barra de nivel, títulos y cartas
- [x] Carta con estilo propio (nada de FIFA): media, icono de puesto, foto, afinidad y equipo; color por rareza de Victory Road (Common verde · Growing azul · Advanced morado · Top amarillo · Legendary naranja; sin Hero)
- [x] Iconos de Victory Road: puestos, afinidades, tipos de supertécnica, espíritu guerrero, Mixi Max, tótem
- [ ] Escudos de los equipos en la carta (la wiki solo tiene los de unos 12 equipos de Victory Road)
- [ ] Iconos de Tiro largo y Bloqueo de tiros (hay imagen, falta saber qué técnicas lo son: dato `zukan_types`)
- [x] Paneles inferiores: modo de juego y ajustes (idioma, sonido, tema)
- [x] Tema oscuro por defecto; fuera la portada antigua
- [x] Textos en inglés, español, francés e italiano

## Fase 2 · Draft MADFUT
- [x] Química: enlaces entre puestos vecinos; verde (2 coincidencias de equipo / juego / elemento), amarillo (1), rojo (0)
- [x] Química por jugador (0–3), del equipo (0–100) y bonus de capitán
- [x] Media del equipo (fórmula FUT)
- [x] Elegir formación (1 de 5) y capitán (1 de 5)
- [x] Tocar un hueco → elegir 1 de 5 jugadores de ese puesto (sin repetir personaje)
- [x] Campo con líneas de química de colores
- [x] Resumen (media y química) → jugar el torneo FFI con ese once
- [x] Banquillo (5 suplentes, 1 de 5 de cualquier puesto; entran al campo si el puesto coincide)
- [x] Cambiar jugadores de sitio en el campo (mismo puesto; el capitán va con su carta)
- [x] La química influye en la simulación del partido (−5 % a +5 % de fuerza; 50 = neutro)
- [ ] Guardar un draft y jugarlo más tarde (con la economía local, fase 3)
- [x] Texto del panel grande válido para los dos modos

## Arreglos y revisiones
- [x] Imágenes de la wiki (Fandom) bloqueadas por el Referer → `<meta name="referrer" content="no-referrer">`
- [ ] Llevar ese arreglo también a `main` (la web actual tiene ~85 imágenes de la wiki rotas por lo mismo)
- [x] Revisar las cartas con iniciales: las 6.074 URL de imagen responden bien (eran fotos aún cargando en el navegador de pruebas)

## Fase 3 · Economía local
- [x] Monedas y XP por jugar (torneo: grupos 250 · semis 500 · final 800 + sobre · campeón 1.500 + sobre Oro)
- [x] Sobres con probabilidades por rareza (Bronce, Plata, Oro, Leyenda y por saga) y apertura animada
- [ ] Sobres por elemento y por equipo
- [x] Mis cartas: colección con filtros, repetidas (×N) y venta rápida
- [x] Colecciones: cada equipo de cada juego, % y premio al 100 % (2.000 + sobre Oro)
- [x] Premio diario con racha de 7 días y 5 objetivos del día
- [ ] Objetivos semanales y de carrera
- [x] Draft FFI, alineación, torneo, resultado y jugadores dentro del marco nuevo (fuera la barra y el pie antiguos; créditos en Ajustes)
- [ ] Rediseño por dentro del torneo, la alineación y el explorador de jugadores (siguen con los paneles antiguos)

## Fase 4 · Modos
- [ ] Duelo (Fatal con supertécnicas y ventaja de elemento)
- [ ] Higher/Lower
- [ ] Copas por saga y copa diaria de 4 equipos
- [ ] Puzzles de draft (cartas fijas → 100 de química)

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
