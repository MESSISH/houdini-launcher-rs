import { useState, useEffect } from 'react';
import { api, HoudiniVersion, Package, PresetData } from './services/api';

type TabType = 'houdini' | 'packages' | 'settings';

// SVG Icons as components
const Icons = {
  Houdini: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  Box: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Play: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Star: ({ filled }: { filled: boolean }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  Folder: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Rocket: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
};

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    if (!presetName) {
      setCurrentPreset(null);
      return;
    }
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

  const NavButton = ({ id, icon: Icon, label }: { id: TabType; icon: React.ComponentType<any>; label: string }) => (
    <button
      className={`nav-item ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <Icon className="nav-icon" />
      {label}
    </button>
  );

  const renderHoudiniTab = () => (
    <>
      <div className="page-header">
        <h1 className="page-title">Houdini Versions</h1>
        <p className="page-subtitle">Select a Houdini installation to launch</p>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Available Versions</h2>
            <p className="card-subtitle">{houdiniVersions.length} installation(s) found</p>
          </div>
        </div>

        {houdiniVersions.length === 0 ? (
          <div className="empty-state">
            <Icons.AlertCircle />
            <h3 className="empty-state-title">No Houdini Installations Found</h3>
            <p className="empty-state-text">
              Please configure the Houdini install directory in Settings.
              Houdini is typically installed at &quot;C:\Program Files\Side Effects Software\&quot;
            </p>
          </div>
        ) : (
          <div className="version-grid">
            {houdiniVersions.map(version => (
              <div
                key={version.path}
                className={`version-card ${selectedVersion?.path === version.path ? 'selected' : ''}`}
                onClick={() => setSelectedVersion(version)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedVersion(version)}
              >
                <div className="version-name">{version.name}</div>
                <div className="version-path">{version.path}</div>
                {selectedVersion?.path === version.path && (
                  <span className="version-badge">Selected</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  const renderPackagesTab = () => (
    <>
      <div className="page-header">
        <h1 className="page-title">Packages</h1>
        <p className="page-subtitle">Manage Houdini packages and favorites</p>
      </div>

      <div className="search-container">
        <Icons.Search />
        <input
          type="text"
          className="search-input"
          placeholder="Search packages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search packages"
        />
      </div>

      <div className="packages-layout">
        <div className="package-column">
          <div className="column-header enabled">
            <span className="column-title">
              <Icons.Check />
              Enabled
            </span>
            <span className="column-count">{enabledPackages.length}</span>
          </div>
          <div className="package-list">
            {enabledPackages.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p className="empty-state-text">No enabled packages</p>
              </div>
            ) : (
              enabledPackages.map(pkg => (
                <PackageItem
                  key={pkg.name}
                  pkg={pkg}
                  isFavorite={favorites.includes(pkg.name)}
                  onToggle={() => handlePackageToggle(pkg.name, !pkg.enabled)}
                  onFavoriteToggle={() => handleFavoriteToggle(pkg.name)}
                />
              ))
            )}
          </div>
        </div>

        <div className="package-column">
          <div className="column-header disabled">
            <span className="column-title">
              <Icons.X />
              Disabled
            </span>
            <span className="column-count">{disabledPackages.length}</span>
          </div>
          <div className="package-list">
            {disabledPackages.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <p className="empty-state-text">No disabled packages</p>
              </div>
            ) : (
              disabledPackages.map(pkg => (
                <PackageItem
                  key={pkg.name}
                  pkg={pkg}
                  isFavorite={favorites.includes(pkg.name)}
                  onToggle={() => handlePackageToggle(pkg.name, !pkg.enabled)}
                  onFavoriteToggle={() => handleFavoriteToggle(pkg.name)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderSettingsTab = () => (
    <>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Configure launcher preferences</p>
      </div>

      <div className="settings-grid">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Houdini Configuration</h2>
          </div>
          <div className="settings-section">
            <label className="settings-label">Packages Directory</label>
            <div className="input-group">
              <input
                type="text"
                className="input-field"
                value={configPaths?.packages_dir || ''}
                readOnly
                aria-label="Packages directory"
              />
              <button
                className="btn btn-secondary btn-icon"
                onClick={handleOpenPackagesDir}
                aria-label="Open packages folder"
              >
                <Icons.ExternalLink />
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">General Settings</h2>
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-row-title">Startup with Windows</span>
              <span className="settings-row-description">Launch Houdini Launcher when you log in</span>
            </div>
            <div
              className={`toggle-switch ${autostart ? 'active' : ''}`}
              onClick={handleAutostartToggle}
              role="switch"
              aria-checked={autostart}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleAutostartToggle()}
            />
          </div>
          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-row-title">Deadline Remote Monitor</span>
              <span className="settings-row-description">Enable Deadline job monitoring</span>
            </div>
            <div
              className={`toggle-switch ${deadlineMonitor ? 'active' : ''}`}
              onClick={handleDeadlineMonitorToggle}
              role="switch"
              aria-checked={deadlineMonitor}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleDeadlineMonitorToggle()}
            />
          </div>
        </div>
      </div>
    </>
  );

  if (isLoading) {
    return (
      <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading" style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-base)' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Icons.Rocket />
            <span className="sidebar-title">Houdini Launcher</span>
          </div>
        </div>

        <div className="preset-section">
          <div className="preset-label">Current Preset</div>
          <select
            className="preset-select"
            value={currentPreset || ''}
            onChange={(e) => handleApplyPreset(e.target.value)}
            aria-label="Select preset"
          >
            <option value="">No Preset</option>
            {presets.map(p => (
              <option key={p.name} value={p.name}>
                {p.name}{p.name === defaultPreset ? ' (Default)' : ''}
              </option>
            ))}
          </select>
          <div className="preset-actions">
            <button className="action-btn" onClick={handleCreatePreset}>
              <Icons.Plus /> New
            </button>
            {currentPreset && (
              <button
                className="action-btn"
                onClick={() => handleSetDefault(currentPreset)}
              >
                Set Default
              </button>
            )}
            {currentPreset && currentPreset !== defaultPreset && (
              <button
                className="action-btn danger"
                onClick={() => handleDeletePreset(currentPreset)}
              >
                <Icons.Trash /> Delete
              </button>
            )}
          </div>
        </div>

        <nav className="nav-menu">
          <NavButton id="houdini" icon={Icons.Houdini} label="Houdini" />
          <NavButton id="packages" icon={Icons.Box} label="Packages" />
          <NavButton id="settings" icon={Icons.Settings} label="Settings" />
        </nav>

        <div className="launch-section">
          <button
            className="launch-button"
            onClick={handleLaunch}
            disabled={!selectedVersion}
          >
            <Icons.Play />
            Launch Houdini
          </button>
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'houdini' && renderHoudiniTab()}
        {activeTab === 'packages' && renderPackagesTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>
    </div>
  );
}

// Package Item Component
function PackageItem({
  pkg,
  isFavorite,
  onToggle,
  onFavoriteToggle,
}: {
  pkg: Package;
  isFavorite: boolean;
  onToggle: () => void;
  onFavoriteToggle: () => void;
}) {
  return (
    <div className="package-item">
      <input
        type="checkbox"
        className="package-checkbox"
        checked={pkg.enabled}
        onChange={onToggle}
        aria-label={`Enable ${pkg.name}`}
      />
      <div className="package-info">
        <div className="package-name">{pkg.name}</div>
        <div className="package-path">{pkg.file_path}</div>
      </div>
      <button
        className={`package-favorite ${isFavorite ? 'active' : ''}`}
        onClick={onFavoriteToggle}
        aria-label={isFavorite ? `Remove ${pkg.name} from favorites` : `Add ${pkg.name} to favorites`}
      >
        <Icons.Star filled={isFavorite} />
      </button>
    </div>
  );
}

export default App;
