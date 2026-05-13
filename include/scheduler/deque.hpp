#pragma once

#include "task.hpp"
#include <deque>
#include <mutex>
#include <optional>
#include <memory>

namespace scheduler {

/**
 * @brief A thread-safe deque supporting work-stealing.
 * 
 * The owner thread pushes and pops from the front.
 * Stealer threads pop from the back.
 */
class WorkStealingDeque {
public:
    void push(std::unique_ptr<Task> task) {
        std::lock_guard<std::mutex> lock(mutex_);
        deque_.push_front(std::move(task));
    }

    std::unique_ptr<Task> pop() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (deque_.empty()) {
            return nullptr;
        }
        auto task = std::move(deque_.front());
        deque_.pop_front();
        return task;
    }

    std::unique_ptr<Task> steal() {
        std::lock_guard<std::mutex> lock(mutex_);
        if (deque_.empty()) {
            return nullptr;
        }
        auto task = std::move(deque_.back());
        deque_.pop_back();
        return task;
    }

    bool empty() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return deque_.empty();
    }

    size_t size() const {
        std::lock_guard<std::mutex> lock(mutex_);
        return deque_.size();
    }

private:
    mutable std::mutex mutex_;
    std::deque<std::unique_ptr<Task>> deque_;
};

} // namespace scheduler
