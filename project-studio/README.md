# Project Studio

Project Studio es una app local de escritorio para administrar los proyectos del portafolio sin editar JSON a mano.

## Requisitos

- Node.js y npm.
- Rust y Cargo instalados en `PATH` para ejecutar Tauri v2.
- El portafolio debe mantenerse como sitio estatico Astro.

Si `cargo --version` o `rustc --version` fallan, Tauri no puede arrancar. En Windows puedes instalar Rust con:

```powershell
winget install Rustlang.Rustup
```

Despues cierra y abre de nuevo PowerShell. Verifica:

```powershell
cargo --version
rustc --version
```

## Comandos

Desde la raiz del portafolio:

```bash
npm run studio:dev
npm run studio:build
npm run tauri:dev
npm run tauri:build
```

Desde esta carpeta:

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

## Que modifica

La app solo trabaja dentro del repositorio actual:

- `src/content/projects/*.json`
- `public/projects/[slug]/*`
- `project-studio/data/technologies.json`
- `src/data/projects.generated.json` mediante `npm run sync:projects`

No ejecuta Git, no crea commits y no hace push.

## Flujo

1. Abre Project Studio.
2. Usa "Nuevo proyecto" o edita/duplica uno existente.
3. Completa el wizard: categoria, informacion, media, tecnologias, modulos, visual y preview.
4. Haz clic en "Guardar y actualizar portafolio".
5. La app guarda el JSON, copia assets locales, ejecuta `npm run sync:projects` y abre `http://localhost:4321/proyectos/[slug]`.

Para que la preview externa abra correctamente, manten el servidor Astro corriendo con:

```bash
npm run dev
```

Si Astro arranca en otro puerto porque `4321` esta ocupado, por ejemplo `4322`, inicia Project Studio asi:

```powershell
$env:PORTFOLIO_PREVIEW_URL="http://localhost:4322"; npm run studio:dev
```

## Formato de proyectos

Project Studio escribe un formato extendido con:

- `visualTemplate`
- `featuredLevel`
- `status`
- `stack`
- `media`
- `visualOptions`
- `modulesOrder`
- `modules`
- `githubUrl`
- `priority`
- `pinned`

Tambien mantiene campos compatibles con el portafolio actual: `href`, `previewImage`, `visualClass`, `copy.es`, `copy.en`, `detail.es`, `detail.en`, `detail.stack`, `detail.media` y `detail.links`.
