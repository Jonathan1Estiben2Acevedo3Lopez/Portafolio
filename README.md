# Portafolio Jonathan Acevedo

Portafolio personal construido con Astro, Tailwind CSS y JavaScript. El sitio muestra perfil profesional, proyectos, certificados, blog, intereses, experiencia, formacion academica y datos de contacto.

El contenido repetible se administra desde archivos JSON. Los proyectos viven como archivos separados en `src/content/projects` y se sincronizan automaticamente a un JSON generado para la interfaz.

## Stack

- Astro
- Tailwind CSS
- JavaScript ES Modules
- CSS personalizado
- pdfjs-dist
- sharp

## Scripts

```bash
npm install
npm run new:project
npm run sync:projects
npm run dev
npm run build
npm run preview
```

| Comando | Uso |
| --- | --- |
| `npm run new:project` | Crea un proyecto nuevo con preguntas y sincroniza los datos. |
| `npm run sync:projects` | Regenera `src/data/projects.generated.json` desde `src/content/projects`. |
| `npm run dev` | Inicia el servidor local de desarrollo. |
| `npm run build` | Genera el sitio estatico en `dist`. |
| `npm run preview` | Previsualiza el build localmente. |

## Estructura

```text
.
|-- public/
|   |-- CV_Ejemplo.pdf
|   |-- docqee-preview.png
|   |-- favicon.svg
|   `-- pets/
|-- src/
|   |-- assets/
|   |-- certificados/
|   |-- content/
|   |   `-- projects/
|   |       |-- docqee.json
|   |       |-- launch-canvas.json
|   |       `-- portafolio-web.json
|   |-- data/
|   |   |-- about.json
|   |   |-- blog.json
|   |   |-- blog-details.js
|   |   |-- certificates.json
|   |   |-- interests.json
|   |   |-- project-details.js
|   |   `-- projects.generated.json
|   |-- pages/
|   |   |-- index.astro
|   |   |-- blog/[slug].astro
|   |   |-- certificados/ver.astro
|   |   `-- proyectos/[slug].astro
|   |-- scripts/
|   |   `-- portfolio.js
|   `-- styles/
|       `-- global.css
|-- astro.config.mjs
|-- package.json
|-- scripts/
|   |-- new-project.mjs
|   |-- project-utils.mjs
|   `-- sync-projects.mjs
|-- tailwind.config.mjs
`-- README.md
```

## Archivos Clave

| Archivo | Funcion |
| --- | --- |
| `src/pages/index.astro` | Estructura principal del portafolio. |
| `src/scripts/portfolio.js` | Render dinamico, filtros, idioma, tema e interacciones. |
| `src/styles/global.css` | Estilos globales, componentes, responsive y temas. |
| `src/data/about.json` | Formación académica y experiencia laboral. |
| `src/content/projects/*.json` | Fuente editable de proyectos y fichas. |
| `src/data/projects.generated.json` | Datos generados para la UI. No editar manualmente. |
| `src/data/project-details.js` | Adaptador que genera fichas desde `projects.generated.json`. |
| `src/data/certificates.json` | Certificados y archivos asociados. |
| `src/data/blog.json` | Entradas del blog. |
| `src/data/blog-details.js` | Adaptador para generar rutas del blog desde `blog.json`. |
| `src/data/interests.json` | Items de la seccion Intereses. |

## Contenido

### Sobre Mi

La seccion de formacion y experiencia sale de `src/data/about.json`.

```json
{
  "copy": {
    "es": {
      "title": "Sobre mi",
      "subtitle": "Formacion academica, recorrido universitario y experiencia laboral.",
      "groups": [
        {
          "title": "Formacion academica",
          "icon": "school",
          "items": []
        }
      ]
    }
  }
}
```

### Proyectos

Cada proyecto vive en un archivo separado dentro de `src/content/projects`. El archivo `src/data/projects.generated.json` se genera automaticamente desde esos proyectos y no se debe editar a mano.

#### Flujo recomendado

1. Guarda la imagen del proyecto en `public`, por ejemplo `public/mi-proyecto-preview.png`.
2. Crea el proyecto con el asistente:

```bash
npm run new:project
```

3. Responde las preguntas del asistente. Al terminar, se crea un archivo como `src/content/projects/mi-proyecto.json`.
4. Cuando el asistente pregunte `Cuantas capturas/imagenes tiene este proyecto?`, responde `0` si aun no tienes imagenes o el numero exacto si ya las tienes listas.
5. Revisa y ajusta ese archivo si quieres mejorar textos, stack, resultados, entregables, enlaces o medios.
6. Corre el sitio o compila:

