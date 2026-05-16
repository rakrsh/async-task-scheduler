# Async Task Scheduler UI

A real-time web dashboard for visualizing task scheduler metrics and worker performance.

## Features

- **📊 Real-time Metrics**: Live updates of queue status, worker activity, and performance metrics
- **📋 Queue Visualization**: Visual representation of task queues by priority level (High, Normal, Low)
- **👷 Worker Monitoring**: Per-worker CPU usage, task completion counts, and work-stealing statistics
- **📈 Performance Analytics**: Throughput, latency, and work-stealing efficiency metrics
- **🎨 Modern UI**: Dark theme with responsive design using React and Recharts

## Quick Start

### Prerequisites
- Node.js 14+ and npm
- The main scheduler application running

### Installation

```bash
# Install dependencies for both server and client
npm install

# From the root ui/ directory
npm install -w server -w client
```

### Development

Start both the server and client in development mode:

```bash
npm run dev
```

This will:
- Start the Express server on http://localhost:3001
- Start the React development server with hot reload

Access the dashboard at: http://localhost:3000

### Production Build

```bash
# Build the React client
npm run build

# Start the server (serves built client)
npm start
```

## API Endpoints

The dashboard communicates with the scheduler via REST API:

- `GET /api/metrics` - Overall scheduler metrics
- `GET /api/metrics/queue-status` - Task queue status by worker
- `GET /api/metrics/workers` - Worker activity and CPU usage
- `GET /api/metrics/performance` - Performance metrics and throughput
- `GET /api/metrics/history` - Historical metrics for trends
- `GET /api/health` - Server health check

## Architecture

### Server (`server/`)
- **server.js**: Express API server and static file serving
- **metricsCollector.js**: Collects and aggregates scheduler metrics

### Client (`client/`)
- **components/Dashboard.js**: Main dashboard container
- **components/QueueStatus.js**: Task queue visualization
- **components/WorkerActivity.js**: Worker performance monitoring
- **components/PerformanceMetrics.js**: System-wide performance analytics

## Integration with C++ Scheduler

The dashboard is designed to work with the async-task-scheduler C++ library. To integrate:

1. Modify the `MetricsCollector` to connect to your running scheduler instance
2. Implement metrics export from the C++ scheduler (via shared memory, IPC, or socket)
3. Update the `/api/metrics/*` endpoints to fetch real data

## Configuration

Set environment variables:

```bash
# Server port
PORT=3001

# API base URL (for client)
REACT_APP_API_BASE=http://localhost:3001
```

## Troubleshooting

**Connection errors**: Ensure the Express server is running on the correct port
**No data appearing**: Check that metrics are being collected and exposed correctly
**Performance issues**: Reduce polling frequency or implement WebSocket for real-time updates

## Future Enhancements

- [ ] WebSocket support for real-time push updates
- [ ] Historical data export (CSV/JSON)
- [ ] Custom alerts and thresholds
- [ ] Task timing analysis and profiling
- [ ] Integration with OpenTelemetry
