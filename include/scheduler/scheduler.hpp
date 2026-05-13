#pragma once

#include "worker.hpp"
#include <vector>
#include <memory>
#include <random>

namespace scheduler {

/**
 * @brief High-Performance Asynchronous Task Scheduler.
 */
class Scheduler {
public:
    explicit Scheduler(size_t thread_count = std::thread::hardware_concurrency());
    ~Scheduler();

    void schedule(std::unique_ptr<Task> task, Priority priority = Priority::Normal);

    // Internal API for workers
    const std::vector<std::unique_ptr<Worker>>& workers() const { return workers_; }
    size_t thread_count() const { return workers_.size(); }

private:
    std::vector<std::unique_ptr<Worker>> workers_;
    std::atomic<size_t> next_worker_{0};
};

} // namespace scheduler
