#pragma once

#include <cstdint>
#include <vector>
#include <chrono>
#include <string>

namespace scheduler {

/**
 * @brief Enumeration for worker status
 */
enum class WorkerStatus {
    Active,    ///< Worker is actively processing tasks
    Idle,      ///< Worker is idle, awaiting tasks or steals
    Suspended, ///< Worker is temporarily suspended
};

/**
 * @brief Per-worker metrics snapshot
 */
struct WorkerMetrics {
    uint32_t id;                  ///< Worker thread ID
    WorkerStatus status;          ///< Current worker status
    uint64_t tasksCompleted;      ///< Total tasks completed by this worker
    uint64_t tasksStolen;         ///< Total tasks stolen from others
    double cpuUsage;              ///< Estimated CPU usage percentage (0-100)
    uint32_t highPriorityQueued;  ///< Tasks queued at high priority
    uint32_t normalPriorityQueued;///< Tasks queued at normal priority
    uint32_t lowPriorityQueued;   ///< Tasks queued at low priority
};

/**
 * @brief Global queue status snapshot
 */
struct QueueStatus {
    uint64_t totalQueued;         ///< Total tasks queued across all workers
    uint64_t highPriorityTotal;   ///< Total high priority tasks queued
    uint64_t normalPriorityTotal; ///< Total normal priority tasks queued
    uint64_t lowPriorityTotal;    ///< Total low priority tasks queued
};

/**
 * @brief Performance metrics for the scheduler
 */
struct PerformanceMetrics {
    std::chrono::nanoseconds uptime;           ///< Scheduler uptime
    uint64_t totalTasksProcessed;              ///< Total tasks processed since startup
    uint64_t totalTasksStolen;                 ///< Total steals since startup
    double tasksPerSecond;                     ///< Current throughput (tasks/sec)
    double stealsPerSecond;                    ///< Current steal rate (steals/sec)
    double averageLatency;                     ///< Average task latency in microseconds
    double averageCpuUsage;                    ///< Average CPU usage across all workers
};

/**
 * @brief Metrics collector interface for scheduler monitoring
 * 
 * This interface allows external tools (like the dashboard) to query
 * scheduler metrics for visualization and monitoring.
 */
class IMetricsCollector {
public:
    virtual ~IMetricsCollector() = default;

    /**
     * @brief Get metrics for a specific worker
     * @param workerId The worker ID
     * @return WorkerMetrics for the specified worker
     */
    virtual WorkerMetrics getWorkerMetrics(uint32_t workerId) const = 0;

    /**
     * @brief Get metrics for all workers
     * @return Vector of WorkerMetrics for all workers
     */
    virtual std::vector<WorkerMetrics> getAllWorkerMetrics() const = 0;

    /**
     * @brief Get global queue status
     * @return Current queue status snapshot
     */
    virtual QueueStatus getQueueStatus() const = 0;

    /**
     * @brief Get performance metrics
     * @return Current performance metrics snapshot
     */
    virtual PerformanceMetrics getPerformanceMetrics() const = 0;

    /**
     * @brief Get number of active workers
     * @return Count of workers with Active status
     */
    virtual uint32_t getActiveWorkerCount() const = 0;

    /**
     * @brief Get total number of workers
     * @return Total worker count
     */
    virtual uint32_t getTotalWorkerCount() const = 0;

    /**
     * @brief Reset performance counters
     */
    virtual void resetCounters() = 0;

    /**
     * @brief Check if metrics collection is enabled
     * @return true if metrics collection is active
     */
    virtual bool isMetricsEnabled() const = 0;

    /**
     * @brief Enable or disable metrics collection
     * @param enable true to enable, false to disable
     */
    virtual void setMetricsEnabled(bool enable) = 0;
};

} // namespace scheduler
