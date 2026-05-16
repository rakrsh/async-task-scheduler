import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { MetricsCollector } from './metricsCollector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const metricsCollector = new MetricsCollector();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static React app
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.get('/api/metrics', (req, res) => {
  const metrics = metricsCollector.getMetrics();
  res.json(metrics);
});

app.get('/api/metrics/queue-status', (req, res) => {
  const queueStatus = metricsCollector.getQueueStatus();
  res.json(queueStatus);
});

app.get('/api/metrics/workers', (req, res) => {
  const workers = metricsCollector.getWorkerStats();
  res.json(workers);
});

app.get('/api/metrics/performance', (req, res) => {
  const performance = metricsCollector.getPerformanceMetrics();
  res.json(performance);
});

app.get('/api/metrics/history', (req, res) => {
  const history = metricsCollector.getMetricsHistory();
  res.json(history);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// Fallback to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`📊 Dashboard server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/metrics`);
});
