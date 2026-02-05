use crate::models::ConfigPaths;
use crate::utils::config::{discover_config_root as utils_discover_config_root, load_saved_config_root};
use std::path::PathBuf;
use tauri::State;
use crate::AppState;

#[tauri::command]
pub fn get_config_paths(state: State<'_, AppState>) -> Result<ConfigPaths, String> {
    let config_root = load_saved_config_root();
    let config_paths = ConfigPaths::from_root(&config_root);
    Ok(config_paths)
}

#[tauri::command]
pub fn discover_config_root_cmd(explicit: Option<String>) -> Result<PathBuf, String> {
    let root = utils_discover_config_root(explicit);
    Ok(root)
}

#[tauri::command]
pub fn save_config_root(root: PathBuf) -> Result<(), String> {
    use crate::utils::config::save_config_root;
    save_config_root(&root)
        .map_err(|e| format!("Failed to save config root: {}", e))?;
    Ok(())
}
