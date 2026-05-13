#include <benchmark/benchmark.hpp>
#include "scheduler/scheduler.hpp"
#include <atomic>
#include <vector>

using namespace scheduler;

Task async_noop() {
    co_return;
}

static void BM_TaskSchedulingLatency(benchmark::State& state) {
    Scheduler sched(state.range(0));
    
    for (auto _ : state) {
        sched.schedule(std::make_unique<Task>(async_noop()));
    }
}

// Benchmark with different thread counts
BENCHMARK(BM_TaskSchedulingLatency)->Arg(1)->Arg(2)->Arg(4)->Arg(8);

static void BM_WorkStealingEfficiency(benchmark::State& state) {
    size_t num_threads = state.range(0);
    Scheduler sched(num_threads);
    std::atomic<int> completed_tasks{0};
    const int total_tasks = 10000;

    auto task_func = [&completed_tasks]() -> Task {
        completed_tasks.fetch_add(1);
        co_return;
    };

    for (auto _ : state) {
        completed_tasks = 0;
        for (int i = 0; i < total_tasks; ++i) {
            sched.schedule(std::make_unique<Task>(task_func()));
        }
        while (completed_tasks < total_tasks) {
            std::this_thread::yield();
        }
    }
}

BENCHMARK(BM_WorkStealingEfficiency)->Arg(4);

BENCHMARK_MAIN();
