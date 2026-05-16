# Dashboard

## Overview

The Async Task Scheduler Dashboard is a real-time web-based visualization tool for monitoring and analyzing the performance of the task scheduler. It provides insights into:

- **Task Queue Status**: Visual representation of task queues across workers by priority level
- **Worker Activity**: Real-time monitoring of worker thread performance and CPU usage
- **Performance Metrics**: Throughput, latency, and work-stealing efficiency statistics

## Features

### 📊 Queue Status Panel
Displays task distribution across priority levels:
- **High Priority**: Critical tasks (red)
- **Normal Priority**: Standard tasks (orange)
- **Low Priority**: Background tasks (blue)

Metrics include per-worker queue depth and global statistics, helping identify load imbalances.

### 👷 Worker Activity Panel
Real-time worker monitoring showing:
- **Status**: Active (green) or Idle (gray)
- **CPU Usage**: Per-worker CPU utilization with visual progress bars
- **Tasks Completed**: Total tasks processed by each worker
- **Tasks Stolen**: Number of tasks acquired via work-stealing
- **Trend Charts**: Historical CPU usage and task completion trends

### 📈 Performance Metrics Panel
System-wide performance analysis:
- **Throughput**: Tasks processed per second
- **Work-Stealing Stats**: Steals per second and total steal count
- **Efficiency Ratios**: Work-stealing ratio and direct completion rate
- **System Uptime**: Total runtime and average latency

## Getting Started

### Prerequisites
- Node.js 14+
- The async-task-scheduler compiled and running

### Installation

```bash
cd ui
npm install
```

### Development Mode

Start both server and client with live reload:

```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## API Integration

The dashboard communicates with the scheduler via REST API endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/metrics` | Overall scheduler metrics snapshot |
| `GET /api/metrics/queue-status` | Task queue status by worker and priority |
| `GET /api/metrics/workers` | Worker statistics and CPU usage |
| `GET /api/metrics/performance` | System performance and throughput metrics |
| `GET /api/metrics/history` | Historical data for trend analysis |
| `GET /api/health` | Server health check |

## Integrating with Your Scheduler

### Step 1: Extend Scheduler with Metrics Exposure

Add methods to your scheduler to expose metrics:

```cpp
// In scheduler.hpp or worker.hpp
struct WorkerMetrics {
    uint64_t tasksCompleted;
    uint64_t tasksStolen;
    double cpuUsage;
    WorkerStatus status;
};

class Scheduler {
    std::vector<WorkerMetrics> getWorkerMetrics() const;
    QueueStatus getQueueStatus() const;
    // ...
};
```

### Step 2: Create Metrics Bridge

Implement a bridge to expose metrics via HTTP (shared memory, IPC, or direct C++ binding):

```cpp
// Example: REST server using a library like crow or pistache
auto metricsRoute = [scheduler]() {
    auto metrics = scheduler->getMetrics();
    return json::serialize(metrics);
};
```

### Step 3: Update MetricsCollector

Modify `ui/server/metricsCollector.js` to connect to your scheduler:

```javascript
import { MetricsCollector as CppMetrics } from '../scheduler-binding/index.js';

class MetricsCollector {
    constructor() {
        this.cppMetrics = new CppMetrics();
    }
    
    getMetrics() {
        return this.cppMetrics.getMetrics();
    }
}
```

## Monitoring Best Practices

### Identifying Load Imbalance
- **Indicator**: High variance in queue depths across workers
- **Action**: Check work-stealing ratio; high ratios indicate uneven distribution

### Detecting Bottlenecks
- **Indicator**: Consistent high CPU on one or two workers with idle workers present
- **Action**: Review task affinity and consider load balancing adjustments

### Optimizing Throughput
- **Indicator**: Low work-stealing ratio despite idle workers
- **Action**: Tasks may be too large; consider decomposition or priority adjustments

### Latency Analysis
- **Indicator**: High average latency with low throughput
- **Action**: Check for priority starvation; ensure High priority tasks are processed promptly

## Architecture

```
┌─────────────────────────────────────────┐
│   React Dashboard (Client)              │
│  ├─ QueueStatus Component              │
│  ├─ WorkerActivity Component           │
│  └─ PerformanceMetrics Component       │
└──────────────────┬──────────────────────┘
                   │ HTTP (REST)
┌──────────────────▼──────────────────────┐
│   Express Server (Node.js)              │
│  ├─ /api/metrics                       │
│  ├─ /api/metrics/queue-status          │
│  ├─ /api/metrics/workers               │
│  └─ /api/metrics/performance           │
└──────────────────┬──────────────────────┘
                   │ IPC/Shared Memory
┌──────────────────▼──────────────────────┐
│   Async Task Scheduler (C++)            │
│  ├─ WorkStealingDeque                  │
│  ├─ Worker Threads                     │
│  └─ Metrics Collection                 │
└─────────────────────────────────────────┘
```

## Troubleshooting

### Dashboard not connecting
- Verify Express server is running: `curl http://localhost:3001/api/health`
- Check REACT_APP_API_BASE environment variable
- Ensure CORS is properly configured

### No metrics displayed
- Verify scheduler is running and exposing metrics
- Check browser console for API errors
- Review MetricsCollector implementation

### Performance degradation
- Reduce polling frequency (currently 1 second)
- Consider WebSocket implementation for lower overhead
- Profile React component render times

## Future Enhancements

- [ ] **WebSocket Support**: Real-time push updates instead of polling
- [ ] **Historical Analysis**: Long-term trend analysis and export
- [ ] **Custom Alerts**: Configurable thresholds and notifications
- [ ] **Task Profiling**: Per-task execution time and memory usage
- [ ] **Distributed Monitoring**: Multi-scheduler aggregation
- [ ] **OpenTelemetry Integration**: Standards-based metrics export

## Configuration

Create a `.env.local` file in `ui/server/` to customize:

```bash
PORT=3001
NODE_ENV=production
SCHEDULER_HOST=localhost
SCHEDULER_PORT=5000
POLLING_INTERVAL=1000
```

## Performance Considerations

- **Polling Interval**: Default 1 second; increase for slower networks
- **History Size**: Default 300 data points (~5 minutes at 1Hz)
- **Chart Updates**: Debounced to prevent excessive renders
- **Memory Usage**: Minimal; scales linearly with worker count

See [README.md](../ui/README.md) for additional technical details.
