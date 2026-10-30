# Carta interactiva para Nina

## Cómo abrirla
1. Descomprime `carta-nina.zip`.
2. Abre `index.html` en Chrome, Edge u Opera.
3. Haz clic en el moño para abrir la carta.
4. Al final puedes volver al inicio o cerrar la carta.

## Cómo poner tus fotografías
Crea/usa la carpeta `assets` y coloca tus fotos con estos nombres:
- `nina-1.jpg` — foto principal de Nina, junto a la carta.
- `recuerdo-1.jpg`
- `recuerdo-2.jpg`
- `recuerdo-3.jpg`
- `recuerdo-4.jpg`
- `globo-1.jpg`, `globo-2.jpg`, `globo-3.jpg` — fotografías que se verán dentro de los globos del collage.

Se recomienda usar JPG o WebP y recortar las fotos antes si quieres un encuadre específico. Si una foto no existe, aparecerá una tarjeta de marcador indicando el nombre del archivo que debes reemplazar.

## Cómo editar las notas
Abre la página y haz clic sobre cualquier post-it para escribir encima. Para que el texto quede guardado permanentemente, edita el texto correspondiente en `index.html` y guarda el archivo.

## Cómo editar la carta
Abre `index.html` con un editor de texto (por ejemplo, Visual Studio Code) y busca `id="letterCopy"`. Edita los párrafos dentro de ese bloque. La página funciona sin instalar programas ni dependencias.

## Cómo cambiar el collage de globos
El diseño inicial simula globos azules con textura de collage. Si colocas `globo-1.jpg`, `globo-2.jpg` y `globo-3.jpg` dentro de `assets`, esas fotos aparecerán recortadas dentro de los globos. Sin esos archivos se muestran texturas de color de reserva.

## Publicarla
Puedes subir el contenido descomprimido a un repositorio de GitHub y activar GitHub Pages. No subas el ZIP como único archivo: sube los archivos y la carpeta `assets` para que la web pueda encontrarlos.
