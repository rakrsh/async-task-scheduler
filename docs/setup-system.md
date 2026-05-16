# Setup System Documentation

This document explains the unified setup and launch system for the Async Task Scheduler project.

## Overview

The project provides **multiple entry points** for setup and launch, all coordinated to ensure a smooth developer experience:

- **PowerShell Script** (`setup.ps1`) - Primary for Windows developers
- **Bash Script** (`setup.sh`) - Primary for macOS/Linux developers  
- **Node.js Script** (`setup.js`) - Cross-platform alternative
- **Batch Launcher** (`launch.bat`) - Windows quick access

## Architecture

### Single Entry Point Philosophy

All scripts implement the **same workflow** regardless of platform:

```
User Command
    ↓
Platform-Specific Script
    ↓
1. Check Prerequisites
    ↓
2. Install C++ Dependencies
    ↓
3. Install Node.js Dependencies
    ↓
4. Build C++ Project
    ↓
5. Configure Dashboard
    ↓
Ready to Run
```

### Implementation Details

Each script performs these core operations:

#### 1. Prerequisite Checking
- CMake 3.20+
- C++ Compiler (MSVC, GCC, or Clang)
- Node.js 14+
- vcpkg (optional, auto-cloned if needed)

#### 2. C++ Dependency Installation
```
vcpkg bootstrap → vcpkg install (via vcpkg.json)
```

#### 3. Node.js Dependency Installation
```
npm install (root)
    ↓
npm install -w server
    ↓
npm install -w client
```

#### 4. C++ Build
```
cmake configure (with vcpkg toolchain)
    ↓
cmake build --parallel
```

#### 5. Dashboard Configuration
- Ensures UI dependencies are installed
- Creates `.env` from template if needed
- Validates server configuration

## Script Comparison

| Feature | PowerShell | Bash | Node.js | Batch |
|---------|-----------|------|---------|-------|
| Platform | Windows | macOS/Linux | All | Windows |
| Features | Full | Full | Full | Wrapper |
| Color Output | ✓ | ✓ | ✓ | Via PS1 |
| Error Handling | ✓ | ✓ | ✓ | Via PS1 |
| Parallel Build | ✓ | ✓ | ✓ | Via PS1 |
| Help Text | ✓ | ✓ | ✓ | Via PS1 |

### PowerShell (setup.ps1)

**Advantages:**
- Native Windows shell
- Integrated error handling
- Full featured menu system
- Environment management

**Modes:**
```powershell
.\setup.ps1                    # Full setup
.\setup.ps1 -Mode setup        # Explicit
.\setup.ps1 -Mode dev          # Dev + run
.\setup.ps1 -Mode build        # Build only
.\setup.ps1 -Mode run          # Run only
.\setup.ps1 -Mode clean        # Clean artifacts
.\setup.ps1 -Help              # Show help
```

### Bash (setup.sh)

**Advantages:**
- Native Unix shell (macOS/Linux)
- POSIX compliance
- Portable across systems

**Usage:**
```bash
./setup.sh                     # Full setup
./setup.sh dev                 # Dev + run
./setup.sh build               # Build only
./setup.sh run                 # Run only
./setup.sh clean               # Clean
./setup.sh help                # Show help
```

### Node.js (setup.js)

**Advantages:**
- True cross-platform (Windows/macOS/Linux)
- No shell dependency
- Direct package management

**Usage:**
```bash
node setup.js                  # Full setup
node setup.js --dev            # Dev + run
node setup.js --build          # Build only
node setup.js --run            # Run only
node setup.js --clean          # Clean
node setup.js --help           # Show help
```

### Batch (launch.bat)

**Advantages:**
- Native Windows compatibility
- Simple interface
- Delegates to PowerShell for actual work

**Usage:**
```cmd
launch.bat setup
launch.bat dev
launch.bat build
launch.bat run
launch.bat clean
launch.bat help
```

## Workflow Modes

### Full Setup (Default)

```powershell
.\setup.ps1              # All setup steps
```

**What happens:**
1. Checks all prerequisites
2. If missing: displays installation links
3. Installs vcpkg if needed
4. Runs `vcpkg install`
5. Installs root npm dependencies
6. Installs server npm dependencies
7. Installs client npm dependencies
8. Configures CMake with vcpkg toolchain
9. Builds C++ project in Release mode
10. Displays completion message with next steps

**Time:** 5-15 minutes (depending on system and internet)

### Development Mode

```powershell
.\setup.ps1 -Mode dev    # Setup + run
```

**What happens:**
1. Full setup (as above)
2. Starts Express server (port 3001)
3. Starts React dev server (port 3000)
4. Opens dashboard in browser (if available)
5. Keeps running with hot-reload

**Access:**
- Dashboard: http://localhost:3000
- API: http://localhost:3001

### Build Only

```powershell
.\setup.ps1 -Mode build
```

**What happens:**
1. Skips prerequisite checks
2. Skips dependency installation
3. Runs CMake configuration
4. Builds C++ project
5. Reports success/failure

**Use when:** Dependencies already installed, just need rebuild

### Run Only

```powershell
.\setup.ps1 -Mode run
```

