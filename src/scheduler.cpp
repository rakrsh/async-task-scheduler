#include "scheduler/scheduler.hpp"

namespace scheduler {

Scheduler::Scheduler(size_t thread_count) {
    if (thread_count == 0) thread_count = 1;
    
    workers_.reserve(thread_count);
    for (size_t i = 0; i < thread_count; ++i) {
        workers_.push_back(std::make_unique<Worker>(i, *this));
    }

    for (auto& worker : workers_) {
        worker->start();
    }
}

Scheduler::~Scheduler() {
    for (auto& worker : workers_) {
        worker->stop();
    }
}

void Scheduler::schedule(std::unique_ptr<Task> task, Priority priority) {
    // Simple round-robin initial distribution
    size_t idx = next_worker_.fetch_add(1, std::memory_order_relaxed) % workers_.size();
    workers_[idx]->push(std::move(task), priority);
}

} // namespace scheduler
