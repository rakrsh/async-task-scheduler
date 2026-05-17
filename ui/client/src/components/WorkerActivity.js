import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Panel.css';

function WorkerActivity({ data }) {
  if (!data || !data.workers) return null;

  const cpuChartData = data.workers.map(w => ({
    name: `W${w.id}`,
    cpu: parseFloat(w.cpuUsage),
    utilization: parseFloat(w.utilization),
  }));

  const taskChartData = data.workers.map(w => ({
    name: `W${w.id}`,
    completed: w.tasksCompleted,
    stolen: w.tasksStolen,
  }));

  const getStatusColor = (status) => {
    return status === 'active' ? '#22c55e' : '#9ca3af';
  };

  const getStatusLabel = (status) => {
    return status === 'active' ? '🟢 Active' : '⚫ Idle';
  };

  return (
    <div className="panel">
      <h2>👷 Worker Activity</h2>

      <div className="worker-grid">
        {data.workers.map(w => (
          <div key={w.id} className={`worker-card ${w.status}`}>
            <div className="worker-header">
              <h4>Worker {w.id}</h4>
              <span className="worker-status" style={{ color: getStatusColor(w.status) }}>
                {getStatusLabel(w.status)}
              </span>
            </div>
            <div className="worker-metrics">
              <div className="metric">
                <span className="label">CPU Usage</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${parseFloat(w.cpuUsage)}%`,
                      backgroundColor: parseFloat(w.cpuUsage) > 50 ? '#ef4444' : '#f59e0b'
                    }}
                  ></div>
                </div>
                <span className="value">{w.cpuUsage}%</span>
              </div>
              <div className="metric">
                <span className="label">Tasks Completed</span>
                <span className="value">{w.tasksCompleted.toLocaleString()}</span>
              </div>
              <div className="metric">
                <span className="label">Tasks Stolen</span>
                <span className="value" style={{ color: '#a78bfa' }}>{w.tasksStolen}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart">
          <h3>CPU Usage by Worker</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={cpuChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(30, 30, 46, 0.9)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="cpu" fill="#f59e0b" name="CPU Usage (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart">
          <h3>Tasks by Worker</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(30, 30, 46, 0.9)', 
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
              <Bar dataKey="stolen" fill="#a78bfa" name="Stolen" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="summary-stats">
        <h3>Summary</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="label">Active Workers</span>
            <span className="value" style={{ color: '#22c55e' }}>{data.summary.activeWorkers}</span>
          </div>
          <div className="stat">
            <span className="label">Idle Workers</span>
            <span className="value" style={{ color: '#9ca3af' }}>{data.summary.idleWorkers}</span>
          </div>
          <div className="stat">
            <span className="label">Avg CPU Usage</span>
            <span className="value">{data.summary.averageCpuUsage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerActivity;
