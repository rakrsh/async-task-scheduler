# Quick Start Guide

Get up and running with the Async Task Scheduler in minutes!

## 🚀 One-Command Setup

Choose your platform:

### Windows (PowerShell)
```powershell
.\setup.ps1
```

Or use the batch launcher:
```cmd
launch.bat setup
```

### macOS / Linux (Bash)
```bash
chmod +x setup.sh
./setup.sh
```

### Cross-Platform (Node.js)
```bash
node setup.js
```

## 📋 Available Commands

### Full Setup (Recommended First Time)
Installs all dependencies and builds the project.

**PowerShell:**
```powershell
.\setup.ps1                    # Default: full setup
.\setup.ps1 -Mode setup        # Explicit setup mode
```

**Bash:**
```bash
./setup.sh                     # Default: full setup
./setup.sh help                # Show help
```

**Node.js:**
```bash
node setup.js                  # Default: full setup
node setup.js --help           # Show help
```

**Batch (Windows):**
```cmd
launch.bat setup
launch.bat help
```

### Development Mode
Runs full setup then starts the application with hot-reload.

**PowerShell:**
```powershell
.\setup.ps1 -Mode dev
```

**Bash:**
```bash
./setup.sh dev
```

**Node.js:**
```bash
node setup.js --dev
```

**Batch:**
```cmd
launch.bat dev
```

### Build Only
Builds the C++ project without running anything.

**PowerShell:**
```powershell
.\setup.ps1 -Mode build
```

**Bash:**
```bash
./setup.sh build
```

**Node.js:**
```bash
node setup.js --build
```

**Batch:**
```cmd
launch.bat build
```

### Run Already-Built Project
Starts the dashboard and API server (requires prior build).

**PowerShell:**
```powershell
.\setup.ps1 -Mode run
```

**Bash:**
```bash
./setup.sh run
```

**Node.js:**
```bash
node setup.js --run
```

**Batch:**
```cmd
launch.bat run
```

### Clean Build Artifacts
Removes all build directories and node_modules.

**PowerShell:**
```powershell
.\setup.ps1 -Mode clean
```

**Bash:**
```bash
./setup.sh clean
```

**Node.js:**
```bash
node setup.js --clean
```

**Batch:**
```cmd
launch.bat clean
```

## 🎯 What Happens During Setup?

The setup process performs these steps in order:

1. **Check Prerequisites**
   - CMake (3.20+)
   - C++ Compiler (MSVC 19.28+, GCC 10+, or Clang 11+)
   - Node.js (14+)
   - vcpkg (optional, will be cloned if needed)

2. **Install C++ Dependencies**
   - Initializes vcpkg if not present
   - Installs dependencies listed in `vcpkg.json`

3. **Install Node.js Dependencies**
   - Root `package.json` dependencies
   - Server dependencies (`ui/server/package.json`)
   - Client dependencies (`ui/client/package.json`)

4. **Build C++ Project**
   - Generates CMake build files with vcpkg toolchain
   - Compiles scheduler, tests, and benchmarks
   - Outputs binaries to `build/Release/`

5. **Ready to Run**
   - Dashboard available at http://localhost:3000
   - API server at http://localhost:3001

## 🌐 Accessing the Application

After setup completes, open your browser:

- **Dashboard**: http://localhost:3000
  - Real-time task visualization
  - Worker metrics and performance graphs

- **API Documentation**: http://localhost:3001/api/metrics
  - REST endpoints for metrics

- **Main Documentation**: http://localhost:8000 (run `mkdocs serve` in another terminal)
  - Architecture, guides, and API reference

## 🔧 Prerequisites

