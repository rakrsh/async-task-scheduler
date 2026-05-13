# High-Performance Asynchronous Task Scheduler

[![C++20](https://img.shields.io/badge/C%2B%2B-20-blue.svg)](https://isocpp.org/std/the-standard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A thread-safe, work-stealing executor implemented in modern C++20. Designed for low-latency systems like High-Frequency Trading (HFT) and Automotive applications.

## 🚀 Key Features
- **Work-Stealing**: Idle threads steal tasks from peer deques to maximize throughput and minimize CPU starvation.
- **Multi-Level Priority**: Support for `High`, `Normal`, and `Low` priority task tiers.
- **C++20 Coroutines**: Native support for `Task` coroutines with `co_await`/`co_return` semantics.
- **Lock-Free Deques**: Optimized `WorkStealingDeque` for minimum contention between owners and stealers.
- **Modern Memory Management**: Zero raw pointers; exclusively uses smart pointers and RAII.
- **Performance Validated**: Integrated Google Benchmark suite for rigorous performance analysis.

## 📚 Documentation
- [**User Guide**](user-guide.md): Detailed installation, configuration, and usage instructions.
- [**Architecture**](architecture.md): Internal design and component overview.
- [**AI Agent Manual**](agent-manual.md): Guide for AI assistants working on this codebase.
- [**Copilot Instructions**](copilot.md): Project-specific coding standards for GitHub Copilot.

## 🛠️ Quick Start

### Requirements
- C++20 compliant compiler (MSVC 19.28+, GCC 10+, Clang 11+)
- CMake 3.20+
- [vcpkg](https://vcpkg.io/) (recommended) or Conan

### Build Instructions
```powershell
# Install dependencies
vcpkg install

# Configure and build
cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE=[path/to/vcpkg]/scripts/buildsystems/vcpkg.cmake
cmake --build build --config Release
```

### Basic Usage
```cpp
#include <scheduler/scheduler.hpp>

int main() {
    scheduler::Scheduler executor(std::thread::hardware_concurrency());
    
    executor.schedule(std::make_unique<scheduler::Task>(my_coroutine()), scheduler::Priority::High);
    
    return 0;
}
```

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
