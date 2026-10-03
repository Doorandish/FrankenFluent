import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, Database, Server, Smartphone, Brain, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  status: string;
  type: string;
  docs: string;
}

interface SreData {
  system: {
    uptime_seconds: number;
    memory_usage_mb: number;
    cpu_load: number;
    status: string;
  };
  topology: Node[];
}

export const SystemDashboardPage: React.FC = () => {
  const [data, setData] = useState<SreData | null>(null);
  const [activeDoc, setActiveDoc] = useState<Node | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('/api/sre/metrics');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load SRE metrics', err);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-8 text-white">Loading telemetry...</div>;

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <Smartphone className="w-6 h-6" />;
      case 'server': return <Server className="w-6 h-6" />;
      case 'database': return <Database className="w-6 h-6" />;
      case 'external': return <Brain className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Activity className="text-brand-500" /> System Observability & Docs
        </h1>
        <p className="text-dark-400 mt-2">Real-time telemetry and interactive technical documentation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-dark-400 text-sm mb-1 uppercase tracking-wider">System Status</h3>
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            {data.system.status === 'healthy' ? <CheckCircle className="text-brand-500" /> : <AlertTriangle className="text-red-500" />}
            {data.system.status.toUpperCase()}
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-dark-400 text-sm mb-1 uppercase tracking-wider">Uptime</h3>
          <div className="text-2xl font-bold text-white">{data.system.uptime_seconds}s</div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-dark-400 text-sm mb-1 uppercase tracking-wider">Memory Usage</h3>
          <div className="text-2xl font-bold text-white">{data.system.memory_usage_mb} MB</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Topology & Health</h2>
          <div className="space-y-4">
            {data.topology.map(node => (
              <div key={node.id} className={`p-5 rounded-2xl border flex items-center justify-between transition-all ${node.status === 'healthy' ? 'bg-dark-900 border-dark-700 hover:border-brand-500/50' : 'bg-red-950/20 border-red-900/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${node.status === 'healthy' ? 'bg-dark-800 text-brand-400' : 'bg-red-900/50 text-red-400 animate-pulse'}`}>
                    {getIcon(node.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{node.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${node.status === 'healthy' ? 'bg-brand-900/30 text-brand-400' : 'bg-red-900/30 text-red-400'}`}>
                      {node.status}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveDoc(node)}
                  className="btn-secondary py-1.5 px-3 flex items-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" /> Docs
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white mb-4">Interactive Documentation</h2>
          {activeDoc ? (
            <div className="glass-card p-6 border-brand-500/30 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dark-800">
                <FileText className="text-brand-500 w-6 h-6" />
                <h3 className="text-xl font-bold text-white">{activeDoc.name} Specs</h3>
              </div>
              <div className="prose prose-invert prose-brand">
                <p className="text-dark-200 leading-relaxed">{activeDoc.docs}</p>
                <div className="mt-6 bg-dark-950 p-4 rounded-xl border border-dark-800 font-mono text-sm text-brand-300">
                  // Live Config View
                  <br />
                  module_id: "{activeDoc.id}"
                  <br />
                  type: "{activeDoc.type}"
                  <br />
                  telemetry_status: "{activeDoc.status}"
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 border border-dashed border-dark-700 rounded-2xl flex items-center justify-center text-dark-500">
              Click a "Docs" button on a module to view its documentation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