### Windows
- [Visual Studio 2019+](https://visualstudio.microsoft.com/) or [Build Tools for C++](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
- [CMake 3.20+](https://cmake.org/download/)
- [Node.js 14+](https://nodejs.org/)

### macOS
```bash
# Using Homebrew:
brew install cmake node
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install cmake build-essential nodejs npm
```

## 🆘 Troubleshooting

### CMake not found
**Windows:** Install from [cmake.org](https://cmake.org/download/)
```powershell
# Or via Chocolatey:
choco install cmake
```

**macOS:**
```bash
brew install cmake
```

**Linux:**
```bash
sudo apt-get install cmake
```

### C++ compiler not found
**Windows:** Install [Visual Studio Community](https://visualstudio.microsoft.com/downloads/)

**macOS:**
```bash
xcode-select --install
```

**Linux (GCC):**
```bash
sudo apt-get install build-essential
```

**Linux (Clang):**
```bash
sudo apt-get install clang
```

### Node.js not found
Install from [nodejs.org](https://nodejs.org/) or:

**macOS:**
```bash
brew install node
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### vcpkg bootstrap fails
The setup script handles this automatically. If you encounter issues:

```powershell
# Windows:
.\vcpkg\bootstrap-vcpkg.bat

# macOS/Linux:
./vcpkg/bootstrap-vcpkg.sh
```

### Port already in use
If ports 3000 or 3001 are already in use, you can change them:

**Dashboard client:**
Edit `ui/client/src/components/Dashboard.js` and modify `REACT_APP_API_BASE`

**Server port:**
Edit `ui/server/.env` and change `PORT=3001` to another port

### Build fails with linking errors
```bash
# Clean and rebuild from scratch:
.\setup.ps1 -Mode clean  # or ./setup.sh clean
.\setup.ps1 -Mode build  # or ./setup.sh build
```

### Dashboard shows "Connection Error"
Ensure the Express server is running:
```bash
# Check if server is listening:
curl http://localhost:3001/api/health
```

If not running, restart:
```powershell
.\setup.ps1 -Mode run  # or ./setup.sh run
```

## 📚 Next Steps

1. **Review the Architecture**
   - Read [docs/architecture.md](../docs/architecture.md)

2. **Integrate with Your Scheduler**
   - Follow [docs/integration-guide.md](../docs/integration-guide.md)

3. **Explore the Metrics API**
   - Visit [docs/dashboard.md](../docs/dashboard.md)

4. **Run Tests and Benchmarks**
   - `./build/Release/scheduler_test.exe` (Windows)
   - `./build/Release/scheduler_test` (Linux/macOS)
   - `./build/Release/scheduler_bench.exe` (Benchmarks)

## 🎓 Understanding the Structure

```
async-task-scheduler/
├── setup.ps1              # Windows PowerShell setup
├── setup.sh               # macOS/Linux Bash setup
├── setup.js               # Cross-platform Node.js setup
├── launch.bat             # Windows batch launcher
├── CMakeLists.txt         # C++ build configuration
├── vcpkg.json             # C++ dependency manifest
├── ui/                    # Web dashboard (Node.js + React)
│   ├── server/            # Express API server
│   ├── client/            # React dashboard
│   └── package.json       # NPM workspace config
├── src/                   # C++ source code
├── include/scheduler/     # C++ headers
├── tests/                 # Unit tests
├── benchmarks/            # Performance benchmarks
└── docs/                  # Documentation
```

## 💡 Tips

- **Speed Up Builds:** The setup uses parallel compilation (`--parallel`). More cores = faster builds.
- **Skip Setup:** If you've already built once, use `setup.ps1 -Mode run` to skip the build.
- **Clean Slate:** Use `setup.ps1 -Mode clean` to remove all build artifacts before troubleshooting.
- **Verbose Builds:** Remove `--silent` flags in setup scripts for detailed build output.
- **Check Logs:** Look for errors in the terminal output; they usually indicate missing dependencies.

## 📞 Getting Help

- Check [Troubleshooting](#-troubleshooting) section above
- Review [docs/integration-guide.md](../docs/integration-guide.md) for integration issues
- Read [README.md](../README.md) for project overview
- See [AGENTS.md](../AGENTS.md) for AI assistant guidelines

---

**Ready to schedule tasks?** 🚀

```powershell
# Windows
.\setup.ps1 -Mode dev

# macOS/Linux
./setup.sh dev

# Any platform
node setup.js --dev
```

Then open http://localhost:3000 in your browser!
