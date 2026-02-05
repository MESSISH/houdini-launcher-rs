#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod utils;

use commands::config::get_config_paths;
use models::{ConfigPaths, Package, PresetData};
use tauri::WindowEvent;

pub struct AppState {
    pub config_paths: ConfigPaths,
    pub packages: Vec<Package>,
    pub presets: Vec<PresetData>,
    pub default_preset: Option<String>,
    pub favorites: Vec<String>,
}

impl AppState {
    pub fn new() -> Self {
        let config_root = utils::config::load_saved_config_root();
        let config_paths = ConfigPaths::from_root(&config_root);
        Self {
            config_paths,
            packages: Vec::new(),
            presets: Vec::new(),
            default_preset: None,
            favorites: Vec::new(),
        }
    }
}

#[tauri::command]
fn get_app_icon() -> Result<String, String> {
    let icon_path = utils::config::get_config_dir().join("icon").join("houdini_badge_flat.svg");
    if icon_path.exists() {
        return Ok(icon_path.to_string_lossy().to_string());
    }
    Err("Icon not found".to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            get_config_paths,
            commands::config::discover_config_root_cmd,
            commands::config::save_config_root,
            commands::houdini::list_houdini_versions,
            commands::houdini::get_houdini_exe_path,
            commands::houdini::save_houdini_exe,
            commands::houdini::load_saved_houdini_exe,
            commands::packages::load_packages,
            commands::packages::save_package_enabled,
            commands::packages::get_packages_list,
            commands::packages::load_favorites,
            commands::packages::save_favorites,
            commands::presets::load_presets,
            commands::presets::save_presets,
            commands::presets::create_preset,
            commands::presets::delete_preset,
            commands::presets::set_default_preset,
            commands::launch::launch_houdini,
            commands::settings::is_autostart_enabled,
            commands::settings::set_autostart,
            commands::settings::is_deadline_monitor_enabled,
            commands::settings::set_deadline_monitor_enabled,
            commands::settings::open_packages_dir,
            get_app_icon,
        ])
        .on_window_event(|window: &tauri::Window, event: &WindowEvent| match event {
            WindowEvent::CloseRequested { api, .. } => {
                window.hide().ok();
                api.prevent_close();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
