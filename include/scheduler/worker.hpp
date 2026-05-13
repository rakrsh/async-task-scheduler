#pragma once

#include "deque.hpp"
#include "priority.hpp"
#include <thread>
#include <atomic>
#include <vector>
#include <functional>

namespace scheduler {

class Scheduler;

/**
 * @brief Represents a worker thread that executes tasks.
 */
class Worker {
public:
    Worker(size_t id, Scheduler& scheduler);
    ~Worker();

    // Disable copy/move
    Worker(const Worker&) = delete;
    Worker& operator=(const Worker&) = delete;

    void start();
    void stop();

    void push(std::unique_ptr<Task> task, Priority priority);
    std::unique_ptr<Task> steal(Priority priority);

    size_t id() const { return id_; }

private:
    void run();
    std::unique_ptr<Task> try_pop_local();
    std::unique_ptr<Task> try_steal();

    size_t id_;
    Scheduler& scheduler_;
    std::thread thread_;
    std::atomic<bool> running_{false};

    // Separate deques for different priorities to ensure multi-level feedback or simple priority handling
    WorkStealingDeque high_priority_queue_;
    WorkStealingDeque normal_priority_queue_;
    WorkStealingDeque low_priority_queue_;
};

} // namespace scheduler
