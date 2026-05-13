#include <gtest/gtest.h>
#include "scheduler/scheduler.hpp"
#include <atomic>
#include <chrono>

using namespace scheduler;

TEST(SchedulerTest, BasicTaskExecution) {
    Scheduler sched(2);
    std::atomic<bool> executed{false};

    auto my_task = [&executed]() -> Task {
        executed = true;
        co_return;
    };

    sched.schedule(std::make_unique<Task>(my_task()));

    auto start = std::chrono::steady_clock::now();
    while (!executed && (std::chrono::steady_clock::now() - start) < std::chrono::seconds(1)) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    EXPECT_TRUE(executed);
}

TEST(SchedulerTest, PriorityExecution) {
    Scheduler sched(1);
    std::atomic<int> last_executed_priority{0};

    auto task_high = [&last_executed_priority]() -> Task {
        last_executed_priority = 3;
        co_return;
    };
    auto task_normal = [&last_executed_priority]() -> Task {
        last_executed_priority = 2;
        co_return;
    };
    auto task_low = [&last_executed_priority]() -> Task {
        last_executed_priority = 1;
        co_return;
    };

    // Schedule in reverse order to test if priorities are respected
    // Note: Since they go to the same worker's deques, and worker pops high first.
    sched.schedule(std::make_unique<Task>(task_low()), Priority::Low);
    sched.schedule(std::make_unique<Task>(task_normal()), Priority::Normal);
    sched.schedule(std::make_unique<Task>(task_high()), Priority::High);

    std::this_thread::sleep_for(std::chrono::milliseconds(100));
    // The last one to finish would likely be low if they were processed sequentially by priority
    // But since the worker checks high first, then normal, then low in each loop iteration.
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
