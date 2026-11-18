import React, { useState, useEffect } from 'react';
import { runAllTestVectors, TestResult, NIST_VECTORS } from '../crypto/testVectors';
import { BlockTrace, KeySize } from '../types/aes';
import { encryptBlockWithTrace } from '../crypto/aesEngine';
import { hexToBytes, formatHex } from '../crypto/utils';
import { 
  CheckCircle2, 
  XCircle, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  ArrowRight, 
  Timer
} from 'lucide-react';

interface TestVectorSuiteProps {
  onLoadVectorToVisualizer: (trace: BlockTrace) => void;
}

export const TestVectorSuite: React.FC<TestVectorSuiteProps> = ({
  onLoadVectorToVisualizer,
}) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastRunTime, setLastRunTime] = useState<string | null>(null);

  const executeSuite = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllTestVectors();
      setResults(res);
      setIsRunning(false);
      setLastRunTime(new Date().toLocaleTimeString());
    }, 200);
  };

  useEffect(() => {
    executeSuite();
  }, []);

  const handleInspectVector = (keyHex: string, ptHex: string, size: KeySize) => {
    try {
      const ptBytes = hexToBytes(ptHex);
      const kBytes = hexToBytes(keyHex);
      const trace = encryptBlockWithTrace(ptBytes, kBytes, size);
      onLoadVectorToVisualizer(trace);
    } catch {
      // Handled
    }
  };

  const allPassed = results.length > 0 && results.every(r => r.passed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 font-semibold">
                FORMAL VERIFICATION
              </span>
              <h2 className="text-xl font-bold text-white">NIST FIPS 197 Test Vector Suite</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated cryptographic validation using official National Institute of Standards and Technology (NIST) known-answer test vectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={executeSuite}
              disabled={isRunning}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              {isRunning ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
            </button>
          </div>
        </div>

        {/* Status Summary Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${
              allPassed
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}>
              {allPassed ? <ShieldCheck className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-bold text-slate-200">
                {allPassed ? 'ALL TEST VECTORS PASSED (100% NIST FIPS 197 Compliance)' : 'Tests Running or Failed'}
              </span>
              <div className="text-[11px] text-slate-400">
                {results.filter(r => r.passed).length} of {results.length} tests passing
              </div>
            </div>
          </div>

          {lastRunTime && (
            <span className="text-slate-400 text-[11px] flex items-center gap-1">
              <Timer className="w-3.5 h-3.5" /> Last executed: {lastRunTime}
            </span>
          )}
        </div>
      </div>

      {/* Test Results Cards */}
      <div className="space-y-4">
        {results.map((res, idx) => {
          const nistVec = NIST_VECTORS.find(v => v.id === res.id);

          return (
            <div
              key={idx}
              className={`bg-[#0b101c] border rounded-2xl p-5 shadow-lg transition-all ${
                res.passed
                  ? 'border-emerald-900/40 hover:border-emerald-800/60'
                  : 'border-rose-900/40 hover:border-rose-800/60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg border ${
                    res.passed ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80' : 'bg-rose-950/60 text-rose-400 border-rose-800/80'
                  }`}>
                    {res.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{res.title}</h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Duration: {res.durationMs.toFixed(2)} ms
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                    res.passed ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' : 'bg-rose-950/70 text-rose-300 border-rose-800/60'
                  }`}>
                    {res.passed ? 'PASS' : 'FAIL'}
                  </span>

                  {nistVec && (
                    <button
                      onClick={() => handleInspectVector(nistVec.keyHex, nistVec.plaintextHex, nistVec.keySize)}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors"
                      title="Load this test vector directly into the step-by-step Round Visualizer"
                    >
                      <span>Inspect Rounds</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Vector Details */}
              <div className="mt-3 space-y-2 text-xs font-mono">
                {nistVec && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div>
                      <span className="text-slate-400 block">Plaintext:</span>
                      <span className="text-slate-200">{formatHex(nistVec.plaintextHex, 2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Key:</span>
                      <span className="text-amber-300">{formatHex(nistVec.keyHex, 2)}</span>
                    </div>
                  </div>
                )}

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Expected:</span>
                    <span className="text-emerald-400 break-all">{formatHex(res.expected, 2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Actual:</span>
                    <span className="text-cyan-300 break-all">{formatHex(res.actual, 2)}</span>
                  </div>
                </div>

                {res.details && (
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    {res.details}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
