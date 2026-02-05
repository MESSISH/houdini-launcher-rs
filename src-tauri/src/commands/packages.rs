use crate::models::Package;
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FavoritesFile {
    favorites: Vec<String>,
}

#[tauri::command]
pub fn load_packages(state: State<AppState>) -> Result<Vec<Package>, String> {
    let packages_dir = &state.config_paths.packages_dir;
    if !packages_dir.exists() {
        return Ok(Vec::new());
    }

    let mut packages: Vec<Package> = Vec::new();

    let entries = match std::fs::read_dir(packages_dir) {
        Ok(e) => e,
        Err(_) => return Ok(Vec::new()),
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("json") {
            match std::fs::read_to_string(&path) {
                Ok(content) => {
                    match serde_json::from_str::<serde_json::Value>(&content) {
                        Ok(data) => {
                            let pkg = Package::from_json(
                                path.file_stem()
                                    .unwrap_or_default()
                                    .to_string_lossy()
                                    .to_string(),
                                path,
                                data,
                                state.config_paths.root.clone(),
                            );
                            packages.push(pkg);
                        }
                        Err(e) => {
                            eprintln!("Failed to parse {}: {}", path.display(), e);
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to read {}: {}", path.display(), e);
                }
            }
        }
    }

    packages.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(packages)
}

#[tauri::command]
pub fn save_package_enabled(
    package_name: String,
    enabled: bool,
    state: State<AppState>,
) -> Result<(), String> {
    let packages_dir = &state.config_paths.packages_dir;
    let pkg_path = packages_dir.join(&format!("{}.json", package_name));

    if !pkg_path.exists() {
        return Err(format!("Package file not found: {}", pkg_path.display()));
    }

    match std::fs::read_to_string(&pkg_path) {
        Ok(content) => {
            let mut data: serde_json::Value = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse package JSON: {}", e))?;

            data["enable"] = serde_json::Value::Bool(enabled);

            let new_content = serde_json::to_string_pretty(&data)
                .map_err(|e| format!("Failed to serialize package: {}", e))?;

            std::fs::write(&pkg_path, new_content)
                .map_err(|e| format!("Failed to write package: {}", e))?;

            Ok(())
        }
        Err(e) => Err(format!("Failed to read package: {}", e)),
    }
}

#[tauri::command]
pub fn get_packages_list(state: State<AppState>) -> Result<Vec<Package>, String> {
    load_packages(state)
}

#[tauri::command]
pub fn load_favorites(state: State<AppState>) -> Result<Vec<String>, String> {
    let path = &state.config_paths.favorites_file;
    if !path.exists() {
        return Ok(Vec::new());
    }

    match std::fs::read_to_string(path) {
        Ok(content) => {
            let data: FavoritesFile = serde_json::from_str(&content).unwrap_or_else(|_| FavoritesFile { favorites: Vec::new() });
            Ok(data.favorites)
        }
        Err(_) => Ok(Vec::new()),
    }
}

#[tauri::command]
pub fn save_favorites(
    favorites: Vec<String>,
    state: State<AppState>,
) -> Result<(), String> {
    let path = &state.config_paths.favorites_file;

    let data = FavoritesFile { favorites };
    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize favorites: {}", e))?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config dir: {}", e))?;
    }

    std::fs::write(path, content)
        .map_err(|e| format!("Failed to write favorites: {}", e))?;

    Ok(())
}