```bash
npm run dev
```

o:

```bash
npm run build
```

Antes de iniciar o compilar, el proyecto ejecuta `npm run sync:projects` automaticamente. Eso actualiza `src/data/projects.generated.json`.

#### Crear un proyecto nuevo

```bash
npm run new:project
```

Ese comando crea el archivo del proyecto y actualiza el JSON generado.

#### Editar un proyecto existente

Edita directamente el archivo correspondiente en `src/content/projects`, por ejemplo:

```text
src/content/projects/portafolio-web.json
```

Luego puedes correr manualmente:

```bash
npm run sync:projects
```

Tambien puedes saltarte ese paso si despues vas a ejecutar `npm run dev`, `npm run build` o `npm run preview`, porque esos comandos sincronizan antes de arrancar.

#### Que hace cada campo importante

| Campo | Uso |
| --- | --- |
| `slug` | Identificador del proyecto y nombre de la ruta. Ejemplo: `/proyectos/mi-proyecto`. |
| `order` | Orden en que aparece. Un numero menor aparece antes. |
| `category` | Categoria usada por los filtros de la home. |
| `href` | Ruta interna de la ficha. Normalmente `/proyectos/slug`. |
| `liveUrl` | URL externa para `Interactuar` y `Abrir sitio`. |
| `previewImage` | Imagen ubicada en `public`. Se escribe con `/nombre.png`. |
| `visualClass` | Visual de respaldo si no hay imagen. |
| `showInHome` | Si es `false`, oculta la card en la home pero conserva la ficha. |
| `copy` | Textos cortos de la card en espanol e ingles. |
| `detail` | Contenido largo de la ficha interna. |
| `detail.es` | Textos narrativos principales de la ficha en espanol. |
| `detail.en` | Textos narrativos en ingles. Puedes dejar campos sin poner y se usara fallback al espanol. |
| `detail.stack` | Tecnologias o herramientas usadas. |
| `detail.media.images` | Capturas opcionales con `src`, `alt` y `caption`. |
| `detail.media.videos` | Videos opcionales con `src`, `poster`, `title` y `caption`. |
| `detail.links` | Enlaces opcionales: demo, repositorio, documentacion, video u otros. |

Ejemplo de proyecto con card y ficha:

```json
{
  "slug": "mi-proyecto",
  "order": 40,
  "category": "web",
  "year": "2026",
  "href": "/proyectos/mi-proyecto",
  "liveUrl": "https://example.com/",
  "previewImage": "/mi-proyecto-preview.png",
  "visualClass": "visual-control",
  "copy": {
    "es": {
      "title": "Mi Proyecto",
      "tag": "Proyecto personal",
      "description": "Descripcion corta del proyecto.",
      "accent": "Web"
    },
    "en": {
      "title": "My Project",
      "tag": "Personal project",
      "description": "Short project description.",
      "accent": "Web"
    }
  },
  "detail": {
    "category": "Web",
    "stack": ["Astro", "JavaScript"],
    "media": {
      "images": [
        {
          "src": "/mi-proyecto-preview.png",
          "alt": {
            "es": "Vista previa de Mi Proyecto",
            "en": "My Project preview"
          },
          "caption": {
            "es": "Pantalla principal del proyecto.",
            "en": "Project main screen."
          }
        }
      ]
    },
    "links": [
      {
        "type": "demo",
        "href": "https://example.com/",
        "label": {
          "es": "Abrir demo",
          "en": "Open demo"
        }
      }
    ],
    "liveUrl": "https://example.com/",
    "es": {
      "summary": "Resumen corto para la ficha.",
      "overview": "Descripcion larga del proyecto.",
      "challenge": "Reto principal.",
      "solution": "Solucion aplicada.",
      "process": ["Paso 1", "Paso 2"],
      "results": ["Resultado 1", "Resultado 2"],
      "deliverables": ["Landing", "Ficha", "Deploy"],
      "learnings": ["Aprendizaje 1"]
    },
    "en": {
      "summary": "Short case study summary.",
      "overview": "Long project description."
    }
  }
}
```

Si agregas `"detail"`, Astro genera automaticamente `/proyectos/mi-proyecto`. La ficha oculta por si sola las secciones vacias, asi que un proyecto puede tener `0`, `1` o varias capturas, videos opcionales o solo texto. Si quieres conservar la ficha pero ocultar la card en la home, agrega `"showInHome": false`.

