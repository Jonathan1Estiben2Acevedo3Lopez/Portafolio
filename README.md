# Portafolio Jonathan Acevedo

Portafolio personal construido con Astro, Tailwind CSS y JavaScript. El sitio muestra perfil profesional, proyectos, certificados, blog, intereses, experiencia, formacion academica y datos de contacto.

El contenido repetible se administra desde archivos JSON en `src/data`, para que agregar nuevos proyectos, certificados, articulos o intereses no requiera tocar la logica de renderizado.

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
npm run dev
npm run build
npm run preview
```

| Comando | Uso |
| --- | --- |
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
|   |-- data/
|   |   |-- about.json
|   |   |-- blog.json
|   |   |-- blog-details.js
|   |   |-- certificates.json
|   |   |-- interests.json
|   |   |-- project-details.js
|   |   `-- projects.json
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
| `src/data/projects.json` | Cards de proyectos. |
| `src/data/project-details.js` | Fichas completas de proyectos. |
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

Las cards salen de `src/data/projects.json`.

```json
{
  "slug": "mi-proyecto",
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
  }
}
```

Para crear la pagina interna `/proyectos/mi-proyecto`, tambien agrega el mismo `slug` en `src/data/project-details.js`.

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
