# Copia de zukan.inazuma.jp

Datos oficiales de Level-5 (Inazugle / *Player Codex* de Victory Road), descargados con `tools/db/fetch.py`
y guardados en el repo para no depender de la web. Para volver a descargarlos, borra el fichero y ejecuta el script.

| Fichero | Qué es |
|---|---|
| `chara_list.json` | Las 5.456 fichas de personajes: nº oficial (`no`), id de imagen (`id` → `https://dxi4wb638ujep.cloudfront.net/1/<id>.png`), nombre inglés, elemento, posición, rol (Player / Manager / Coach / Coordinator), edad, equipos, juegos donde sale y enlace a su ficha (`q`) |
| `chara_param.json` | Por nº: descripción oficial (inglés) y stats de Victory Road a nivel 50 (`vr_lv50`) |
| `chara_names_ja.json` | Id de imagen → nombre japonés |
| `skills.json` | Las 903 supertécnicas: nombre (inglés y japonés), tipos, descripción, imagen y vídeos |
| `formations.json` | Formaciones de Victory Road |
| `items.json` | Objetos: botas, pulseras, colgantes, especiales, equipaciones y emblemas |

*Inazuma Eleven* © Level-5 Inc. Uso fan, sin ánimo de lucro.