Los archivos locales de imagen o video se guardan manualmente en `public` y se referencian con rutas como `/mi-captura.png` o `/demo.mp4`. Tambien puedes usar URLs externas. El comando no copia archivos automaticamente.

Categorias actuales: `web`, `branding`, `automation`.

### Certificados

Los certificados se registran en `src/data/certificates.json` y los archivos se guardan en `src/certificados`.

```json
{
  "id": "mi-certificado",
  "fileName": "mi_certificado.pdf",
  "type": "pdf",
  "mime": "application/pdf",
  "issued": "2026",
  "copy": {
    "es": {
      "title": "Mi certificado",
      "issuer": "Entidad emisora",
      "tags": ["PDF", "Curso"]
    },
    "en": {
      "title": "My certificate",
      "issuer": "Issuer",
      "tags": ["PDF", "Course"]
    }
  }
}
```

Tipos soportados: `pdf` e `image`.

### Blog

Las entradas salen de `src/data/blog.json`. Cada `slug` genera una ruta en `/blog/[slug]`.

```json
{
  "slug": "mi-articulo",
  "filter": "web",
  "visualClass": "visual-control",
  "copy": {
    "es": {
      "category": "Producto digital",
      "date": "Mayo 2026",
      "readTime": "4 min de lectura",
      "title": "Mi articulo",
      "excerpt": "Resumen corto.",
      "body": "Texto para la card destacada.",
      "introduction": "Introduccion del articulo.",
      "paragraphs": ["Parrafo 1", "Parrafo 2"],
      "highlights": ["Idea clave 1", "Idea clave 2"]
    },
    "en": {
      "category": "Digital product",
      "date": "May 2026",
      "title": "My post",
      "excerpt": "Short summary.",
      "body": "Featured card text."
    }
  }
}
```

Filtros actuales: `design`, `web`, `automation`, `content`.

### Intereses

Los items salen de `src/data/interests.json`.

```json
{
  "filter": "movies",
  "visualClass": "visual-cinema",
  "copy": {
    "es": {
      "category": "Peliculas",
      "title": "Titulo",
      "meta": "Genero / enfoque",
      "description": "Descripcion corta.",
      "body": "Texto ampliado.",
      "tags": ["Etiqueta 1", "Etiqueta 2"]
    },
    "en": {
      "category": "Movies",
      "title": "Title",
      "meta": "Genre / focus",
      "description": "Short description.",
      "body": "Expanded text.",
      "tags": ["Tag 1", "Tag 2"]
    }
  }
}
```

Filtros actuales: `movies`, `series`, `anime`, `books`, `games`.

## Estilos

Los estilos estan centralizados en `src/styles/global.css`.

Aqui se controlan:

- Variables de color.
- Tema claro y oscuro.
- Cards.
- Lineas de tiempo.
- Scrollbars.
- Animaciones.
- Responsive.
- Clases visuales como `visual-control`, `visual-launch`, `visual-brand`, `visual-cinema` y similares.

Si agregas una nueva `visualClass`, tambien debes crear sus estilos en `global.css`.

## Mantenimiento

- Ejecutar `npm run build` antes de publicar.
- Mantener los `slug` en minusculas, sin espacios y sin tildes.
- Guardar previews publicas en `public`.
- Guardar certificados protegidos en `src/certificados`.
- Si agregas una categoria o filtro nuevo, actualizar el boton correspondiente en `src/pages/index.astro` y sus textos en `src/scripts/portfolio.js`.
- Evitar duplicar informacion entre JSON y archivos de detalle cuando el mismo dato pueda reutilizarse.

## Despliegue

El sitio genera archivos estaticos en `dist`.

```bash
npm run build
```

La carpeta `dist` puede publicarse en Vercel, Netlify, Cloudflare Pages, GitHub Pages o cualquier hosting estatico.

## Atribuciones

Las mascotas animadas provienen de VS Code Pets. La atribucion se encuentra en:

```text
public/pets/vscode-pets/ATTRIBUTION.txt
```

## Autor

Jonathan Estiben Acevedo Lopez

- Email: <jonalopezacevedo@gmail.com>
- LinkedIn: <https://www.linkedin.com/in/jonathan-estiben-acevedo-l%C3%B3pez-066b3226a>
- GitHub: <https://github.com/Jonathan1Estiben2Acevedo3Lopez>
- GitLab: <https://gitlab.com/JonathanAcevedo>
