# GitHub Copilot Instructions for Async Task Scheduler

This document provides context and guidelines for AI coding assistants (like GitHub Copilot and Antigravity) when working on the `async-task-scheduler` repository.

## Core Principles
- **Modern C++ Only**: Strictly use C++20 features. Avoid C-style constructs.
- **Memory Safety**: No raw pointers for ownership. Use `std::unique_ptr` and `std::shared_ptr`. Use `std::span` or references for non-owning access.
- **Concurrency**: Use the provided `WorkStealingDeque` and `Scheduler` abstractions. Avoid raw `std::thread` usage outside of the `Scheduler` class.
- **Performance**: This is a high-performance system. Minimize allocations in the hot path. Favor `std::move`.

## Project Structure
- `include/scheduler/`: Public headers.
  - `task.hpp`: Coroutine-based task implementation.
  - `scheduler.hpp`: Main executor interface.
  - `worker.hpp`: Worker thread logic and work-stealing.
  - `deque.hpp`: Thread-safe work-stealing deque.
- `src/`: Implementation files.
- `tests/`: GTest suites.
- `benchmarks/`: Google Benchmark performance tests.

## Coding Standards
- **Naming**: `PascalCase` for classes, `snake_case` for methods and variables, `SCREAMING_SNAKE_CASE` for constants.
- **Coroutines**: Use the `Task<T>` type defined in `task.hpp`. Always ensure coroutines are properly awaited.
- **Error Handling**: Prefer exceptions for exceptional cases, but ensure thread safety and no resource leaks.
- **Documentation**: Use Doxygen-style comments for public APIs in header files.

## Testing Guidelines
- Every new feature must have a corresponding test in `tests/`.
- Use `EXPECT_` and `ASSERT_` macros correctly.
- Ensure tests are thread-safe and don't have race conditions.

## Performance Validation
- Any change to the core scheduling logic or deque must be validated using the benchmarks in `benchmarks/`.
- Document performance impact in PR descriptions.
