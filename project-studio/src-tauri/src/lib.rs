mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      commands::studio_status,
      commands::pick_project_image,
      commands::write_project_preview,
      commands::open_project_preview,
      commands::create_project
    ])
    .run(tauri::generate_context!())
    .expect("error while running Project Studio");
}
