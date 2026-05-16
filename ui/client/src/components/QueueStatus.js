import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Panel.css';

function QueueStatus({ data }) {
  if (!data || !data.workers) return null;

  const chartData = data.workers.map(w => ({
    worker: `W${w.id}`,
    high: w.highPriority,
    normal: w.normalPriority,
    low: w.lowPriority,
  }));

  const colors = {
    high: '#ef4444',
    normal: '#f59e0b',
    low: '#3b82f6',
  };

  return (
    <div className="panel">
      <h2>📋 Queue Status</h2>
      
      <div className="queue-chart">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="worker" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(30, 30, 46, 0.9)', 
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
            />
            <Legend />
            <Bar dataKey="high" fill={colors.high} name="High Priority" />
            <Bar dataKey="normal" fill={colors.normal} name="Normal Priority" />
            <Bar dataKey="low" fill={colors.low} name="Low Priority" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="queue-stats">
        <h3>Global Statistics</h3>
        <div className="stats-grid">
          <div className="stat">
            <span className="label">Total Queued</span>
            <span className="value">{data.globalStats.totalQueued}</span>
          </div>
          <div className="stat high">
            <span className="label">High Priority</span>
            <span className="value">{data.globalStats.highPriorityTotal}</span>
          </div>
          <div className="stat normal">
            <span className="label">Normal Priority</span>
            <span className="value">{data.globalStats.normalPriorityTotal}</span>
          </div>
          <div className="stat low">
            <span className="label">Low Priority</span>
            <span className="value">{data.globalStats.lowPriorityTotal}</span>
          </div>
        </div>
      </div>

      <div className="queue-table">
        <table>
          <thead>
            <tr>
              <th>Worker</th>
              <th style={{ color: '#ef4444' }}>High</th>
              <th style={{ color: '#f59e0b' }}>Normal</th>
              <th style={{ color: '#3b82f6' }}>Low</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.workers.map(w => (
              <tr key={w.id}>
                <td>Worker {w.id}</td>
                <td style={{ color: '#ef4444' }}>{w.highPriority}</td>
                <td style={{ color: '#f59e0b' }}>{w.normalPriority}</td>
                <td style={{ color: '#3b82f6' }}>{w.lowPriority}</td>
                <td style={{ fontWeight: 'bold' }}>{w.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QueueStatus;
