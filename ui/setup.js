#!/usr/bin/env node

/**
 * Dashboard Setup Script
 * Helps set up and run the async-task-scheduler dashboard
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(50)}`, 'bright');
  log(`  ${title}`, 'bright');
  log(`${'='.repeat(50)}\n`, 'bright');
}

async function checkNodeVersion() {
  section('Checking Node.js Version');
  try {
    const version = execSync('node --version', { encoding: 'utf8' }).trim();
    log(`✓ Node.js ${version} installed`, 'green');
    return true;
  } catch (err) {
    log('✗ Node.js not found. Please install Node.js 14+', 'red');
    return false;
  }
}

async function installDependencies() {
  section('Installing Dependencies');
  try {
    log('Installing root dependencies...', 'yellow');
    execSync('npm install', { cwd: __dirname, stdio: 'inherit' });
    
    log('\nInstalling server dependencies...', 'yellow');
    execSync('npm install -w server', { cwd: __dirname, stdio: 'inherit' });
    
    log('\nInstalling client dependencies...', 'yellow');
    execSync('npm install -w client', { cwd: __dirname, stdio: 'inherit' });
    
    log('\n✓ All dependencies installed successfully', 'green');
    return true;
  } catch (err) {
    log('✗ Failed to install dependencies', 'red');
    return false;
  }
}

async function setupEnv() {
  section('Setting Up Environment Variables');
  
  const serverEnvPath = path.join(__dirname, 'server', '.env');
  const examplePath = path.join(__dirname, 'server', '.env.example');
  
  if (!fs.existsSync(serverEnvPath) && fs.existsSync(examplePath)) {
    try {
      const exampleContent = fs.readFileSync(examplePath, 'utf8');
      fs.writeFileSync(serverEnvPath, exampleContent);
      log('✓ Created .env file from template', 'green');
    } catch (err) {
      log('✗ Failed to create .env file', 'red');
    }
  } else if (fs.existsSync(serverEnvPath)) {
    log('✓ .env file already exists', 'green');
  }
}

async function displayStartInstructions() {
  section('Setup Complete!');
  
  log('📊 Async Task Scheduler Dashboard is ready to use!\n', 'bright');
  
  log('Quick Start:', 'bright');
  log('  Development mode (with hot reload):');
  log('    npm run dev\n', 'yellow');
  
  log('  Production build:');
  log('    npm run build');
  log('    npm start\n', 'yellow');
  
  log('Access:', 'bright');
  log('  Dashboard: http://localhost:3000', 'blue');
  log('  API Server: http://localhost:3001', 'blue');
  log('  API Docs: http://localhost:3001/api/metrics\n', 'blue');
  
  log('Integration:', 'bright');
  log('  See docs/integration-guide.md for connecting to your scheduler\n', 'yellow');
  
  log('Troubleshooting:', 'bright');
  log('  Connection issues? Check that your scheduler is running');
  log('  Verify metrics server is accessible at the configured endpoint');
  log('  See README.md in this directory for more help\n', 'yellow');
}

async function main() {
  log('\n🚀 Async Task Scheduler Dashboard Setup\n', 'bright');
  
  // Check Node.js
  if (!await checkNodeVersion()) {
    process.exit(1);
  }
  
  // Install dependencies
  if (!await installDependencies()) {
    process.exit(1);
  }
  
  // Setup environment
  await setupEnv();
  
  // Display instructions
  await displayStartInstructions();
}

main().catch(err => {
  log(`\n✗ Setup failed: ${err.message}`, 'red');
  process.exit(1);
});
