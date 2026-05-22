use base64::{engine::general_purpose::STANDARD as BASE64_STANDARD, Engine};
use image::ImageFormat;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    env, fs,
    io::{Read, Write},
    net::TcpStream,
    path::{Path, PathBuf},
    process::Command,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use walkdir::WalkDir;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectSummary {
    slug: String,
    title: String,
    category: String,
    year: String,
    status: String,
    featured_level: String,
    visual_template: String,
    href: String,
    preview_image: String,
    path: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssetInput {
    source_path: String,
    target_name: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProjectPayload {
    original_slug: Option<String>,
    project: Value,
    assets: Vec<AssetInput>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveProjectResult {
    slug: String,
    json_path: String,
    asset_paths: Vec<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DuplicatePayload {
    source_slug: String,
    target_slug: String,
    copy_assets: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeletePayload {
    slug: String,
    delete_json: bool,
    delete_assets: bool,
    delete_asset_folder: bool,
}

fn repo_root() -> Result<PathBuf, String> {
    let manifest_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest_dir
        .parent()
        .and_then(Path::parent)
        .map(Path::to_path_buf)
        .ok_or_else(|| "No se pudo resolver la raiz del repositorio.".to_string())
}

fn projects_dir() -> Result<PathBuf, String> {
    Ok(repo_root()?.join("src").join("content").join("projects"))
}

fn public_projects_dir() -> Result<PathBuf, String> {
    Ok(repo_root()?.join("public").join("projects"))
}

fn public_dir() -> Result<PathBuf, String> {
    Ok(repo_root()?.join("public"))
}

fn technologies_file() -> Result<PathBuf, String> {
    Ok(repo_root()?
        .join("project-studio")
        .join("data")
        .join("technologies.json"))
}

fn ensure_inside(path: &Path, base: &Path) -> Result<(), String> {
    let canonical_base = base
        .canonicalize()
        .map_err(|error| format!("No se pudo resolver base: {error}"))?;
    let canonical_path = if path.exists() {
        path.canonicalize()
            .map_err(|error| format!("No se pudo resolver ruta: {error}"))?
    } else {
        let parent = path
            .parent()
            .ok_or_else(|| "Ruta sin directorio padre.".to_string())?;
        parent
            .canonicalize()
            .map_err(|error| format!("No se pudo resolver directorio padre: {error}"))?
            .join(path.file_name().unwrap_or_default())
    };

    if canonical_path.starts_with(&canonical_base) {
        Ok(())
    } else {
        Err("Operacion bloqueada fuera del repositorio.".to_string())
    }
}

fn slug_from_value(project: &Value) -> Result<String, String> {
    project
        .get("slug")
        .and_then(Value::as_str)
        .filter(|slug| !slug.trim().is_empty())
        .map(str::to_string)
        .ok_or_else(|| "El proyecto no tiene slug.".to_string())
}

fn project_file(slug: &str) -> Result<PathBuf, String> {
    Ok(projects_dir()?.join(format!("{slug}.json")))
}

fn asset_dir(slug: &str) -> Result<PathBuf, String> {
    Ok(public_projects_dir()?.join(slug))
}

fn localized_title(project: &Value) -> String {
    project
        .pointer("/copy/es/title")
        .and_then(Value::as_str)
        .or_else(|| project.pointer("/copy/en/title").and_then(Value::as_str))
        .unwrap_or("Sin titulo")
        .to_string()
}

fn field_string(project: &Value, key: &str, fallback: &str) -> String {
    project
        .get(key)
        .and_then(Value::as_str)
        .unwrap_or(fallback)
        .to_string()
}

fn read_json_file(path: &Path) -> Result<Value, String> {
    let text = fs::read_to_string(path).map_err(|error| format!("No se pudo leer JSON: {error}"))?;
    serde_json::from_str(&text).map_err(|error| format!("JSON invalido: {error}"))
}

fn write_json_file(path: &Path, value: &Value) -> Result<(), String> {
    let text = serde_json::to_string_pretty(value)
        .map_err(|error| format!("No se pudo serializar JSON: {error}"))?;
    fs::write(path, format!("{text}\n")).map_err(|error| format!("No se pudo escribir JSON: {error}"))
}

fn copy_asset_to_webp(source: &Path, target: &Path) -> Result<(), String> {
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|error| format!("No se pudo crear carpeta de assets: {error}"))?;
    }

    let image = image::open(source).map_err(|error| format!("No se pudo abrir imagen: {error}"))?;
    image
        .save_with_format(target, ImageFormat::WebP)
        .map_err(|error| format!("No se pudo convertir imagen a WebP: {error}"))
}

fn copy_asset_inputs(slug: &str, assets: &[AssetInput]) -> Result<Vec<String>, String> {
    let dir = asset_dir(slug)?;
    fs::create_dir_all(&dir).map_err(|error| format!("No se pudo crear carpeta de assets: {error}"))?;
    ensure_inside(&dir, &repo_root()?)?;

    let mut copied = Vec::new();
    for asset in assets {
        if asset.source_path.trim().is_empty() || asset.target_name.trim().is_empty() {
            continue;
        }

        let source = PathBuf::from(&asset.source_path);
        if !source.exists() {
            return Err(format!("Asset no encontrado: {}", asset.source_path));
        }

        let safe_name = asset
            .target_name
            .chars()
            .map(|character| {
                if character.is_ascii_alphanumeric() || character == '-' || character == '_' || character == '.' {
                    character
                } else {
                    '-'
                }
            })
            .collect::<String>();
        let file_name = if safe_name.ends_with(".webp") {
            safe_name
        } else {
            format!("{safe_name}.webp")
        };
        let target = dir.join(file_name);
        copy_asset_to_webp(&source, &target)?;
        copied.push(format!(
            "/projects/{}/{}",
            slug,
            target.file_name().unwrap_or_default().to_string_lossy()
        ));
    }

    Ok(copied)
}

fn collect_project_asset_references(value: &Value, slug: &str, references: &mut Vec<String>) {
    match value {
        Value::String(text) => {
            let prefix = format!("/projects/{slug}/");
            if text.starts_with(&prefix) {
                references.push(text.to_string());
            }
        }
        Value::Array(items) => {
            for item in items {
                collect_project_asset_references(item, slug, references);
            }
        }
        Value::Object(entries) => {
            for item in entries.values() {
                collect_project_asset_references(item, slug, references);
            }
        }
        _ => {}
    }
}

fn validate_project_asset_references(slug: &str, project: &Value) -> Result<(), String> {
    let mut references = Vec::new();
    collect_project_asset_references(project, slug, &mut references);
    references.sort();
    references.dedup();

    let public = public_dir()?;
    let missing = references
        .into_iter()
        .filter(|reference| {
            let public_relative = reference.trim_start_matches('/');
            !public.join(public_relative).is_file()
        })
        .collect::<Vec<_>>();

    if missing.is_empty() {
        return Ok(());
    }

    Err(format!(
        "Hay imagenes referenciadas que no existen en public: {}. Vuelve a agregarlas desde el gestor para copiarlas correctamente.",
        missing.join(", ")
    ))
}

fn copy_dir_contents(source: &Path, target: &Path) -> Result<(), String> {
    fs::create_dir_all(target).map_err(|error| format!("No se pudo crear carpeta destino: {error}"))?;

    for entry in WalkDir::new(source).into_iter().filter_map(Result::ok) {
        if !entry.file_type().is_file() {
            continue;
        }

        let relative = entry
            .path()
            .strip_prefix(source)
            .map_err(|error| format!("No se pudo calcular ruta relativa: {error}"))?;
        let target_file = target.join(relative);
        if let Some(parent) = target_file.parent() {
            fs::create_dir_all(parent).map_err(|error| format!("No se pudo crear carpeta: {error}"))?;
        }
        fs::copy(entry.path(), target_file).map_err(|error| format!("No se pudo copiar asset existente: {error}"))?;
    }

    Ok(())
}

fn asset_mime_type(path: &Path) -> Result<&'static str, String> {
    match path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "avif" => Ok("image/avif"),
        "bmp" => Ok("image/bmp"),
        "gif" => Ok("image/gif"),
        "ico" => Ok("image/x-icon"),
        "jpg" | "jpeg" => Ok("image/jpeg"),
        "png" => Ok("image/png"),
        "svg" => Ok("image/svg+xml"),
        "webp" => Ok("image/webp"),
        _ => Err("Formato de imagen no soportado para preview.".to_string()),
    }
}

fn resolve_asset_reference(reference: &str) -> Result<PathBuf, String> {
    let reference = reference.trim();
    if reference.is_empty() {
        return Err("Referencia de imagen vacia.".to_string());
    }

    let public = public_dir()?;
    let repo = repo_root()?;
    let public_relative = reference.trim_start_matches(|character| character == '/' || character == '\\');
    let public_candidate = public.join(public_relative);
    if public_candidate.exists() && public_candidate.is_file() {
        ensure_inside(&public_candidate, &public)?;
        return Ok(public_candidate);
    }

    let direct_path = PathBuf::from(reference);
    if direct_path.is_absolute() {
        if direct_path.exists() && direct_path.is_file() {
            return Ok(direct_path);
        }

        return Err(format!("Imagen no encontrada: {reference}"));
    }

    let repo_candidate = repo.join(reference);
    if repo_candidate.exists() && repo_candidate.is_file() {
        ensure_inside(&repo_candidate, &repo)?;
        return Ok(repo_candidate);
    }

    Err(format!("Imagen no encontrada: {reference}"))
}

#[tauri::command]
pub fn read_asset_data_url(reference: String) -> Result<String, String> {
    let trimmed = reference.trim();
    if trimmed.starts_with("http://") || trimmed.starts_with("https://") || trimmed.starts_with("data:") {
        return Ok(trimmed.to_string());
    }

    let path = resolve_asset_reference(trimmed)?;
    let mime_type = asset_mime_type(&path)?;
    let bytes = fs::read(&path).map_err(|error| format!("No se pudo leer imagen: {error}"))?;
    Ok(format!(
        "data:{mime_type};base64,{}",
        BASE64_STANDARD.encode(bytes)
    ))
}

#[tauri::command]
pub fn list_projects() -> Result<Vec<ProjectSummary>, String> {
    let dir = projects_dir()?;
    fs::create_dir_all(&dir).map_err(|error| format!("No se pudo crear carpeta de proyectos: {error}"))?;
    ensure_inside(&dir, &repo_root()?)?;

    let mut projects = Vec::new();
    for entry in fs::read_dir(&dir).map_err(|error| format!("No se pudo listar proyectos: {error}"))? {
        let entry = entry.map_err(|error| format!("Entrada invalida: {error}"))?;
        let path = entry.path();
        if path.extension().and_then(|value| value.to_str()) != Some("json") {
            continue;
        }

        let project = read_json_file(&path)?;
        let slug = slug_from_value(&project)?;
        projects.push(ProjectSummary {
            slug: slug.clone(),
            title: localized_title(&project),
            category: field_string(&project, "category", "web"),
            year: field_string(&project, "year", ""),
            status: field_string(&project, "status", "completed"),
            featured_level: field_string(&project, "featuredLevel", "normal"),
            visual_template: field_string(&project, "visualTemplate", "minimal"),
            href: field_string(&project, "href", &format!("/proyectos/{slug}")),
            preview_image: field_string(&project, "previewImage", ""),
            path: path.to_string_lossy().to_string(),
        });
    }

    projects.sort_by(|a, b| a.title.to_lowercase().cmp(&b.title.to_lowercase()));
    Ok(projects)
}

#[tauri::command]
pub fn read_project(slug: String) -> Result<Value, String> {
    let path = project_file(&slug)?;
    ensure_inside(&path, &repo_root()?)?;
    read_json_file(&path)
}

#[tauri::command]
pub fn save_project(payload: SaveProjectPayload) -> Result<SaveProjectResult, String> {
    let slug = slug_from_value(&payload.project)?;
    let target = project_file(&slug)?;
    let project_dir = projects_dir()?;
    fs::create_dir_all(&project_dir).map_err(|error| format!("No se pudo crear carpeta: {error}"))?;
    ensure_inside(&target, &repo_root()?)?;

    let original_slug = payload.original_slug.as_deref();
    if let Some(original_slug) = original_slug {
        if original_slug != slug && target.exists() {
            return Err("Ya existe un proyecto con el nuevo slug.".to_string());
        }

        if original_slug != slug {
            let original_assets = asset_dir(original_slug)?;
            let next_assets = asset_dir(&slug)?;
            if original_assets.exists() && !next_assets.exists() {
                ensure_inside(&original_assets, &repo_root()?)?;
                ensure_inside(&next_assets, &repo_root()?)?;
                copy_dir_contents(&original_assets, &next_assets)?;
            }
        }
    }

    let asset_paths = copy_asset_inputs(&slug, &payload.assets)?;
    validate_project_asset_references(&slug, &payload.project)?;
    write_json_file(&target, &payload.project)?;

    if let Some(original_slug) = original_slug {
        if original_slug != slug {
            let original = project_file(original_slug)?;
            if original.exists() {
                ensure_inside(&original, &project_dir)?;
                fs::remove_file(original).map_err(|error| format!("No se pudo eliminar JSON anterior: {error}"))?;
            }

            let original_assets = asset_dir(original_slug)?;
            let next_assets = asset_dir(&slug)?;
            if original_assets.exists() && next_assets.exists() {
                ensure_inside(&original_assets, &repo_root()?)?;
                let _ = fs::remove_dir_all(original_assets);
            }
        }
    }

    Ok(SaveProjectResult {
        slug,
        json_path: target.to_string_lossy().to_string(),
        asset_paths,
    })
}

#[tauri::command]
pub fn duplicate_project(payload: DuplicatePayload) -> Result<Value, String> {
    let source = read_project(payload.source_slug.clone())?;
    let mut duplicate = source.clone();
    duplicate["slug"] = json!(payload.target_slug);
    duplicate["href"] = json!(format!("/proyectos/{}", duplicate["slug"].as_str().unwrap_or("nuevo-proyecto")));
    duplicate["featuredLevel"] = json!("normal");
    duplicate["pinned"] = json!(false);

    let target_slug = slug_from_value(&duplicate)?;
    let target = project_file(&target_slug)?;
    if target.exists() {
        return Err("Ya existe un proyecto con ese slug.".to_string());
    }

    if payload.copy_assets {
        let source_assets = asset_dir(&payload.source_slug)?;
        let target_assets = asset_dir(&target_slug)?;
        if source_assets.exists() {
            fs::create_dir_all(&target_assets).map_err(|error| format!("No se pudo crear carpeta destino: {error}"))?;
            for entry in WalkDir::new(&source_assets).into_iter().filter_map(Result::ok) {
                if !entry.file_type().is_file() {
                    continue;
                }
                let relative = entry.path().strip_prefix(&source_assets).map_err(|error| error.to_string())?;
                let target_file = target_assets.join(relative);
                if let Some(parent) = target_file.parent() {
                    fs::create_dir_all(parent).map_err(|error| format!("No se pudo crear carpeta: {error}"))?;
                }
                fs::copy(entry.path(), target_file).map_err(|error| format!("No se pudo copiar asset: {error}"))?;
            }
        }
    } else {
        duplicate["previewImage"] = json!("");
        duplicate["media"] = json!({
            "cover": "",
            "gallery": [],
            "video": {
                "type": "youtube",
                "url": "",
                "youtubeId": ""
            }
        });
    }

    write_json_file(&target, &duplicate)?;
    Ok(duplicate)
}

#[tauri::command]
pub fn delete_project(payload: DeletePayload) -> Result<(), String> {
    if payload.delete_json {
        let path = project_file(&payload.slug)?;
        if path.exists() {
            ensure_inside(&path, &repo_root()?)?;
            fs::remove_file(path).map_err(|error| format!("No se pudo eliminar JSON: {error}"))?;
        }
    }

    if payload.delete_assets || payload.delete_asset_folder {
        let dir = asset_dir(&payload.slug)?;
        if dir.exists() {
            ensure_inside(&dir, &repo_root()?)?;
            if payload.delete_asset_folder {
                fs::remove_dir_all(dir).map_err(|error| format!("No se pudo eliminar carpeta de assets: {error}"))?;
            } else {
                for entry in fs::read_dir(dir).map_err(|error| format!("No se pudo listar assets: {error}"))? {
                    let entry = entry.map_err(|error| format!("Asset invalido: {error}"))?;
                    if entry.path().is_file() {
                        fs::remove_file(entry.path()).map_err(|error| format!("No se pudo eliminar asset: {error}"))?;
                    }
                }
            }
        }
    }

    Ok(())
}

#[tauri::command]
pub fn copy_assets(slug: String, assets: Vec<AssetInput>) -> Result<Vec<String>, String> {
    copy_asset_inputs(&slug, &assets)
}

#[tauri::command]
pub fn save_technology(technology: Value) -> Result<Vec<Value>, String> {
    let path = technologies_file()?;
    ensure_inside(&path, &repo_root()?)?;
    let mut technologies = if path.exists() {
        read_json_file(&path)?.as_array().cloned().unwrap_or_default()
    } else {
        Vec::new()
    };

    let slug = technology
        .get("slug")
        .and_then(Value::as_str)
        .filter(|value| !value.trim().is_empty())
        .ok_or_else(|| "La tecnologia necesita slug.".to_string())?;
    let index = technologies
        .iter()
        .position(|item| item.get("slug").and_then(Value::as_str) == Some(slug));

    if let Some(index) = index {
        technologies[index] = technology;
    } else {
        technologies.push(technology);
    }

    technologies.sort_by(|a, b| {
        a.get("name")
            .and_then(Value::as_str)
            .unwrap_or("")
            .to_lowercase()
            .cmp(&b.get("name").and_then(Value::as_str).unwrap_or("").to_lowercase())
    });
    write_json_file(&path, &Value::Array(technologies.clone()))?;
    Ok(technologies)
}

#[tauri::command]
pub fn run_sync_projects() -> Result<String, String> {
    let root = repo_root()?;
    let npm = if cfg!(target_os = "windows") { "npm.cmd" } else { "npm" };
    let output = Command::new(npm)
        .args(["run", "sync:projects"])
        .current_dir(root)
        .output()
        .map_err(|error| format!("No se pudo ejecutar sync:projects: {error}"))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

fn preview_port_is_live(port: u16) -> bool {
    let address = match format!("127.0.0.1:{port}").parse() {
        Ok(address) => address,
        Err(_) => return false,
    };

    let mut stream = match TcpStream::connect_timeout(&address, Duration::from_millis(350)) {
        Ok(stream) => stream,
        Err(_) => return false,
    };

    let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
    let _ = stream.set_write_timeout(Some(Duration::from_millis(500)));
    if stream
        .write_all(b"GET / HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n")
        .is_err()
    {
        return false;
    }

    let mut buffer = [0; 96];
    match stream.read(&mut buffer) {
        Ok(size) if size > 0 => {
            let response = String::from_utf8_lossy(&buffer[..size]);
            response.starts_with("HTTP/1.1 2") || response.starts_with("HTTP/1.1 3")
        }
        _ => true,
    }
}

fn preview_base_url() -> String {
    if let Ok(url) = env::var("PORTFOLIO_PREVIEW_URL") {
        let trimmed = url.trim().trim_end_matches('/').to_string();
        if !trimmed.is_empty() {
            return trimmed;
        }
    }

    for port in 4321..=4330 {
        if preview_port_is_live(port) {
            return format!("http://127.0.0.1:{port}");
        }
    }

    "http://127.0.0.1:4321".to_string()
}

#[tauri::command]
pub fn open_preview(slug: String) -> Result<(), String> {
    let base_url = preview_base_url();
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis())
        .unwrap_or_default();
    let url = format!("{base_url}/proyectos/{slug}?studioUpdated={timestamp}");
    open::that(url).map_err(|error| format!("No se pudo abrir preview: {error}"))
}
