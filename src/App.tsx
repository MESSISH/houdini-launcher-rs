import { useState, useEffect } from 'react';
import { api, HoudiniVersion, Package, PresetData } from './services/api';

type TabType = 'houdini' | 'packages' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('houdini');
  const [houdiniVersions, setHoudiniVersions] = useState<HoudiniVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<HoudiniVersion | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [presets, setPresets] = useState<PresetData[]>([]);
  const [defaultPreset, setDefaultPreset] = useState<string | null>(null);
  const [currentPreset, setCurrentPreset] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [configPaths, setConfigPaths] = useState<any>(null);
  const [autostart, setAutostart] = useState(false);
  const [deadlineMonitor, setDeadlineMonitor] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const paths = await api.getConfigPaths();
      setConfigPaths(paths);

      const [versions, pkgs, { presets: p, default: def }, favs] = await Promise.all([
        api.listHoudiniVersions(),
        api.loadPackages(),
        api.loadPresets(),
        api.loadFavorites(),
      ]);

      setHoudiniVersions(versions);
      setPackages(pkgs);
      setPresets(p || []);
      setDefaultPreset(def);
      setFavorites(favs || []);

      const savedExe = await api.loadSavedHoudiniExe();
      if (savedExe && versions.length > 0) {
        const version = versions.find(v => savedExe.includes(v.name) || savedExe.includes(v.path));
        if (version) setSelectedVersion(version);
      } else if (versions.length > 0) {
        setSelectedVersion(versions[0]);
      }

      const [auto, deadline] = await Promise.all([
        api.isAutostartEnabled(),
        api.isDeadlineMonitorEnabled(),
      ]);
      setAutostart(auto);
      setDeadlineMonitor(deadline);
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const handleLaunch = async () => {
    if (!selectedVersion) return;
    try {
      const exePath = await api.getHoudiniExePath(selectedVersion.path);
      await api.launchHoudini(exePath, configPaths.packages_dir, configPaths.root, []);
    } catch (error) {
      console.error('Failed to launch Houdini:', error);
    }
  };

  const handlePackageToggle = async (pkgName: string, enabled: boolean) => {
    try {
      await api.savePackageEnabled(pkgName, enabled);
      const pkgs = await api.loadPackages();
      setPackages(pkgs);
    } catch (error) {
      console.error('Failed to toggle package:', error);
    }
  };

  const handleFavoriteToggle = async (pkgName: string) => {
    const newFavorites = favorites.includes(pkgName)
      ? favorites.filter(f => f !== pkgName)
      : [...favorites, pkgName];
    try {
      await api.saveFavorites(newFavorites);
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleCreatePreset = async () => {
    const name = prompt('Enter preset name:');
    if (!name) return;
    try {
      const enabledPackages = packages.filter(p => p.enabled).map(p => p.name);
      await api.createPreset(name, enabledPackages, selectedVersion?.name || '');
      const { presets: p } = await api.loadPresets();
      setPresets(p || []);
      setCurrentPreset(name);
    } catch (error) {
      console.error('Failed to create preset:', error);
    }
  };

  const handleApplyPreset = async (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (!preset) return;
    try {
      await Promise.all(
        packages.map(pkg =>
          api.savePackageEnabled(pkg.name, preset.packages.includes(pkg.name))
        )
      );
      const pkgs = await api.loadPackages();
      setPackages(pkgs);
      setCurrentPreset(presetName);
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  };

  const handleSetDefault = async (presetName: string) => {
    try {
      await api.setDefaultPreset(presetName, packages.filter(p => p.enabled).map(p => p.name));
      setDefaultPreset(presetName);
    } catch (error) {
      console.error('Failed to set default preset:', error);
    }
  };

  const handleDeletePreset = async (presetName: string) => {
    if (!confirm(`Delete preset "${presetName}"?`)) return;
    try {
      await api.deletePreset(presetName);
      const { presets: p } = await api.loadPresets();
      setPresets(p || []);
      if (currentPreset === presetName) setCurrentPreset(null);
      if (defaultPreset === presetName) setDefaultPreset(null);
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const handleSavePresets = async () => {
    try {
      await api.savePresets(presets, defaultPreset);
    } catch (error) {
      console.error('Failed to save presets:', error);
    }
  };

  const handleAutostartToggle = async () => {
    const newValue = !autostart;
    try {
      await api.setAutostart(newValue);
      setAutostart(newValue);
    } catch (error) {
      console.error('Failed to toggle autostart:', error);
    }
  };

  const handleDeadlineMonitorToggle = async () => {
    const newValue = !deadlineMonitor;
    try {
      await api.setDeadlineMonitorEnabled(newValue);
      setDeadlineMonitor(newValue);
    } catch (error) {
      console.error('Failed to toggle deadline monitor:', error);
    }
  };

  const handleOpenPackagesDir = async () => {
    try {
      await api.openPackagesDir();
    } catch (error) {
      console.error('Failed to open packages dir:', error);
    }
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.file_path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledPackages = filteredPackages.filter(p => p.enabled);
  const disabledPackages = filteredPackages.filter(p => !p.enabled);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Houdini Launcher</h1>
        </div>

        <div className="preset-section">
          <div className="preset-label">Current Preset</div>
          <select
            className="preset-select"
            value={currentPreset || ''}
            onChange={(e) => handleApplyPreset(e.target.value)}
          >
            <option value="">No Preset</option>
            {presets.map(p => (
              <option key={p.name} value={p.name}>
                {p.name}{p.name === defaultPreset ? ' (Default)' : ''}
              </option>
            ))}
          </select>
          <div className="preset-actions">
            <button className="preset-action-btn" onClick={handleCreatePreset}>
              + New
            </button>
            {currentPreset && (
              <button
                className="preset-action-btn"
                onClick={() => handleSetDefault(currentPreset)}
              >
                Set Default
              </button>
            )}
            {currentPreset && currentPreset !== defaultPreset && (
              <button
                className="preset-action-btn"
                onClick={() => handleDeletePreset(currentPreset)}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <nav className="nav-menu">
          <div
            className={`nav-item ${activeTab === 'houdini' ? 'active' : ''}`}
            onClick={() => setActiveTab('houdini')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Houdini Versions
          </div>
          <div
            className={`nav-item ${activeTab === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveTab('packages')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Packages
          </div>
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </div>
        </nav>

        <button className="launch-button" onClick={handleLaunch}>
          Launch Houdini
        </button>
      </aside>

      <main className="main-content">
        {activeTab === 'houdini' && (
          <div>
            <h2 className="page-title">Houdini Versions</h2>
            <div className="card">
              <div className="card-title">Select Version</div>
              {houdiniVersions.length === 0 ? (
                <div className="empty-state">
                  No Houdini installations found. Please configure the Houdini install directory in Settings.
                </div>
              ) : (
                <div className="version-grid">
                  {houdiniVersions.map(version => (
                    <div
                      key={version.path}
                      className={`version-item ${selectedVersion?.path === version.path ? 'selected' : ''}`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="version-name">{version.name}</div>
                      <div className="version-path">{version.path}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <div>
            <h2 className="page-title">Packages</h2>
            <div className="card">
              <input
                type="text"
                className="search-input"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="packages-container">
                <div className="packages-column">
                  <div className="column-header">
                    Enabled ({enabledPackages.length})
                  </div>
                  <div className="package-list">
                    {enabledPackages.map(pkg => (
                      <div key={pkg.name} className="package-item">
                        <span
                          className={`favorite-star ${favorites.includes(pkg.name) ? 'active' : ''}`}
                          onClick={() => handleFavoriteToggle(pkg.name)}
                        >
                          {favorites.includes(pkg.name) ? '★' : '☆'}
                        </span>
                        <input
                          type="checkbox"
                          className="package-checkbox"
                          checked={pkg.enabled}
                          onChange={() => handlePackageToggle(pkg.name, !pkg.enabled)}
                        />
                        <span className="package-name">{pkg.name}</span>
                        <span className="package-path">{pkg.file_path}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="packages-column">
                  <div className="column-header">
                    Disabled ({disabledPackages.length})
                  </div>
                  <div className="package-list">
                    {disabledPackages.map(pkg => (
                      <div key={pkg.name} className="package-item">
                        <span
                          className={`favorite-star ${favorites.includes(pkg.name) ? 'active' : ''}`}
                          onClick={() => handleFavoriteToggle(pkg.name)}
                        >
                          {favorites.includes(pkg.name) ? '★' : '☆'}
                        </span>
                        <input
                          type="checkbox"
                          className="package-checkbox"
                          checked={pkg.enabled}
                          onChange={() => handlePackageToggle(pkg.name, !pkg.enabled)}
                        />
                        <span className="package-name">{pkg.name}</span>
                        <span className="package-path">{pkg.file_path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2 className="page-title">Settings</h2>
            <div className="card">
              <div className="card-title">Houdini Configuration</div>
              <div className="settings-section">
                <label className="settings-label">Packages Directory</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    className="settings-input"
                    value={configPaths?.packages_dir || ''}
                    readOnly
                  />
                  <button className="browse-button" onClick={handleOpenPackagesDir}>
                    Open Folder
                  </button>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-title">General Settings</div>
              <div className="settings-row">
                <span>Startup with Windows</span>
                <div
                  className={`settings-toggle ${autostart ? 'active' : ''}`}
                  onClick={handleAutostartToggle}
                />
              </div>
              <div className="settings-row">
                <span>Deadline Remote Monitor</span>
                <div
                  className={`settings-toggle ${deadlineMonitor ? 'active' : ''}`}
                  onClick={handleDeadlineMonitorToggle}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
