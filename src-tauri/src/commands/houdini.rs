use crate::models::HoudiniVersion;
use crate::utils::config::{get_houdini_exe_txt_path, get_houdini_root_txt_path};
use std::path::{Path, PathBuf};
use tauri::State;
use crate::AppState;

#[tauri::command]
pub fn list_houdini_versions(state: State<'_, AppState>) -> Result<Vec<HoudiniVersion>, String> {
    let roots = common_houdini_roots();

    for root in &roots {
        let versions = list_houdini_versions_from_root(root);
        if !versions.is_empty() {
            return Ok(versions);
        }
    }

    let versions = list_houdini_versions_from_root(&state.config_paths.root);
    if !versions.is_empty() {
        return Ok(versions);
    }

    Ok(Vec::new())
}

fn common_houdini_roots() -> Vec<PathBuf> {
    vec![
        PathBuf::from(r"C:\Program Files\Side Effects Software"),
        PathBuf::from(r"C:\Program Files\SideFX"),
    ]
}

pub fn list_houdini_versions_from_root(install_root: &Path) -> Vec<HoudiniVersion> {
    if !install_root.exists() {
        return Vec::new();
    }

    let mut versions: Vec<HoudiniVersion> = Vec::new();

    if let Ok(entries) = std::fs::read_dir(install_root) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                let name = path.file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();

                if name.starts_with("Houdini") {
                    let bin_path = path.join("bin");
                    if bin_path.is_dir() {
                        versions.push(HoudiniVersion {
                            name: name.clone(),
                            path: path.clone(),
                            bin_path,
                        });
                    }
                }
            }
        }
    }

    versions.sort_by(|a, b| b.name.cmp(&a.name));
    versions
}

#[tauri::command]
pub fn get_houdini_exe_path(
    version_path: String,
    exe_name: Option<String>,
) -> Result<String, String> {
    let version_path = PathBuf::from(version_path);
    let exe_name = exe_name.unwrap_or_else(|| "houdinifx.exe".to_string());

    let exe_path = version_path.join("bin").join(&exe_name);
    let fallback_path = version_path.join("bin").join("houdini.exe");

    if exe_path.exists() {
        return Ok(exe_path.to_string_lossy().to_string());
    }
    if fallback_path.exists() {
        return Ok(fallback_path.to_string_lossy().to_string());
    }

    Ok(exe_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn save_houdini_exe(exe_path: String) -> Result<(), String> {
    let path = get_houdini_exe_txt_path();
    std::fs::write(&path, exe_path)
        .map_err(|e| format!("Failed to save Houdini exe: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn load_saved_houdini_exe() -> Result<Option<String>, String> {
    let path = get_houdini_exe_txt_path();
    if path.exists() {
        match std::fs::read_to_string(&path) {
            Ok(text) => {
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    return Ok(Some(trimmed.to_string()));
                }
            }
            Err(_) => {}
        }
    }
    Ok(None)
}

#[tauri::command]
pub fn load_saved_houdini_root() -> Result<Option<PathBuf>, String> {
    let path = get_houdini_root_txt_path();
    if path.exists() {
        match std::fs::read_to_string(&path) {
            Ok(text) => {
                let trimmed = text.trim();
                if !trimmed.is_empty() {
                    return Ok(Some(PathBuf::from(trimmed)));
                }
            }
            Err(_) => {}
        }
    }
    Ok(None)
}

#[tauri::command]
pub fn save_houdini_root(root: PathBuf) -> Result<(), String> {
    let path = get_houdini_root_txt_path();
    std::fs::write(&path, root.to_string_lossy().as_ref())
        .map_err(|e| format!("Failed to save Houdini root: {}", e))?;
    Ok(())
}
