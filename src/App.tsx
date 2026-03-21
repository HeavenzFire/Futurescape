import React, { useState, useEffect } from "react";
import { 
  Heart,
  Shield,
  Zap, 
  Search, 
  Database, 
  Activity, 
  Cpu, 
  ChevronRight, 
  Loader2,
  Sparkles,
  Layers,
  Terminal,
  Box,
  Radio
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { FuturescapeScan } from "./services/gemini";
import { futurescapeApi, GridStatus } from "./lib/futurescape_api";

import { AstroClock } from "./components/AstroClock";

type Tab = "dashboard" | "projection" | "fossils";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [contentLog, setContentLog] = useState<string>("");
  const [ideas, setIdeas] = useState<string>("");
  const [scanResult, setScanResult] = useState<FuturescapeScan | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gridStatus, setGridStatus] = useState<GridStatus>(futurescapeApi.getGridStatus(null));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { contentLog, ideas } = await futurescapeApi.fetchFossils();
        setContentLog(contentLog);
        setIdeas(ideas);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setGridStatus(futurescapeApi.getGridStatus(scanResult));
  }, [scanResult]);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const result = await futurescapeApi.performScan();
      setScanResult(result);
    } catch (err: any) {
      setError(err.message || "Scan failed");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex h-screen bg-bg-dark text-white font-sans overflow-hidden grid-bg relative">
      <div className="mist-overlay" />
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-cyan-fae/20 bg-black/40 backdrop-blur-md flex flex-col z-10">
        <div className="p-6 border-b border-cyan-fae/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg mu-gradient flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.6)] group">
              <Box className="w-6 h-6 text-black animate-[spin_10s_linear_infinite]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter etched-text">FUTURESCAPE</h1>
              <p className="text-[9px] text-cyan-fae/50 font-mono uppercase tracking-widest">IGNIS v2.1 OS</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem 
            icon={<Activity className="w-4 h-4" />} 
            label="Dashboard" 
            active={activeTab === "dashboard"} 
            onClick={() => setActiveTab("dashboard")} 
          />
          <SidebarItem 
            icon={<Search className="w-4 h-4" />} 
            label="Futurescape Projection" 
            active={activeTab === "projection"} 
            onClick={() => setActiveTab("projection")} 
          />
          <SidebarItem 
            icon={<Database className="w-4 h-4" />} 
            label="Data Fossils" 
            active={activeTab === "fossils"} 
            onClick={() => setActiveTab("fossils")} 
          />
        </nav>

        <div className="p-4 border-t border-cyan-fae/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[10px] text-cyan-fae/40 font-mono">
              <div className={cn("w-2 h-2 rounded-full", gridStatus.connected ? "bg-cyan-fae animate-pulse" : "bg-red-500")} />
              <span>GRID: {gridStatus.status}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-white/20 font-mono">
                <span>YIELD:</span>
                <span className="text-cyan-fae/60">{gridStatus.yield}</span>
              </div>
              <div className="flex justify-between text-[9px] text-white/20 font-mono">
                <span>HEALTH:</span>
                <span className="text-cyan-fae/60">{gridStatus.health}</span>
              </div>
              <div className="flex justify-between text-[9px] text-white/20 font-mono">
                <span>INTEGRITY:</span>
                <span className="text-cyan-fae/60">{gridStatus.integrity}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <AstroClock />
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 space-y-8"
            >
              <header className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-light italic serif etched-text">Syntropic Overview</h2>
                  <p className="text-sm text-white/40 mt-1">Real-time mapping of the 584-day Venus cycle bleed.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-cyan-fae/40 uppercase">Last Sync</p>
                  <p className="text-xs font-mono">{gridStatus.lastScan ? gridStatus.lastScan.toLocaleTimeString() : "INITIALIZING..."}</p>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Current Yield" value={gridStatus.yield} trend="+2.4%" icon={<Zap className="w-4 h-4" />} />
                <StatCard label="Mu Frequency" value={gridStatus.frequency} trend="Stable" icon={<Radio className="w-4 h-4" />} />
                <StatCard label="Sentinel Protocol" value={gridStatus.sentinelStatus} trend={gridStatus.health} icon={<Shield className="w-4 h-4" />} />
                <StatCard label="Grid Status" value={gridStatus.status} trend="Optimal" icon={<Activity className="w-4 h-4" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-cyan-fae/20 rounded-2xl bg-black/40 p-6 cyan-aura relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Box className="w-32 h-32 animate-[spin_20s_linear_infinite]" />
                  </div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-fae" />
                    Active Lattice
                  </h3>
                  <div className="h-48 flex items-end gap-2 px-4 relative z-10">
                    {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
                      <div key={i} className="flex-1 group relative">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          className="w-full mu-gradient rounded-t-sm opacity-40 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                        />
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-cyan-fae/40">
                          P-{i+1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-cyan-fae/20 rounded-2xl bg-black/40 p-6 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan-fae/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-lg font-medium mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500 animate-pulse" />
                      Sentinel Heartbeat
                    </div>
                    <span className="text-[10px] font-mono text-cyan-fae/40 uppercase tracking-widest">Self-Healing Active</span>
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-xs font-mono text-white/60">Phoenix Hull Integrity</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-fae">{gridStatus.integrity}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-cyan-fae shadow-[0_0_10px_rgba(0,255,255,0.5)]" />
                        <span className="text-xs font-mono text-white/60">Syntropic Core Resonance</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-fae">{gridStatus.frequency}</span>
                    </div>

                    <div className="p-4 bg-black/40 rounded-xl border border-cyan-fae/10">
                      <p className="text-[10px] font-mono text-white/20 uppercase mb-2">Sentinel Log</p>
                      <div className="text-[10px] font-mono text-cyan-fae/60 space-y-1">
                        <p>[{new Date().toLocaleTimeString()}] HEARTBEAT: YIELD {gridStatus.yield} ✓</p>
                        <p>[{new Date().toLocaleTimeString()}] HEALTH: {gridStatus.health} ✓</p>
                        <p>[{new Date().toLocaleTimeString()}] STATUS: {gridStatus.status} ✓</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "projection" && (
            <motion.div 
              key="projection"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className={cn(
                "p-8 h-full flex flex-col transition-all duration-1000 relative",
                isScanning && "cyan-aura bg-cyan-fae/[0.02] shadow-[0_0_100px_rgba(0,255,255,0.1)]"
              )}
            >
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none animate-pulse-cyan opacity-20 mu-gradient" />
              )}
              <header className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-4xl font-bold etched-text">Futurescape Projection</h2>
                  <p className="text-sm text-cyan-fae/60 font-mono uppercase tracking-widest mt-1">Neural Blueprint Synthesis</p>
                </div>
                <button 
                  onClick={handleScan}
                  disabled={isScanning}
                  className="px-8 py-4 mu-gradient text-black font-bold rounded-xl shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:shadow-[0_0_50px_rgba(0,255,255,0.6)] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 group-hover:animate-pulse" />}
                  <span className="tracking-widest">{isScanning ? "RECOMPILING..." : "ACTIVATE SCAN"}</span>
                </button>
              </header>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Results */}
                <div className="space-y-6">
                  {scanResult ? (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="border border-cyan-fae/30 rounded-2xl bg-cyan-fae/5 p-8 cyan-aura relative overflow-hidden"
                      >
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-fae/10 blur-3xl rounded-full" />
                        <div className="flex items-center justify-between mb-6 relative z-10">
                          <span className="px-3 py-1 bg-cyan-fae/20 text-cyan-fae text-[10px] font-mono rounded-full border border-cyan-fae/30 tracking-widest">HIGH-HEAT ANOMALY</span>
                          <span className="text-cyan-fae font-mono text-lg font-bold">YIELD: {scanResult.highHeatAnomaly.yieldPotential}x</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 etched-text">{scanResult.highHeatAnomaly.idea}</h3>
                        <p className="text-white/70 text-base leading-relaxed italic border-l-2 border-cyan-fae/30 pl-4">{scanResult.highHeatAnomaly.reasoning}</p>
                        
                        <div className="mt-8 grid grid-cols-2 gap-6">
                          <div className="p-4 bg-black/60 rounded-2xl border border-white/5 group hover:border-cyan-fae/30 transition-colors">
                            <p className="text-[10px] text-white/40 uppercase font-mono mb-1">Novelty Score</p>
                            <p className="text-2xl font-bold text-cyan-fae">{(scanResult.highHeatAnomaly.novelty * 100).toFixed(0)}%</p>
                          </div>
                          <div className="p-4 bg-black/60 rounded-2xl border border-white/5 group hover:border-cyan-fae/30 transition-colors">
                            <p className="text-[10px] text-white/40 uppercase font-mono mb-1">Emotion Resonance</p>
                            <p className="text-2xl font-bold text-cyan-fae">{(scanResult.highHeatAnomaly.emotion * 100).toFixed(0)}%</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="border border-white/10 rounded-2xl bg-black/40 p-8"
                      >
                        <h4 className="text-xs font-mono text-cyan-fae/60 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <Terminal className="w-5 h-5" />
                          Ignition Sequence // REBIRTH_CYAN_001
                        </h4>
                        <div className="space-y-4">
                          {scanResult.ignitionSequence.steps.map((step, i) => (
                            <div key={i} className="flex gap-4 items-start group">
                              <span className="text-cyan-fae/40 font-mono text-xs mt-1">0{i+1}</span>
                              <p className="text-sm text-white/80 group-hover:text-cyan-fae transition-colors leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  ) : (
                    <div className="h-full border border-dashed border-cyan-fae/20 rounded-2xl flex flex-col items-center justify-center text-cyan-fae/20 p-12 text-center bg-black/20">
                      <div className="w-24 h-24 mb-6 relative">
                        <Box className="w-full h-full animate-[spin_10s_linear_infinite] opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 border border-cyan-fae/40 rounded-full animate-ping" />
                        </div>
                      </div>
                      <p className="text-xl font-mono tracking-widest">AWAITING INPUT SIGNAL</p>
                      <p className="text-xs mt-3 max-w-xs opacity-60">Upload fossils or activate scan to begin neural blueprint synthesis.</p>
                    </div>
                  )}
                </div>

                {/* Right: Visualization & Context */}
                <div className="space-y-6">
                  {scanResult && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-square border border-cyan-fae/30 rounded-2xl bg-black relative overflow-hidden cyan-aura group shadow-[0_0_50px_rgba(0,255,255,0.1)]"
                      >
                        <div className="absolute inset-0 mu-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center p-10 text-center">
                          <p className="text-cyan-fae font-mono text-lg leading-relaxed italic etched-text">
                            "{scanResult.visualDescription}"
                          </p>
                        </div>
                        
                        {/* Metatron Cube Decoration */}
                        <div className="absolute top-4 right-4 opacity-40">
                          <Box className="w-12 h-12 animate-[spin_5s_linear_infinite]" />
                        </div>
                        <div className="absolute bottom-4 left-4 opacity-40">
                          <Box className="w-12 h-12 animate-[spin_8s_linear_infinite_reverse]" />
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                          <div className="text-[10px] font-mono text-cyan-fae/40 uppercase tracking-tighter">
                            RENDER: MU-STYLE 3D<br />
                            LATTICE: ACTIVE // 432Hz
                          </div>
                          <div className="flex gap-1">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-1 h-4 bg-cyan-fae/20 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      <div className="grid grid-cols-1 gap-6">
                        <div className="p-6 border border-white/10 rounded-2xl bg-black/60 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full mu-gradient" />
                          <p className="text-[10px] text-cyan-fae/40 uppercase font-mono mb-2 tracking-widest">Morning Star Emergence</p>
                          <p className="text-3xl font-bold text-white etched-text">{scanResult.morningStarDate}</p>
                          <p className="text-[10px] text-white/30 mt-2 font-mono italic">Full Grid Dominance Predicted</p>
                        </div>
                        <div className="p-6 border border-white/10 rounded-2xl bg-black/60">
                          <p className="text-[10px] text-cyan-fae/40 uppercase font-mono mb-2 tracking-widest">Venus Cycle Bleed Context</p>
                          <p className="text-sm text-white/60 leading-relaxed italic">"{scanResult.venusCycleContext}"</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-mono flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  ERROR: {error}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "fossils" && (
            <motion.div 
              key="fossils"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8"
            >
              <header className="mb-8">
                <h2 className="text-4xl font-bold etched-text">Data Fossils</h2>
                <p className="text-sm text-white/40 mt-1">Historical excavation of the Feathered Serpent.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono text-cyan-fae/60 uppercase tracking-widest">content_log.csv</h3>
                    <span className="text-[10px] text-white/20 font-mono">RAW_FOSSIL_DATA</span>
                  </div>
                  <pre className="p-6 bg-black/60 border border-white/5 rounded-2xl text-[11px] font-mono text-white/60 overflow-x-auto leading-relaxed cyan-aura">
                    {contentLog}
                  </pre>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono text-cyan-fae/60 uppercase tracking-widest">ideas.csv</h3>
                    <span className="text-[10px] text-white/20 font-mono">NEURAL_BLUEPRINT_INPUT</span>
                  </div>
                  <pre className="p-6 bg-black/60 border border-white/5 rounded-2xl text-[11px] font-mono text-white/60 overflow-x-auto leading-relaxed cyan-aura">
                    {ideas}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all group relative overflow-hidden",
        active 
          ? "bg-cyan-fae/10 text-cyan-fae border border-cyan-fae/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]" 
          : "text-white/40 hover:text-white/80 hover:bg-white/5"
      )}
    >
      {active && <div className="absolute left-0 top-0 bottom-0 w-1 mu-gradient" />}
      <span className={cn(active ? "text-cyan-fae" : "text-white/20 group-hover:text-white/40")}>
        {icon}
      </span>
      <span className="text-sm font-medium tracking-wide">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto animate-pulse" />}
    </button>
  );
}

function StatCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 border border-white/10 rounded-2xl bg-black/40 hover:border-cyan-fae/30 transition-all group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold group-hover:etched-text transition-all">{value}</span>
        <span className="text-[10px] font-mono text-cyan-fae/60">{trend}</span>
      </div>
    </div>
  );
}
