import { invoke } from '@tauri-apps/api/core';

export interface HoudiniVersion {
  name: string;
  path: string;
  bin_path: string;
}

export interface Package {
  name: string;
  file_path: string;
  data: Record<string, unknown>;
  enabled: boolean;
  config_root: string;
}

export interface PresetData {
  name: string;
  packages: string[];
  houdini: string;
  avatar: string;
  avatar_path: string;
}

export interface ConfigPaths {
  root: string;
  packages_dir: string;
  global_vars_file: string;
  presets_file: string;
  favorites_file: string;
  houdini_root_file: string;
  houdini_exe_file: string;
}

class ApiService {
  // Config
  async getConfigPaths(): Promise<ConfigPaths> {
    return invoke('get_config_paths');
  }

  async discoverConfigRoot(explicit?: string): Promise<string> {
    return invoke('discover_config_root', { explicit });
  }

  async saveConfigRoot(root: string): Promise<void> {
    return invoke('save_config_root', { root });
  }

  // Houdini
  async listHoudiniVersions(): Promise<HoudiniVersion[]> {
    return invoke('list_houdini_versions');
  }

  async getHoudiniExePath(versionPath: string, exeName?: string): Promise<string> {
    return invoke('get_houdini_exe_path', { versionPath, exeName });
  }

  async saveHoudiniExe(exePath: string): Promise<void> {
    return invoke('save_houdini_exe', { exePath });
  }

  async loadSavedHoudiniExe(): Promise<string | null> {
    return invoke('load_saved_houdini_exe');
  }

  // Packages
  async loadPackages(): Promise<Package[]> {
    return invoke('load_packages');
  }

  async savePackageEnabled(name: string, enabled: boolean): Promise<void> {
    return invoke('save_package_enabled', { packageName: name, enabled });
  }

  async loadFavorites(): Promise<string[]> {
    return invoke('load_favorites');
  }

  async saveFavorites(favorites: string[]): Promise<void> {
    return invoke('save_favorites', { favorites });
  }

  // Presets
  async loadPresets(): Promise<{ presets: PresetData[]; default: string | null }> {
    return invoke('load_presets');
  }

  async savePresets(presets: PresetData[], defaultPreset: string | null): Promise<void> {
    return invoke('save_presets', { presets, defaultPreset });
  }

  async createPreset(name: string, packages: string[], houdini: string): Promise<PresetData> {
    return invoke('create_preset', { name, packages, houdini });
  }

  async deletePreset(name: string): Promise<void> {
    return invoke('delete_preset', { name });
  }

  async setDefaultPreset(name: string, packages: string[]): Promise<void> {
    return invoke('set_default_preset', { name, packages });
  }

  // Launch
  async launchHoudini(
    exePath: string,
    packageDir: string,
    configRoot: string,
    envVars: [string, string][]
  ): Promise<void> {
    return invoke('launch_houdini', { exePath, packageDir, configRoot, envVars });
  }

  // Settings
  async isAutostartEnabled(): Promise<boolean> {
    return invoke('is_autostart_enabled');
  }

  async setAutostart(enabled: boolean): Promise<boolean> {
    return invoke('set_autostart', { enabled });
  }

  async isDeadlineMonitorEnabled(): Promise<boolean> {
    return invoke('is_deadline_monitor_enabled');
  }

  async setDeadlineMonitorEnabled(enabled: boolean): Promise<void> {
    return invoke('set_deadline_monitor_enabled', { enabled });
  }

  async openPackagesDir(): Promise<void> {
    return invoke('open_packages_dir');
  }

  // UI
  async getAppIcon(): Promise<string> {
    return invoke('get_app_icon');
  }

  async centerWindow(): Promise<void> {
    return invoke('center_window');
  }
}

export const api = new ApiService();
