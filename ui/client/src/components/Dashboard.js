import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QueueStatus from './QueueStatus';
import WorkerActivity from './WorkerActivity';
import PerformanceMetrics from './PerformanceMetrics';
import './Dashboard.css';

function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [workerStats, setWorkerStats] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, queueRes, workersRes, perfRes] = await Promise.all([
          axios.get(`${API_BASE}/api/metrics`),
          axios.get(`${API_BASE}/api/metrics/queue-status`),
          axios.get(`${API_BASE}/api/metrics/workers`),
          axios.get(`${API_BASE}/api/metrics/performance`),
        ]);

        setMetrics(metricsRes.data);
        setQueueStatus(queueRes.data);
        setWorkerStats(workersRes.data);
        setPerformanceMetrics(perfRes.data);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        setError(err.message);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Poll for updates every second
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="dashboard loading">
        <div className="loading-spinner"></div>
        <p>Connecting to scheduler...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard error">
        <h1>Connection Error</h1>
        <p>Unable to connect to dashboard API: {error}</p>
        <p className="help-text">Make sure the server is running on {API_BASE}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>📊 Async Task Scheduler Dashboard</h1>
          <div className="header-status">
            <span className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      {metrics && (
        <div className="metrics-summary">
          <div className="metric-card">
            <h3>Total Tasks</h3>
            <p className="metric-value">{metrics.totalTasksProcessed?.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h3>Work Steals</h3>
            <p className="metric-value">{metrics.totalTasksStolen?.toLocaleString()}</p>
          </div>
          <div className="metric-card">
            <h3>Active Workers</h3>
            <p className="metric-value">{metrics.activeWorkers} / {metrics.workers}</p>
          </div>
          <div className="metric-card">
            <h3>Avg CPU Usage</h3>
            <p className="metric-value">{metrics.averageCpuUsage}%</p>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {queueStatus && <QueueStatus data={queueStatus} />}
        {workerStats && <WorkerActivity data={workerStats} />}
        {performanceMetrics && <PerformanceMetrics data={performanceMetrics} />}
      </div>
    </div>
  );
}

export default Dashboard;
