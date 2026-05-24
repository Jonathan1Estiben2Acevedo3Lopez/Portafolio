use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::{
  process::{Command, Stdio},
  fs,
  net::{SocketAddr, TcpStream},
  path::{Path, PathBuf},
  time::Duration,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

const IMAGE_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp", "gif", "svg"];
const PREVIEW_SLUG: &str = "studio-preview";
const PREVIEW_PORT: u16 = 4321;
#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectExtraLinkInput {
  #[serde(rename = "type")]
  link_type: Option<String>,
  href: String,
  label_es: String,
  label_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectMetricInput {
  value: String,
  label: String,
  label_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectModuleInput {
  title: String,
  title_en: Option<String>,
  description: String,
  description_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectFlowStepInput {
  step: String,
  title: String,
  title_en: Option<String>,
  description: String,
  description_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectImageInput {
  src: String,
  alt_es: String,
  alt_en: Option<String>,
  caption_es: Option<String>,
  caption_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectVideoInput {
  src: String,
  poster: Option<String>,
  title_es: String,
  title_en: Option<String>,
  caption_es: Option<String>,
  caption_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateProjectInput {
  title: String,
  slug: String,
  category: String,
  year: String,
  tag: String,
  accent: String,
  description: String,
  title_en: Option<String>,
  tag_en: Option<String>,
  accent_en: Option<String>,
  description_en: Option<String>,
  detail_category: String,
  detail_category_en: Option<String>,
  summary: String,
  summary_en: Option<String>,
  overview: String,
  overview_en: Option<String>,
  challenge: String,
  challenge_en: Option<String>,
  solution: String,
  solution_en: Option<String>,
  #[serde(default)]
  process: Vec<String>,
  #[serde(default)]
  process_en: Vec<String>,
  results: Option<String>,
  results_en: Option<String>,
  stack: Option<String>,
  deliverables: Option<String>,
  deliverables_en: Option<String>,
  learnings: Option<String>,
  learnings_en: Option<String>,
  live_url: Option<String>,
  repo_url: Option<String>,
  preview_image: Option<String>,
  visual_class: String,
  show_in_home: bool,
  status: Option<String>,
  featured_level: Option<String>,
  #[serde(default)]
  extra_links: Vec<ProjectExtraLinkInput>,
  #[serde(default)]
  metrics: Vec<ProjectMetricInput>,
  #[serde(default)]
  modules: Vec<ProjectModuleInput>,
  #[serde(default)]
  flow: Vec<ProjectFlowStepInput>,
  #[serde(default)]
  images: Vec<ProjectImageInput>,
  #[serde(default)]
  videos: Vec<ProjectVideoInput>,
  #[serde(default)]
  section_order: Vec<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatedProject {
  slug: String,
  file_path: String,
  generated_path: String,
  total_projects: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectPreviewResult {
  url: String,
  file_path: String,
}

#[tauri::command]
pub fn studio_status() -> &'static str {
  "ready"
}

#[tauri::command]
pub fn pick_project_image(source: String, slug: Option<String>) -> Result<Option<String>, String> {
  let source = source.trim().to_lowercase();
  let root_dir = portfolio_root()?;
  let public_dir = root_dir.join("public");
  fs::create_dir_all(&public_dir).map_err(|error| error.to_string())?;

  let mut dialog = rfd::FileDialog::new().add_filter("Imagenes", IMAGE_EXTENSIONS);
  if source == "existing" {
    dialog = dialog.set_directory(&public_dir);
  }

  let Some(selected_path) = dialog.pick_file() else {
    return Ok(None);
  };

  if !is_image_file(&selected_path) {
    return Err("Selecciona un archivo de imagen valido: PNG, JPG, WEBP, GIF o SVG.".to_string());
  }

  if source == "existing" {
    if let Some(url) = public_url_for_path(&public_dir, &selected_path)? {
      return Ok(Some(url));
    }

    return copy_image_to_assets(&public_dir, &selected_path, slug.as_deref()).map(Some);
  }

  if source == "import" {
    return copy_image_to_assets(&public_dir, &selected_path, slug.as_deref()).map(Some);
  }

  Err("Origen de imagen no valido.".to_string())
}

#[tauri::command]
pub fn write_project_preview(input: CreateProjectInput) -> Result<ProjectPreviewResult, String> {
  let root_dir = portfolio_root()?;
  let preview_file = public_project_preview_file(&root_dir);
  let project = build_project_value(&input, PREVIEW_SLUG, 999_999, true)?;

  fs::create_dir_all(preview_file.parent().unwrap()).map_err(|error| error.to_string())?;
  write_json_file(&preview_file, &project)?;

  Ok(ProjectPreviewResult {
    url: project_preview_url(),
    file_path: display_path(&preview_file),
  })
}

#[tauri::command]
pub fn open_project_preview(input: CreateProjectInput) -> Result<ProjectPreviewResult, String> {
  let root_dir = portfolio_root()?;
  let project = build_project_value(&input, PREVIEW_SLUG, 999_999, true)?;
  let data_preview_file = project_preview_file(&root_dir);
  let public_preview_file = public_project_preview_file(&root_dir);

  fs::create_dir_all(data_preview_file.parent().unwrap()).map_err(|error| error.to_string())?;
  fs::create_dir_all(public_preview_file.parent().unwrap()).map_err(|error| error.to_string())?;
  write_json_file(&data_preview_file, &project)?;
  write_json_file(&public_preview_file, &project)?;

  ensure_portfolio_preview_server(&root_dir)?;
  open_url(&project_preview_url())?;

  Ok(ProjectPreviewResult {
    url: project_preview_url(),
    file_path: display_path(&public_preview_file),
  })
}

#[tauri::command]
pub fn create_project(input: CreateProjectInput) -> Result<CreatedProject, String> {
  let root_dir = portfolio_root()?;
  let projects_dir = root_dir.join("src").join("content").join("projects");
  let generated_file = root_dir
    .join("src")
    .join("data")
    .join("projects.generated.json");

  fs::create_dir_all(&projects_dir).map_err(|error| error.to_string())?;

  let slug = slugify(&clean_required(&input.slug, "El slug es obligatorio.")?);

  if slug.is_empty() {
    return Err("El slug no puede quedar vacio.".to_string());
  }

  let file_path = projects_dir.join(format!("{slug}.json"));
  if file_path.exists() {
    return Err(format!("Ya existe un proyecto con el slug \"{slug}\"."));
  }

  let existing_projects = read_project_values(&projects_dir)?;
  let next_order = existing_projects
    .iter()
    .filter_map(|project| project.get("order").and_then(Value::as_i64))
    .max()
    .unwrap_or(0)
    + 10;

  let project = build_project_value(&input, &slug, next_order, false)?;

  write_json_file(&file_path, &project)?;

  let mut all_projects = existing_projects;
  all_projects.push(project);
  sort_projects(&mut all_projects);
  fs::create_dir_all(generated_file.parent().unwrap()).map_err(|error| error.to_string())?;
  write_json_file(&generated_file, &Value::Array(all_projects.clone()))?;

  Ok(CreatedProject {
    slug,
    file_path: display_path(&file_path),
    generated_path: display_path(&generated_file),
    total_projects: all_projects.len(),
  })
}

fn portfolio_root() -> Result<PathBuf, String> {
  Path::new(env!("CARGO_MANIFEST_DIR"))
    .parent()
    .and_then(Path::parent)
    .map(Path::to_path_buf)
    .ok_or_else(|| "No se pudo resolver la raiz del portafolio.".to_string())
}

fn project_preview_file(root_dir: &Path) -> PathBuf {
  root_dir
    .join("src")
    .join("data")
    .join("project-studio-preview.generated.json")
}

fn public_project_preview_file(root_dir: &Path) -> PathBuf {
  root_dir.join("public").join("project-studio-preview.json")
}

fn project_preview_url() -> String {
  format!("http://127.0.0.1:{PREVIEW_PORT}/proyectos/{PREVIEW_SLUG}/")
}

fn build_project_value(
  input: &CreateProjectInput,
  slug: &str,
  order: i64,
  is_preview: bool,
) -> Result<Value, String> {
  let title = project_text(
    &input.title,
    "Nombre del proyecto",
    "El nombre del proyecto es obligatorio.",
    is_preview,
  )?;
  let category = fallback(&input.category, "web");
  let year = fallback(&input.year, "2026");
  let tag = fallback(&input.tag, "Web");
  let accent = fallback(&input.accent, &category);
  let description = project_text(
    &input.description,
    "La descripcion corta aparecera aqui mientras escribes.",
    "La descripcion corta es obligatoria.",
    is_preview,
  )?;
  let detail_category = fallback(&input.detail_category, &category);
  let summary = project_text(
    &input.summary,
    "Escribe aqui el resumen que aparecera en el bloque Resumen de la ficha.",
    "El resumen es obligatorio.",
    is_preview,
  )?;
  let long_description = project_text(
    &input.overview,
    "Empieza a escribir la descripcion larga para ver el caso completo con el diseno real del portafolio.",
    "La descripcion larga es obligatoria.",
    is_preview,
  )?;
  let challenge = project_text(
    &input.challenge,
    "Define aqui el reto principal del proyecto.",
    "El reto es obligatorio.",
    is_preview,
  )?;
  let solution = project_text(
    &input.solution,
    "Describe aqui la solucion que estas construyendo.",
    "La solucion es obligatoria.",
    is_preview,
  )?;
  let visual_class = fallback(&input.visual_class, "visual-brand");
  let stack = parse_list(input.stack.as_deref().unwrap_or(""));

  let title_en = optional_or(&input.title_en, &title);
  let tag_en = optional_or(&input.tag_en, &tag);
  let accent_en = optional_or(&input.accent_en, &accent);
  let description_en = optional_or(&input.description_en, &description);
  let detail_category_en = optional_or(&input.detail_category_en, &detail_category);
  let summary_en = optional_or(&input.summary_en, &summary);
  let long_description_en = optional_or(&input.overview_en, &long_description);
  let challenge_en = optional_or(&input.challenge_en, &challenge);
  let solution_en = optional_or(&input.solution_en, &solution);

  let live_url = clean_optional(input.live_url.as_deref());
  let repo_url = clean_optional(input.repo_url.as_deref());
  let preview_image = clean_optional(input.preview_image.as_deref());
  let status = clean_optional(input.status.as_deref());
  let featured_level = clean_optional(input.featured_level.as_deref());

  let mut links = Vec::new();
  if let Some(url) = &live_url {
    links.push(json!({
      "type": "demo",
      "href": url,
      "label": {
        "es": "Abrir demo",
        "en": "Open demo"
      }
    }));
  }

  if let Some(url) = &repo_url {
    links.push(json!({
      "type": "repo",
      "href": url,
      "label": {
        "es": "Repositorio",
        "en": "Repository"
      }
    }));
  }

  for link in &input.extra_links {
    let Some(href) = clean_optional(Some(link.href.as_str())) else {
      continue;
    };
    let label_es = fallback(&link.label_es, "Abrir enlace");
    let label_en = optional_or(&link.label_en, &label_es);
    let link_type = link
      .link_type
      .as_deref()
      .map(str::trim)
      .filter(|value| !value.is_empty())
      .unwrap_or("custom");

    links.push(json!({
      "type": link_type,
      "href": href,
      "label": {
        "es": label_es,
        "en": label_en
      }
    }));
  }

  let metrics = project_metrics(&input.metrics);
  let modules = project_modules(&input.modules);
  let flow = project_flow(&input.flow);
  let (dynamic_modules, modules_order) = project_dynamic_modules(&input.modules, &input.flow);
  let images = project_images(&input.images, &title);
  let videos = project_videos(&input.videos, &title);
  let process_steps = clean_string_list(&input.process);
  let process_steps_en = {
    let cleaned = clean_string_list(&input.process_en);
    if cleaned.is_empty() {
      process_steps.clone()
    } else {
      cleaned
    }
  };
  let section_order = project_section_order(&input.section_order);

  let mut project = json!({
    "slug": slug,
    "order": order,
    "category": category,
    "year": year,
    "href": format!("/proyectos/{slug}"),
    "visualClass": visual_class,
    "copy": {
      "es": {
        "title": title,
        "tag": tag,
        "description": description,
        "accent": accent
      },
      "en": {
        "title": title_en,
        "tag": tag_en,
        "description": description_en,
        "accent": accent_en
      }
    },
    "modules": dynamic_modules,
    "modulesOrder": modules_order,
    "sectionOrder": section_order.clone(),
    "detail": {
      "category": {
        "es": detail_category,
        "en": detail_category_en
      },
      "sectionOrder": section_order,
      "stack": stack,
      "metrics": metrics,
      "modules": modules,
      "flow": flow,
      "links": links,
      "media": {
        "images": images,
        "videos": videos
      },
      "es": {
        "summary": description,
        "overview": summary,
        "longDescription": long_description,
        "challenge": challenge,
        "solution": solution,
        "process": process_steps.clone(),
        "results": parse_list(input.results.as_deref().unwrap_or("")),
        "deliverables": parse_list(input.deliverables.as_deref().unwrap_or("")),
        "learnings": parse_list(input.learnings.as_deref().unwrap_or(""))
      },
      "en": {
        "summary": description_en,
        "overview": summary_en,
        "longDescription": long_description_en,
        "challenge": challenge_en,
        "solution": solution_en,
        "process": process_steps_en,
        "results": parse_list(&optional_or(&input.results_en, input.results.as_deref().unwrap_or(""))),
        "deliverables": parse_list(&optional_or(&input.deliverables_en, input.deliverables.as_deref().unwrap_or(""))),
        "learnings": parse_list(&optional_or(&input.learnings_en, input.learnings.as_deref().unwrap_or("")))
      }
    }
  });

  if let Some(url) = live_url {
    project["liveUrl"] = json!(url);
    project["detail"]["liveUrl"] = json!(url);
  }

  if let Some(url) = repo_url {
    project["githubUrl"] = json!(url);
  }

  if let Some(image) = preview_image {
    project["previewImage"] = json!(image);
  }

  if !input.show_in_home || is_preview {
    project["showInHome"] = json!(false);
  }

  if let Some(value) = status {
    project["status"] = json!(value);
  } else if is_preview {
    project["status"] = json!("draft");
  }

  if let Some(value) = featured_level {
    project["featuredLevel"] = json!(value);
  }

  Ok(project)
}

fn project_text(value: &str, preview_fallback: &str, required_message: &str, is_preview: bool) -> Result<String, String> {
  if is_preview {
    Ok(fallback(value, preview_fallback))
  } else {
    clean_required(value, required_message)
  }
}

fn ensure_portfolio_preview_server(root_dir: &Path) -> Result<(), String> {
  if is_preview_server_running() {
    return Ok(());
  }

  let port = PREVIEW_PORT.to_string();
  let mut command = Command::new("cmd");
  command
    .args([
      "/C",
      "npm",
      "run",
      "dev",
      "--",
      "--host",
      "127.0.0.1",
      "--port",
      port.as_str(),
    ])
    .current_dir(root_dir)
    .stdin(Stdio::null())
    .stdout(Stdio::null())
    .stderr(Stdio::null());

  #[cfg(target_os = "windows")]
  command.creation_flags(CREATE_NO_WINDOW);

  command
    .spawn()
    .map_err(|error| format!("No se pudo iniciar el servidor local del portafolio: {error}"))?;

  for _ in 0..40 {
    if is_preview_server_running() {
      return Ok(());
    }

    std::thread::sleep(Duration::from_millis(500));
  }

  Err("El servidor local del portafolio no respondio a tiempo. Intenta ejecutar npm run dev en la carpeta Portafolio.".to_string())
}

fn is_preview_server_running() -> bool {
  let address = SocketAddr::from(([127, 0, 0, 1], PREVIEW_PORT));
  TcpStream::connect_timeout(&address, Duration::from_millis(250)).is_ok()
}

fn open_url(url: &str) -> Result<(), String> {
  #[cfg(target_os = "windows")]
  {
    let mut command = Command::new("explorer");
    command.arg(url);
    command.creation_flags(CREATE_NO_WINDOW);
    command
      .spawn()
      .map_err(|error| format!("No se pudo abrir el navegador: {error}"))?;
    return Ok(());
  }

  #[allow(unreachable_code)]
  Err(format!("Abre esta URL en tu navegador: {url}"))
}

fn is_image_file(path: &Path) -> bool {
  path
    .extension()
    .and_then(|extension| extension.to_str())
    .map(|extension| {
      IMAGE_EXTENSIONS
        .iter()
        .any(|allowed| extension.eq_ignore_ascii_case(allowed))
    })
    .unwrap_or(false)
}

fn copy_image_to_assets(public_dir: &Path, source_path: &Path, slug: Option<&str>) -> Result<String, String> {
  let folder = slug
    .map(slugify)
    .filter(|value| !value.is_empty())
    .unwrap_or_else(|| "nuevo-proyecto".to_string());
  let assets_dir = public_dir.join("project-assets").join(folder);
  fs::create_dir_all(&assets_dir).map_err(|error| error.to_string())?;

  let stem = source_path
    .file_stem()
    .and_then(|value| value.to_str())
    .map(slugify)
    .filter(|value| !value.is_empty())
    .unwrap_or_else(|| "imagen".to_string());
  let extension = source_path
    .extension()
    .and_then(|value| value.to_str())
    .map(|value| value.to_lowercase())
    .ok_or_else(|| "La imagen seleccionada no tiene extension.".to_string())?;
  let destination = unique_asset_path(&assets_dir, &stem, &extension);

  fs::copy(source_path, &destination).map_err(|error| error.to_string())?;
  public_url_for_path(public_dir, &destination)?
    .ok_or_else(|| "No se pudo generar la ruta publica de la imagen.".to_string())
}

fn unique_asset_path(assets_dir: &Path, stem: &str, extension: &str) -> PathBuf {
  let mut counter = 0;

  loop {
    let file_name = if counter == 0 {
      format!("{stem}.{extension}")
    } else {
      format!("{stem}-{counter}.{extension}")
    };
    let candidate = assets_dir.join(file_name);

    if !candidate.exists() {
      return candidate;
    }

    counter += 1;
  }
}

fn public_url_for_path(public_dir: &Path, path: &Path) -> Result<Option<String>, String> {
  let public_dir = fs::canonicalize(public_dir).map_err(|error| error.to_string())?;
  let path = fs::canonicalize(path).map_err(|error| error.to_string())?;
  let Ok(relative_path) = path.strip_prefix(public_dir) else {
    return Ok(None);
  };
  let relative_url = relative_path
    .iter()
    .map(|part| part.to_string_lossy())
    .collect::<Vec<_>>()
    .join("/");

  Ok(Some(format!("/{relative_url}")))
}

fn read_project_values(projects_dir: &Path) -> Result<Vec<Value>, String> {
  let mut projects = Vec::new();

  for entry in fs::read_dir(projects_dir).map_err(|error| error.to_string())? {
    let entry = entry.map_err(|error| error.to_string())?;
    let path = entry.path();
    if path.extension().and_then(|extension| extension.to_str()) != Some("json") {
      continue;
    }

    let content = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    let project: Value = serde_json::from_str(&content)
      .map_err(|error| format!("{}: {error}", display_path(&path)))?;
    projects.push(project);
  }

  sort_projects(&mut projects);
  Ok(projects)
}

fn sort_projects(projects: &mut [Value]) {
  projects.sort_by(|a, b| {
    let order_a = a
      .get("order")
      .and_then(Value::as_i64)
      .unwrap_or(i64::MAX);
    let order_b = b
      .get("order")
      .and_then(Value::as_i64)
      .unwrap_or(i64::MAX);

    order_a.cmp(&order_b).then_with(|| {
      a.get("slug")
        .and_then(Value::as_str)
        .unwrap_or("")
        .cmp(b.get("slug").and_then(Value::as_str).unwrap_or(""))
    })
  });
}

fn write_json_file(path: &Path, value: &Value) -> Result<(), String> {
  let content = serde_json::to_string_pretty(value).map_err(|error| error.to_string())?;
  fs::write(path, format!("{content}\n")).map_err(|error| error.to_string())
}

fn clean_required(value: &str, message: &str) -> Result<String, String> {
  let cleaned = value.trim();
  if cleaned.is_empty() {
    return Err(message.to_string());
  }

  Ok(cleaned.to_string())
}

fn clean_optional(value: Option<&str>) -> Option<String> {
  value
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .map(ToString::to_string)
}

fn fallback(value: &str, fallback: &str) -> String {
  let cleaned = value.trim();
  if cleaned.is_empty() {
    fallback.to_string()
  } else {
    cleaned.to_string()
  }
}

fn optional_or(value: &Option<String>, fallback: &str) -> String {
  value
    .as_deref()
    .map(str::trim)
    .filter(|value| !value.is_empty())
    .unwrap_or(fallback)
    .to_string()
}

fn parse_list(value: &str) -> Vec<String> {
  value
    .split([',', ';'])
    .map(str::trim)
    .filter(|item| !item.is_empty())
    .map(ToString::to_string)
    .collect()
}

fn clean_string_list(values: &[String]) -> Vec<String> {
  values
    .iter()
    .map(String::as_str)
    .map(str::trim)
    .filter(|item| !item.is_empty())
    .map(ToString::to_string)
    .collect()
}

fn project_section_order(values: &[String]) -> Vec<String> {
  const DEFAULT_ORDER: [&str; 3] = ["images", "videos", "modules"];
  let mut order = Vec::new();

  for value in values.iter().map(String::as_str).map(str::trim) {
    if DEFAULT_ORDER.contains(&value) && !order.iter().any(|item| item == value) {
      order.push(value.to_string());
    }
  }

  for value in DEFAULT_ORDER {
    if !order.iter().any(|item| item == value) {
      order.push(value.to_string());
    }
  }

  order
}

fn project_metrics(metrics: &[ProjectMetricInput]) -> Vec<Value> {
  metrics
    .iter()
    .filter_map(|metric| {
      let value = clean_optional(Some(metric.value.as_str()))?;
      let label = clean_optional(Some(metric.label.as_str()))?;
      let label_en = optional_or(&metric.label_en, &label);

      Some(json!({
        "value": value,
        "label": {
          "es": label,
          "en": label_en
        }
      }))
    })
    .collect()
}

fn project_modules(modules: &[ProjectModuleInput]) -> Vec<Value> {
  modules
    .iter()
    .filter_map(|module| {
      let title = clean_optional(Some(module.title.as_str()))?;
      let description = clean_optional(Some(module.description.as_str()))?;
      let title_en = optional_or(&module.title_en, &title);
      let description_en = optional_or(&module.description_en, &description);

      Some(json!({
        "title": {
          "es": title,
          "en": title_en
        },
        "description": {
          "es": description,
          "en": description_en
        }
      }))
    })
    .collect()
}

fn project_flow(flow: &[ProjectFlowStepInput]) -> Vec<Value> {
  flow
    .iter()
    .filter_map(|step| {
      let title = clean_optional(Some(step.title.as_str()))?;
      let description = clean_optional(Some(step.description.as_str()))?;
      let title_en = optional_or(&step.title_en, &title);
      let description_en = optional_or(&step.description_en, &description);
      let step_label = fallback(&step.step, "Paso");

      Some(json!({
        "step": step_label,
        "title": {
          "es": title,
          "en": title_en
        },
        "description": {
          "es": description,
          "en": description_en
        }
      }))
    })
    .collect()
}

fn project_dynamic_modules(modules: &[ProjectModuleInput], flow: &[ProjectFlowStepInput]) -> (Value, Vec<String>) {
  let mut module_map = Map::new();
  let mut modules_order = Vec::new();

  for (index, module) in modules.iter().enumerate() {
    let Some(title) = clean_optional(Some(module.title.as_str())) else {
      continue;
    };
    let Some(body) = clean_optional(Some(module.description.as_str())) else {
      continue;
    };
    let title_en = optional_or(&module.title_en, &title);
    let body_en = optional_or(&module.description_en, &body);
    let id = format!("studio-module-{}", index + 1);

    module_map.insert(
      id.clone(),
      json!({
        "label": {
          "es": "Modulo",
          "en": "Module"
        },
        "title": {
          "es": title,
          "en": title_en
        },
        "body": {
          "es": body,
          "en": body_en
        }
      }),
    );
    modules_order.push(id);
  }

  let flow_items = flow
    .iter()
    .filter_map(|step| {
      let title = clean_optional(Some(step.title.as_str()))?;
      let description = clean_optional(Some(step.description.as_str()))?;
      let title_en = optional_or(&step.title_en, &title);
      let description_en = optional_or(&step.description_en, &description);
      let step_label = fallback(&step.step, "Paso");

      Some(json!({
        "label": step_label,
        "title": {
          "es": title,
          "en": title_en
        },
        "description": {
          "es": description,
          "en": description_en
        }
      }))
    })
    .collect::<Vec<_>>();

  if !flow_items.is_empty() {
    module_map.insert(
      "timeline".to_string(),
      json!({
        "label": {
          "es": "Flujo",
          "en": "Flow"
        },
        "title": {
          "es": "Flujo",
          "en": "Flow"
        },
        "body": {
          "es": "Linea de tiempo del recorrido o proceso del proyecto.",
          "en": "Timeline of the project journey or process."
        },
        "items": flow_items
      }),
    );
    modules_order.push("timeline".to_string());
  }

  (Value::Object(module_map), modules_order)
}

fn project_images(images: &[ProjectImageInput], title: &str) -> Vec<Value> {
  images
    .iter()
    .filter_map(|image| {
      let src = clean_optional(Some(image.src.as_str()))?;
      let alt_es = fallback(&image.alt_es, title);
      let alt_en = optional_or(&image.alt_en, &alt_es);
      let mut value = json!({
        "src": src,
        "alt": {
          "es": alt_es,
          "en": alt_en
        }
      });

      if let Some(caption_es) = clean_optional(image.caption_es.as_deref()) {
        let caption_en = optional_or(&image.caption_en, &caption_es);
        value["caption"] = json!({
          "es": caption_es,
          "en": caption_en
        });
      }

      Some(value)
    })
    .collect()
}

fn project_videos(videos: &[ProjectVideoInput], title: &str) -> Vec<Value> {
  videos
    .iter()
    .filter_map(|video| {
      let src = clean_optional(Some(video.src.as_str()))?;
      let title_es = fallback(&video.title_es, title);
      let title_en = optional_or(&video.title_en, &title_es);
      let mut value = json!({
        "src": src,
        "title": {
          "es": title_es,
          "en": title_en
        }
      });

      if let Some(poster) = clean_optional(video.poster.as_deref()) {
        value["poster"] = json!(poster);
      }

      if let Some(caption_es) = clean_optional(video.caption_es.as_deref()) {
        let caption_en = optional_or(&video.caption_en, &caption_es);
        value["caption"] = json!({
          "es": caption_es,
          "en": caption_en
        });
      }

      Some(value)
    })
    .collect()
}

fn slugify(value: &str) -> String {
  let mut slug = String::new();
  let mut previous_dash = false;

  for character in value.trim().to_lowercase().chars() {
    if character.is_ascii_alphanumeric() {
      slug.push(character);
      previous_dash = false;
    } else if !previous_dash {
      slug.push('-');
      previous_dash = true;
    }
  }

  slug.trim_matches('-').to_string()
}

fn display_path(path: &Path) -> String {
  path.to_string_lossy().replace('\\', "/")
}
