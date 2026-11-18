import React, { useState } from 'react';
import { KeySize, CipherMode, EncryptionResult, BlockTrace } from '../types/aes';
import { encryptAES } from '../crypto/aesEngine';
import { hexToBytes, stringToBytes, formatHex, generateRandomHex } from '../crypto/utils';
import { 
  Lock, 
  RotateCw, 
  Sparkles, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface EncryptionSimulatorProps {
  keySize: KeySize;
  setKeySize: (size: KeySize) => void;
  onSendToVisualizer: (trace: BlockTrace) => void;
}

export const EncryptionSimulator: React.FC<EncryptionSimulatorProps> = ({
  keySize,
  setKeySize,
  onSendToVisualizer,
}) => {
  const [inputFormat, setInputFormat] = useState<'text' | 'hex'>('text');
  const [plaintextInput, setPlaintextInput] = useState<string>('Hello AES! Cryptography in action.');
  const [keyInput, setKeyInput] = useState<string>('2b7e151628aed2a6abf7158809cf4f3c');
  const [mode, setMode] = useState<CipherMode>('CBC');
  const [customIvHex, setCustomIvHex] = useState<string>('');
  const [result, setResult] = useState<EncryptionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const getExpectedKeyChars = (size: KeySize) => (size === 128 ? 32 : size === 192 ? 48 : 64);

  const handleGenerateRandomKey = () => {
    const bytesCount = keySize === 128 ? 16 : keySize === 192 ? 24 : 32;
    const randomKey = generateRandomHex(bytesCount);
    setKeyInput(randomKey);
  };

  const handleLoadSample = () => {
    if (keySize === 128) {
      setKeyInput('000102030405060708090a0b0c0d0e0f');
      setInputFormat('hex');
      setPlaintextInput('00112233445566778899aabbccddeeff');
    } else if (keySize === 192) {
      setKeyInput('000102030405060708090a0b0c0d0e0f1011121314151617');
      setInputFormat('hex');
      setPlaintextInput('00112233445566778899aabbccddeeff');
    } else {
      setKeyInput('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
      setInputFormat('hex');
      setPlaintextInput('00112233445566778899aabbccddeeff');
    }
  };

  const handleClear = () => {
    setPlaintextInput('');
    setResult(null);
    setErrorMsg(null);
  };

  const handleEncrypt = () => {
    setErrorMsg(null);
    try {
      if (!plaintextInput.trim()) {
        throw new Error('Please enter a plaintext message or hex bytes to encrypt.');
      }

      const cleanKey = keyInput.replace(/\s+/g, '');
      const expectedChars = getExpectedKeyChars(keySize);
      if (cleanKey.length !== expectedChars) {
        throw new Error(`Key must be exactly ${expectedChars} hex characters (${expectedChars / 2} bytes) for AES-${keySize}.`);
      }

      let ptBytes: number[];
      if (inputFormat === 'hex') {
        const cleanPt = plaintextInput.replace(/\s+/g, '');
        if (cleanPt.length % 2 !== 0) {
          throw new Error('Plaintext hexadecimal string must have an even number of characters.');
        }
        ptBytes = hexToBytes(cleanPt);
      } else {
        ptBytes = stringToBytes(plaintextInput);
      }

      const encResult = encryptAES(
        ptBytes,
        cleanKey,
        keySize,
        mode,
        customIvHex.trim() ? customIvHex.trim() : undefined
      );

      setResult(encResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Encryption failed.');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60 font-semibold">
                ENCRYPTION ENGINE
              </span>
              <h2 className="text-xl font-bold text-white">AES Interactive Encryption Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Encrypt plaintext with AES-128, AES-192, or AES-256 using PKCS#7 padding and standard cipher modes.
            </p>
          </div>

          {/* Key Size Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Key Size:</span>
            <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
              {([128, 192, 256] as const).map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setKeySize(size);
                    if (keyInput.length !== getExpectedKeyChars(size)) {
                      handleGenerateRandomKey();
                    }
                  }}
                  className={`text-xs font-mono px-3 py-1 rounded transition-all ${
                    keySize === size
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size}-bit
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="mt-5 space-y-4">
          {/* Mode & Format Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Mode of Operation:</span>
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
                <button
                  onClick={() => setMode('CBC')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    mode === 'CBC'
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Cipher Block Chaining with unique 16-byte IV"
                >
                  CBC (Standard Multi-Block)
                </button>
                <button
                  onClick={() => setMode('ECB')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    mode === 'ECB'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Electronic Codebook (Educational Single-Block demonstration only)"
                >
                  ECB (Educational Single-Block)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-mono">Plaintext Format:</span>
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex items-center">
                <button
                  onClick={() => setInputFormat('text')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    inputFormat === 'text'
                      ? 'bg-slate-800 text-slate-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  UTF-8 Text
                </button>
                <button
                  onClick={() => setInputFormat('hex')}
                  className={`px-3 py-1 rounded-md font-medium transition-all ${
                    inputFormat === 'hex'
                      ? 'bg-slate-800 text-slate-200 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Hex Bytes
                </button>
              </div>
            </div>
          </div>

          {/* ECB Warning Banner if selected */}
          {mode === 'ECB' && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Educational Notice (ECB Mode):</strong> Electronic Codebook mode encrypts identical plaintext blocks into identical ciphertext blocks, preserving structural patterns (e.g. the famous ECB penguin). It is provided strictly for educational inspection of independent block transformations. Use CBC or GCM for production cryptography.
              </div>
            </div>
          )}

          {/* Plaintext Input */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="text-slate-400 font-mono">
                Plaintext ({inputFormat === 'text' ? 'String' : 'Hexadecimal'}):
              </label>
              <button
                onClick={handleLoadSample}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Load NIST Known-Answer Sample
              </button>
            </div>
            <textarea
              rows={3}
              value={plaintextInput}
              onChange={e => setPlaintextInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
              placeholder={inputFormat === 'text' ? 'Enter secret message...' : 'e.g. 00112233445566778899aabbccddeeff'}
            />
          </div>

          {/* Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs">
              <label className="text-slate-400 font-mono">
                AES-{keySize} Key ({getExpectedKeyChars(keySize)} hex characters / {keySize / 8} bytes):
              </label>
              <button
                onClick={handleGenerateRandomKey}
                className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Generate Secure Random Key
              </button>
            </div>
            <input
              type="text"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 transition-colors"
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

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleEncrypt}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Encrypt Plaintext</span>
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Output Results Section */}
      {result && (
        <div className="bg-[#0b101c] border border-cyan-900/40 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Encryption Results</h3>
                <span className="text-xs text-slate-400 font-mono">
                  Mode: {result.mode} | Key: AES-{result.keySize} | Blocks: {result.blocks.length}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSendToVisualizer(result.detailedTrace)}
              className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-center"
            >
              <span>Inspect in Round Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* PKCS#7 Padding Info */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono">
            <div className="text-slate-400 mb-1 flex items-center justify-between">
              <span>PKCS#7 Padding Breakdown:</span>
              <span className="text-cyan-300 font-semibold">{result.paddingBytesCount} bytes added</span>
            </div>
            <div className="text-slate-300 break-all">
              Padded Bytes (16-byte block aligned): {formatHex(result.paddedHex, 4)}
            </div>
          </div>

          {/* Ciphertext (Hex) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Ciphertext (Hexadecimal):</span>
              <button
                onClick={() => copyToClipboard(result.ciphertextHex, 'hex')}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
              >
                {copiedType === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'hex' ? 'Copied' : 'Copy Hex'}</span>
              </button>
            </div>
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 break-all select-all">
              {formatHex(result.ciphertextHex, 2)}
            </div>
          </div>

          {/* Ciphertext (Base64) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Ciphertext (Base64 Encoded):</span>
              <button
                onClick={() => copyToClipboard(result.ciphertextBase64, 'base64')}
                className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300"
              >
                {copiedType === 'base64' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'base64' ? 'Copied' : 'Copy Base64'}</span>
              </button>
            </div>
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 font-mono text-xs text-slate-200 break-all select-all">
              {result.ciphertextBase64}
            </div>
          </div>

          {/* IV Display if CBC */}
          {result.ivHex && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs font-mono flex items-center justify-between">
              <span className="text-slate-400">Initialization Vector (IV - 16 bytes):</span>
              <span className="text-amber-300">{formatHex(result.ivHex, 2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
