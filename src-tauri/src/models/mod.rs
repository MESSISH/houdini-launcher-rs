use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigPaths {
    pub root: PathBuf,
    pub packages_dir: PathBuf,
    pub global_vars_file: PathBuf,
    pub presets_file: PathBuf,
    pub favorites_file: PathBuf,
    pub houdini_root_file: PathBuf,
    pub houdini_exe_file: PathBuf,
}

impl ConfigPaths {
    pub fn from_root(root: &Option<PathBuf>) -> Self {
        let root = root.clone().unwrap_or_else(|| PathBuf::from("."));
        Self {
            root: root.clone(),
            packages_dir: root.join("packages"),
            global_vars_file: root.join("scripts").join("global_vars.json"),
            presets_file: root.join("config").join("launcher_presets.json"),
            favorites_file: root.join("config").join("launcher_favorites.json"),
            houdini_root_file: root.join("config").join("houdini_root.txt"),
            houdini_exe_file: root.join("config").join("houdini_exe.txt"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Package {
    pub name: String,
    pub file_path: PathBuf,
    pub data: serde_json::Value,
    pub enabled: bool,
    pub config_root: PathBuf,
}

impl Package {
    pub fn from_json(name: String, file_path: PathBuf, data: serde_json::Value, config_root: PathBuf) -> Self {
        let enabled = data.get("enable")
            .and_then(|v| v.as_bool())
            .unwrap_or(true);
        Self {
            name,
            file_path,
            data,
            enabled,
            config_root,
        }
    }

    pub fn has_missing_paths(&self) -> bool {
        if let Some(env) = self.data.get("env") {
            if let Some(arr) = env.as_array() {
                for entry in arr {
                    if let Some(obj) = entry.as_object() {
                        for (key, value) in obj {
                            if key == "hpath" || key == "path" {
                                let path_str = value.as_str().unwrap_or("");
                                let resolved = self.resolve_path(path_str);
                                if !resolved.exists() {
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        }
        false
    }

    fn resolve_path(&self, raw: &str) -> PathBuf {
        let mut resolved = raw.to_string();
        let env_vars = self.get_env_map();
        for (key, val) in env_vars {
            resolved = resolved.replace(&format!("${}", key), &val);
        }
        resolved = resolved.replace("$CONFIG_ROOT_PATH", &self.config_root.to_string_lossy());
        PathBuf::from(resolved)
    }

    fn get_env_map(&self) -> std::collections::HashMap<String, String> {
        let mut env = std::collections::HashMap::new();
        if let Some(env_arr) = self.data.get("env").and_then(|v| v.as_array()) {
            for entry in env_arr {
                if let Some(obj) = entry.as_object() {
                    for (key, val) in obj {
                        match val {
                            serde_json::Value::String(s) => { env.insert(key.clone(), s.clone()); }
                            serde_json::Value::Number(n) => { env.insert(key.clone(), n.to_string()); }
                            _ => {}
                        }
                    }
                }
            }
        }
        env
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetData {
    pub name: String,
    pub packages: Vec<String>,
    pub houdini: String,
    pub avatar: String,
    pub avatar_path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PresetsFile {
    pub default: Option<String>,
    pub presets: Vec<PresetData>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FavoritesFile {
    pub favorites: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GlobalVarsFile {
    #[serde(flatten)]
    pub vars: std::collections::HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HoudiniVersion {
    pub name: String,
    pub path: PathBuf,
    pub bin_path: PathBuf,
}
