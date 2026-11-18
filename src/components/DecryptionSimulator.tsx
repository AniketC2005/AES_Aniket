import React, { useState } from 'react';
import { KeySize, CipherMode, DecryptionResult, BlockTrace } from '../types/aes';
import { decryptAES } from '../crypto/aesEngine';
import { formatHex } from '../crypto/utils';
import { 
  Unlock, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface DecryptionSimulatorProps {
  keySize: KeySize;
  setKeySize: (size: KeySize) => void;
  onSendToVisualizer: (trace: BlockTrace) => void;
}

export const DecryptionSimulator: React.FC<DecryptionSimulatorProps> = ({
  keySize,
  setKeySize,
  onSendToVisualizer,
}) => {
  const [format, setFormat] = useState<'hex' | 'base64'>('hex');
  const [ciphertextInput, setCiphertextInput] = useState<string>('');
  const [keyInput, setKeyInput] = useState<string>('2b7e151628aed2a6abf7158809cf4f3c');
  const [mode, setMode] = useState<CipherMode>('CBC');
  const [result, setResult] = useState<DecryptionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const getExpectedKeyChars = (size: KeySize) => (size === 128 ? 32 : size === 192 ? 48 : 64);

  const handleDecrypt = () => {
    setErrorMsg(null);
    try {
      if (!ciphertextInput.trim()) {
        throw new Error('Please enter ciphertext in Hexadecimal or Base64.');
      }

      const cleanKey = keyInput.replace(/\s+/g, '');
      const expectedChars = getExpectedKeyChars(keySize);
      if (cleanKey.length !== expectedChars) {
        throw new Error(`Key must be exactly ${expectedChars} hex characters for AES-${keySize}.`);
      }

      const cleanCipher = ciphertextInput.trim();
      const decResult = decryptAES(
        cleanCipher,
        cleanKey,
        keySize,
        mode,
        format === 'base64'
      );

      setResult(decResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Decryption failed.');
    }
  };

  const handleLoadNistSample = () => {
    setMode('ECB');
    if (keySize === 128) {
      setKeyInput('000102030405060708090a0b0c0d0e0f');
      setCiphertextInput('69c4e0d86a7b0430d8cdb78070b4c55a');
      setFormat('hex');
    } else if (keySize === 192) {
      setKeyInput('000102030405060708090a0b0c0d0e0f1011121314151617');
      setCiphertextInput('dda97ca4864cdfe06eaf70a0ec0d7191');
      setFormat('hex');
    } else {
      setKeyInput('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
      setCiphertextInput('8ea2b7ca516745bfeafc49904b496089');
      setFormat('hex');
    }
  };

  const copyText = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 border border-purple-800/60 font-semibold">
                DECRYPTION ENGINE
              </span>
              <h2 className="text-xl font-bold text-white">AES Interactive Decryption Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Reverse AES transformations using InvShiftRows, InvSubBytes, and InvMixColumns to recover the original plaintext.
            </p>
          </div>

          {/* Key Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Cipher Size:</span>
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
              {([128, 192, 256] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setKeySize(size)}
                  className={`text-xs font-mono px-3 py-1 rounded transition-all ${
                    keySize === size
                      ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size}-bit
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-5 space-y-4">
          {/* Format and Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Mode of Operation:</span>
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
                <button
                  onClick={() => setMode('CBC')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    mode === 'CBC'
                      ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  CBC (Standard IV + Blocks)
                </button>
                <button
                  onClick={() => setMode('ECB')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    mode === 'ECB'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ECB (Single Block / Raw)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Input Encoding:</span>
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
                <button
                  onClick={() => setFormat('hex')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    format === 'hex'
                      ? 'bg-slate-800 text-slate-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hexadecimal
                </button>
                <button
                  onClick={() => setFormat('base64')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    format === 'base64'
                      ? 'bg-slate-800 text-slate-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Base64
                </button>
              </div>
            </div>
          </div>

          {/* Ciphertext Input */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="text-slate-400 font-mono">
                Ciphertext ({format.toUpperCase()}):
              </label>
              <button
                onClick={handleLoadNistSample}
                className="text-purple-400 hover:text-purple-300 font-mono text-[11px] flex items-center gap-1"
              >
                Load NIST Known-Answer Vector
              </button>
            </div>
            <textarea
              rows={3}
              value={ciphertextInput}
              onChange={e => setCiphertextInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder={format === 'hex' ? 'Paste ciphertext hex string...' : 'Paste ciphertext base64 string...'}
            />
          </div>

          {/* Key Input */}
          <div>
            <label className="text-slate-400 block mb-1 text-xs font-mono">
              AES-{keySize} Decryption Key ({getExpectedKeyChars(keySize)} hex characters):
            </label>
            <input
              type="text"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder={`${getExpectedKeyChars(keySize)} hex characters`}
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-950/50 border border-rose-800/80 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-300 font-mono">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleDecrypt}
              className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>Decrypt Ciphertext</span>
            </button>
            <button
              onClick={() => {
                setCiphertextInput('');
                setResult(null);
                setErrorMsg(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Decryption Result */}
      {result && (
        <div className="bg-[#0b101c] border border-purple-900/40 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg border ${
                result.unpaddedSuccessfully
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}>
                {result.unpaddedSuccessfully ? <CheckCircle className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Decryption Outcome</h3>
                <span className="text-xs text-slate-400 font-mono">
                  {result.unpaddedSuccessfully ? 'PKCS#7 Padding Successfully Verified & Stripped' : 'Note: Raw / Unpadded Block Decrypted'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSendToVisualizer(result.detailedTrace)}
              className="bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-center"
            >
              <span>Inspect in Inverse Round Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Recovered Plaintext Text */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Recovered Plaintext (UTF-8 String):</span>
              <button
                onClick={() => copyText(result.recoveredText)}
                className="flex items-center gap-1 text-purple-400 hover:text-purple-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-sm text-emerald-300 break-all select-all font-semibold">
              {result.recoveredText}
            </div>
          </div>

          {/* Recovered Hex */}
          <div className="space-y-1.5">
            <span className="text-xs font-mono text-slate-400 block">Recovered Plaintext (Hex Bytes):</span>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 break-all select-all">
              {formatHex(result.recoveredHex, 2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
