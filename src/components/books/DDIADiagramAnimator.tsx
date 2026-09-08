import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database, 
  ArrowRight, 
  Cpu, 
  Layers, 
  RefreshCw, 
  Lock, 
  Eye, 
  ShieldCheck, 
  Flame, 
  TrendingUp,
  Sliders,
  Clock,
  Send,
  Sparkles
} from 'lucide-react';

interface DDIADiagramAnimatorProps {
  diagramId: string;
}

export const DDIADiagramAnimator: React.FC<DDIADiagramAnimatorProps> = ({ diagramId }) => {
  // Common animation state
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Diagram 1-3 Twitter Fanout states
  const [twitterApproach, setTwitterApproach] = useState<'write' | 'read' | 'hybrid'>('hybrid');
  const [tweetSender, setTweetSender] = useState<'normal' | 'celebrity'>('normal');
  const [followerCount, setFollowerCount] = useState(75);

  // Diagram 1-4 Percentiles states
  const [percentileThreshold, setPercentileThreshold] = useState<'p50' | 'p95' | 'p99' | 'p999'>('p99');
  const [simulatedCalls, setSimulatedCalls] = useState<number[]>([92, 76, 103, 143, 86, 487, 133]);

  // Diagram 3-1 & 3-4 SSTable / Compaction states
  const [compactionState, setCompactionState] = useState<number>(0);

  // Diagram 5-2 Sync vs Async Replication
  const [replicationType, setReplicationType] = useState<'sync' | 'async'>('async');
  const [replicaDelay, setReplicaDelay] = useState(false);

  // Diagram 5-11 Quorum Calculator states
  const [quorumN, setQuorumN] = useState(3);
  const [quorumW, setQuorumW] = useState(2);
  const [quorumR, setQuorumR] = useState(2);
  const [failedNodes, setFailedNodes] = useState<number[]>([]);

  // Diagram 7-8 Write Skew states
  const [doctorsOnCall, setDoctorsOnCall] = useState<{ Alice: boolean; Bob: boolean }>({ Alice: true, Bob: true });
  const [writeSkewAnomaly, setWriteSkewAnomaly] = useState(false);

  // Diagram 8-5 Fencing Tokens states
  const [fencingToken, setFencingToken] = useState(33);
  const [client1Token, setClient1Token] = useState(33);
  const [client2Token, setClient2Token] = useState(34);
  const [gcPaused, setGcPaused] = useState(false);
  const [fencingOutcome, setFencingOutcome] = useState<string>('');

  // Diagram 9-9 2PC states
  const [twoPCStep, setTwoPCStep] = useState(0);
  const [coordinatorCrashed, setCoordinatorCrashed] = useState(false);

  // Diagram 11-4 Dual writes vs CDC
  const [syncApproach, setSyncApproach] = useState<'dual_write' | 'cdc'>('cdc');
  const [dualWriteRaceTriggered, setDualWriteRaceTriggered] = useState(false);

  // Auto-play timer for active animated simulations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 4);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="my-6 rounded-3xl border border-teal-500/40 bg-slate-950/90 shadow-2xl overflow-hidden transition-all">
      {/* Interactive Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-teal-950/80 via-slate-900 to-indigo-950/80 border-b border-teal-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Interactive System Simulation</span>
              <span className="px-2 py-0.5 rounded-full bg-teal-900/60 text-teal-300 text-[10px] font-mono font-semibold border border-teal-500/30">
                Live Dynamic Diagram
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">Step-by-step visual animation demonstrating the exact architecture from the book text.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 text-white shadow-lg'
                : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isPlaying ? 'fill-white' : ''}`} />
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>
          <button
            onClick={() => {
              setActiveStep(0);
              setIsPlaying(false);
              setWriteSkewAnomaly(false);
              setDoctorsOnCall({ Alice: true, Bob: true });
              setCoordinatorCrashed(false);
              setTwoPCStep(0);
              setGcPaused(false);
              setFencingOutcome('');
            }}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RENDER DYNAMIC ANIMATION BASED ON DIAGRAM ID */}
      <div className="p-6">
        
        {/* ========================================================================= */}
        {/* FIGURE 1-1: COMPOSITE DATA SYSTEMS */}
        {/* ========================================================================= */}
        {diagramId === 'fig-1-1' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 1-1. Composite Data System Architecture</span>
              <button
                onClick={() => setActiveStep((prev) => (prev + 1) % 4)}
                className="px-3 py-1 rounded-lg bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-bold hover:bg-teal-600/50 cursor-pointer"
              >
                Step {activeStep + 1} / 4 →
              </button>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
              {/* Client Box */}
              <div className={`p-4 rounded-xl border transition-all ${
                activeStep === 0 ? 'bg-teal-600/20 border-teal-400 scale-105 shadow-xl' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <span>Client Request</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">GET /user/profile</div>
              </div>

              <ArrowRight className={`w-5 h-5 transition-colors ${activeStep >= 1 ? 'text-teal-400 animate-pulse' : 'text-slate-700'}`} />

              {/* App Code Server */}
              <div className={`p-4 rounded-xl border transition-all ${
                activeStep === 1 ? 'bg-indigo-600/20 border-indigo-400 scale-105 shadow-xl' : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-indigo-400" />
                  <span>Application Code</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Check Cache → Query DB</div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Cache */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeStep === 2 ? 'bg-amber-600/20 border-amber-400 scale-105 shadow-xl' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>In-Memory Cache (Redis)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Sub-millisecond speed</div>
                </div>

                {/* Primary DB */}
                <div className={`p-3 rounded-xl border transition-all ${
                  activeStep === 3 ? 'bg-emerald-600/20 border-emerald-400 scale-105 shadow-xl' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Primary Database (Postgres)</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Durable System of Record</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 p-3 rounded-xl bg-slate-900 border border-slate-800">
              <strong className="text-teal-400">Key Takeaway:</strong> A modern system design stitches together general-purpose building blocks into a specialized composite data system behind a clean API.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 1-3: TWITTER TIMELINE FAN-OUT ARCHITECTURE */}
        {/* ========================================================================= */}
        {diagramId === 'fig-1-3-twitter-fanout' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-xs font-mono text-teal-400 font-bold">Figure 1-3. Twitter Timeline Pipeline (Fan-Out on Write vs Read)</span>
                <p className="text-[11px] text-slate-400">Compare how writes propagate to follower timeline mailboxes.</p>
              </div>

              {/* Approach Selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setTwitterApproach('read')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    twitterApproach === 'read' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Approach 1: Fan-out on Read
                </button>
                <button
                  onClick={() => setTwitterApproach('write')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    twitterApproach === 'write' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Approach 2: Fan-out on Write
                </button>
                <button
                  onClick={() => setTwitterApproach('hybrid')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    twitterApproach === 'hybrid' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hybrid (Celebrities)
                </button>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Simulate Poster:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setTweetSender('normal');
                      setFollowerCount(75);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      tweetSender === 'normal'
                        ? 'bg-teal-600/30 border-teal-500 text-teal-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    Normal User (75 Followers)
                  </button>
                  <button
                    onClick={() => {
                      setTweetSender('celebrity');
                      setFollowerCount(30000000);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      tweetSender === 'celebrity'
                        ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    Celebrity (30,000,000 Followers)
                  </button>
                </div>
              </div>

              {/* Calculations Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                <div className="text-slate-400">Posting Workload:</div>
                <div className="text-teal-400 font-bold">
                  {twitterApproach === 'read' && '1 global DB write • 0 cache mailbox writes'}
                  {twitterApproach === 'write' && `${followerCount.toLocaleString()} home timeline cache writes!`}
                  {twitterApproach === 'hybrid' && (
                    tweetSender === 'celebrity'
                      ? '1 global DB write (0 cache writes, merged at read time)'
                      : `${followerCount} home timeline cache writes`
                  )}
                </div>
                <div className="text-[10px] text-slate-500">
                  {twitterApproach === 'read' && 'Read load: 300k QPS expensive multi-way SQL JOINs'}
                  {twitterApproach === 'write' && (tweetSender === 'celebrity' ? '⚠️ Overload! 30M writes within 5 seconds!' : 'Read load: Cheap single key cache lookup')}
                  {twitterApproach === 'hybrid' && 'Optimal: Normal users fan-out on write; celebrities fan-out on read!'}
                </div>
              </div>
            </div>

            {/* Visual Diagram */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-6">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center mx-auto mb-2">
                  <Send className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200">{tweetSender === 'celebrity' ? 'Lady Gaga (30M)' : 'User (75)'}</div>
                <div className="text-[10px] text-slate-500 font-mono">POST /tweet</div>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-teal-400 animate-pulse" />
                <span className="text-[10px] font-mono text-teal-300">
                  {twitterApproach === 'write' ? 'Fan-out to Mailboxes' : 'Global Tweet DB'}
                </span>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Timeline Cache 1: [T8, T7, T5, T4]</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Timeline Cache 2: [T8, T6, T5]</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 1-4 & 1-5: PERCENTILES & TAIL LATENCY AMPLIFICATION */}
        {/* ========================================================================= */}
        {diagramId === 'fig-1-4-percentiles' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 1-4 & 1-5. Response Time Percentiles & Tail Latency Amplification</span>
              <div className="flex gap-1.5">
                {(['p50', 'p95', 'p99', 'p999'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPercentileThreshold(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      percentileThreshold === p ? 'bg-teal-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Parallel Services Tail Latency Simulator */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>1 User Request invoking 7 Parallel Backend Microservices:</span>
                <button
                  onClick={() => {
                    const newCalls = [
                      Math.floor(70 + Math.random() * 40),
                      Math.floor(60 + Math.random() * 30),
                      Math.floor(80 + Math.random() * 50),
                      Math.floor(100 + Math.random() * 60),
                      Math.floor(60 + Math.random() * 40),
                      Math.floor(350 + Math.random() * 250), // outlier
                      Math.floor(90 + Math.random() * 60)
                    ];
                    setSimulatedCalls(newCalls);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 font-mono text-xs font-bold cursor-pointer"
                >
                  Randomize Latencies
                </button>
              </div>

              <div className="space-y-2">
                {simulatedCalls.map((ms, idx) => {
                  const isSlowest = ms === Math.max(...simulatedCalls);
                  return (
                    <div key={idx} className="flex items-center gap-3 text-xs font-mono">
                      <span className="w-20 text-slate-400">Backend {idx + 1}:</span>
                      <div className="flex-1 bg-slate-950 h-5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isSlowest ? 'bg-rose-500 animate-pulse' : 'bg-teal-500'
                          }`}
                          style={{ width: `${Math.min(100, (ms / 600) * 100)}%` }}
                        />
                      </div>
                      <span className={`w-16 text-right font-bold ${isSlowest ? 'text-rose-400' : 'text-slate-300'}`}>
                        {ms} ms
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total End-User Response Time:</span>
                <span className="text-rose-400 font-bold text-sm">
                  {Math.max(...simulatedCalls)} ms (Slowest backend dictates response!)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 3-4: SSTABLE & LSM-TREE COMPACTION */}
        {/* ========================================================================= */}
        {diagramId === 'fig-3-4-sstable-compaction' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 3-4. SSTable Compaction & Merging Process</span>
              <button
                onClick={() => setCompactionState((prev) => (prev + 1) % 3)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer transition-all shadow"
              >
                {compactionState === 0 ? 'Run Compaction & Merge →' : compactionState === 1 ? 'Discard Old Duplicates →' : 'Reset'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Segment 1 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 font-mono">Segment 1 (Oldest)</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="p-1.5 rounded bg-slate-950 text-slate-400">handbag: 8786</div>
                  <div className="p-1.5 rounded bg-slate-950 text-slate-400">handful: 40308</div>
                  <div className="p-1.5 rounded bg-slate-950 text-slate-400">handicap: 65995</div>
                </div>
              </div>

              {/* Segment 2 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 font-mono">Segment 2 (Newer)</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="p-1.5 rounded bg-slate-950 text-slate-400">handcuffs: 2729</div>
                  <div className="p-1.5 rounded bg-slate-950 text-teal-400 font-bold">handful: 42307 (Update)</div>
                  <div className="p-1.5 rounded bg-slate-950 text-slate-400">handiwork: 16912</div>
                </div>
              </div>

              {/* Segment 3 */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300 font-mono">Segment 3 (Latest)</div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="p-1.5 rounded bg-slate-950 text-emerald-400 font-bold">handful: 44662 (Latest)</div>
                  <div className="p-1.5 rounded bg-slate-950 text-emerald-400 font-bold">handicap: 70836 (Latest)</div>
                  <div className="p-1.5 rounded bg-slate-950 text-slate-400">handoff: 5741</div>
                </div>
              </div>
            </div>

            {/* Merged Segment Output */}
            {compactionState >= 1 && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-500/40 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-xs font-bold text-teal-300">
                  <span>Merged Compacted SSTable File (Sorted by Key, No Duplicates):</span>
                  <span className="font-mono text-emerald-400">O(N) Mergesort Streamed</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800">handbag: 8786</div>
                  <div className="p-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800">handcuffs: 2729</div>
                  <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 font-bold border border-emerald-500/30">handful: 44662</div>
                  <div className="p-2 rounded-lg bg-slate-950 text-emerald-400 font-bold border border-emerald-500/30">handicap: 70836</div>
                  <div className="p-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800">handiwork: 45521</div>
                  <div className="p-2 rounded-lg bg-slate-950 text-slate-200 border border-slate-800">handoff: 5741</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 5-11: QUORUM CALCULATOR & REPLICATION SIMULATOR */}
        {/* ========================================================================= */}
        {diagramId === 'fig-5-11-quorum-calculator' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 5-11. Leaderless Quorums (w + r &gt; n)</span>
              <div className="text-xs font-bold">
                {quorumW + quorumR > quorumN ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300">
                    ✓ Strong Consistency: w + r ({quorumW + quorumR}) &gt; n ({quorumN})
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-600 text-rose-300">
                    ⚠ Sloppy / Stale Read Risk: w + r ({quorumW + quorumR}) ≤ n ({quorumN})
                  </span>
                )}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">Replicas n = {quorumN}</label>
                <input
                  type="range"
                  min="3"
                  max="7"
                  step="2"
                  value={quorumN}
                  onChange={(e) => setQuorumN(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">Write Quorum w = {quorumW}</label>
                <input
                  type="range"
                  min="1"
                  max={quorumN}
                  value={quorumW}
                  onChange={(e) => setQuorumW(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-mono">Read Quorum r = {quorumR}</label>
                <input
                  type="range"
                  min="1"
                  max={quorumN}
                  value={quorumR}
                  onChange={(e) => setQuorumR(Number(e.target.value))}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Replicas Nodes Display */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-4">
              {Array.from({ length: quorumN }).map((_, idx) => {
                const nodeNum = idx + 1;
                const isFailed = failedNodes.includes(nodeNum);
                return (
                  <div
                    key={nodeNum}
                    onClick={() => {
                      if (isFailed) {
                        setFailedNodes(failedNodes.filter((x) => x !== nodeNum));
                      } else {
                        setFailedNodes([...failedNodes, nodeNum]);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                      isFailed
                        ? 'bg-rose-950/40 border-rose-600/60 opacity-60'
                        : 'bg-slate-900 border-slate-700 hover:border-teal-400 shadow-lg'
                    }`}
                  >
                    <Database className={`w-8 h-8 mx-auto mb-1 ${isFailed ? 'text-rose-400' : 'text-teal-400'}`} />
                    <div className="text-xs font-bold text-slate-200">Replica {nodeNum}</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {isFailed ? 'CRASHED (Click to revive)' : 'Healthy'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
              Active Healthy Nodes: <strong className="text-slate-200">{quorumN - failedNodes.length}</strong>. 
              Writes require <strong className="text-teal-400">{quorumW}</strong> acks, Reads require <strong className="text-teal-400">{quorumR}</strong> acks.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 7-8: WRITE SKEW SIMULATOR */}
        {/* ========================================================================= */}
        {diagramId === 'fig-7-8-write-skew' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 7-8. Write Skew: The Two Doctors On-Call Conundrum</span>
              <div className="text-xs">
                {writeSkewAnomaly ? (
                  <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-600 text-rose-400 font-bold">
                    🚨 INVARIANT VIOLATED: 0 Doctors On Call!
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-400 font-bold">
                    Status: Hospital Safe
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alice Transaction */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Transaction A (Alice)</span>
                  <span className="text-[10px] font-mono text-teal-400">TxID = 42</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
                  <div>1. SELECT COUNT(*) WHERE on_call=true</div>
                  <div className="text-emerald-400">→ Returns: 2 doctors (Safe!)</div>
                  <div>2. UPDATE doctors SET on_call=false WHERE name=\'Alice\'</div>
                </div>
                <button
                  disabled={!doctorsOnCall.Alice}
                  onClick={() => {
                    setDoctorsOnCall((prev) => {
                      const next = { ...prev, Alice: false };
                      if (!next.Alice && !next.Bob) setWriteSkewAnomaly(true);
                      return next;
                    });
                  }}
                  className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold cursor-pointer transition-all"
                >
                  {doctorsOnCall.Alice ? 'Alice Requests Off-Call' : 'Alice Already Off-Call'}
                </button>
              </div>

              {/* Bob Transaction */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Transaction B (Bob)</span>
                  <span className="text-[10px] font-mono text-indigo-400">TxID = 43</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-1">
                  <div>1. SELECT COUNT(*) WHERE on_call=true</div>
                  <div className="text-emerald-400">→ Returns: 2 doctors (Safe!)</div>
                  <div>2. UPDATE doctors SET on_call=false WHERE name=\'Bob\'</div>
                </div>
                <button
                  disabled={!doctorsOnCall.Bob}
                  onClick={() => {
                    setDoctorsOnCall((prev) => {
                      const next = { ...prev, Bob: false };
                      if (!next.Alice && !next.Bob) setWriteSkewAnomaly(true);
                      return next;
                    });
                  }}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold cursor-pointer transition-all"
                >
                  {doctorsOnCall.Bob ? 'Bob Requests Off-Call' : 'Bob Already Off-Call'}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <strong className="text-amber-400">Why Snapshot Isolation fails:</strong> Both transactions read from a snapshot where 2 doctors are on call. Because Alice modifies Alice and Bob modifies Bob, there is no dirty write or row conflict, so both commit — leaving nobody on call! Solution requires <strong>Serializable Snapshot Isolation (SSI)</strong> or explicit row locking.
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 8-5: FENCING TOKENS SIMULATOR */}
        {/* ========================================================================= */}
        {diagramId === 'fig-8-5-fencing-tokens' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 8-5. Distributed Locks with Monotonic Fencing Tokens</span>
              <div className="text-xs font-mono text-slate-300">Lock Service Token: <strong className="text-teal-400">{fencingToken}</strong></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client 1 */}
              <div className={`p-4 rounded-2xl border transition-all ${
                gcPaused ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Client 1</span>
                  <span className="text-[10px] font-mono text-slate-400">Acquired Token {client1Token}</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setGcPaused(!gcPaused)}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                      gcPaused ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {gcPaused ? '⏸ Stop-the-World GC Pause (15s)' : 'Pause Thread (Simulate GC)'}
                  </button>
                  <button
                    onClick={() => {
                      if (client1Token < fencingToken) {
                        setFencingOutcome(`❌ REJECTED! Storage sees token ${client1Token} < current token ${fencingToken}`);
                      } else {
                        setFencingOutcome('✓ Written to storage successfully.');
                      }
                    }}
                    className="w-full py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Send Write with Token {client1Token}
                  </button>
                </div>
              </div>

              {/* Lock Service */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-teal-400" />
                  <span>Lock Service (ZooKeeper)</span>
                </div>
                <p className="text-[11px] text-slate-400">Lease expired while Client 1 paused. Client 2 requested lease and got incremented token.</p>
                <button
                  onClick={() => {
                    setFencingToken(34);
                  }}
                  className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                >
                  Grant Lease to Client 2 (Token 34)
                </button>
              </div>

              {/* Storage Service */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Shared Storage Service</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
                  Highest Processed Token: <strong className="text-emerald-400">{fencingToken}</strong>
                </div>
                {fencingOutcome && (
                  <div className="p-2 rounded-xl bg-slate-950 font-mono text-xs font-bold text-amber-300 animate-fadeIn">
                    {fencingOutcome}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 9-9 & 9-10: TWO-PHASE COMMIT (2PC) & CRASH SIMULATOR */}
        {/* ========================================================================= */}
        {diagramId === 'fig-9-9-two-phase-commit' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 9-9 & 9-10. Two-Phase Commit (2PC) State Machine</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (twoPCStep === 1) {
                      setCoordinatorCrashed(true);
                    } else {
                      setTwoPCStep((prev) => (prev + 1) % 3);
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold cursor-pointer"
                >
                  {twoPCStep === 0 ? 'Phase 1: Send Prepare →' : twoPCStep === 1 ? 'Phase 2: Send Commit →' : 'Reset Transaction'}
                </button>
                <button
                  onClick={() => setCoordinatorCrashed(!coordinatorCrashed)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer ${
                    coordinatorCrashed ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {coordinatorCrashed ? 'Coordinator Crashed!' : 'Crash Coordinator'}
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
              {/* Coordinator Node */}
              <div className={`p-4 rounded-xl border max-w-sm mx-auto text-center transition-all ${
                coordinatorCrashed ? 'bg-rose-950/60 border-rose-500 animate-pulse' : 'bg-slate-950 border-slate-800'
              }`}>
                <Server className={`w-6 h-6 mx-auto mb-1 ${coordinatorCrashed ? 'text-rose-400' : 'text-teal-400'}`} />
                <div className="text-xs font-bold text-slate-200">
                  {coordinatorCrashed ? 'Coordinator CRASHED (In-Doubt!)' : 'Coordinator (Transaction Manager)'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {twoPCStep === 0 && 'Idle / Initializing'}
                  {twoPCStep === 1 && 'Waiting for "YES" votes from all participants'}
                  {twoPCStep === 2 && 'Commit point written to WAL disk!'}
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <Database className="w-5 h-5 text-teal-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-200">Database 1</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {twoPCStep === 0 && 'Ready'}
                    {twoPCStep === 1 && 'Voted "YES" (Locks held!)'}
                    {twoPCStep === 2 && !coordinatorCrashed && 'COMMITTED ✓'}
                    {coordinatorCrashed && twoPCStep === 1 && 'STUCK IN-DOUBT 🔒'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
                  <Database className="w-5 h-5 text-teal-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-200">Database 2</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {twoPCStep === 0 && 'Ready'}
                    {twoPCStep === 1 && 'Voted "YES" (Locks held!)'}
                    {twoPCStep === 2 && !coordinatorCrashed && 'COMMITTED ✓'}
                    {coordinatorCrashed && twoPCStep === 1 && 'STUCK IN-DOUBT 🔒'}
                  </div>
                </div>
              </div>

              {coordinatorCrashed && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                  <strong>The 2PC Dilemma:</strong> Participants voted "YES" and surrendered their right to abort. Because the coordinator crashed before confirming, Database 1 & 2 cannot unilaterally abort OR commit. They must hold locks forever until the coordinator reboots!
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* FIGURE 11-4: DUAL WRITES RACE CONDITION VS CDC */}
        {/* ========================================================================= */}
        {diagramId === 'fig-11-4-dual-writes-vs-cdc' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-teal-400 font-bold">Figure 11-4 & 11-5. Dual Writes Race Condition vs Change Data Capture (CDC)</span>
              <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => {
                    setSyncApproach('dual_write');
                    setDualWriteRaceTriggered(true);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    syncApproach === 'dual_write' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dual Writes (Race Prone)
                </button>
                <button
                  onClick={() => {
                    setSyncApproach('cdc');
                    setDualWriteRaceTriggered(false);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    syncApproach === 'cdc' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Change Data Capture (Ordered Log)
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
              {syncApproach === 'dual_write' ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300">
                    <strong>Race Condition:</strong> Client 1 sets X = A, Client 2 sets X = B. The database sees Client 1 first, then Client 2 (final DB = B). But network jitter makes the search index see Client 2 first, then Client 1 (final Index = A).
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center font-mono text-xs">
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <Database className="w-6 h-6 text-teal-400 mx-auto mb-1" />
                      <div className="text-slate-300 font-bold">Primary Database</div>
                      <div className="text-emerald-400 mt-2 font-bold text-sm">Value: X = B</div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                      <Eye className="w-6 h-6 text-indigo-400 mx-auto mb-1" />
                      <div className="text-slate-300 font-bold">Search Index (Elasticsearch)</div>
                      <div className="text-rose-400 mt-2 font-bold text-sm">Value: X = A (Out of sync!)</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                    <strong>CDC Solution:</strong> Only the primary database accepts writes. Changes are streamed in strict commit log order via Kafka/Debezium. The search index consumes the stream sequentially.
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                    <div className="text-teal-400 font-bold">PostgreSQL WAL</div>
                    <ArrowRight className="w-4 h-4 text-teal-400 animate-pulse" />
                    <div className="text-indigo-400 font-bold">Kafka Log [X=A, X=B]</div>
                    <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <div className="text-emerald-400 font-bold">Elasticsearch: X = B ✓</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
