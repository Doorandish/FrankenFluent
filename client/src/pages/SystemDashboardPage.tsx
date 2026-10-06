import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Activity, Database, Server, Smartphone, Brain, Volume2, 
  FileText, CheckCircle, AlertTriangle, ArrowLeft, ExternalLink, 
  Code, ShieldAlert, Cpu, Layers, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleDoc {
  id: string;
  name: string;
  type: 'client' | 'server' | 'database' | 'ai' | 'audio';
  status: 'healthy' | 'degraded' | 'warning';
  summary: string;
  non_technical: {
    purpose: string;
    user_experience: string;
    business_value: string;
  };
  technical: {
    stack: string[];
    source_files: string[];
    endpoints?: string[];
    data_flow: string;
    error_handling: string;
    environment_vars?: string[];
  };
}

interface SreData {
  system: {
    uptime_seconds: number;
    memory_usage_mb: number;
    cpu_load: number;
    status: string;
    environment: string;
  };
  topology: ModuleDoc[];
}

export const SystemDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<SreData | null>(null);
  const [selectedModule, setSelectedModule] = useState<ModuleDoc | null>(null);
  const [docTab, setDocTab] = useState<'non-technical' | 'technical'>('technical');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await axios.get('/api/sre/metrics');
        setData(res.data);
        if (!selectedModule && res.data.topology?.length > 0) {
          setSelectedModule(res.data.topology[0]);
        }
      } catch (err) {
        console.error('Failed to load SRE metrics', err);
      }
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center text-white">
        <Activity className="w-8 h-8 text-brand-500 animate-spin mr-3" />
        <span>Loading Real-time System Telemetry & Documentation...</span>
      </div>
    );
  }

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'client': return <Smartphone className="w-5 h-5" />;
      case 'server': return <Server className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'ai': return <Brain className="w-5 h-5" />;
      case 'audio': return <Volume2 className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-dark-800 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2.5 rounded-xl bg-dark-900 border border-dark-800 hover:border-brand-500/40 text-dark-300 hover:text-white transition-all"
              title="Return to App"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Architecture & Living Docs</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 font-mono">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs md:text-sm text-dark-400 mt-1">
                Interactive topological overview and complete technical & business documentation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${data.system.status === 'healthy' ? 'bg-brand-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`} />
              <span className="text-xs font-semibold text-white uppercase">{data.system.status}</span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-dark-300 font-mono">
              Uptime: <b className="text-white">{data.system.uptime_seconds}s</b>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-dark-300 font-mono">
              RAM: <b className="text-white">{data.system.memory_usage_mb} MB</b>
            </div>
          </div>
        </header>

        {/* Visual Topology Graph / Flow */}
        <section className="bg-dark-900/60 backdrop-blur-xl border border-dark-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg font-bold text-white">Visual System Topology (Click any component to inspect)</h2>
            </div>
            <span className="text-xs text-dark-400">Click node for deep dive</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {data.topology.map((mod) => {
              const isSelected = selectedModule?.id === mod.id;
              return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 relative group ${
                    isSelected 
                      ? 'bg-dark-800/90 border-brand-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-brand-500/50' 
                      : 'bg-dark-900/70 border-dark-800 hover:border-dark-700 hover:bg-dark-850'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-brand-500/20 text-brand-400' : 'bg-dark-800 text-dark-300 group-hover:text-white'}`}>
                      {getModuleIcon(mod.type)}
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-brand-400">
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                      {mod.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{mod.name}</h3>
                  <p className="text-xs text-dark-400 mt-1 line-clamp-2 leading-relaxed">{mod.summary}</p>

                  <div className="mt-3 pt-3 border-t border-dark-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-dark-500 uppercase font-mono">{mod.type}</span>
                    <span className={`font-semibold ${isSelected ? 'text-brand-400' : 'text-dark-400 group-hover:text-dark-200'}`}>
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Detailed Module Documentation Viewer */}
        {selectedModule && (
          <section className="bg-dark-900/80 border border-dark-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Doc Header & Tabs */}
            <div className="p-6 bg-dark-850/80 border-b border-dark-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {getModuleIcon(selectedModule.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl md:text-2xl font-bold text-white">{selectedModule.name}</h2>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-dark-800 text-dark-300">
                      id: {selectedModule.id}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">{selectedModule.summary}</p>
                </div>
              </div>

              {/* Toggle Tabs */}
              <div className="flex p-1 bg-dark-950 rounded-xl border border-dark-800">
                <button
                  onClick={() => setDocTab('technical')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    docTab === 'technical' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  Technical Specs (فنی)
                </button>
                <button
                  onClick={() => setDocTab('non-technical')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                    docTab === 'non-technical' 
                      ? 'bg-brand-600 text-white shadow-sm' 
                      : 'text-dark-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Overview & Value (غیرفنی)
                </button>
              </div>
            </div>

            {/* Doc Content Area */}
            <div className="p-6 md:p-8">
              {docTab === 'technical' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Architecture & Data Flow */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-dark-400 font-mono mb-2">Technology Stack</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedModule.technical.stack.map((item, i) => (
                          <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-dark-800 text-brand-300 border border-dark-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-dark-400 font-mono mb-2">Data Flow Pipeline</h4>
                      <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 text-sm text-dark-200 leading-relaxed font-sans">
                        {selectedModule.technical.data_flow}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-dark-400 font-mono mb-2">Error Handling & Resilience</h4>
                      <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 text-sm text-dark-200 leading-relaxed font-sans">
                        {selectedModule.technical.error_handling}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Code & Endpoints */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-dark-400 font-mono mb-2">Related Source Files</h4>
                      <div className="space-y-2">
                        {selectedModule.technical.source_files.map((file, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-dark-800 text-xs font-mono text-dark-300 hover:text-white">
                            <span>{file}</span>
                            <span className="text-dark-500">repo root</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedModule.technical.endpoints && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-dark-400 font-mono mb-2">API Endpoints / Contracts</h4>
                        <div className="space-y-2">
                          {selectedModule.technical.endpoints.map((ep, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-dark-950 border border-dark-800 text-xs font-mono text-brand-400">
                              {ep}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedModule.technical.environment_vars && selectedModule.technical.environment_vars.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase tracking-wider text-dark-400 font-mono mb-2">Environment Variables</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedModule.technical.environment_vars.map((env, i) => (
                            <span key={i} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-dark-800 text-amber-400 border border-dark-700">
                              {env}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Non-Technical Tab */
                <div className="space-y-6 max-w-4xl">
                  <div className="p-5 rounded-2xl bg-dark-950 border border-dark-800">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-brand-400" />
                      هدف و کارکرد ماژول (Purpose)
                    </h4>
                    <p className="text-dark-200 text-sm leading-relaxed">
                      {selectedModule.non_technical.purpose}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-dark-950 border border-dark-800">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-blue-400" />
                      تجربه کاربر نهایی (User Experience)
                    </h4>
                    <p className="text-dark-200 text-sm leading-relaxed">
                      {selectedModule.non_technical.user_experience}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-dark-950 border border-dark-800">
                    <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      ارزش تجاری و محصولی (Business Value)
                    </h4>
                    <p className="text-dark-200 text-sm leading-relaxed">
                      {selectedModule.non_technical.business_value}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
