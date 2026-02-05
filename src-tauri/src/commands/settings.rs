use std::path::PathBuf;
use tauri::State;
use crate::AppState;
use crate::utils::config::get_config_dir;

const APP_NAME: &str = "HoudiniLauncher";
const REG_PATH: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";

#[cfg(target_os = "windows")]
use winreg::enums::*;
#[cfg(target_os = "windows")]
use winreg::RegKey;

#[cfg(target_os = "windows")]
fn get_executable_path() -> String {
    let exe_path = std::env::current_exe()
        .unwrap_or_else(|_| PathBuf::from("launcher.exe"))
        .to_string_lossy()
        .to_string();
    format!(r#"{}"#, exe_path)
}

#[tauri::command]
pub fn is_autostart_enabled() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        if let Ok(key) = hkcu.open_subkey(REG_PATH) {
            if let Ok(_value) = key.get_value::<String, _>(APP_NAME) {
                return Ok(true);
            }
        }
        Ok(false)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[tauri::command]
pub fn set_autostart(enabled: bool) -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let key = hkcu.open_subkey_with_flags(REG_PATH, KEY_SET_VALUE)
            .map_err(|e| format!("Failed to open registry key: {}", e))?;

        if enabled {
            let exe_path = get_executable_path();
            key.set_value(APP_NAME, &exe_path)
                .map_err(|e| format!("Failed to set autostart: {}", e))?;
        } else {
            if let Ok(_) = key.delete_value(APP_NAME) {
                // Value deleted
            }
        }
        Ok(true)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[tauri::command]
pub fn is_deadline_monitor_enabled() -> Result<bool, String> {
    let config_dir = get_config_dir();
    let monitor_file = config_dir.join("deadline_monitor_enabled.txt");

    if monitor_file.exists() {
        if let Ok(content) = std::fs::read_to_string(&monitor_file) {
            return Ok(content.trim() == "1" || content.trim().to_lowercase() == "true");
        }
    }

    Ok(false)
}

#[tauri::command]
pub fn set_deadline_monitor_enabled(enabled: bool) -> Result<(), String> {
    let config_dir = get_config_dir();
    let monitor_file = config_dir.join("deadline_monitor_enabled.txt");

    let content = if enabled { "1" } else { "0" };
    std::fs::write(&monitor_file, content)
        .map_err(|e| format!("Failed to write deadline monitor setting: {}", e))?;

    Ok(())
}

#[tauri::command]
pub fn open_packages_dir(state: State<AppState>) -> Result<(), String> {
    let packages_dir = &state.config_paths.packages_dir;

    #[cfg(target_os = "windows")]
    {
        if let Err(e) = std::process::Command::new("explorer").arg(packages_dir).spawn() {
            return Err(format!("Failed to open packages dir: {}", e));
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        if let Err(e) = std::process::Command::new("open").arg(packages_dir).spawn() {
            return Err(format!("Failed to open packages dir: {}", e));
        }
    }

    Ok(())
}
