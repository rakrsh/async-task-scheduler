# Integration Guide for Dashboard

This guide explains how to integrate the real-time dashboard with your async-task-scheduler implementation.

## Overview

The dashboard communicates with the scheduler through a REST API. The integration involves:

1. **Implementing the Metrics Interface** in your scheduler
2. **Creating a Metrics Server** to expose metrics via HTTP
3. **Connecting the Dashboard** to the metrics server

## Step 1: Implement IMetricsCollector

The `metrics.hpp` header defines the interface for exposing scheduler metrics. Implement this interface in your scheduler:

```cpp
#include "scheduler/metrics.hpp"
#include "scheduler/scheduler.hpp"

class SchedulerMetricsCollector : public scheduler::IMetricsCollector {
private:
    Scheduler& scheduler_;

public:
    explicit SchedulerMetricsCollector(Scheduler& scheduler)
        : scheduler_(scheduler) {}

    WorkerMetrics getWorkerMetrics(uint32_t workerId) const override {
        auto& worker = scheduler_.getWorker(workerId);
        return WorkerMetrics{
            workerId,
            worker.isActive() ? WorkerStatus::Active : WorkerStatus::Idle,
            worker.getTasksCompleted(),
            worker.getTasksStolen(),
            worker.getCpuUsage(),
            worker.getQueueSize(Priority::High),
            worker.getQueueSize(Priority::Normal),
            worker.getQueueSize(Priority::Low),
        };
    }

    std::vector<WorkerMetrics> getAllWorkerMetrics() const override {
        std::vector<WorkerMetrics> metrics;
        for (uint32_t i = 0; i < scheduler_.getWorkerCount(); ++i) {
            metrics.push_back(getWorkerMetrics(i));
        }
        return metrics;
    }

    QueueStatus getQueueStatus() const override {
        // Implementation
    }

    PerformanceMetrics getPerformanceMetrics() const override {
        // Implementation
    }

    // ... other methods
};
```

## Step 2: Create a Metrics REST Server

You can use libraries like [Pistache](http://pistache.io/) or [crow](https://github.com/CrowCpp/Crow) to create a REST API.

Example with crow:

```cpp
#include <crow_all.hpp>
#include "scheduler/metrics.hpp"

int main() {
    Scheduler scheduler(4); // 4 worker threads
    SchedulerMetricsCollector metrics(scheduler);
    
    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/metrics")
    ([&metrics]() {
        auto perf = metrics.getPerformanceMetrics();
        return crow::response(crow::status::ok, json_serialize(perf));
    });

    CROW_ROUTE(app, "/api/metrics/workers")
    ([&metrics]() {
        auto workers = metrics.getAllWorkerMetrics();
        return crow::response(crow::status::ok, json_serialize(workers));
    });

    CROW_ROUTE(app, "/api/metrics/queue-status")
    ([&metrics]() {
        auto status = metrics.getQueueStatus();
        return crow::response(crow::status::ok, json_serialize(status));
    });

    app.port(3001).multithreaded().run();
    return 0;
}
```

## Step 3: Configure the Dashboard

1. **Build the Dashboard**:
   ```bash
   cd ui/client
   npm install
   npm run build
   ```

2. **Start the Metrics Server**:
   ```bash
   ./your_metrics_server
   ```

3. **Serve the Dashboard**:
   ```bash
   cd ui/server
   NODE_ENV=production PORT=3000 npm start
   ```

4. **Access the Dashboard**:
   Open `http://localhost:3000` in your browser

## API Endpoints Reference

All endpoints return JSON responses.

### GET /api/metrics
Returns overall scheduler metrics including throughput and steal counts.

**Response**:
```json
{
  "uptime": 12345678,
  "totalTasksProcessed": 1000000,
  "totalTasksStolen": 50000,
  "tasksPerSecond": 1000.5,
  "stealsPerSecond": 50.2,
  "averageLatency": 75.3,
  "averageCpuUsage": 65.2
}
```

### GET /api/metrics/workers
Returns per-worker metrics for all workers.

**Response**:
```json
[
  {
    "id": 0,
    "status": "active",
    "tasksCompleted": 250000,
    "tasksStolen": 12500,
    "cpuUsage": 85.3,
    "highPriorityQueued": 5,
    "normalPriorityQueued": 15,
    "lowPriorityQueued": 2
  },
  ...
]
```

### GET /api/metrics/queue-status
Returns global queue status and per-worker breakdown.

**Response**:
```json
{
  "totalQueued": 22,
  "highPriorityTotal": 5,
  "normalPriorityTotal": 15,
  "lowPriorityTotal": 2,
  "workers": [...]
}
```

### GET /api/metrics/performance
Returns performance metrics and efficiency calculations.

**Response**:
```json
{
  "throughput": {
    "tasksPerSecond": 1000.5,
    "stealsPerSecond": 50.2
  },
  "totalTasksProcessed": 1000000,
  "totalTasksStolen": 50000,
  "uptime": 12345,
  "averageLatency": 75.3
}
```

## Metrics JSON Schema

For custom serialization, use these schemas:

### WorkerStatus Enum
- `"active"` - Worker is processing tasks
- `"idle"` - Worker is idle
- `"suspended"` - Worker is suspended

### WorkerMetrics
```cpp
struct WorkerMetrics {
    uint32_t id;
    std::string status;           // "active", "idle", or "suspended"
    uint64_t tasksCompleted;
    uint64_t tasksStolen;
    double cpuUsage;              // 0.0 - 100.0
    uint32_t highPriorityQueued;
    uint32_t normalPriorityQueued;
    uint32_t lowPriorityQueued;
};
```

## Troubleshooting

### Dashboard shows "Connection Error"
- Verify the metrics server is running on port 3001
- Check CORS headers: ensure `Access-Control-Allow-Origin: *` is set
- Test with curl: `curl -s http://localhost:3001/api/metrics | jq`

### Metrics are outdated
- Ensure metrics collection is enabled: `metricsCollector.setMetricsEnabled(true)`
- Reduce polling interval in dashboard if needed
- Check network latency

### High CPU usage in dashboard
- Reduce polling frequency from 1s to 2-5s
- Consider implementing WebSocket for push updates
- Profile React components with Chrome DevTools

## Performance Considerations

- **Polling Interval**: Default 1 second; safe for most systems
- **Metrics Collection Overhead**: Minimal (<1% overhead per metrics query)
- **Memory**: Metrics snapshots are lightweight (~1KB per worker)
- **Network**: Each metrics query is <2KB

## Future: WebSocket Integration

For lower latency and reduced server load:

```cpp
// Server-side (crow)
CROW_WEBSOCKET_ROUTE(app, "/ws/metrics")
.onopen([](crow::websocket::connection& conn) {
    // Start streaming metrics
})
.onclose([](crow::websocket::connection& conn) {
    // Stop streaming
})
.onmessage([](crow::websocket::connection& conn, const std::string& data) {
    // Handle client requests
});
```

```javascript
// Client-side (JavaScript)
const ws = new WebSocket('ws://localhost:3001/ws/metrics');
ws.onmessage = (event) => {
    const metrics = JSON.parse(event.data);
    updateDashboard(metrics);
};
```

## Example: Complete Integration

See `docs/examples/metrics-server.cpp` for a complete example of implementing and serving metrics.

## Support

For issues or questions:
1. Check the [Dashboard Documentation](../docs/dashboard.md)
2. Review [Architecture](../docs/architecture.md) for system design
3. Examine [Copilot Instructions](../docs/copilot.md) for AI-assisted debugging
