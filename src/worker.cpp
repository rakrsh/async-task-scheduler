#include "scheduler/worker.hpp"
#include "scheduler/scheduler.hpp"
#include <chrono>

namespace scheduler {

Worker::Worker(size_t id, Scheduler& scheduler)
    : id_(id), scheduler_(scheduler) {}

Worker::~Worker() {
    stop();
}

void Worker::start() {
    running_ = true;
    thread_ = std::thread(&Worker::run, this);
}

void Worker::stop() {
    running_ = false;
    if (thread_.joinable()) {
        thread_.join();
    }
}

void Worker::push(std::unique_ptr<Task> task, Priority priority) {
    switch (priority) {
        case Priority::High:   high_priority_queue_.push(std::move(task)); break;
        case Priority::Normal: normal_priority_queue_.push(std::move(task)); break;
        case Priority::Low:    low_priority_queue_.push(std::move(task)); break;
    }
}

std::unique_ptr<Task> Worker::steal(Priority priority) {
    switch (priority) {
        case Priority::High:   return high_priority_queue_.steal();
        case Priority::Normal: return normal_priority_queue_.steal();
        case Priority::Low:    return low_priority_queue_.steal();
    }
    return nullptr;
}

void Worker::run() {
    while (running_) {
        std::unique_ptr<Task> task = try_pop_local();
        
        if (!task) {
            task = try_steal();
        }

        if (task) {
            if (task->resume()) {
                // If the task suspended again, push it back to the high priority queue (MFLQ style)
                // or just keep it in normal for now. 
                // For simplicity, we'll push it back to where it came from or normal.
                push(std::move(task), Priority::Normal);
            }
        } else {
            // No tasks found, yield to prevent 100% CPU usage if idle
            std::this_thread::yield();
            // In a real high-perf system, we might spin for a bit then use a CV.
        }
    }
}

std::unique_ptr<Task> Worker::try_pop_local() {
    auto task = high_priority_queue_.pop();
    if (task) return task;
    
    task = normal_priority_queue_.pop();
    if (task) return task;
    
    return low_priority_queue_.pop();
}

std::unique_ptr<Task> Worker::try_steal() {
    size_t count = scheduler_.thread_count();
    if (count <= 1) return nullptr;

    // Try to steal from a random worker
    static thread_local std::mt19937 gen(std::hash<std::thread::id>{}(std::this_thread::get_id()));
    std::uniform_int_distribution<size_t> dist(0, count - 1);

    size_t victim_idx = dist(gen);
    if (victim_idx == id_) {
        victim_idx = (victim_idx + 1) % count;
    }

    auto& victim = scheduler_.workers()[victim_idx];
    
    // Priorities: try to steal high priority first
    auto task = victim->steal(Priority::High);
    if (task) return task;

    task = victim->steal(Priority::Normal);
    if (task) return task;

    return victim->steal(Priority::Low);
}

} // namespace scheduler
