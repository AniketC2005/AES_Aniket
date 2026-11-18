import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BlockTrace, KeySize } from '../types/aes';
import { StateMatrixView } from './StateMatrixView';
import { TransformationCard } from './TransformationCard';
import { encryptBlockWithTrace, decryptBlockWithTrace } from '../crypto/aesEngine';
import { hexToBytes, bytesToHex, formatHex } from '../crypto/utils';
import { NIST_VECTORS } from '../crypto/testVectors';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  FastForward,
  CheckCircle
} from 'lucide-react';

interface RoundVisualizerProps {
  keySize: KeySize;
  setKeySize: (size: KeySize) => void;
  externalTrace?: BlockTrace | null;
}

export const RoundVisualizer: React.FC<RoundVisualizerProps> = ({
  keySize,
  setKeySize,
  externalTrace,
}) => {
  // Current mode: encryption or decryption visualization
  const [isDecryption, setIsDecryption] = useState<boolean>(false);
  const [inputHex, setInputHex] = useState<string>('00112233445566778899aabbccddeeff');
  const [keyHex, setKeyHex] = useState<string>('000102030405060708090a0b0c0d0e0f');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [trace, setTrace] = useState<BlockTrace | null>(null);
  const timerRef = useRef<any>(null);

  // Compute trace on key, input, mode or keySize change
  const recomputeTrace = useCallback(() => {
    try {
      const cleanInput = inputHex.replace(/\s+/g, '');
      const cleanKey = keyHex.replace(/\s+/g, '');
      const inBytes = hexToBytes(cleanInput);
      const kBytes = hexToBytes(cleanKey);

      if (inBytes.length !== 16) return;

      let newTrace: BlockTrace;
      if (isDecryption) {
        newTrace = decryptBlockWithTrace(inBytes, kBytes, keySize);
      } else {
        newTrace = encryptBlockWithTrace(inBytes, kBytes, keySize);
      }
      setTrace(newTrace);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch {
      // Invalid input handled gracefully
    }
  }, [inputHex, keyHex, isDecryption, keySize]);

  // Load external trace if provided
  useEffect(() => {
    if (externalTrace) {
      setTrace(externalTrace);
      setIsDecryption(externalTrace.isDecryption);
      setKeySize(externalTrace.keySize);
      setInputHex(bytesToHex(externalTrace.inputBytes));
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } else {
      recomputeTrace();
    }
  }, [externalTrace, recomputeTrace, setKeySize]);

  // Load NIST official preset
  const loadNistPreset = (size: KeySize) => {
    setKeySize(size);
    const vec = NIST_VECTORS.find(v => v.keySize === size) || NIST_VECTORS[0];
    setInputHex(vec.plaintextHex);
    setKeyHex(vec.keyHex);
    setIsDecryption(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [trace, currentStepIndex]);

  // Play animation loop
  useEffect(() => {
    if (isPlaying && trace) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= trace.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, trace]);

  const currentStep = trace?.steps[currentStepIndex];

  const handleNext = () => {
    if (trace && currentStepIndex < trace.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  // Jump directly to a round
  const jumpToRound = (roundNum: number) => {
    if (!trace) return;
    const targetIdx = trace.steps.findIndex(s => s.round === roundNum);
    if (targetIdx !== -1) {
      setCurrentStepIndex(targetIdx);
      setIsPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-semibold">
                CORE LABORATORY
              </span>
              <h2 className="text-xl font-bold text-white">AES Round-by-Round Visualizer</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Step through every byte-level transformation of the 4×4 State Matrix for AES-{keySize} ({trace?.roundsCount || 10} rounds).
            </p>
          </div>

          {/* Mode & NIST Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
              <button
                onClick={() => { setIsDecryption(false); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !isDecryption
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Encryption
              </button>
              <button
                onClick={() => { setIsDecryption(true); }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  isDecryption
                    ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Decryption
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Presets:</span>
              {([128, 192, 256] as const).map(size => (
                <button
                  key={size}
                  onClick={() => loadNistPreset(size)}
                  className={`text-xs font-mono px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border transition-all ${
                    keySize === size
                      ? 'border-cyan-500/40 text-cyan-300 font-semibold'
                      : 'border-slate-800 text-slate-400'
                  }`}
                  title={`Load official NIST FIPS 197 AES-${size} Known-Answer Vector`}
                >
                  NIST-{size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Input Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">
              {isDecryption ? 'Ciphertext Block (16 Bytes / 32 Hex)' : 'Plaintext Block (16 Bytes / 32 Hex)'}:
            </label>
            <input
              type="text"
              value={inputHex}
              onChange={e => setInputHex(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="32 hexadecimal characters"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">
              AES Key ({keySize === 128 ? '16' : keySize === 192 ? '24' : '32'} Bytes / {keySize === 128 ? '32' : keySize === 192 ? '48' : '64'} Hex):
            </label>
            <input
              type="text"
              value={keyHex}
              onChange={e => setKeyHex(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder="Hexadecimal encryption key"
            />
          </div>
        </div>
      </div>

      {/* Playback Controls & Round Navigator */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation buttons */}
        <div className="flex items-center gap-1.5 w-full md:w-auto justify-center">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset to beginning (Round 0)"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-medium flex items-center gap-1"
            title="Previous step (Left Arrow)"
          >
            Previous
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
            }`}
            title="Play / Pause (Spacebar)"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
          </button>
          <button
            onClick={handleNext}
            disabled={!trace || currentStepIndex >= trace.steps.length - 1}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-medium flex items-center gap-1"
            title="Next step (Right Arrow)"
          >
            Next
          </button>
          <button
            onClick={() => {
              if (trace) setCurrentStepIndex(trace.steps.length - 1);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Jump to final output"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 text-[11px] flex items-center gap-1">
            <FastForward className="w-3.5 h-3.5 text-cyan-400" /> Speed:
          </span>
          {[
            { label: '0.5x', speed: 1800 },
            { label: '1x', speed: 1000 },
            { label: '1.5x', speed: 600 },
            { label: '2x', speed: 300 },
          ].map(opt => (
            <button
              key={opt.label}
              onClick={() => setPlaybackSpeed(opt.speed)}
              className={`px-2 py-1 rounded transition-colors ${
                playbackSpeed === opt.speed
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Round Jumper Bar */}
      {trace && (
        <div className="bg-[#0b101c] border border-slate-800/80 rounded-xl p-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 min-w-max">
            <span className="text-[11px] font-mono text-slate-400 mr-2">Jump to Round:</span>
            {Array.from({ length: trace.roundsCount + 1 }).map((_, r) => {
              const isCurrentRound = currentStep?.round === r;
              return (
                <button
                  key={r}
                  onClick={() => jumpToRound(r)}
                  className={`text-xs font-mono px-3 py-1 rounded-md transition-all ${
                    isCurrentRound
                      ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 font-bold shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {r === 0 ? 'Init (R0)' : r === trace.roundsCount ? `Final (R${r})` : `R${r}`}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Step Transformation Card */}
      {currentStep && (
        <TransformationCard
          step={currentStep}
          totalSteps={trace?.steps.length || 0}
        />
      )}

      {/* Matrices Comparison Grid */}
      {currentStep && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Matrix Before */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                State Before Transformation
              </span>
              <span>Hex: {formatHex(bytesToHex(currentStep.matrixBefore.flat()), 4)}</span>
            </div>
            <StateMatrixView
              matrix={currentStep.matrixBefore}
              title="State (Pre-Transformation)"
              subtitle="Input to this step"
              compact={false}
            />
          </div>

          {/* Matrix After */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                State After Transformation (Highlighted changes)
              </span>
              <span>Hex: {formatHex(bytesToHex(currentStep.matrixAfter.flat()), 4)}</span>
            </div>
            <StateMatrixView
              matrix={currentStep.matrixAfter}
              title="State (Post-Transformation)"
              subtitle="Resulting State Matrix"
              changedCells={currentStep.changedCells}
              highlightColor={isDecryption ? 'amber' : 'cyan'}
              compact={false}
            />
          </div>
        </div>
      )}

      {/* AddRoundKey Auxiliary Display: shows the Round Key Matrix if step is AddRoundKey */}
      {currentStep?.roundKey && (
        <div className="bg-[#0b101c] border border-amber-900/40 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider font-mono">
                Active Round Key Matrix (Round {currentStep.round})
              </h4>
            </div>
            <span className="text-[11px] font-mono text-amber-300">
              StateAfter = StateBefore ⊕ RoundKey
            </span>
          </div>
          <div className="max-w-xs mx-auto">
            <StateMatrixView
              matrix={currentStep.roundKey}
              highlightColor="amber"
              compact={true}
            />
          </div>
        </div>
      )}

      {/* Output Ciphertext / Plaintext Banner when reached end */}
      {trace && currentStepIndex === trace.steps.length - 1 && (
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-800/80 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  {isDecryption ? 'Decryption Completed Successfully' : 'Encryption Completed Successfully'}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Final Output ({trace.roundsCount} rounds of AES-{keySize}):
                </p>
              </div>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-4 py-2 font-mono text-sm text-cyan-300 break-all select-all">
              {bytesToHex(trace.outputBytes)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
