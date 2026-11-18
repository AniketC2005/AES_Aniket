import React from 'react';
import { NavTab } from './Navbar';
import { KeySize } from '../types/aes';
import { 
  Lock, 
  Layers, 
  KeyRound, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Cpu, 
  Sparkles
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: NavTab) => void;
  keySize: KeySize;
  setKeySize: (size: KeySize) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  keySize,
  setKeySize,
}) => {
  const cipherProfiles = [
    {
      size: 128 as KeySize,
      name: 'AES-128',
      rounds: 10,
      keyBits: 128,
      keyBytes: 16,
      words: 44,
      status: 'Standard Production',
      desc: 'Most widely used worldwide for internet traffic, HTTPS/TLS, and consumer storage.',
      accent: 'cyan',
    },
    {
      size: 192 as KeySize,
      name: 'AES-192',
      rounds: 12,
      keyBits: 192,
      keyBytes: 24,
      words: 52,
      status: 'High Security Margin',
      desc: 'Intermediate key length offering balanced performance with extended security margin.',
      accent: 'blue',
    },
    {
      size: 256 as KeySize,
      name: 'AES-256',
      rounds: 14,
      keyBits: 256,
      keyBytes: 32,
      words: 60,
      status: 'Top Secret / Quantum-Resistant',
      desc: 'Highest security level, mandated for Top Secret government intelligence and post-quantum resilience.',
      accent: 'purple',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0e1628] to-[#090d16] border border-slate-800/90 rounded-3xl p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NIST FIPS 197 Cryptography Laboratory</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            AES <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">LAB</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed font-normal">
            Interactive, mathematical simulator for the <strong>Advanced Encryption Standard (AES)</strong>. Explore internal 4×4 State Matrix transformations, Galois Field arithmetic in GF(2<sup>8</sup>), SubBytes, ShiftRows, MixColumns, and Key Expansion.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('visualization')}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 text-xs md:text-sm flex items-center gap-2 transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Round Visualizer</span>
            </button>
            <button
              onClick={() => setActiveTab('encryption')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium px-5 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Encryption Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium px-5 py-2.5 rounded-xl text-xs md:text-sm flex items-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Run NIST Verification Tests</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute right-40 bottom-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* AES Algorithm Workflow Diagram Card */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-base text-white">AES High-Level Block Pipeline (FIPS 197)</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Block Size: Fixed 128 Bits (16 Bytes)</span>
        </div>

        {/* Pipeline Steps Flowchart */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-center text-xs font-mono">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Input Block</span>
            <div className="font-bold text-slate-200 text-sm my-1">Plaintext</div>
            <span className="text-[10px] text-cyan-400">16 Bytes (4×4 State)</span>
          </div>

          <div className="bg-slate-950/80 border border-amber-900/40 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] text-amber-400 uppercase">Initial Round 0</span>
            <div className="font-bold text-amber-300 text-sm my-1">AddRoundKey</div>
            <span className="text-[10px] text-slate-400">XOR with Round Key 0</span>
          </div>

          <div className="bg-slate-950/80 border border-cyan-800/60 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] text-cyan-400 uppercase">Rounds 1 to {keySize === 128 ? 9 : keySize === 192 ? 11 : 13}</span>
            <div className="font-bold text-cyan-300 text-sm my-1">Standard Rounds</div>
            <span className="text-[10px] text-slate-300">SubBytes → ShiftRows → MixColumns → AddRoundKey</span>
          </div>

          <div className="bg-slate-950/80 border border-purple-900/40 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] text-purple-400 uppercase">Final Round {keySize === 128 ? 10 : keySize === 192 ? 12 : 14}</span>
            <div className="font-bold text-purple-300 text-sm my-1">Final Round</div>
            <span className="text-[10px] text-slate-400">SubBytes → ShiftRows → AddRoundKey (No MixColumns)</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 uppercase">Output Block</span>
            <div className="font-bold text-emerald-300 text-sm my-1">Ciphertext</div>
            <span className="text-[10px] text-emerald-400">128-bit Encrypted Block</span>
          </div>
        </div>
      </div>

      {/* AES Key Profiles Cards */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <span>AES Key Size Specifications</span>
          <span className="text-xs font-mono font-normal text-slate-400">(Click to switch active simulator cipher)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cipherProfiles.map(p => {
            const isSelected = keySize === p.size;
            return (
              <div
                key={p.size}
                onClick={() => setKeySize(p.size)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-[#0b101c] border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-bold text-white">{p.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      isSelected ? 'bg-cyan-950/70 text-cyan-300 border-cyan-800/80' : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Rounds:</span>
                      <strong className="text-slate-200">{p.rounds} Rounds</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Key Length:</span>
                      <strong className="text-slate-200">{p.keyBytes} Bytes ({p.keyBits}b)</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Expanded Words:</span>
                      <strong className="text-slate-200">{p.words} Words</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">State Matrix:</span>
                      <strong className="text-slate-200">4×4 Bytes</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium">
                  <span className={isSelected ? 'text-cyan-400 font-bold' : 'text-slate-400'}>
                    {isSelected ? '✓ Active Cipher Selected' : 'Select Cipher'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('visualization')}
          className="cursor-pointer bg-[#0b101c] hover:bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">Round-by-Round Visualizer</h4>
          <p className="text-xs text-slate-400">
            Step through SubBytes, ShiftRows, MixColumns, and AddRoundKey with before-and-after State matrices.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('key-expansion')}
          className="cursor-pointer bg-[#0b101c] hover:bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
            <KeyRound className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">Key Expansion Explorer</h4>
          <p className="text-xs text-slate-400">
            Inspect RotWord, SubWord, and round constant (Rcon) XOR arithmetic for every generated word w[i].
          </p>
        </div>

        <div
          onClick={() => setActiveTab('algorithm')}
          className="cursor-pointer bg-[#0b101c] hover:bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">AES Theory & Mathematics</h4>
          <p className="text-xs text-slate-400">
            Undergraduate CS reference on Galois Fields GF(2<sup>8</sup>), irreducible polynomials, and cipher modes.
          </p>
        </div>

        <div
          onClick={() => setActiveTab('tests')}
          className="cursor-pointer bg-[#0b101c] hover:bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-4 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-sm text-white mb-1">NIST Test Vector Verifier</h4>
          <p className="text-xs text-slate-400">
            Live in-browser validation against NIST FIPS 197 known-answer test vectors for 128, 192, and 256 bits.
          </p>
        </div>
      </div>
    </div>
  );
};
