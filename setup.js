#!/usr/bin/env node

/**
 * Async Task Scheduler - Cross-platform Setup & Launch
 * 
 * Usage:
 *   node setup.js                 # Full setup
 *   node setup.js --dev           # Setup and run in dev mode
 *   node setup.js --build         # Build only
 *   node setup.js --run           # Run already-built project
 *   node setup.js --clean         # Clean build artifacts
 *   node setup.js --help          # Show help
 */

import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const log = {
  header: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n  ${msg}\n${'='.repeat(60)}${colors.reset}\n`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
};

// Check if command exists
async function commandExists(cmd) {
  try {
    if (process.platform === 'win32') {
      await execAsync(`where ${cmd}`);
    } else {
      await execAsync(`which ${cmd}`);
    }
    return true;
  } catch {
    return false;
  }
}

// Check prerequisites
async function checkPrerequisites() {
  log.header('Checking Prerequisites');

  let allOk = true;

  // Check CMake
  if (await commandExists('cmake')) {
    try {
      const { stdout } = await execAsync('cmake --version');
      const version = stdout.split('\n')[0];
      log.success(`CMake: ${version}`);
    } catch {
      log.warning('CMake found but version check failed');
    }
  } else {
    log.error('CMake not found. Install from https://cmake.org/download/');
    allOk = false;
  }

  // Check C++ Compiler
  const compilers = ['cl', 'clang++', 'g++'];
  let compilerFound = false;

  for (const compiler of compilers) {
    if (await commandExists(compiler)) {
      try {
        const { stdout } = await execAsync(
          process.platform === 'win32' && compiler === 'cl'
            ? `${compiler} 2>&1 | findstr "Version"`
            : `${compiler} --version`
        );
        log.success(`Compiler: ${stdout.split('\n')[0]}`);
        compilerFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
  }

  if (!compilerFound) {
    log.error('No C++ compiler found. Install Visual Studio, Clang, or GCC.');
    allOk = false;
  }

  // Check Node.js
  if (await commandExists('node')) {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    log.success(`Node.js: ${version}`);
  } else {
    log.error('Node.js not found. Install from https://nodejs.org/');
    allOk = false;
  }

  // Check vcpkg
  if (fs.existsSync(path.join(__dirname, 'vcpkg'))) {
    log.success('vcpkg: Found locally');
  } else if (await commandExists('vcpkg')) {
    log.success('vcpkg: Found in PATH');
  } else {
    log.warning('vcpkg not found. It will be initialized if needed.');
  }

  return allOk;
}

// Install C++ dependencies
async function installCppDependencies() {
  log.header('Installing C++ Dependencies');

  log.info('Installing dependencies via vcpkg...');

  try {
    await execAsync('vcpkg install', { cwd: __dirname, stdio: 'inherit' });
    log.success('C++ dependencies installed');
    return true;
  } catch (err) {
    log.error('Failed to install C++ dependencies');
    console.error(err.message);
    return false;
  }
}

// Install Node.js dependencies
async function installNodeDependencies() {
  log.header('Installing Node.js Dependencies');

  const uiDir = path.join(__dirname, 'ui');

  try {
    log.info('Installing root dependencies...');
    execSync('npm install --silent', { cwd: uiDir, stdio: 'inherit' });

    log.info('Installing server dependencies...');
    execSync('npm install -w server --silent', { cwd: uiDir, stdio: 'inherit' });

    log.info('Installing client dependencies...');
    execSync('npm install -w client --silent', { cwd: uiDir, stdio: 'inherit' });

    log.success('Node.js dependencies installed');
    return true;
  } catch (err) {
    log.error('Failed to install Node.js dependencies');
    console.error(err.message);
    return false;
  }
}

// Build C++ project
async function buildCppProject() {
  log.header('Building C++ Project');

  const vcpkgToolchain = path.join(__dirname, 'vcpkg', 'scripts', 'buildsystems', 'vcpkg.cmake');

  try {
    log.info('Configuring CMake...');
    execSync(
      `cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE="${vcpkgToolchain}" -DCMAKE_BUILD_TYPE=Release`,
      { cwd: __dirname, stdio: 'inherit' }
    );

    log.info('Building...');
    execSync('cmake --build build --config Release --parallel', {
      cwd: __dirname,
      stdio: 'inherit',
    });

    log.success('C++ project built successfully');
    return true;
  } catch (err) {
    log.error('Build failed');
    console.error(err.message);
    return false;
  }
}

// Full setup
async function runSetup() {
  log.header('Async Task Scheduler - Complete Setup');

  if (!(await checkPrerequisites())) {
    log.error('Prerequisites check failed. Please install missing components.');
    process.exit(1);
  }

  if (!(await installCppDependencies())) {
    log.error('C++ dependency installation failed');
    process.exit(1);
  }

  if (!(await installNodeDependencies())) {
    log.error('Node.js dependency installation failed');
    process.exit(1);
  }

  if (!(await buildCppProject())) {
    log.error('C++ build failed');
    process.exit(1);
  }

  displayCompletionMessage();
}

// Build only
async function runBuild() {
  log.header('Building C++ Project');

  if (!(await buildCppProject())) {
    process.exit(1);
  }

  log.success('Build complete');
}

// Run application
async function runApplication() {
  log.header('Starting Application');

  const schedulerExe = path.join(__dirname, 'build', 'Release', 'scheduler_test.exe');
  const dashboardSetup = path.join(__dirname, 'ui', 'server', 'package.json');

  if (!fs.existsSync(schedulerExe)) {
    log.warning('Scheduler not yet built. Building now...');
    if (!(await buildCppProject())) {
      process.exit(1);
    }
  }

  if (!fs.existsSync(dashboardSetup)) {
    log.warning('Dashboard not yet setup. Installing dependencies...');
    if (!(await installNodeDependencies())) {
      process.exit(1);
    }
  }

  log.info('Starting dashboard and scheduler...');
  log.info('  Dashboard: http://localhost:3000');
  log.info('  API Server: http://localhost:3001\n');

  const uiDir = path.join(__dirname, 'ui');
  execSync('npm run dev', { cwd: uiDir, stdio: 'inherit' });
}

// Development mode
async function runDev() {
  await runSetup();

  log.header('Starting Development Mode');
  log.info('Starting services...');
  log.info('  Dashboard: http://localhost:3000');
  log.info('  API Server: http://localhost:3001\n');

  const uiDir = path.join(__dirname, 'ui');
  execSync('npm run dev', { cwd: uiDir, stdio: 'inherit' });
}

// Clean
function runClean() {
  log.header('Cleaning Build Artifacts');

  const pathsToClean = [
    path.join(__dirname, 'build'),
    path.join(__dirname, 'ui', 'node_modules'),
    path.join(__dirname, 'ui', 'server', 'node_modules'),
    path.join(__dirname, 'ui', 'client', 'node_modules'),
  ];

  for (const p of pathsToClean) {
    if (fs.existsSync(p)) {
      try {
        fs.rmSync(p, { recursive: true, force: true });
        log.success(`Removed ${path.relative(__dirname, p)}`);
      } catch (err) {
        log.error(`Failed to remove ${path.relative(__dirname, p)}`);
      }
    }
  }

  log.success('Clean complete');
}

// Display completion message
function displayCompletionMessage() {
  console.log(`
${colors.green}╔${'═'.repeat(58)}╗
║ Setup Complete!                                          ║
╚${'═'.repeat(58)}╝${colors.reset}

📊 Async Task Scheduler with Dashboard

Next Steps:

  1. Run the application:
     node setup.js --run

  2. Start in development mode:
     node setup.js --dev

  3. Access the dashboard:
     → Browser: http://localhost:3000
     → API: http://localhost:3001

  4. Build only (without running):
     node setup.js --build

  5. Clean build artifacts:
     node setup.js --clean

Documentation:
  → Main docs: http://localhost:8000 (after 'mkdocs serve')
  → Dashboard: docs/dashboard.md
  → Integration: docs/integration-guide.md

Happy scheduling! 🚀
`);
}

// Help
function showHelp() {
  console.log(`
${colors.bright}Async Task Scheduler - Setup & Launch${colors.reset}

Usage:
  node setup.js [options]

Options:
  (no option)    Full setup (dependencies + build)
  --dev          Setup and run in development mode
  --build        Build C++ project only
  --run          Run already-built project
  --clean        Clean build artifacts
  --help         Show this help message

Examples:
  node setup.js              # Complete setup
  node setup.js --dev        # Setup and launch in dev mode
  node setup.js --run        # Run existing build
  node setup.js --clean      # Remove build artifacts
`);
}

// Main
const args = process.argv.slice(2);
const mode = args[0];

switch (mode) {
  case '--dev':
    runDev().catch((err) => {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    });
    break;
  case '--build':
    runBuild().catch((err) => {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    });
    break;
  case '--run':
    runApplication().catch((err) => {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    });
    break;
  case '--clean':
    runClean();
    break;
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    runSetup().catch((err) => {
      log.error(`Error: ${err.message}`);
      process.exit(1);
    });
}