**What happens:**
1. Checks if builds exist
2. If not: builds them
3. Checks if node_modules exists
4. If not: installs dependencies
5. Starts dashboard
6. Starts API server

**Use when:** Everything already built, just need to run

### Clean

```powershell
.\setup.ps1 -Mode clean
```

**What happens:**
1. Removes `build/` directory
2. Removes all `node_modules` directories
3. Removes generated artifacts

**Use when:** Starting fresh or troubleshooting build issues

## Environment Configuration

### Server Configuration

The Express server reads configuration from `ui/server/.env`:

```bash
# Copy template to create actual config
cp ui/server/.env.example ui/server/.env

# Edit as needed
PORT=3001
NODE_ENV=development
REACT_APP_API_BASE=http://localhost:3001
```

### CMake Configuration

CMake settings are managed through:
- `CMakeLists.txt` - main build configuration
- vcpkg toolchain - dependency management
- `-DCMAKE_BUILD_TYPE=Release` - build mode

## Troubleshooting

### Script Fails to Execute

**PowerShell (Windows):**
```powershell
# If execution policy prevents running:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Bash (macOS/Linux):**
```bash
# Make script executable:
chmod +x setup.sh
```

### Prerequisites Missing

Scripts will display installation URLs and continue. Install missing tools and re-run.

### Build Fails

```powershell
# Clean and rebuild:
.\setup.ps1 -Mode clean
.\setup.ps1 -Mode build
```

### Port Already in Use

Edit `ui/server/.env`:
```bash
PORT=3002        # Change from 3001
```

Then restart:
```powershell
.\setup.ps1 -Mode run
```

## Integration with CI/CD

For automated builds (GitHub Actions, GitLab CI, etc.):

```yaml
# Example: GitHub Actions
- name: Setup Project
  run: node setup.js --build

- name: Run Tests
  run: ./build/Release/scheduler_test.exe
```

## File Manifest

### Setup Scripts
- `setup.ps1` - PowerShell (Windows primary)
- `setup.sh` - Bash (macOS/Linux primary)
- `setup.js` - Node.js (cross-platform)
- `launch.bat` - Batch wrapper (Windows convenience)

### Configuration Files
- `.gitattributes` - Cross-platform line ending management
- `.env.example` - Environment template
- `vcpkg.json` - C++ dependencies
- `package.json` (root & workspaces) - Node.js dependencies

### Documentation
- `docs/QUICKSTART.md` - Quick start guide
- `docs/setup-system.md` - This file
- `README.md` - Main project documentation

## Design Principles

The setup system follows these principles:

1. **Single Responsibility** - Each script does one thing well
2. **Cross-Platform** - Works on Windows, macOS, and Linux
3. **Deterministic** - Same input always produces same output
4. **Informative** - Clear output and error messages
5. **Failfast** - Stops on first error, doesn't try to recover
6. **Idempotent** - Safe to run multiple times
7. **Well-Documented** - Help text and documentation included

## Adding New Setup Steps

To add a new setup step:

1. **Identify the step** - What does it do?
2. **Implement in all scripts** - Add to all 4 scripts
3. **Integrate into workflow** - Add to appropriate mode(s)
4. **Test on all platforms** - Windows, macOS, Linux
5. **Update documentation** - docs/QUICKSTART.md, etc.

Example: Adding a step to validate the build

```powershell
# PowerShell
function Validate-Build {
    Write-Header "Validating Build"
    # validation logic
}

# Call in Run-Setup
Run-Setup() {
    # ... existing steps ...
    Validate-Build
}
```

## Performance Optimization

### Parallel Compilation
- Uses `cmake --build ... --parallel` with automatic core detection
- Significantly speeds up C++ builds on multi-core systems

### Npm Silent Mode
- Uses `npm install --silent` to reduce console spam
- Useful for CI/CD pipelines

### Caching
- Scripts check if builds already exist
- Only rebuilds when necessary
- Can use `--run` mode to skip rebuild

## Future Enhancements

Potential improvements to the setup system:

- [ ] Automatic IDE project generation (Visual Studio, Xcode, VSCode)
- [ ] Docker containerization for guaranteed environment
- [ ] GitHub Actions matrix testing on multiple OS/compiler versions
- [ ] Interactive configuration wizard for advanced options
- [ ] Metrics collection for setup performance analysis
- [ ] Update checking to warn about new versions
- [ ] WebSocket support for real-time build output

## Summary

The unified setup system provides:

✅ **Multiple entry points** - Choose your preferred shell/language
✅ **Consistent behavior** - Same workflow on all platforms
✅ **Easy onboarding** - One command to get started
✅ **Flexibility** - Different modes for different needs
✅ **Good UX** - Clear output and error messages
✅ **Well-documented** - Help text and guides included

Whether you're on Windows with PowerShell, macOS with Bash, or prefer Node.js, the setup experience is consistent and straightforward.

---

**Quick Reference:**
```
Windows:   .\setup.ps1 -Mode dev
macOS/Linux: ./setup.sh dev
Any OS:    node setup.js --dev
```

Then open http://localhost:3000 🚀
