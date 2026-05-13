#pragma once

#include <coroutine>
#include <memory>
#include <exception>

namespace scheduler {

/**
 * @brief A basic C++20 Coroutine Task wrapper.
 * 
 * This class represents a unit of work that can be suspended and resumed.
 */
class Task {
public:
    struct promise_type {
        Task get_return_object() {
            return Task(std::coroutine_handle<promise_type>::from_promise(*this));
        }
        std::initial_suspend initial_suspend() noexcept { return std::suspend_always{}; }
        std::final_suspend final_suspend() noexcept { return std::suspend_always{}; }
        void return_void() {}
        void unhandled_exception() { std::terminate(); }
    };

    explicit Task(std::coroutine_handle<promise_type> handle)
        : handle_(handle) {}

    ~Task() {
        if (handle_) handle_.destroy();
    }

    Task(const Task&) = delete;
    Task& operator=(const Task&) = delete;

    Task(Task&& other) noexcept : handle_(other.handle_) {
        other.handle_ = nullptr;
    }

    Task& operator=(Task&& other) noexcept {
        if (this != &other) {
            if (handle_) handle_.destroy();
            handle_ = other.handle_;
            other.handle_ = nullptr;
        }
        return *this;
    }

    bool resume() {
        if (!handle_.done()) {
            handle_.resume();
            return !handle_.done();
        }
        return false;
    }

    bool done() const { return handle_.done(); }

    // Awaiter support
    bool await_ready() const noexcept { return handle_.done(); }
    void await_suspend(std::coroutine_handle<> awaiting_handle) noexcept {
        // In a real scheduler, we might want to register the continuation
    }
    void await_resume() noexcept {}

private:
    std::coroutine_handle<promise_type> handle_;
};

} // namespace scheduler
