import React, { useState, useMemo } from 'react';
import { KeySize, KeyExpansionWord } from '../types/aes';
import { expandKey } from '../crypto/keyExpansion';
import { hexToBytes, bytesToHex, formatHex, generateRandomHex } from '../crypto/utils';
import { StateMatrixView } from './StateMatrixView';
import { 
  RotateCw, 
  Sparkles, 
  Binary, 
  HelpCircle, 
  Copy, 
  Check 
} from 'lucide-react';

interface KeyExpansionViewProps {
  keySize: KeySize;
  setKeySize: (size: KeySize) => void;
}

export const KeyExpansionView: React.FC<KeyExpansionViewProps> = ({
  keySize,
  setKeySize,
}) => {
  const defaultKeyForSize: Record<KeySize, string> = {
    128: '2b7e151628aed2a6abf7158809cf4f3c',
    192: '8e73b0f7da0e6452c810f32b809079e562f8ead2522c6b7b',
    256: '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4',
  };

  const [keyInput, setKeyInput] = useState<string>(defaultKeyForSize[keySize]);
  const [selectedWord, setSelectedWord] = useState<KeyExpansionWord | null>(null);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'words' | 'matrices'>('words');

  // Handle key size change
  const handleKeySizeChange = (size: KeySize) => {
    setKeySize(size);
    setKeyInput(defaultKeyForSize[size]);
  };

  // Generate random key
  const handleGenerateRandom = () => {
    const bytesCount = keySize === 128 ? 16 : keySize === 192 ? 24 : 32;
    const randomHex = generateRandomHex(bytesCount);
    setKeyInput(randomHex);
  };

  // Compute key expansion
  const expansionResult = useMemo(() => {
    try {
      const clean = keyInput.replace(/\s+/g, '');
      const bytes = hexToBytes(clean);
      return expandKey(bytes, keySize);
    } catch {
      return null;
    }
  }, [keyInput, keySize]);

  const copyHex = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyIndex(idx);
    setTimeout(() => setCopiedKeyIndex(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 font-semibold">
                KEY SCHEDULE
              </span>
              <h2 className="text-xl font-bold text-white">AES Key Expansion Explorer</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Analyze how the original cipher key expands into {keySize === 128 ? '11' : keySize === 192 ? '13' : '15'} distinct 128-bit Round Keys using RotWord, SubWord, and Rcon.
            </p>
          </div>

          {/* Key Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Cipher Size:</span>
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
              {([128, 192, 256] as const).map(size => (
                <button
                  key={size}
                  onClick={() => handleKeySizeChange(size)}
                  className={`text-xs font-mono px-3 py-1 rounded transition-all ${
                    keySize === size
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AES-{size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Input Section */}
        <div className="mt-4 flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <label className="text-xs text-slate-400 font-mono block mb-1">
              Cipher Key ({keySize} bits / {keySize / 8} bytes / {keySize / 4} hex characters):
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-lg px-3 py-2 font-mono text-xs text-cyan-300 focus:outline-none focus:border-amber-500"
              placeholder="Enter hexadecimal key"
            />
          </div>
          <div className="flex items-center gap-2 self-end w-full md:w-auto">
            <button
              onClick={handleGenerateRandom}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Random Key</span>
            </button>
            <button
              onClick={() => setKeyInput(defaultKeyForSize[keySize])}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Standard NIST Key</span>
            </button>
          </div>
        </div>

        {/* Key Expansion Parameters Pill Grid */}
        {expansionResult && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800/60 text-xs font-mono">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Key Words (Nk):</span>
              <span className="text-amber-300 font-bold">{keySize / 32} words</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Rounds (Nr):</span>
              <span className="text-cyan-300 font-bold">{keySize === 128 ? 10 : keySize === 192 ? 12 : 14} rounds</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Total Words Generated:</span>
              <span className="text-purple-300 font-bold">{expansionResult.words.length} words</span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Round Keys (Nr + 1):</span>
              <span className="text-emerald-300 font-bold">{expansionResult.roundKeys.length} matrices</span>
            </div>
          </div>
        )}
      </div>

      {/* View Switcher: Word List vs Round Key 4x4 Matrices */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('words')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'words'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Word Schedule Breakdown (w[0] .. w[{expansionResult ? expansionResult.words.length - 1 : 43}])
          </button>
          <button
            onClick={() => setActiveTab('matrices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'matrices'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Round Key 4×4 Matrices ({expansionResult?.roundKeys.length || 0})
          </button>
        </div>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Click any word to inspect mathematical derivations
        </span>
      </div>

      {/* Words Table Tab */}
      {activeTab === 'words' && expansionResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Table: Words List */}
          <div className="lg:col-span-2 bg-[#0b101c] border border-slate-800 rounded-2xl p-4 shadow-lg overflow-hidden">
            <div className="overflow-x-auto max-h-[560px] scrollbar-thin">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Word</th>
                    <th className="py-2.5 px-3">Hex Value</th>
                    <th className="py-2.5 px-3">Generation Type</th>
                    <th className="py-2.5 px-3 text-right">Round</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expansionResult.words.map((w, idx) => {
                    const roundNum = Math.floor(idx / 4);
                    const isSelected = selectedWord?.index === w.index;
                    const nk = keySize / 32;
                    const isDirectKey = idx < nk;

                    return (
                      <tr
                        key={idx}
                        onClick={() => setSelectedWord(w)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-500/20 text-white'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <td className="py-2 px-3 font-bold text-amber-300">
                          w[{w.index}]
                        </td>
                        <td className="py-2 px-3 font-mono text-cyan-300">
                          {formatHex(w.hex, 2)}
                        </td>
                        <td className="py-2 px-3">
                          {isDirectKey ? (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              Key Word {idx}
                            </span>
                          ) : w.isRconStep ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/60 text-[10px]">
                              RotWord + SubWord + Rcon[{w.rconIndex}]
                            </span>
                          ) : w.isSubWordOnlyStep ? (
                            <span className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60 text-[10px]">
                              SubWord(w[i-1]) (AES-256)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50 text-[10px]">
                              w[i - {nk}] ⊕ w[i - 1]
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400">
                          R{roundNum} (col {idx % 4})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel: Word Inspector */}
          <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
            <h3 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
              <Binary className="w-4 h-4 text-amber-400" />
              Word Mathematical Inspector
            </h3>

            {selectedWord ? (
              <div className="space-y-4 text-xs font-mono">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>Target Word:</span>
                    <span className="text-amber-300 font-bold text-sm">w[{selectedWord.index}]</span>
                  </div>
                  <div className="text-cyan-300 text-sm font-bold">
                    0x{selectedWord.hex.toUpperCase()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Bytes: [{selectedWord.bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}]
                  </div>
                </div>

                {/* Operation steps if generated */}
                {selectedWord.index >= keySize / 32 ? (
                  <div className="space-y-3">
                    {selectedWord.isRconStep && (
                      <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-amber-300 uppercase font-bold block">
                          Non-Linear Transformation (i mod Nk = 0):
                        </span>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Input w[{selectedWord.index - 1}]:</span>
                          <span className="text-slate-200">{formatHex(bytesToHex(selectedWord.tempBefore || []), 2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">1. RotWord (left cycle 1 byte):</span>
                          <span className="text-blue-300">{formatHex(bytesToHex(selectedWord.rotWord || []), 2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">2. SubWord (S-box byte substitution):</span>
                          <span className="text-purple-300">{formatHex(bytesToHex(selectedWord.subWord || []), 2)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">3. XOR with Rcon[{selectedWord.rconIndex}]:</span>
                          <span className="text-emerald-300">{formatHex(bytesToHex(selectedWord.rcon || []), 2)}</span>
                        </div>
                      </div>
                    )}

                    {selectedWord.isSubWordOnlyStep && (
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-purple-300 uppercase font-bold block mb-1">
                          AES-256 Rule (i mod 8 = 4):
                        </span>
                        <div className="text-slate-400 text-[11px]">
                          SubWord(w[{selectedWord.index - 1}]):
                          <div className="text-purple-300 font-bold mt-0.5">
                            {formatHex(bytesToHex(selectedWord.subWord || []), 2)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Final XOR Step */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] text-cyan-300 uppercase font-bold block">
                        Final Bitwise XOR:
                      </span>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>w[{selectedWord.xorSource1?.index}]:</span>
                        <span className="font-bold">{formatHex(bytesToHex(selectedWord.xorSource1?.bytes || []), 2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>⊕ {selectedWord.xorSource2?.label}:</span>
                        <span className="font-bold">{formatHex(bytesToHex(selectedWord.xorSource2?.bytes || []), 2)}</span>
                      </div>
                      <div className="border-t border-slate-700 pt-1 flex items-center justify-between text-amber-300 font-bold">
                        <span>= w[{selectedWord.index}]:</span>
                        <span>{formatHex(selectedWord.hex, 2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-slate-400">
                    <p className="text-xs">
                      This word is taken directly from the initial cipher key at byte offset {selectedWord.index * 4} to {selectedWord.index * 4 + 3}.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                <HelpCircle className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Select any word from the schedule table to view its step-by-step mathematical derivation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Round Key Matrices Tab */}
      {activeTab === 'matrices' && expansionResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expansionResult.roundKeys.map((rk, idx) => {
            const rkHex = bytesToHex(rk.flat());
            const isCopied = copiedKeyIndex === idx;

            return (
              <div key={idx} className="bg-[#0b101c] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                      Round Key {idx} {idx === 0 ? '(Initial)' : idx === expansionResult.roundKeys.length - 1 ? '(Final)' : ''}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Words w[{idx * 4}] .. w[{idx * 4 + 3}]
                    </span>
                  </div>
                  <button
                    onClick={() => copyHex(rkHex, idx)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    title="Copy 16-byte Round Key Hex"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="max-w-[220px] mx-auto">
                  <StateMatrixView
                    matrix={rk}
                    highlightColor="amber"
                    compact={true}
                  />
                </div>

                <div className="bg-slate-950 p-2 rounded-lg border border-slate-900 text-[10px] font-mono text-slate-400 break-all select-all">
                  {formatHex(rkHex, 4)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
