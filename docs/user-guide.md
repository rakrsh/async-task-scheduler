# Async Task Scheduler - User Guide

This guide provides a comprehensive overview of how to integrate and use the Async Task Scheduler in your C++20 projects.

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Getting Started](#getting-started)
3. [Task Management](#task-management)
4. [Priority Levels](#priority-levels)
5. [Work Stealing](#work-stealing)
6. [Best Practices](#best-practices)

---

## Core Concepts

The `async-task-scheduler` is a high-performance, multi-threaded executor designed for low-latency systems.

- **Scheduler**: The central entry point. It manages a pool of worker threads and distributes tasks.
- **Worker**: An internal thread that executes tasks. Each worker has its own local queues to minimize lock contention.
- **Task**: A C++20 coroutine that represents a unit of work.
- **Work-Stealing**: A strategy where idle workers "steal" tasks from the queues of busy workers, ensuring optimal CPU utilization.

---

## Getting Started

To use the scheduler, include the main header:

```cpp
#include <scheduler/scheduler.hpp>
#include <scheduler/task.hpp>
#include <iostream>

using namespace scheduler;

// Define a simple task using C++20 coroutines
Task my_task(int id) {
    std::cout << "Task " << id << " is running on thread " << std::this_thread::get_id() << std::endl;
    co_return;
}

int main() {
    // Create a scheduler with 4 worker threads
    Scheduler scheduler(4);

    // Schedule tasks
    for (int i = 0; i < 10; ++i) {
        scheduler.schedule(std::make_unique<Task>(my_task(i)), Priority::Normal);
    }

    // The scheduler will automatically clean up when it goes out of scope
    return 0;
}
```

---

## Task Management

### Creating Tasks
Tasks must be defined as coroutines returning `scheduler::Task`. 

```cpp
Task compute_heavy_work() {
    // Do something expensive
    int result = 0;
    for(int i = 0; i < 1000000; ++i) result += i;
    
    std::cout << "Result: " << result << std::endl;
    co_return;
}
```

### Scheduling Tasks
Tasks are scheduled using the `schedule` method. You must pass a `std::unique_ptr<Task>`.

```cpp
scheduler.schedule(std::make_unique<Task>(compute_heavy_work()));
```

---

## Priority Levels

The scheduler supports three priority levels:
- `Priority::High`: Tasks that should be executed as soon as possible.
- `Priority::Normal`: Standard tasks (default).
- `Priority::Low`: Background tasks that can wait for idle time.

```cpp
scheduler.schedule(std::make_unique<Task>(urgent_task()), Priority::High);
scheduler.schedule(std::make_unique<Task>(background_task()), Priority::Low);
```

Workers prioritize their own `High` queue, then steal `High` tasks from others, before moving to `Normal` and then `Low` priorities.

---

## Work Stealing

Work-stealing is enabled by default. It allows the system to balance load dynamically. If a thread finishes all its tasks, it will look at the back of other workers' deques to find more work. This is implemented using a lock-free `WorkStealingDeque` to minimize overhead.

---

## Best Practices

1. **Minimize Task Granularity**: Tasks should be small enough to be balanced effectively, but not so small that the scheduling overhead dominates.
2. **Avoid Blocking**: Do not call blocking operations (like `std::this_thread::sleep_for` or heavy I/O) inside a task if possible, as it ties up a worker thread. Use `co_await` with asynchronous I/O if available.
3. **Use the Right Priority**: Avoid flooding the `High` priority queue, as it may starve `Normal` and `Low` priority tasks.
4. **Pre-allocate Tasks**: If performance is critical, consider using a task pool to avoid frequent allocations of `std::unique_ptr<Task>`.
