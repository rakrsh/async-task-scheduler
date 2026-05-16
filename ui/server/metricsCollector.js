/**
 * MetricsCollector - Collects and manages scheduler metrics
 * In production, this would connect to the C++ scheduler via IPC/RPC
 */

class MetricsCollector {
  constructor() {
    this.metricsHistory = [];
    this.maxHistorySize = 300; // Keep last 5 minutes at 1Hz polling
    this.startTime = Date.now();
    this.taskCounter = 0;
    this.stealCounter = 0;
    
    // Initialize with sample workers
    this.workerCount = 4;
    this.initializeWorkers();
    
    // Start periodic metrics collection (simulated)
    this.startMetricsCollection();
  }

  initializeWorkers() {
    this.workers = Array.from({ length: this.workerCount }, (_, i) => ({
      id: i,
      status: i === 0 ? 'active' : 'idle',
      tasksCompleted: Math.floor(Math.random() * 1000),
      tasksStolen: Math.floor(Math.random() * 100),
      queueHighPriority: Math.floor(Math.random() * 10),
      queueNormalPriority: Math.floor(Math.random() * 20),
      queueLowPriority: Math.floor(Math.random() * 5),
      cpuUsage: i === 0 ? Math.random() * 60 : Math.random() * 10,
    }));
  }

  startMetricsCollection() {
    setInterval(() => {
      this.collectSnapshot();
    }, 1000); // Collect metrics every second
  }

  collectSnapshot() {
    // Simulate metric updates
    this.workers.forEach(worker => {
      // Randomly transition worker states
      if (Math.random() > 0.7) {
        worker.status = worker.status === 'active' ? 'idle' : 'active';
      }
      
      // Update metrics
      if (worker.status === 'active') {
        worker.tasksCompleted += Math.floor(Math.random() * 3);
        worker.cpuUsage = 30 + Math.random() * 50;
        if (Math.random() > 0.8) {
          worker.tasksStolen += 1;
          this.stealCounter += 1;
        }
      } else {
        worker.cpuUsage = Math.random() * 5;
      }
      
      // Random task additions
      const queues = ['queueHighPriority', 'queueNormalPriority', 'queueLowPriority'];
      queues.forEach(queue => {
        if (Math.random() > 0.6) {
          worker[queue] = Math.max(0, worker[queue] + Math.floor((Math.random() - 0.5) * 3));
        }
      });
    });

    this.taskCounter += Math.floor(Math.random() * 5);

    // Store snapshot
    const snapshot = {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      totalTasksProcessed: this.taskCounter,
      totalTasksStolen: this.stealCounter,
      averageCpuUsage: (this.workers.reduce((sum, w) => sum + w.cpuUsage, 0) / this.workers.length).toFixed(2),
      activeWorkers: this.workers.filter(w => w.status === 'active').length,
      totalQueued: this.workers.reduce((sum, w) => 
        sum + w.queueHighPriority + w.queueNormalPriority + w.queueLowPriority, 0),
    };

    this.metricsHistory.push(snapshot);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  getMetrics() {
    const latest = this.metricsHistory[this.metricsHistory.length - 1] || {};
    return {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      workers: this.workerCount,
      activeWorkers: this.workers.filter(w => w.status === 'active').length,
      totalTasksProcessed: latest.totalTasksProcessed || 0,
      totalTasksStolen: latest.totalTasksStolen || 0,
      ...latest,
    };
  }

  getQueueStatus() {
    return {
      timestamp: Date.now(),
      workers: this.workers.map(w => ({
        id: w.id,
        highPriority: w.queueHighPriority,
        normalPriority: w.queueNormalPriority,
        lowPriority: w.queueLowPriority,
        total: w.queueHighPriority + w.queueNormalPriority + w.queueLowPriority,
      })),
      globalStats: {
        totalQueued: this.workers.reduce((sum, w) => 
          sum + w.queueHighPriority + w.queueNormalPriority + w.queueLowPriority, 0),
        highPriorityTotal: this.workers.reduce((sum, w) => sum + w.queueHighPriority, 0),
        normalPriorityTotal: this.workers.reduce((sum, w) => sum + w.queueNormalPriority, 0),
        lowPriorityTotal: this.workers.reduce((sum, w) => sum + w.queueLowPriority, 0),
      },
    };
  }

  getWorkerStats() {
    return {
      timestamp: Date.now(),
      totalWorkers: this.workerCount,
      workers: this.workers.map(w => ({
        id: w.id,
        status: w.status,
        tasksCompleted: w.tasksCompleted,
        tasksStolen: w.tasksStolen,
        cpuUsage: w.cpuUsage.toFixed(2),
        utilization: ((w.cpuUsage / 100) * 100).toFixed(1),
      })),
      summary: {
        activeWorkers: this.workers.filter(w => w.status === 'active').length,
        idleWorkers: this.workers.filter(w => w.status === 'idle').length,
        averageCpuUsage: (this.workers.reduce((sum, w) => sum + w.cpuUsage, 0) / this.workers.length).toFixed(2),
      },
    };
  }

  getPerformanceMetrics() {
    const latest = this.metricsHistory[this.metricsHistory.length - 1] || {};
    const oneMinuteAgo = this.metricsHistory.filter(m => m.timestamp > Date.now() - 60000);
    
    return {
      timestamp: Date.now(),
      throughput: {
        tasksPerSecond: (oneMinuteAgo.length > 0 ? 
          (latest.totalTasksProcessed - (oneMinuteAgo[0].totalTasksProcessed || 0)) / 60 : 0).toFixed(2),
        stealsPerSecond: (oneMinuteAgo.length > 0 ? 
          (latest.totalTasksStolen - (oneMinuteAgo[0].totalTasksStolen || 0)) / 60 : 0).toFixed(2),
      },
      totalTasksProcessed: latest.totalTasksProcessed || 0,
      totalTasksStolen: latest.totalTasksStolen || 0,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      averageLatency: (Math.random() * 100 + 50).toFixed(2), // µs
    };
  }

  getMetricsHistory() {
    return {
      timestamp: Date.now(),
      data: this.metricsHistory.map(m => ({
        timestamp: m.timestamp,
        totalTasksProcessed: m.totalTasksProcessed,
        totalTasksStolen: m.totalTasksStolen,
        activeWorkers: m.activeWorkers,
        averageCpuUsage: parseFloat(m.averageCpuUsage),
      })),
    };
  }
}

export { MetricsCollector };
