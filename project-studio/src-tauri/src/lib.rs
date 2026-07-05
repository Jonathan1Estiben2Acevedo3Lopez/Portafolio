mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::studio_status,
            commands::list_projects,
            commands::get_project,
            commands::get_profile,
            commands::list_studio_content,
            commands::get_studio_content,
            commands::set_studio_content_hidden,
            commands::pick_project_image,
            commands::pick_certificate_file,
            commands::pick_profile_cv,
            commands::write_project_preview,
            commands::open_project_preview,
            commands::create_project,
            commands::update_project,
            commands::move_project,
            commands::delete_project,
            commands::save_development_item,
            commands::move_development_item,
            commands::delete_development_item,
            commands::save_certificate,
            commands::move_certificate,
            commands::delete_certificate,
            commands::save_profile,
            commands::save_about_item,
            commands::delete_about_item,
            commands::save_blog_post,
            commands::delete_blog_post,
            commands::save_interest,
            commands::delete_interest
        ])
        .run(tauri::generate_context!())
        .expect("error while running Project Studio");
}
