# High-Performance Asynchronous Task Scheduler

A thread-safe, work-stealing executor implemented in C++20. Designed for low-latency systems like HFT and Automotive.

## Features
- **Work-Stealing**: Idle threads steal tasks from peer deques to maximize throughput.
- **Priority Levels**: Support for `High`, `Normal`, and `Low` priority tasks.
- **C++20 Coroutines**: Native support for `Task` coroutines with `co_await`/`co_return`.
- **Modern Memory Management**: Zero raw pointers; exclusively uses `std::unique_ptr` and `std::shared_ptr`.
- **Benchmarking**: Integrated Google Benchmark suite for performance analysis.

## Requirements
- C++20 compliant compiler (MSVC 19.28+, GCC 10+, Clang 11+)
- CMake 3.20+
- vcpkg or Conan (for dependencies)

## Dependencies
- `google-benchmark`
- `gtest`

## Build Instructions

### Using vcpkg (Recommended)
```powershell
# Install dependencies
vcpkg install

# Configure and build
cmake -B build -S . -DCMAKE_TOOLCHAIN_FILE=[path/to/vcpkg]/scripts/buildsystems/vcpkg.cmake
cmake --build build --config Release
```

### Running Benchmarks
```powershell
./build/benchmarks/Release/scheduler_bench.exe
```

### Running Tests
```powershell
./build/tests/Release/scheduler_test.exe
```

## Architecture
- **Scheduler**: Orchestrates worker threads and initial task distribution.
- **Worker**: Each worker maintains a local set of deques (one per priority) and implements the work-stealing logic.
- **Task**: A coroutine-based unit of work.
- **WorkStealingDeque**: A thread-safe container optimized for owner-access (front) and stealer-access (back).
