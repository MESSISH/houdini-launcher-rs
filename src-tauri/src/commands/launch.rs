use std::env;
use std::path::PathBuf;
use std::process::Command;
use tauri::State;
use crate::AppState;

#[tauri::command]
pub async fn launch_houdini(
    exe_path: String,
    package_dir: String,
    config_root: String,
    env_vars: Vec<(String, String)>,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let exe = PathBuf::from(&exe_path);

    if !exe.exists() {
        return Err(format!("Houdini executable not found: {}", exe_path));
    }

    let mut env = env::vars().collect::<Vec<_>>();
    env.push(("HOUDINI_PACKAGE_DIR".to_string(), package_dir));
    env.push(("CONFIG_ROOT_PATH".to_string(), config_root));

    for (k, v) in &env_vars {
        env.push((k.clone(), v.clone()));
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let mut command = Command::new(&exe);
        command.env_clear();
        for (key, value) in &env {
            command.env(key, value);
        }
        command.creation_flags(CREATE_NO_WINDOW);
        command.current_dir(&state.config_paths.root);

        if let Ok(mut child) = command.spawn() {
            child.wait().ok();
        }
    }

    Ok(())
}
