use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::{
  collections::BTreeSet,
  process::{Command, Stdio},
  fs,
  net::{SocketAddr, TcpStream},
  path::{Component, Path, PathBuf},
  time::Duration,
};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

const IMAGE_EXTENSIONS: &[&str] = &["png", "jpg", "jpeg", "webp", "gif", "svg"];
const CERTIFICATE_EXTENSIONS: &[&str] = &["pdf", "png", "jpg", "jpeg", "webp"];
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
pub struct ProjectCollaboratorInput {
  name: String,
  role: Option<String>,
  role_en: Option<String>,
  photo: Option<String>,
  portfolio_url: Option<String>,
  github_url: Option<String>,
  linkedin_url: Option<String>,
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
  collaborators: Vec<ProjectCollaboratorInput>,
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectListItem {
  slug: String,
  title: String,
  year: String,
  status: String,
  show_in_home: bool,
  file_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StudioContentItem {
  key: String,
  title: String,
  subtitle: String,
  detail: String,
  status: String,
  hidden: bool,
  file_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SavedContent {
  key: String,
  file_path: String,
  total_items: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PickedCertificateFile {
  file_name: String,
  file_type: String,
  mime: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AboutInput {
  group: String,
  period: String,
  title: String,
  #[serde(default)]
  category: String,
  institution: String,
  detail: String,
  skills: String,
  stack: String,
  focus: String,
  detail_placement: String,
  title_en: Option<String>,
  category_en: Option<String>,
  institution_en: Option<String>,
  detail_en: Option<String>,
  skills_en: Option<String>,
  focus_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CertificateInput {
  id: String,
  file_name: String,
  certificate_type: String,
  mime: String,
  issued: String,
  status: String,
  #[serde(default)]
  hidden: bool,
  title: String,
  issuer: String,
  tags: String,
  title_en: Option<String>,
  issuer_en: Option<String>,
  tags_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DevelopmentInput {
  id: String,
  #[serde(rename = "kind")]
  item_kind: String,
  cover: String,
  progress: String,
  certificate_url: Option<String>,
  #[serde(default)]
  hidden: bool,
  title: String,
  description: String,
  title_en: Option<String>,
  description_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BlogInput {
  slug: String,
  filter: String,
  visual_class: String,
  category: String,
  date: String,
  read_time: String,
  title: String,
  excerpt: String,
  body: String,
  introduction: String,
  paragraphs: String,
  highlights: String,
  category_en: Option<String>,
  date_en: Option<String>,
  read_time_en: Option<String>,
  title_en: Option<String>,
  excerpt_en: Option<String>,
  body_en: Option<String>,
  introduction_en: Option<String>,
  paragraphs_en: Option<String>,
  highlights_en: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InterestInput {
  filter: String,
  visual_class: String,
  category: String,
  title: String,
  meta: String,
  description: String,
  body: String,
  tags: String,
  category_en: Option<String>,
  title_en: Option<String>,
  meta_en: Option<String>,
  description_en: Option<String>,
  body_en: Option<String>,
  tags_en: Option<String>,
}

#[tauri::command]
pub fn studio_status() -> &'static str {
  "ready"
}

#[tauri::command]
pub fn list_projects() -> Result<Vec<ProjectListItem>, String> {
  let root_dir = portfolio_root()?;
  let projects_dir = root_dir.join("src").join("content").join("projects");
  let projects = read_project_values(&projects_dir)?;

  Ok(
    projects
      .into_iter()
      .filter_map(|project| {
        let slug = project.get("slug")?.as_str()?.to_string();
        let title = project
          .pointer("/copy/es/title")
          .and_then(Value::as_str)
          .unwrap_or(slug.as_str())
          .to_string();
        let year = project.get("year").and_then(Value::as_str).unwrap_or("").to_string();
        let status = project.get("status").and_then(Value::as_str).unwrap_or("completed").to_string();
        let show_in_home = project.get("showInHome").and_then(Value::as_bool).unwrap_or(true);
        let file_path = display_path(&projects_dir.join(format!("{slug}.json")));

        Some(ProjectListItem {
          slug,
          title,
          year,
          status,
          show_in_home,
          file_path,
        })
      })
      .collect(),
  )
}

#[tauri::command]
pub fn get_project(slug: String) -> Result<Value, String> {
  let root_dir = portfolio_root()?;
  let projects_dir = root_dir.join("src").join("content").join("projects");
  let slug = slugify(&slug);
  let file_path = projects_dir.join(format!("{slug}.json"));
  let content = fs::read_to_string(&file_path).map_err(|error| format!("{}: {error}", display_path(&file_path)))?;

  serde_json::from_str(&content).map_err(|error| format!("{}: {error}", display_path(&file_path)))
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
pub fn list_studio_content(kind: String) -> Result<Vec<StudioContentItem>, String> {
  let root_dir = portfolio_root()?;
  let kind = kind.trim();

  if kind == "about" {
    return list_about_items(&root_dir);
  }

  let file_path = studio_content_file(&root_dir, kind)?;
  let items = read_json_array(&file_path)?;

  Ok(
    items
      .iter()
      .enumerate()
      .map(|(index, item)| studio_content_item(kind, item, index, &file_path))
      .collect(),
  )
}

#[tauri::command]
pub fn get_studio_content(kind: String, key: String) -> Result<Value, String> {
  let root_dir = portfolio_root()?;
  let kind = kind.trim();

  if kind == "about" {
    return get_about_item(&root_dir, &key);
  }

  let file_path = studio_content_file(&root_dir, kind)?;
  let items = read_json_array(&file_path)?;
  let key = key.trim();

  match kind {
    "development" => items
      .into_iter()
      .find(|item| item.get("id").and_then(Value::as_str) == Some(key))
      .ok_or_else(|| format!("No se encontro el elemento en desarrollo \"{key}\".")),
    "certificates" => items
      .into_iter()
      .find(|item| item.get("id").and_then(Value::as_str) == Some(key))
      .ok_or_else(|| format!("No se encontro el certificado \"{key}\".")),
    "blog" => items
      .into_iter()
      .find(|item| item.get("slug").and_then(Value::as_str) == Some(key))
      .ok_or_else(|| format!("No se encontro la nota \"{key}\".")),
    "interests" => {
      let index = key.parse::<usize>().map_err(|_| "Indice de interes no valido.".to_string())?;
      items
        .into_iter()
        .nth(index)
        .ok_or_else(|| format!("No se encontro el interes #{index}."))
    }
    _ => Err("Modulo no soportado.".to_string()),
  }
}

#[tauri::command]
pub fn set_studio_content_hidden(kind: String, key: String, hidden: bool) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let kind = kind.trim();

  if !matches!(kind, "development" | "certificates") {
    return Err("La visibilidad solo esta disponible para En desarrollo y Certificados.".to_string());
  }

  let file_path = studio_content_file(&root_dir, kind)?;
  let mut items = read_json_array(&file_path)?;
  let id = slugify(&clean_required(&key, "El ID del contenido es obligatorio.")?);
  let item = items
    .iter_mut()
    .find(|item| item.get("id").and_then(Value::as_str) == Some(id.as_str()))
    .ok_or_else(|| format!("No se encontro el contenido \"{id}\"."))?;
  let item_object = item
    .as_object_mut()
    .ok_or_else(|| format!("El contenido \"{id}\" no tiene un formato editable."))?;

  if hidden {
    item_object.insert("hidden".to_string(), json!(true));
  } else {
    item_object.remove("hidden");
  }

  write_json_array(&file_path, &items)?;

  Ok(SavedContent {
    key: id,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn pick_certificate_file(source: String) -> Result<Option<PickedCertificateFile>, String> {
  let source = source.trim().to_lowercase();
  let root_dir = portfolio_root()?;
  let certificates_dir = root_dir.join("public").join("certificados");
  fs::create_dir_all(&certificates_dir).map_err(|error| error.to_string())?;

  let mut dialog = rfd::FileDialog::new().add_filter("Certificados", CERTIFICATE_EXTENSIONS);
  if source == "existing" {
    dialog = dialog.set_directory(&certificates_dir);
  }

  let Some(selected_path) = dialog.pick_file() else {
    return Ok(None);
  };

  if !is_certificate_file(&selected_path) {
    return Err("Selecciona un PDF o una imagen valida: PDF, PNG, JPG o WEBP.".to_string());
  }

  let final_path = if source == "existing" && is_inside_dir(&certificates_dir, &selected_path)? {
    selected_path
  } else if source == "import" || source == "existing" {
    copy_certificate_to_dir(&certificates_dir, &selected_path)?
  } else {
    return Err("Origen de certificado no valido.".to_string());
  };

  let file_name = final_path
    .file_name()
    .and_then(|name| name.to_str())
    .ok_or_else(|| "No se pudo leer el nombre del archivo.".to_string())?
    .to_string();
  let (file_type, mime) = certificate_type_and_mime(&file_name);

  Ok(Some(PickedCertificateFile {
    file_name,
    file_type,
    mime,
  }))
}

#[tauri::command]
pub fn save_certificate(existing_id: Option<String>, input: CertificateInput) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "certificates")?;
  let mut items = read_json_array(&file_path)?;
  let id = slugify(&clean_required(&input.id, "El ID del certificado es obligatorio.")?);

  if id.is_empty() {
    return Err("El ID del certificado no puede quedar vacio.".to_string());
  }

  let existing_id = existing_id.as_deref().map(str::trim).filter(|value| !value.is_empty());
  if items.iter().any(|item| {
    item.get("id").and_then(Value::as_str) == Some(id.as_str())
      && existing_id != Some(id.as_str())
  }) {
    return Err(format!("Ya existe un certificado con el ID \"{id}\"."));
  }

  let certificate = build_certificate_value(&input, &id)?;
  upsert_by_field(&mut items, "id", existing_id, &id, certificate)?;
  write_json_array(&file_path, &items)?;

  Ok(SavedContent {
    key: id,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn delete_certificate(id: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "certificates")?;
  let mut items = read_json_array(&file_path)?;
  let id = slugify(&clean_required(&id, "El ID del certificado es obligatorio.")?);
  let original_len = items.len();
  let removed_item = items
    .iter()
    .find(|item| item.get("id").and_then(Value::as_str) == Some(id.as_str()))
    .cloned();

  items.retain(|item| item.get("id").and_then(Value::as_str) != Some(id.as_str()));

  if items.len() == original_len {
    return Err(format!("No se encontro el certificado \"{id}\"."));
  }

  write_json_array(&file_path, &items)?;
  if let Some(item) = removed_item {
    remove_certificate_assets(&root_dir, &item)?;
    remove_local_public_file_references(&root_dir, &item)?;
  }

  Ok(SavedContent {
    key: id,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn save_development_item(existing_id: Option<String>, input: DevelopmentInput) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "development")?;
  let mut items = read_json_array(&file_path)?;
  let id = slugify(&clean_required(&input.id, "El ID del elemento en desarrollo es obligatorio.")?);

  if id.is_empty() {
    return Err("El ID del elemento en desarrollo no puede quedar vacio.".to_string());
  }

  let existing_id = existing_id.as_deref().map(str::trim).filter(|value| !value.is_empty());
  if items.iter().any(|item| {
    item.get("id").and_then(Value::as_str) == Some(id.as_str())
      && existing_id != Some(id.as_str())
  }) {
    return Err(format!("Ya existe un elemento en desarrollo con el ID \"{id}\"."));
  }

  let development_item = build_development_value(&input, &id)?;
  upsert_by_field(&mut items, "id", existing_id, &id, development_item)?;
  write_json_array(&file_path, &items)?;

  Ok(SavedContent {
    key: id,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn move_development_item(id: String, direction: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "development")?;
  let mut items = read_json_array(&file_path)?;
  let id = slugify(&clean_required(&id, "El ID del elemento en desarrollo es obligatorio.")?);
  let current_index = items
    .iter()
    .position(|item| item.get("id").and_then(Value::as_str) == Some(id.as_str()))
    .ok_or_else(|| format!("No se encontro el elemento en desarrollo \"{id}\"."))?;
  let target_index = match direction.trim().to_lowercase().as_str() {
    "up" | "arriba" if current_index > 0 => current_index - 1,
    "down" | "abajo" if current_index + 1 < items.len() => current_index + 1,
    "up" | "arriba" | "down" | "abajo" => current_index,
    _ => return Err("Direccion de orden no valida.".to_string()),
  };

  if target_index != current_index {
    items.swap(current_index, target_index);
    write_json_array(&file_path, &items)?;
  }

  Ok(SavedContent {
    key: id,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn delete_development_item(id: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "development")?;
  let mut items = read_json_array(&file_path)?;
  let id = slugify(&clean_required(&id, "El ID del elemento en desarrollo es obligatorio.")?);
  let original_len = items.len();
  let removed_item = items
    .iter()
    .find(|item| item.get("id").and_then(Value::as_str) == Some(id.as_str()))
    .cloned();

  items.retain(|item| item.get("id").and_then(Value::as_str) != Some(id.as_str()));

  if items.len() == original_len {
    return Err(format!("No se encontro el elemento en desarrollo \"{id}\"."));
  }

  write_json_array(&file_path, &items)?;
  if let Some(item) = removed_item {
    remove_project_assets_dir(&root_dir, &id)?;
    remove_local_public_file_references(&root_dir, &item)?;
  }

  Ok(SavedContent {
    key: id,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn save_about_item(existing_key: Option<String>, input: AboutInput) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = about_file(&root_dir);
  let mut about = read_json_value(&file_path)?;
  let group = about_group_key(&input.group)?;
  let item_es = build_about_item_value(&input, "es")?;
  let item_en = build_about_item_value(&input, "en")?;
  let saved_key;

  if let Some(existing_key) = existing_key.as_deref().map(str::trim).filter(|value| !value.is_empty()) {
    let (old_group, old_index) = parse_about_key(existing_key)?;

    if old_group == group {
      replace_about_item(&mut about, "es", &group, old_index, item_es)?;
      replace_about_item(&mut about, "en", &group, old_index, item_en)?;
      saved_key = format!("{group}:{old_index}");
    } else {
      remove_about_item_at(&mut about, "es", &old_group, old_index)?;
      remove_about_item_at(&mut about, "en", &old_group, old_index)?;
      let new_index = push_about_item(&mut about, "es", &group, item_es)?;
      push_about_item(&mut about, "en", &group, item_en)?;
      saved_key = format!("{group}:{new_index}");
    }
  } else {
    let new_index = push_about_item(&mut about, "es", &group, item_es)?;
    push_about_item(&mut about, "en", &group, item_en)?;
    saved_key = format!("{group}:{new_index}");
  }

  write_json_file(&file_path, &about)?;
  let total_items = count_about_items(&about);

  Ok(SavedContent {
    key: saved_key,
    file_path: display_path(&file_path),
    total_items,
  })
}

#[tauri::command]
pub fn delete_about_item(key: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = about_file(&root_dir);
  let mut about = read_json_value(&file_path)?;
  let (group, index) = parse_about_key(&key)?;

  remove_about_item_at(&mut about, "es", &group, index)?;
  remove_about_item_at(&mut about, "en", &group, index)?;
  write_json_file(&file_path, &about)?;

  Ok(SavedContent {
    key,
    file_path: display_path(&file_path),
    total_items: count_about_items(&about),
  })
}

#[tauri::command]
pub fn save_blog_post(existing_slug: Option<String>, input: BlogInput) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "blog")?;
  let mut items = read_json_array(&file_path)?;
  let slug = slugify(&clean_required(&input.slug, "El slug de la nota es obligatorio.")?);

  if slug.is_empty() {
    return Err("El slug de la nota no puede quedar vacio.".to_string());
  }

  let existing_slug = existing_slug.as_deref().map(str::trim).filter(|value| !value.is_empty());
  if items.iter().any(|item| {
    item.get("slug").and_then(Value::as_str) == Some(slug.as_str())
      && existing_slug != Some(slug.as_str())
  }) {
    return Err(format!("Ya existe una nota con el slug \"{slug}\"."));
  }

  let post = build_blog_value(&input, &slug)?;
  upsert_by_field(&mut items, "slug", existing_slug, &slug, post)?;
  write_json_array(&file_path, &items)?;

  Ok(SavedContent {
    key: slug,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn delete_blog_post(slug: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "blog")?;
  let mut items = read_json_array(&file_path)?;
  let slug = slugify(&clean_required(&slug, "El slug de la nota es obligatorio.")?);
  let original_len = items.len();
  let removed_item = items
    .iter()
    .find(|item| item.get("slug").and_then(Value::as_str) == Some(slug.as_str()))
    .cloned();

  items.retain(|item| item.get("slug").and_then(Value::as_str) != Some(slug.as_str()));

  if items.len() == original_len {
    return Err(format!("No se encontro la nota \"{slug}\"."));
  }

  write_json_array(&file_path, &items)?;
  if let Some(item) = removed_item {
    remove_project_assets_dir(&root_dir, &slug)?;
    remove_local_public_file_references(&root_dir, &item)?;
  }

  Ok(SavedContent {
    key: slug,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn save_interest(existing_index: Option<usize>, input: InterestInput) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "interests")?;
  let mut items = read_json_array(&file_path)?;
  let title = clean_required(&input.title, "El titulo del interes es obligatorio.")?;
  let interest = build_interest_value(&input, &title)?;

  let key = if let Some(index) = existing_index {
    if index >= items.len() {
      return Err(format!("No existe el interes #{index}."));
    }
    items[index] = interest;
    index.to_string()
  } else {
    items.push(interest);
    (items.len() - 1).to_string()
  };

  write_json_array(&file_path, &items)?;

  Ok(SavedContent {
    key,
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
}

#[tauri::command]
pub fn delete_interest(index: usize) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let file_path = studio_content_file(&root_dir, "interests")?;
  let mut items = read_json_array(&file_path)?;

  if index >= items.len() {
    return Err(format!("No existe el interes #{index}."));
  }

  let removed_item = items.remove(index);
  write_json_array(&file_path, &items)?;
  remove_project_assets_dir(&root_dir, &index.to_string())?;
  remove_local_public_file_references(&root_dir, &removed_item)?;

  Ok(SavedContent {
    key: index.to_string(),
    file_path: display_path(&file_path),
    total_items: items.len(),
  })
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

#[tauri::command]
pub fn update_project(existing_slug: String, input: CreateProjectInput) -> Result<CreatedProject, String> {
  let root_dir = portfolio_root()?;
  let projects_dir = root_dir.join("src").join("content").join("projects");
  let generated_file = root_dir
    .join("src")
    .join("data")
    .join("projects.generated.json");

  fs::create_dir_all(&projects_dir).map_err(|error| error.to_string())?;

  let existing_slug = slugify(&existing_slug);
  let old_file_path = projects_dir.join(format!("{existing_slug}.json"));
  if !old_file_path.exists() {
    return Err(format!("No existe un proyecto con el slug \"{existing_slug}\"."));
  }

  let slug = slugify(&clean_required(&input.slug, "El slug es obligatorio.")?);
  if slug.is_empty() {
    return Err("El slug no puede quedar vacio.".to_string());
  }

  let file_path = projects_dir.join(format!("{slug}.json"));
  if slug != existing_slug && file_path.exists() {
    return Err(format!("Ya existe un proyecto con el slug \"{slug}\"."));
  }

  let existing_projects = read_project_values(&projects_dir)?;
  let existing_project = existing_projects
    .iter()
    .find(|project| project.get("slug").and_then(Value::as_str) == Some(existing_slug.as_str()))
    .ok_or_else(|| format!("No se encontro el proyecto \"{existing_slug}\"."))?;
  let order = existing_project
    .get("order")
    .and_then(Value::as_i64)
    .unwrap_or(10);
  let project = build_project_value(&input, &slug, order, false)?;

  write_json_file(&file_path, &project)?;
  if slug != existing_slug {
    fs::remove_file(&old_file_path).map_err(|error| error.to_string())?;
  }

  let mut all_projects = existing_projects
    .into_iter()
    .filter(|project| project.get("slug").and_then(Value::as_str) != Some(existing_slug.as_str()))
    .collect::<Vec<_>>();
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

#[tauri::command]
pub fn move_project(slug: String, direction: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let projects_dir = root_dir.join("src").join("content").join("projects");
  let generated_file = root_dir
    .join("src")
    .join("data")
    .join("projects.generated.json");
  let slug = slugify(&clean_required(&slug, "El slug del proyecto es obligatorio.")?);

  if slug.is_empty() {
    return Err("El slug del proyecto no puede quedar vacio.".to_string());
  }

  let mut all_projects = read_project_values(&projects_dir)?;
  let current_index = all_projects
    .iter()
    .position(|project| project.get("slug").and_then(Value::as_str) == Some(slug.as_str()))
    .ok_or_else(|| format!("No se encontro el proyecto \"{slug}\"."))?;
  let target_index = match direction.trim().to_lowercase().as_str() {
    "up" | "arriba" if current_index > 0 => current_index - 1,
    "down" | "abajo" if current_index + 1 < all_projects.len() => current_index + 1,
    "up" | "arriba" | "down" | "abajo" => current_index,
    _ => return Err("Direccion de orden no valida.".to_string()),
  };

  if target_index != current_index {
    all_projects.swap(current_index, target_index);

    for (index, project) in all_projects.iter_mut().enumerate() {
      let project_slug = project
        .get("slug")
        .and_then(Value::as_str)
        .ok_or_else(|| "Proyecto sin slug.".to_string())?
        .to_string();
      project
        .as_object_mut()
        .ok_or_else(|| format!("El proyecto \"{project_slug}\" no es un objeto JSON."))?
        .insert("order".to_string(), json!(((index as i64) + 1) * 10));
      write_json_file(&projects_dir.join(format!("{project_slug}.json")), project)?;
    }
  }

  fs::create_dir_all(generated_file.parent().unwrap()).map_err(|error| error.to_string())?;
  write_json_file(&generated_file, &Value::Array(all_projects.clone()))?;

  Ok(SavedContent {
    key: slug,
    file_path: display_path(&generated_file),
    total_items: all_projects.len(),
  })
}

#[tauri::command]
pub fn delete_project(slug: String) -> Result<SavedContent, String> {
  let root_dir = portfolio_root()?;
  let projects_dir = root_dir.join("src").join("content").join("projects");
  let generated_file = root_dir
    .join("src")
    .join("data")
    .join("projects.generated.json");
  let slug = slugify(&clean_required(&slug, "El slug del proyecto es obligatorio.")?);

  if slug.is_empty() {
    return Err("El slug del proyecto no puede quedar vacio.".to_string());
  }

  let file_path = projects_dir.join(format!("{slug}.json"));
  if !file_path.exists() {
    return Err(format!("No existe un proyecto con el slug \"{slug}\"."));
  }

  let project_to_delete = read_json_value(&file_path)?;
  let existing_projects = read_project_values(&projects_dir)?;
  let mut all_projects = existing_projects
    .into_iter()
    .filter(|project| project.get("slug").and_then(Value::as_str) != Some(slug.as_str()))
    .collect::<Vec<_>>();
  sort_projects(&mut all_projects);

  fs::remove_file(&file_path).map_err(|error| format!("{}: {error}", display_path(&file_path)))?;
  remove_project_assets_dir(&root_dir, &slug)?;
  remove_local_public_file_references(&root_dir, &project_to_delete)?;

  fs::create_dir_all(generated_file.parent().unwrap()).map_err(|error| error.to_string())?;
  write_json_file(&generated_file, &Value::Array(all_projects.clone()))?;

  Ok(SavedContent {
    key: slug,
    file_path: display_path(&file_path),
    total_items: all_projects.len(),
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

fn about_file(root_dir: &Path) -> PathBuf {
  root_dir.join("src").join("data").join("about.json")
}

fn list_about_items(root_dir: &Path) -> Result<Vec<StudioContentItem>, String> {
  let file_path = about_file(root_dir);
  let about = read_json_value(&file_path)?;
  let mut items = Vec::new();

  for group in ["education", "work"] {
    let subtitle = about_group_title(&about, "es", group);

    for (index, item) in about_group_items(&about, "es", group).iter().enumerate() {
      items.push(StudioContentItem {
        key: format!("{group}:{index}"),
        title: about_item_title(item),
        subtitle: subtitle.clone(),
        detail: item
          .get("period")
          .and_then(Value::as_str)
          .unwrap_or("Sin periodo")
          .to_string(),
        status: String::new(),
        hidden: false,
        file_path: display_path(&file_path),
      });
    }
  }

  Ok(items)
}

fn get_about_item(root_dir: &Path, key: &str) -> Result<Value, String> {
  let file_path = about_file(root_dir);
  let about = read_json_value(&file_path)?;
  let (group, index) = parse_about_key(key)?;
  let es_items = about_group_items(&about, "es", &group);
  let en_items = about_group_items(&about, "en", &group);
  let es = es_items
    .get(index)
    .cloned()
    .ok_or_else(|| format!("No se encontro la entrada \"{key}\"."))?;
  let en = en_items.get(index).cloned().unwrap_or_else(|| es.clone());

  Ok(json!({
    "group": group,
    "es": es,
    "en": en
  }))
}

fn about_group_key(value: &str) -> Result<String, String> {
  match value.trim().to_lowercase().as_str() {
    "education" | "school" | "academic" | "formacion" | "formacion-academica" => {
      Ok("education".to_string())
    }
    "work" | "experience" | "laboral" | "experiencia" | "experiencia-laboral" => {
      Ok("work".to_string())
    }
    _ => Err("Grupo de Sobre mi no soportado.".to_string()),
  }
}

fn about_group_icon(group: &str) -> Result<&'static str, String> {
  match group {
    "education" => Ok("school"),
    "work" => Ok("work"),
    _ => Err("Grupo de Sobre mi no soportado.".to_string()),
  }
}

fn parse_about_key(key: &str) -> Result<(String, usize), String> {
  let (group, index) = key
    .trim()
    .split_once(':')
    .ok_or_else(|| "Clave de Sobre mi no valida.".to_string())?;
  let group = about_group_key(group)?;
  let index = index
    .parse::<usize>()
    .map_err(|_| "Indice de Sobre mi no valido.".to_string())?;

  Ok((group, index))
}

fn about_group_title(about: &Value, lang: &str, group: &str) -> String {
  let icon = about_group_icon(group).unwrap_or("");

  about
    .pointer(&format!("/copy/{lang}/groups"))
    .and_then(Value::as_array)
    .and_then(|groups| {
      groups
        .iter()
        .find(|item| item.get("icon").and_then(Value::as_str) == Some(icon))
    })
    .and_then(|item| item.get("title"))
    .and_then(Value::as_str)
    .unwrap_or(if group == "education" {
      "Formacion academica"
    } else {
      "Experiencia laboral"
    })
    .to_string()
}

fn about_group_items(about: &Value, lang: &str, group: &str) -> Vec<Value> {
  let icon = about_group_icon(group).unwrap_or("");

  about
    .pointer(&format!("/copy/{lang}/groups"))
    .and_then(Value::as_array)
    .and_then(|groups| {
      groups
        .iter()
        .find(|item| item.get("icon").and_then(Value::as_str) == Some(icon))
    })
    .and_then(|item| item.get("items"))
    .and_then(Value::as_array)
    .cloned()
    .unwrap_or_default()
}

fn about_group_items_mut<'a>(about: &'a mut Value, lang: &str, group: &str) -> Result<&'a mut Vec<Value>, String> {
  let icon = about_group_icon(group)?;
  let groups = about
    .pointer_mut(&format!("/copy/{lang}/groups"))
    .and_then(Value::as_array_mut)
    .ok_or_else(|| format!("No se encontraron grupos de Sobre mi para {lang}."))?;
  let group_value = groups
    .iter_mut()
    .find(|item| item.get("icon").and_then(Value::as_str) == Some(icon))
    .ok_or_else(|| format!("No se encontro el grupo {group} en Sobre mi."))?;

  if group_value.get("items").is_none() {
    group_value["items"] = json!([]);
  }

  group_value
    .get_mut("items")
    .and_then(Value::as_array_mut)
    .ok_or_else(|| format!("El grupo {group} no tiene una lista editable."))
}

fn about_item_title(item: &Value) -> String {
  item
    .get("title")
    .and_then(Value::as_str)
    .or_else(|| item.get("institution").and_then(Value::as_str))
    .unwrap_or("Sin titulo")
    .to_string()
}

fn count_about_items(about: &Value) -> usize {
  about_group_items(about, "es", "education").len() + about_group_items(about, "es", "work").len()
}

fn push_about_item(about: &mut Value, lang: &str, group: &str, item: Value) -> Result<usize, String> {
  let items = about_group_items_mut(about, lang, group)?;
  items.push(item);

  Ok(items.len() - 1)
}

fn replace_about_item(about: &mut Value, lang: &str, group: &str, index: usize, item: Value) -> Result<(), String> {
  let items = about_group_items_mut(about, lang, group)?;

  if index >= items.len() {
    return Err(format!("No existe la entrada #{index} de Sobre mi."));
  }

  items[index] = item;
  Ok(())
}

fn remove_about_item_at(about: &mut Value, lang: &str, group: &str, index: usize) -> Result<(), String> {
  let items = about_group_items_mut(about, lang, group)?;

  if index >= items.len() {
    return Err(format!("No existe la entrada #{index} de Sobre mi."));
  }

  items.remove(index);
  Ok(())
}

fn studio_content_file(root_dir: &Path, kind: &str) -> Result<PathBuf, String> {
  let file_name = match kind {
    "development" => "development.json",
    "certificates" => "certificates.json",
    "blog" => "blog.json",
    "interests" => "interests.json",
    _ => return Err("Modulo no soportado.".to_string()),
  };

  Ok(root_dir.join("src").join("data").join(file_name))
}

fn studio_content_item(kind: &str, item: &Value, index: usize, file_path: &Path) -> StudioContentItem {
  let copy_es = item.pointer("/copy/es").unwrap_or(&Value::Null);
  let title = copy_es
    .get("title")
    .and_then(Value::as_str)
    .unwrap_or("Sin titulo")
    .to_string();

  let (key, subtitle, detail) = match kind {
    "development" => {
      let kind_label = match item.get("kind").and_then(Value::as_str).unwrap_or("project") {
        "certificate" => "Certificado",
        _ => "Proyecto",
      };
      let progress = item.get("progress").and_then(Value::as_i64).unwrap_or(0);

      (
        item.get("id")
          .and_then(Value::as_str)
          .unwrap_or("")
          .to_string(),
        kind_label.to_string(),
        format!("{progress}% de avance"),
      )
    }
    "certificates" => (
      item.get("id")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string(),
      copy_es
        .get("issuer")
        .and_then(Value::as_str)
        .unwrap_or("Sin emisor")
        .to_string(),
      format!(
        "{} - {}",
        item.get("issued").and_then(Value::as_str).unwrap_or("Sin fecha"),
        item.get("fileName").and_then(Value::as_str).unwrap_or("Sin archivo")
      ),
    ),
    "blog" => (
      item.get("slug")
        .and_then(Value::as_str)
        .unwrap_or("")
        .to_string(),
      copy_es
        .get("date")
        .and_then(Value::as_str)
        .unwrap_or("Sin fecha")
        .to_string(),
      copy_es
        .get("category")
        .and_then(Value::as_str)
        .unwrap_or("Sin categoria")
        .to_string(),
    ),
    "interests" => (
      index.to_string(),
      copy_es
        .get("meta")
        .and_then(Value::as_str)
        .unwrap_or("Sin meta")
        .to_string(),
      copy_es
        .get("category")
        .and_then(Value::as_str)
        .unwrap_or("Sin categoria")
        .to_string(),
    ),
    _ => ("".to_string(), "".to_string(), "".to_string()),
  };

  StudioContentItem {
    key,
    title,
    subtitle,
    detail,
    status: item
      .get("status")
      .and_then(Value::as_str)
      .unwrap_or("")
      .to_string(),
    hidden: item.get("hidden").and_then(Value::as_bool).unwrap_or(false),
    file_path: display_path(file_path),
  }
}

fn read_json_array(path: &Path) -> Result<Vec<Value>, String> {
  if !path.exists() {
    return Ok(Vec::new());
  }

  let content = fs::read_to_string(path).map_err(|error| format!("{}: {error}", display_path(path)))?;
  serde_json::from_str::<Vec<Value>>(&content).map_err(|error| format!("{}: {error}", display_path(path)))
}

fn read_json_value(path: &Path) -> Result<Value, String> {
  let content = fs::read_to_string(path).map_err(|error| format!("{}: {error}", display_path(path)))?;
  serde_json::from_str::<Value>(&content).map_err(|error| format!("{}: {error}", display_path(path)))
}

fn write_json_array(path: &Path, items: &[Value]) -> Result<(), String> {
  fs::create_dir_all(path.parent().unwrap()).map_err(|error| error.to_string())?;
  write_json_file(path, &Value::Array(items.to_vec()))
}

fn upsert_by_field(
  items: &mut Vec<Value>,
  field: &str,
  existing_key: Option<&str>,
  new_key: &str,
  value: Value,
) -> Result<(), String> {
  if let Some(existing_key) = existing_key {
    if let Some(index) = items
      .iter()
      .position(|item| item.get(field).and_then(Value::as_str) == Some(existing_key))
    {
      items[index] = value;
      return Ok(());
    }

    return Err(format!("No se encontro el elemento \"{existing_key}\"."));
  }

  if items
    .iter()
    .any(|item| item.get(field).and_then(Value::as_str) == Some(new_key))
  {
    return Err(format!("Ya existe un elemento con la clave \"{new_key}\"."));
  }

  items.push(value);
  Ok(())
}

fn build_about_item_value(input: &AboutInput, lang: &str) -> Result<Value, String> {
  let group = about_group_key(&input.group)?;
  let period = fallback(&input.period, "2026");
  let title = localized_field(lang, &input.title, &input.title_en);
  let category = localized_field(lang, &input.category, &input.category_en);
  let institution = localized_field(lang, &input.institution, &input.institution_en);
  let detail = localized_field(lang, &input.detail, &input.detail_en);
  let skills = localized_list(lang, &input.skills, &input.skills_en);
  let focus = localized_list(lang, &input.focus, &input.focus_en);
  let stack = parse_list(&input.stack);
  let mut item = Map::new();

  item.insert("period".to_string(), json!(period));

  if group == "education" {
    if title.trim().is_empty() && institution.trim().is_empty() {
      return Err("La entrada de formacion necesita titulo o institucion.".to_string());
    }

    insert_optional_string(&mut item, "institution", &institution);
    insert_optional_string(&mut item, "title", &title);
    insert_optional_string(&mut item, "detail", &detail);

    if !skills.is_empty() {
      item.insert("skills".to_string(), json!(skills));
    }
  } else {
    let title = clean_required(&title, "La experiencia necesita un titulo.")?;
    item.insert("title".to_string(), json!(title));
    insert_optional_string(&mut item, "category", &category);
    insert_optional_string(&mut item, "description", &detail);

    if !stack.is_empty() {
      item.insert("stack".to_string(), json!(stack));
    }

    if !focus.is_empty() {
      item.insert("focus".to_string(), json!(focus));
    }

    if !skills.is_empty() {
      item.insert("skills".to_string(), json!(skills));
    }

    if input.detail_placement.trim() == "right" {
      item.insert("detailPlacement".to_string(), json!("right"));
    }
  }

  Ok(Value::Object(item))
}

fn insert_optional_string(item: &mut Map<String, Value>, key: &str, value: &str) {
  if let Some(value) = clean_optional(Some(value)) {
    item.insert(key.to_string(), json!(value));
  }
}

fn localized_field(lang: &str, value_es: &str, value_en: &Option<String>) -> String {
  if lang == "en" {
    optional_or(value_en, value_es)
  } else {
    value_es.trim().to_string()
  }
}

fn localized_list(lang: &str, value_es: &str, value_en: &Option<String>) -> Vec<String> {
  if lang == "en" {
    let parsed = parse_list(value_en.as_deref().unwrap_or(""));
    if parsed.is_empty() {
      parse_list(value_es)
    } else {
      parsed
    }
  } else {
    parse_list(value_es)
  }
}

fn build_certificate_value(input: &CertificateInput, id: &str) -> Result<Value, String> {
  let file_name = clean_required(&input.file_name, "El archivo del certificado es obligatorio.")?;
  let title = clean_required(&input.title, "El titulo del certificado es obligatorio.")?;
  let issuer = fallback(&input.issuer, "Formacion");
  let title_en = optional_or(&input.title_en, &title);
  let issuer_en = optional_or(&input.issuer_en, &issuer);
  let tags = parse_list(&input.tags);
  let tags_en = {
    let parsed = parse_list(input.tags_en.as_deref().unwrap_or(""));
    if parsed.is_empty() {
      tags.clone()
    } else {
      parsed
    }
  };
  let (detected_type, detected_mime) = certificate_type_and_mime(&file_name);
  let certificate_type = clean_optional(Some(input.certificate_type.as_str())).unwrap_or(detected_type);
  let mime = clean_optional(Some(input.mime.as_str())).unwrap_or(detected_mime);
  let status = clean_optional(Some(input.status.as_str())).unwrap_or_else(|| "completed".to_string());

  let mut certificate = json!({
    "id": id,
    "fileName": file_name,
    "type": certificate_type,
    "mime": mime,
    "issued": fallback(&input.issued, "2026"),
    "status": status,
    "copy": {
      "es": {
        "title": title,
        "issuer": issuer,
        "tags": tags
      },
      "en": {
        "title": title_en,
        "issuer": issuer_en,
        "tags": tags_en
      }
    }
  });

  if input.hidden {
    certificate["hidden"] = json!(true);
  }

  Ok(certificate)
}

fn build_development_value(input: &DevelopmentInput, id: &str) -> Result<Value, String> {
  let title = clean_required(&input.title, "El titulo del elemento en desarrollo es obligatorio.")?;
  let description = clean_required(&input.description, "La descripcion del elemento en desarrollo es obligatoria.")?;
  let title_en = optional_or(&input.title_en, &title);
  let description_en = optional_or(&input.description_en, &description);
  let progress = input
    .progress
    .trim()
    .parse::<i64>()
    .unwrap_or(0)
    .clamp(0, 100);
  let item_kind = match input.item_kind.trim().to_lowercase().as_str() {
    "certificate" | "certificado" => "certificate",
    _ => "project",
  };
  let mut item = Map::new();

  item.insert("id".to_string(), json!(id));
  item.insert("kind".to_string(), json!(item_kind));
  item.insert("progress".to_string(), json!(progress));
  if input.hidden {
    item.insert("hidden".to_string(), json!(true));
  }
  insert_optional_string(&mut item, "cover", &input.cover);
  if item_kind == "certificate" {
    if let Some(certificate_url) = &input.certificate_url {
      insert_optional_string(&mut item, "certificateUrl", certificate_url);
    }
  }
  item.insert(
    "copy".to_string(),
    json!({
      "es": {
        "title": title,
        "description": description
      },
      "en": {
        "title": title_en,
        "description": description_en
      }
    }),
  );

  Ok(Value::Object(item))
}

fn build_blog_value(input: &BlogInput, slug: &str) -> Result<Value, String> {
  let title = clean_required(&input.title, "El titulo de la nota es obligatorio.")?;
  let excerpt = clean_required(&input.excerpt, "El extracto de la nota es obligatorio.")?;
  let body = clean_required(&input.body, "El cuerpo corto de la nota es obligatorio.")?;
  let category = fallback(&input.category, "Contenido");
  let date = fallback(&input.date, "2026");
  let read_time = fallback(&input.read_time, "4 min de lectura");
  let introduction = fallback(&input.introduction, &body);
  let paragraphs = paragraphs_from_text(&input.paragraphs);
  let highlights = paragraphs_from_text(&input.highlights);
  let title_en = optional_or(&input.title_en, &title);
  let excerpt_en = optional_or(&input.excerpt_en, &excerpt);
  let body_en = optional_or(&input.body_en, &body);
  let category_en = optional_or(&input.category_en, &category);
  let date_en = optional_or(&input.date_en, &date);
  let read_time_en = optional_or(&input.read_time_en, &read_time);
  let introduction_en = optional_or(&input.introduction_en, &introduction);
  let paragraphs_en = {
    let parsed = paragraphs_from_text(input.paragraphs_en.as_deref().unwrap_or(""));
    if parsed.is_empty() {
      paragraphs.clone()
    } else {
      parsed
    }
  };
  let highlights_en = {
    let parsed = paragraphs_from_text(input.highlights_en.as_deref().unwrap_or(""));
    if parsed.is_empty() {
      highlights.clone()
    } else {
      parsed
    }
  };

  Ok(json!({
    "slug": slug,
    "filter": fallback(&input.filter, "content"),
    "visualClass": fallback(&input.visual_class, "visual-notes"),
    "copy": {
      "es": {
        "category": category,
        "date": date,
        "readTime": read_time,
        "title": title,
        "excerpt": excerpt,
        "body": body,
        "introduction": introduction,
        "paragraphs": paragraphs,
        "highlights": highlights
      },
      "en": {
        "category": category_en,
        "date": date_en,
        "readTime": read_time_en,
        "title": title_en,
        "excerpt": excerpt_en,
        "body": body_en,
        "introduction": introduction_en,
        "paragraphs": paragraphs_en,
        "highlights": highlights_en
      }
    }
  }))
}

fn build_interest_value(input: &InterestInput, title: &str) -> Result<Value, String> {
  let category = fallback(&input.category, "Intereses");
  let meta = fallback(&input.meta, "Referencia");
  let description = clean_required(&input.description, "La descripcion del interes es obligatoria.")?;
  let body = clean_required(&input.body, "El cuerpo del interes es obligatorio.")?;
  let tags = parse_list(&input.tags);
  let title_en = optional_or(&input.title_en, title);
  let category_en = optional_or(&input.category_en, &category);
  let meta_en = optional_or(&input.meta_en, &meta);
  let description_en = optional_or(&input.description_en, &description);
  let body_en = optional_or(&input.body_en, &body);
  let tags_en = {
    let parsed = parse_list(input.tags_en.as_deref().unwrap_or(""));
    if parsed.is_empty() {
      tags.clone()
    } else {
      parsed
    }
  };

  Ok(json!({
    "filter": fallback(&input.filter, "movies"),
    "visualClass": fallback(&input.visual_class, "visual-cinema"),
    "copy": {
      "es": {
        "category": category,
        "title": title,
        "meta": meta,
        "description": description,
        "body": body,
        "tags": tags
      },
      "en": {
        "category": category_en,
        "title": title_en,
        "meta": meta_en,
        "description": description_en,
        "body": body_en,
        "tags": tags_en
      }
    }
  }))
}

fn paragraphs_from_text(value: &str) -> Vec<String> {
  value
    .lines()
    .map(str::trim)
    .filter(|line| !line.is_empty())
    .map(ToString::to_string)
    .collect()
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
  let collaborators = project_collaborators(&input.collaborators);
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
      "collaborators": collaborators,
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
        "results": clean_optional(input.results.as_deref()).unwrap_or_default(),
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
        "results": optional_or(&input.results_en, input.results.as_deref().unwrap_or("")),
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
    project["detail"]["previewImage"] = json!(image);
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

fn is_certificate_file(path: &Path) -> bool {
  path
    .extension()
    .and_then(|extension| extension.to_str())
    .map(|extension| {
      CERTIFICATE_EXTENSIONS
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

fn copy_certificate_to_dir(certificates_dir: &Path, source_path: &Path) -> Result<PathBuf, String> {
  fs::create_dir_all(certificates_dir).map_err(|error| error.to_string())?;
  let stem = source_path
    .file_stem()
    .and_then(|value| value.to_str())
    .map(slugify)
    .filter(|value| !value.is_empty())
    .unwrap_or_else(|| "certificado".to_string());
  let extension = source_path
    .extension()
    .and_then(|value| value.to_str())
    .map(|value| value.to_lowercase())
    .ok_or_else(|| "El archivo seleccionado no tiene extension.".to_string())?;
  let destination = unique_asset_path(certificates_dir, &stem, &extension);

  fs::copy(source_path, &destination).map_err(|error| error.to_string())?;
  Ok(destination)
}

fn certificate_type_and_mime(file_name: &str) -> (String, String) {
  let extension = Path::new(file_name)
    .extension()
    .and_then(|value| value.to_str())
    .unwrap_or("")
    .to_lowercase();

  match extension.as_str() {
    "pdf" => ("pdf".to_string(), "application/pdf".to_string()),
    "png" => ("image".to_string(), "image/png".to_string()),
    "jpg" | "jpeg" => ("image".to_string(), "image/jpeg".to_string()),
    "webp" => ("image".to_string(), "image/webp".to_string()),
    _ => ("file".to_string(), "application/octet-stream".to_string()),
  }
}

fn is_inside_dir(parent: &Path, child: &Path) -> Result<bool, String> {
  let parent = fs::canonicalize(parent).map_err(|error| error.to_string())?;
  let child = fs::canonicalize(child).map_err(|error| error.to_string())?;
  Ok(child.starts_with(parent))
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

fn remove_project_assets_dir(root_dir: &Path, slug: &str) -> Result<(), String> {
  let project_assets_root = root_dir.join("public").join("project-assets");
  let folder = slugify(slug);

  if folder.is_empty() {
    return Ok(());
  }

  remove_dir_inside(&project_assets_root, &project_assets_root.join(folder))
}

fn remove_certificate_assets(root_dir: &Path, item: &Value) -> Result<(), String> {
  let Some(file_name) = item.get("fileName").and_then(Value::as_str) else {
    return Ok(());
  };

  let Some(relative_path) = safe_relative_path(file_name) else {
    return Err("El nombre del archivo del certificado no es una ruta local valida.".to_string());
  };

  for certificates_dir in [
    root_dir.join("src").join("certificados"),
    root_dir.join("public").join("certificados"),
  ] {
    remove_file_inside(&certificates_dir, &certificates_dir.join(&relative_path))?;
    prune_empty_dirs_until(&certificates_dir, certificates_dir.join(&relative_path).parent())?;
  }

  Ok(())
}

fn remove_local_public_file_references(root_dir: &Path, value: &Value) -> Result<(), String> {
  let public_dir = root_dir.join("public");
  if !public_dir.exists() {
    return Ok(());
  }

  let mut urls = BTreeSet::new();
  collect_local_public_urls(value, &mut urls);

  for url in urls {
    let Some(path) = public_path_from_url(&public_dir, &url) else {
      continue;
    };

    if !is_allowed_public_asset_path(&public_dir, &path)? {
      continue;
    }

    if let Some(parent) = path.parent().map(Path::to_path_buf) {
      remove_file_inside(&public_dir, &path)?;
      prune_allowed_public_asset_dirs(&public_dir, &parent)?;
    }
  }

  Ok(())
}

fn collect_local_public_urls(value: &Value, urls: &mut BTreeSet<String>) {
  match value {
    Value::String(text) => {
      if text.starts_with('/') && !text.starts_with("//") {
        let path = text
          .split(['?', '#'])
          .next()
          .unwrap_or("")
          .trim();

        if !path.is_empty() {
          urls.insert(path.to_string());
        }
      }
    }
    Value::Array(items) => {
      for item in items {
        collect_local_public_urls(item, urls);
      }
    }
    Value::Object(map) => {
      for item in map.values() {
        collect_local_public_urls(item, urls);
      }
    }
    _ => {}
  }
}

fn public_path_from_url(public_dir: &Path, url: &str) -> Option<PathBuf> {
  let relative = url.trim_start_matches('/');
  safe_relative_path(relative).map(|path| public_dir.join(path))
}

fn safe_relative_path(value: &str) -> Option<PathBuf> {
  let path = Path::new(value);

  if path.as_os_str().is_empty() {
    return None;
  }

  if path.components().any(|component| {
    matches!(
      component,
      Component::ParentDir | Component::RootDir | Component::Prefix(_)
    )
  }) {
    return None;
  }

  Some(path.to_path_buf())
}

fn is_allowed_public_asset_path(public_dir: &Path, path: &Path) -> Result<bool, String> {
  if !path.exists() {
    return Ok(false);
  }

  let path = fs::canonicalize(path).map_err(|error| error.to_string())?;

  for allowed_root in [
    public_dir.join("project-assets"),
    public_dir.join("certificados"),
    public_dir.join("interest-assets"),
    public_dir.join("projects"),
  ] {
    if !allowed_root.exists() {
      continue;
    }

    let allowed_root = fs::canonicalize(&allowed_root).map_err(|error| error.to_string())?;
    if path.starts_with(allowed_root) {
      return Ok(true);
    }
  }

  Ok(false)
}

fn remove_file_inside(parent: &Path, path: &Path) -> Result<(), String> {
  if !path.exists() {
    return Ok(());
  }

  let parent = fs::canonicalize(parent).map_err(|error| error.to_string())?;
  let path = fs::canonicalize(path).map_err(|error| error.to_string())?;

  if !path.starts_with(&parent) {
    return Err(format!("No se puede eliminar fuera de {}", display_path(&parent)));
  }

  if path.is_file() {
    fs::remove_file(&path).map_err(|error| format!("{}: {error}", display_path(&path)))?;
  }

  Ok(())
}

fn remove_dir_inside(parent: &Path, path: &Path) -> Result<(), String> {
  if !path.exists() {
    return Ok(());
  }

  let parent = fs::canonicalize(parent).map_err(|error| error.to_string())?;
  let path = fs::canonicalize(path).map_err(|error| error.to_string())?;

  if path == parent || !path.starts_with(&parent) {
    return Err(format!("No se puede eliminar fuera de {}", display_path(&parent)));
  }

  if path.is_dir() {
    fs::remove_dir_all(&path).map_err(|error| format!("{}: {error}", display_path(&path)))?;
  }

  Ok(())
}

fn prune_allowed_public_asset_dirs(public_dir: &Path, start_dir: &Path) -> Result<(), String> {
  for allowed_root in [
    public_dir.join("project-assets"),
    public_dir.join("certificados"),
    public_dir.join("interest-assets"),
    public_dir.join("projects"),
  ] {
    prune_empty_dirs_until(&allowed_root, Some(start_dir))?;
  }

  Ok(())
}

fn prune_empty_dirs_until(stop_root: &Path, start_dir: Option<&Path>) -> Result<(), String> {
  if !stop_root.exists() {
    return Ok(());
  }

  let stop_root = fs::canonicalize(stop_root).map_err(|error| error.to_string())?;
  let Some(start_dir) = start_dir else {
    return Ok(());
  };

  if !start_dir.exists() {
    return Ok(());
  }

  let mut current = fs::canonicalize(start_dir).map_err(|error| error.to_string())?;

  while current.starts_with(&stop_root) && current != stop_root {
    let is_empty = fs::read_dir(&current)
      .map_err(|error| error.to_string())?
      .next()
      .is_none();

    if !is_empty {
      break;
    }

    fs::remove_dir(&current).map_err(|error| format!("{}: {error}", display_path(&current)))?;

    let Some(parent) = current.parent() else {
      break;
    };
    current = parent.to_path_buf();
  }

  Ok(())
}

fn read_project_values(projects_dir: &Path) -> Result<Vec<Value>, String> {
  let mut projects = Vec::new();
  if !projects_dir.exists() {
    return Ok(projects);
  }

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

fn project_collaborators(collaborators: &[ProjectCollaboratorInput]) -> Vec<Value> {
  collaborators
    .iter()
    .filter_map(|collaborator| {
      let name = clean_optional(Some(collaborator.name.as_str()))?;
      let mut value = json!({
        "name": name
      });

      if let Some(role_es) = clean_optional(collaborator.role.as_deref()) {
        let role_en = optional_or(&collaborator.role_en, &role_es);
        value["role"] = json!({
          "es": role_es,
          "en": role_en
        });
      }

      if let Some(photo) = clean_optional(collaborator.photo.as_deref()) {
        value["photo"] = json!(photo);
      }

      if let Some(url) = clean_optional(collaborator.portfolio_url.as_deref()) {
        value["portfolioUrl"] = json!(url);
      }

      if let Some(url) = clean_optional(collaborator.github_url.as_deref()) {
        value["githubUrl"] = json!(url);
      }

      if let Some(url) = clean_optional(collaborator.linkedin_url.as_deref()) {
        value["linkedinUrl"] = json!(url);
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
