#!/bin/bash
#
# Async Task Scheduler - Cross-platform Setup & Launch (Bash version)
#
# Usage:
#   ./setup.sh                 # Full setup
#   ./setup.sh dev             # Setup and run in dev mode
#   ./setup.sh build           # Build only
#   ./setup.sh run             # Run already-built project
#   ./setup.sh clean           # Clean build artifacts
#   ./setup.sh help            # Show help
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Logging functions
log_header() {
    echo -e "\n${CYAN}$(printf '=%.0s' {1..60})${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}$(printf '=%.0s' {1..60})${NC}\n"
}

log_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

log_error() {
    echo -e "${RED}✗ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_header "Checking Prerequisites"
    
    local all_ok=true
    
    # Check CMake
    if command -v cmake &> /dev/null; then
        version=$(cmake --version | head -n1)
        log_success "CMake: $version"
    else
        log_error "CMake not found. Install from https://cmake.org/download/"
        all_ok=false
    fi
    
    # Check C++ Compiler
    if command -v g++ &> /dev/null; then
        version=$(g++ --version | head -n1)
        log_success "GCC: $version"
    elif command -v clang++ &> /dev/null; then
        version=$(clang++ --version | head -n1)
        log_success "Clang: $version"
    else
        log_error "No C++ compiler found. Install GCC or Clang."
        all_ok=false
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        version=$(node --version)
        log_success "Node.js: $version"
    else
        log_error "Node.js not found. Install from https://nodejs.org/"
        all_ok=false
    fi
    
    # Check pkg-config
    if command -v pkg-config &> /dev/null; then
        log_success "pkg-config: Found"
    else
        log_warning "pkg-config not found. Some dependencies may fail."
    fi
    
    if [ "$all_ok" = false ]; then
        return 1
    fi
    return 0
}

# Install C++ dependencies
install_cpp_dependencies() {
    log_header "Installing C++ Dependencies"
    
    log_info "Installing dependencies via vcpkg..."
    
    if [ ! -d "vcpkg" ]; then
        log_info "Cloning vcpkg..."
        git clone https://github.com/Microsoft/vcpkg.git
    fi
    
    ./vcpkg/bootstrap-vcpkg.sh
    ./vcpkg install
    
    log_success "C++ dependencies installed"
    return 0
}

# Install Node.js dependencies
install_node_dependencies() {
    log_header "Installing Node.js Dependencies"
    
    cd ui
    
    log_info "Installing root dependencies..."
    npm install --silent
    
    log_info "Installing server dependencies..."
    npm install -w server --silent
    
    log_info "Installing client dependencies..."
    npm install -w client --silent
    
    cd ..
    
    log_success "Node.js dependencies installed"
    return 0
}

# Build C++ project
build_cpp_project() {
    log_header "Building C++ Project"
    
    local vcpkg_toolchain="$(pwd)/vcpkg/scripts/buildsystems/vcpkg.cmake"
    
    log_info "Configuring CMake..."
    cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE="$vcpkg_toolchain" -DCMAKE_BUILD_TYPE=Release
    
    log_info "Building..."
    cmake --build build --config Release --parallel $(nproc)
    
    log_success "C++ project built successfully"
    return 0
}

# Full setup
run_setup() {
    log_header "Async Task Scheduler - Complete Setup"
    
    if ! check_prerequisites; then
        log_error "Prerequisites check failed. Please install missing components."
        exit 1
    fi
    
    if ! install_cpp_dependencies; then
        log_error "C++ dependency installation failed"
        exit 1
    fi
    
    if ! install_node_dependencies; then
        log_error "Node.js dependency installation failed"
        exit 1
    fi
    
    if ! build_cpp_project; then
        log_error "C++ build failed"
        exit 1
    fi
    
    display_completion_message
}

# Build only
run_build() {
    log_header "Building C++ Project"
    
    if ! build_cpp_project; then
        exit 1
    fi
    
    log_success "Build complete"
}

# Run application
run_application() {
    log_header "Starting Application"
    
    if [ ! -f "build/Release/scheduler_test" ] && [ ! -f "build/Debug/scheduler_test" ]; then
        log_warning "Scheduler not yet built. Building now..."
        if ! build_cpp_project; then
            exit 1
        fi
    fi
    
    if [ ! -f "ui/server/package.json" ]; then
        log_warning "Dashboard not yet setup. Installing dependencies..."
        if ! install_node_dependencies; then
            exit 1
        fi
    fi
    
    log_info "Starting dashboard and scheduler..."
    log_info "  Dashboard: http://localhost:3000"
    log_info "  API Server: http://localhost:3001"
    echo ""
    
    cd ui
    npm run dev
}

# Development mode
run_dev() {
    run_setup
    
    log_header "Starting Development Mode"
    log_info "Starting services..."
    log_info "  Dashboard: http://localhost:3000"
    log_info "  API Server: http://localhost:3001"
    echo ""
    
    cd ui
    npm run dev
}

# Clean
run_clean() {
    log_header "Cleaning Build Artifacts"
    
    [ -d "build" ] && rm -rf build && log_success "Removed build directory"
    [ -d "ui/node_modules" ] && rm -rf ui/node_modules && log_success "Removed UI node_modules"
    [ -d "ui/server/node_modules" ] && rm -rf ui/server/node_modules && log_success "Removed server node_modules"
    [ -d "ui/client/node_modules" ] && rm -rf ui/client/node_modules && log_success "Removed client node_modules"
    
    log_success "Clean complete"
}

# Display completion message
display_completion_message() {
    cat << EOF

${GREEN}╔$(printf '═%.0s' {1..58})╗
║ Setup Complete!                                          ║
╚$(printf '═%.0s' {1..58})╝${NC}

📊 Async Task Scheduler with Dashboard

Next Steps:

  1. Run the application:
     ./setup.sh run

  2. Start in development mode:
     ./setup.sh dev

  3. Access the dashboard:
     → Browser: http://localhost:3000
     → API: http://localhost:3001

  4. Build only (without running):
     ./setup.sh build

  5. Clean build artifacts:
     ./setup.sh clean

Documentation:
  → Main docs: http://localhost:8000 (after 'mkdocs serve')
  → Dashboard: docs/dashboard.md
  → Integration: docs/integration-guide.md

Happy scheduling! 🚀

EOF
}

# Show help
show_help() {
    cat << EOF

${CYAN}Async Task Scheduler - Setup & Launch${NC}

Usage:
  ./setup.sh [command]

Commands:
  (no command)   Full setup (dependencies + build)
  dev            Setup and run in development mode
  build          Build C++ project only
  run            Run already-built project
  clean          Clean build artifacts
  help           Show this help message

Examples:
  ./setup.sh              # Complete setup
  ./setup.sh dev          # Setup and launch in dev mode
  ./setup.sh run          # Run existing build
  ./setup.sh clean        # Remove build artifacts

EOF
}

# Main
case "${1:-setup}" in
    dev)
        run_dev
        ;;
    build)
        run_build
        ;;
    run)
        run_application
        ;;
    clean)
        run_clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        run_setup
        ;;
esac
