use crate::models::{PresetData, PresetsFile};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;
use crate::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PresetsFileSave {
    default: Option<String>,
    presets: HashMap<String, PresetSaveData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PresetSaveData {
    packages: Vec<String>,
    houdini: String,
    avatar: Option<String>,
    avatar_path: Option<String>,
}

#[tauri::command]
pub fn load_presets(state: State<AppState>) -> Result<(Vec<PresetData>, Option<String>), String> {
    let path = &state.config_paths.presets_file;
    if !path.exists() {
        return Ok((Vec::new(), None));
    }

    match std::fs::read_to_string(path) {
        Ok(content) => {
            let data: PresetsFile = serde_json::from_str(&content).unwrap_or_else(|_| PresetsFile {
                default: None,
                presets: Vec::new(),
            });
            let default = data.default;
            let preset_list: Vec<PresetData> = data.presets.into_iter().collect();
            Ok((preset_list, default))
        }
        Err(_) => Ok((Vec::new(), None)),
    }
}

#[tauri::command]
pub fn save_presets(
    presets: Vec<PresetData>,
    default_preset: Option<String>,
    state: State<AppState>,
) -> Result<(), String> {
    let path = &state.config_paths.presets_file;

    let mut presets_map = HashMap::new();
    for preset in &presets {
        presets_map.insert(preset.name.clone(), PresetSaveData {
            packages: preset.packages.clone(),
            houdini: preset.houdini.clone(),
            avatar: if preset.avatar.is_empty() { None } else { Some(preset.avatar.clone()) },
            avatar_path: if preset.avatar_path.is_empty() { None } else { Some(preset.avatar_path.clone()) },
        });
    }

    let data = PresetsFileSave {
        default: default_preset,
        presets: presets_map,
    };

    let content = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize presets: {}", e))?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create config dir: {}", e))?;
    }

    std::fs::write(path, content)
        .map_err(|e| format!("Failed to write presets: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn create_preset(
    name: String,
    packages: Vec<String>,
    houdini: String,
    _state: State<AppState>,
) -> Result<PresetData, String> {
    Ok(PresetData {
        name,
        packages,
        houdini,
        avatar: String::new(),
        avatar_path: String::new(),
    })
}

#[tauri::command]
pub fn delete_preset(_name: String, _state: State<AppState>) -> Result<(), String> {
    Ok(())
}

#[tauri::command]
pub fn set_default_preset(
    _name: String,
    _packages: Vec<String>,
    _state: State<AppState>,
) -> Result<(), String> {
    Ok(())
}
