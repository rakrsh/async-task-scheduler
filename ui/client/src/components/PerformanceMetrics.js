import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Panel.css';

function PerformanceMetrics({ data }) {
  if (!data) return null;

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="panel">
      <h2>📈 Performance Metrics</h2>

      <div className="perf-summary">
        <div className="perf-stat">
          <h4>Throughput</h4>
          <div className="stat-group">
            <div className="stat-item">
              <span className="label">Tasks/sec</span>
              <span className="value">{data.throughput.tasksPerSecond}</span>
            </div>
            <div className="stat-item">
              <span className="label">Steals/sec</span>
              <span className="value" style={{ color: '#a78bfa' }}>{data.throughput.stealsPerSecond}</span>
            </div>
          </div>
        </div>

        <div className="perf-stat">
          <h4>Totals</h4>
          <div className="stat-group">
            <div className="stat-item">
              <span className="label">Tasks Processed</span>
              <span className="value">{data.totalTasksProcessed.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="label">Work Steals</span>
              <span className="value" style={{ color: '#a78bfa' }}>{data.totalTasksStolen.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="perf-stat">
          <h4>System</h4>
          <div className="stat-group">
            <div className="stat-item">
              <span className="label">Uptime</span>
              <span className="value">{formatTime(data.uptime)}</span>
            </div>
            <div className="stat-item">
              <span className="label">Avg Latency</span>
              <span className="value">{data.averageLatency} µs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="efficiency-metrics">
        <h3>Efficiency Calculation</h3>
        <div className="efficiency-item">
          <span className="label">Work-Stealing Ratio</span>
          <span className="value">
            {data.totalTasksProcessed > 0 
              ? ((data.totalTasksStolen / data.totalTasksProcessed) * 100).toFixed(2)
              : '0'
            }%
          </span>
          <span className="description">
            Lower ratio indicates better load balancing (fewer steals needed)
          </span>
        </div>
        <div className="efficiency-item">
          <span className="label">Direct Completion Rate</span>
          <span className="value">
            {data.totalTasksProcessed > 0 
              ? (((data.totalTasksProcessed - data.totalTasksStolen) / data.totalTasksProcessed) * 100).toFixed(2)
              : '0'
            }%
          </span>
          <span className="description">
            Tasks completed by original owner thread
          </span>
        </div>
      </div>

      <div className="legend-note">
        <p>ℹ️ <strong>Work-Stealing Ratio:</strong> Percentage of tasks that were stolen by idle workers. High ratios may indicate uneven load distribution across workers.</p>
        <p>ℹ️ <strong>Average Latency:</strong> Estimated average time from task submission to completion (microseconds).</p>
      </div>
    </div>
  );
}

export default PerformanceMetrics;
