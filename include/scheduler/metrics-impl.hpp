#pragma once

#include <atomic>
#include <chrono>
#include <thread>
#include <vector>
#include <mutex>
#include <memory>
#include "scheduler/metrics.hpp"

namespace scheduler {

/**
 * @brief Example implementation of IMetricsCollector
 * 
 * This is a reference implementation showing how to collect and expose
 * scheduler metrics for the dashboard. In production, integrate this
 * with your actual scheduler implementation.
 */
class MetricsCollectorImpl : public IMetricsCollector {
private:
    struct WorkerData {
        WorkerStatus status = WorkerStatus::Idle;
        uint64_t tasksCompleted = 0;
        uint64_t tasksStolen = 0;
        double cpuUsage = 0.0;
        uint32_t highPriorityQueued = 0;
        uint32_t normalPriorityQueued = 0;
        uint32_t lowPriorityQueued = 0;
    };

    std::vector<WorkerData> workerData_;
    std::atomic<uint64_t> totalTasksProcessed_{0};
    std::atomic<uint64_t> totalTasksStolen_{0};
    std::chrono::steady_clock::time_point startTime_;
    mutable std::mutex dataMutex_;
    std::atomic<bool> metricsEnabled_{true};

public:
    /**
     * @brief Constructor
     * @param workerCount Number of workers to track
     */
    explicit MetricsCollectorImpl(uint32_t workerCount)
        : workerData_(workerCount), startTime_(std::chrono::steady_clock::now()) {}

    WorkerMetrics getWorkerMetrics(uint32_t workerId) const override {
        std::lock_guard<std::mutex> lock(dataMutex_);
        if (workerId >= workerData_.size()) {
            throw std::out_of_range("Worker ID out of range");
        }

        const auto& data = workerData_[workerId];
        return WorkerMetrics{
            workerId,
            data.status,
            data.tasksCompleted,
            data.tasksStolen,
            data.cpuUsage,
            data.highPriorityQueued,
            data.normalPriorityQueued,
            data.lowPriorityQueued,
        };
    }

    std::vector<WorkerMetrics> getAllWorkerMetrics() const override {
        std::lock_guard<std::mutex> lock(dataMutex_);
        std::vector<WorkerMetrics> metrics;
        metrics.reserve(workerData_.size());

        for (uint32_t i = 0; i < workerData_.size(); ++i) {
            const auto& data = workerData_[i];
            metrics.emplace_back(WorkerMetrics{
                i,
                data.status,
                data.tasksCompleted,
                data.tasksStolen,
                data.cpuUsage,
                data.highPriorityQueued,
                data.normalPriorityQueued,
                data.lowPriorityQueued,
            });
        }
        return metrics;
    }

    QueueStatus getQueueStatus() const override {
        std::lock_guard<std::mutex> lock(dataMutex_);
        uint64_t totalQueued = 0;
        uint64_t highPriority = 0;
        uint64_t normalPriority = 0;
        uint64_t lowPriority = 0;

        for (const auto& data : workerData_) {
            totalQueued += data.highPriorityQueued + data.normalPriorityQueued + data.lowPriorityQueued;
            highPriority += data.highPriorityQueued;
            normalPriority += data.normalPriorityQueued;
            lowPriority += data.lowPriorityQueued;
        }

        return QueueStatus{
            totalQueued,
            highPriority,
            normalPriority,
            lowPriority,
        };
    }

    PerformanceMetrics getPerformanceMetrics() const override {
        auto now = std::chrono::steady_clock::now();
        auto uptime = std::chrono::duration_cast<std::chrono::nanoseconds>(now - startTime_);
        
        double totalCpu = 0.0;
        {
            std::lock_guard<std::mutex> lock(dataMutex_);
            for (const auto& data : workerData_) {
                totalCpu += data.cpuUsage;
            }
        }

        return PerformanceMetrics{
            uptime,
            totalTasksProcessed_.load(),
            totalTasksStolen_.load(),
            50.0,  // Placeholder: calculate from actual data
            5.0,   // Placeholder: calculate from actual data
            75.3,  // Placeholder: calculate from actual data
            totalCpu / workerData_.size(),
        };
    }

    uint32_t getActiveWorkerCount() const override {
        std::lock_guard<std::mutex> lock(dataMutex_);
        return std::count_if(workerData_.begin(), workerData_.end(),
            [](const WorkerData& data) { return data.status == WorkerStatus::Active; });
    }

    uint32_t getTotalWorkerCount() const override {
        return static_cast<uint32_t>(workerData_.size());
    }

    void resetCounters() override {
        std::lock_guard<std::mutex> lock(dataMutex_);
        totalTasksProcessed_ = 0;
        totalTasksStolen_ = 0;
        for (auto& data : workerData_) {
            data.tasksCompleted = 0;
            data.tasksStolen = 0;
        }
        startTime_ = std::chrono::steady_clock::now();
    }

    bool isMetricsEnabled() const override {
        return metricsEnabled_.load();
    }

    void setMetricsEnabled(bool enable) override {
        metricsEnabled_.store(enable);
    }

    // Methods for updating metrics from scheduler
    void updateWorkerStatus(uint32_t workerId, WorkerStatus status) {
        std::lock_guard<std::mutex> lock(dataMutex_);
        if (workerId < workerData_.size()) {
            workerData_[workerId].status = status;
        }
    }

    void recordTaskCompletion(uint32_t workerId) {
        std::lock_guard<std::mutex> lock(dataMutex_);
        if (workerId < workerData_.size()) {
            workerData_[workerId].tasksCompleted++;
            totalTasksProcessed_++;
        }
    }

    void recordTaskStolen(uint32_t workerId) {
        std::lock_guard<std::mutex> lock(dataMutex_);
        if (workerId < workerData_.size()) {
            workerData_[workerId].tasksStolen++;
            totalTasksStolen_++;
        }
    }

    void setQueueSize(uint32_t workerId, Priority priority, uint32_t size) {
        std::lock_guard<std::mutex> lock(dataMutex_);
        if (workerId < workerData_.size()) {
            switch (priority) {
                case Priority::High:
                    workerData_[workerId].highPriorityQueued = size;
                    break;
                case Priority::Normal:
                    workerData_[workerId].normalPriorityQueued = size;
                    break;
                case Priority::Low:
                    workerData_[workerId].lowPriorityQueued = size;
                    break;
            }
        }
    }

    void setCpuUsage(uint32_t workerId, double usage) {
        std::lock_guard<std::mutex> lock(dataMutex_);
        if (workerId < workerData_.size()) {
            workerData_[workerId].cpuUsage = usage;
        }
    }
};

} // namespace scheduler
