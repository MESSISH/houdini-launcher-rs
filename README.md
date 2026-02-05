# Houdini Launcher (Rust Version)

A modern Houdini launcher built with Tauri + React, ported from the Python version.

## Features

- Modern, beautiful UI with dark theme
- Houdini version selection and management
- Package management (enable/disable)
- Presets for quick configuration switching
- Favorites system
- System tray support
- Startup with Windows
- Deadline remote monitor support

## Development

### Prerequisites

- Rust 1.70+
- Node.js 18+
- Windows 10/11

### Setup

1. Install dependencies:

```bash
# Install Rust dependencies
cargo fetch

# Install Node dependencies
npm install
```

2. Run in development mode:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
cargo build --release
```

## Project Structure

```
houdini-launcher-rs/
├── src/
│   ├── main.rs           # Tauri entry point
│   ├── models/          # Data models
│   ├── commands/         # Tauri commands
│   └── utils/           # Utility functions
├── src-tauri/
│   ├── tauri.conf.json   # Tauri configuration
│   └── Cargo.toml        # Rust dependencies
├── dist/                 # Built React frontend
└── icon/                # Application icons
```

## Credits

Original Python version: [houdini_launcher_tool](https://github.com/yourusername/houdini_launcher_tool)
