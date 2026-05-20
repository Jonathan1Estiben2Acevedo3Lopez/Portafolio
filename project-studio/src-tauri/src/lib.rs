mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_projects,
            commands::read_project,
            commands::save_project,
            commands::duplicate_project,
            commands::delete_project,
            commands::copy_assets,
            commands::save_technology,
            commands::run_sync_projects,
            commands::open_preview
        ])
        .run(tauri::generate_context!())
        .expect("error while running Project Studio");
}
