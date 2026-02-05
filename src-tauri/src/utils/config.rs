use std::path::{Path, PathBuf};
use serde::Deserialize;
use dirs;

const CONFIG_DIR_NAME: &str = "houdini-launcher";

pub fn get_home_dir() -> Option<PathBuf> {
    dirs::home_dir()
}

pub fn get_config_dir() -> PathBuf {
    if let Some(home) = get_home_dir() {
        home.join(CONFIG_DIR_NAME)
    } else {
        PathBuf::from(CONFIG_DIR_NAME)
    }
}

pub fn ensure_config_dir() -> PathBuf {
    let config_dir = get_config_dir();
    if !config_dir.exists() {
        std::fs::create_dir_all(&config_dir).ok();
    }
    config_dir
}

pub fn get_config_root_txt_path() -> PathBuf {
    get_config_dir().join("config_root.txt")
}

pub fn load_saved_config_root() -> Option<PathBuf> {
    let path = get_config_root_txt_path();
    if path.exists() {
        if let Ok(text) = std::fs::read_to_string(&path) {
            let trimmed = text.trim();
            if !trimmed.is_empty() {
                return Some(PathBuf::from(trimmed));
            }
        }
    }
    None
}

pub fn save_config_root(root: &Path) -> Result<(), std::io::Error> {
    let path = get_config_root_txt_path();
    std::fs::write(&path, root.to_string_lossy().as_ref())
}

pub fn get_presets_json_path() -> PathBuf {
    get_config_dir().join("launcher_presets.json")
}

pub fn get_favorites_json_path() -> PathBuf {
    get_config_dir().join("launcher_favorites.json")
}

pub fn get_houdini_root_txt_path() -> PathBuf {
    get_config_dir().join("houdini_root.txt")
}

pub fn get_houdini_exe_txt_path() -> PathBuf {
    get_config_dir().join("houdini_exe.txt")
}

pub fn looks_like_config_root(path: &Path) -> bool {
    path.join("packages").is_dir()
}

pub fn normalize_path(p: PathBuf) -> PathBuf {
    if let Ok(expanded) = expand_tilde(&p) {
        expanded
    } else {
        p
    }
}

fn expand_tilde(path: &Path) -> Result<PathBuf, std::io::Error> {
    if let Some(s) = path.to_str() {
        if s.starts_with("~") {
            if let Some(home) = dirs::home_dir() {
                return Ok(home.join(&s[1..]));
            }
        }
    }
    Ok(path.to_path_buf())
}

pub fn load_json_file<T: serde::de::DeserializeOwned>(path: &Path) -> Option<T> {
    if !path.exists() {
        return None;
    }
    match std::fs::read_to_string(path) {
        Ok(content) => {
            serde_json::from_str(&content).ok()
        }
        Err(_) => None,
    }
}

pub fn save_json_file<T: serde::Serialize>(path: &Path, data: &T) -> Result<(), std::io::Error> {
    let content = serde_json::to_string_pretty(data).unwrap_or_default();
    std::fs::write(path, content)
}

pub fn discover_config_root(explicit: Option<String>) -> PathBuf {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Some(s) = explicit {
        candidates.push(normalize_path(PathBuf::from(s)));
    }

    if let Some(saved) = load_saved_config_root() {
        candidates.push(normalize_path(saved));
    }

    if let Ok(env_root) = std::env::var("HOUDINI_CONFIG_ROOT") {
        candidates.push(normalize_path(PathBuf::from(env_root)));
    }

    candidates.push(std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")));

    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();

    for start in &candidates {
        let mut current = Some(start.clone());
        while let Some(p) = current {
            let key = p.to_string_lossy().to_string();
            if seen.contains(&key) {
                break;
            }
            seen.insert(key);

            if looks_like_config_root(&p) {
                return p;
            }
            current = p.parent().map(|x| x.to_path_buf());
        }
    }

    candidates.first().cloned().unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")))
}
