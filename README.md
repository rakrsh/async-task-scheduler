# High-Performance Asynchronous Task Scheduler

[![C++20](https://img.shields.io/badge/C%2B%2B-20-blue.svg)](https://isocpp.org/std/the-standard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docs](https://github.com/rakrsh/async-task-scheduler/actions/workflows/deploy-docs.yml/badge.svg)](https://rakrsh.github.io/async-task-scheduler/)

A thread-safe, work-stealing executor implemented in modern C++20. Designed for low-latency systems like High-Frequency Trading (HFT) and Automotive applications.

## 🚀 Key Features
- **Work-Stealing**: Idle threads steal tasks from peer deques to maximize throughput and minimize CPU starvation.
- **Multi-Level Priority**: Support for `High`, `Normal`, and `Low` priority task tiers.
- **C++20 Coroutines**: Native support for `Task` coroutines with `co_await`/`co_return` semantics.
- **Lock-Free Deques**: Optimized `WorkStealingDeque` for minimum contention between owners and stealers.
- **Modern Memory Management**: Zero raw pointers; exclusively uses smart pointers and RAII.
- **Performance Validated**: Integrated Google Benchmark suite for rigorous performance analysis.
- **📊 Real-Time Dashboard**: Web-based UI for visualizing task queues, worker activity, and performance metrics.

## 📚 Documentation
The documentation is available in a deployable format using **MkDocs**.

- [**User Guide**](docs/user-guide.md): Detailed installation and usage.
- [**Dashboard**](docs/dashboard.md): Real-time monitoring and visualization of tasks.
- [**Architecture**](docs/architecture.md): Internal design and component overview.
- [**AI Agent Manual**](docs/agent-manual.md): Guide for AI assistants.

### Viewing Documentation Locally
To serve the documentation locally with live-reload:
```powershell
pip install -r docs/requirements.txt
mkdocs serve
```
Then open `http://127.0.0.1:8000` in your browser.

### Running the Dashboard
To run the real-time task visualization dashboard:
```powershell
cd ui
npm install
npm run dev
```
The dashboard will be available at `http://localhost:3000`

### Building for Deployment
```powershell
mkdocs build
```
The static site will be generated in the `site/` directory.

## 🛠️ Quick Start

### One-Command Setup

Get the entire application running in one command:

**Windows (PowerShell):**
```powershell
.\setup.ps1
```

**macOS / Linux (Bash):**
```bash
./setup.sh
```

**Any Platform (Node.js):**
```bash
node setup.js
```

The setup process will:
- ✅ Check prerequisites (CMake, compiler, Node.js)
- ✅ Install C++ and Node.js dependencies
- ✅ Build the C++ scheduler
- ✅ Install and configure the dashboard
- ✅ Provide next steps

### Running in Development Mode

After initial setup, start everything with one command:

```powershell
# Windows
.\setup.ps1 -Mode dev

# macOS/Linux
./setup.sh dev

# Any platform
node setup.js --dev
```

This opens:
- 📊 Dashboard: http://localhost:3000
- 📡 API Server: http://localhost:3001

### Basic C++ Usage

```cpp
#include <scheduler/scheduler.hpp>

int main() {
    scheduler::Scheduler executor(std::thread::hardware_concurrency());
    
    executor.schedule(std::make_unique<scheduler::Task>(my_coroutine()), scheduler::Priority::High);
    
    return 0;
}
```

### Requirements
- C++20 compliant compiler (MSVC 19.28+, GCC 10+, Clang 11+)
- CMake 3.20+
- Node.js 14+
- Git

See [QUICKSTART.md](docs/QUICKSTART.md) for detailed setup instructions and troubleshooting.

## 🧪 Testing & Benchmarking
```powershell
# Run Unit Tests
./build/tests/Release/scheduler_test.exe

# Run Performance Benchmarks
./build/benchmarks/Release/scheduler_bench.exe
```

## 🏛️ Architecture
The system is built on three core pillars:
1. **Scheduler**: The global coordinator that manages thread affinity and initial task placement.
2. **Worker**: A dedicated thread managing localized priority queues.
3. **WorkStealingDeque**: A specialized container optimized for LIFO access by the owner and FIFO access by stealers.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
