import React, { useState } from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Globe,
  Binary
} from 'lucide-react';

export const AlgorithmExplanation: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string>('intro');

  const topics = [
    { id: 'intro', label: '1. What is AES & Cryptography?' },
    { id: 'structure', label: '2. Block Structure & State Matrix' },
    { id: 'transformations', label: '3. The Four Core Transformations' },
    { id: 'math', label: '4. Galois Field GF(2⁸) Mathematics' },
    { id: 'keyschedule', label: '5. Key Schedule & Expansion' },
    { id: 'decryption', label: '6. Decryption & Inverse Operations' },
    { id: 'modes', label: '7. Cipher Modes (ECB, CBC, GCM)' },
    { id: 'applications', label: '8. Real-World Applications' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AES Cryptography Reference & Theory</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive undergraduate Computer Science curriculum guide on the Advanced Encryption Standard (FIPS 197).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Topics */}
        <div className="lg:col-span-1 bg-[#0b101c] border border-slate-800 rounded-2xl p-3 shadow-md space-y-1 h-fit">
          <span className="text-[10px] font-mono uppercase text-slate-400 px-3 py-1 block">
            Theory Curriculum
          </span>
          {topics.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTopic(t.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTopic === t.id
                  ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-[#0b101c] border border-slate-800 rounded-2xl p-6 shadow-lg text-slate-300 text-sm leading-relaxed space-y-6">
          {activeTopic === 'intro' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                What is Cryptography and AES?
              </h3>
              <p>
                <strong>Cryptography</strong> is the mathematical science of securing digital communication and stored data against adversaries. It guarantees four fundamental security properties: <em>Confidentiality</em> (preventing unauthorized reading), <em>Integrity</em> (detecting tampering), <em>Authentication</em> (verifying sender identity), and <em>Non-repudiation</em>.
              </p>

              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider text-cyan-300">
                  Symmetric vs Asymmetric Cryptography
                </h4>
                <p className="text-xs text-slate-300">
                  In <strong>symmetric-key cryptography</strong>, the same secret key is used for both encryption and decryption. Both sender and receiver must securely agree on this key beforehand. Block ciphers like AES process fixed-length blocks of data at high speeds with low computational overhead.
                </p>
              </div>

              <h4 className="font-bold text-white text-sm pt-2">Why was AES Created?</h4>
              <p className="text-xs text-slate-300">
                In 1997, the U.S. National Institute of Standards and Technology (NIST) initiated a multi-year worldwide competition to replace the aging Data Encryption Standard (DES), whose 56-bit key had become vulnerable to brute-force attacks. In 2001, the <strong>Rijndael cipher</strong>, designed by Belgian cryptographers Joan Daemen and Vincent Rijmen, was selected and standardized as <strong>FIPS 197: Advanced Encryption Standard (AES)</strong>.
              </p>
            </div>
          )}

          {activeTopic === 'structure' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                AES Block Structure & The State Matrix
              </h3>
              <p className="text-xs text-slate-300">
                AES operates strictly on fixed-size blocks of <strong>128 bits (16 bytes)</strong>. Unlike DES, which used a Feistel network, AES is a <strong>Substitution-Permutation Network (SPN)</strong> that processes the entire 128-bit block in parallel in every round.
              </p>

              <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-xl space-y-3 font-mono text-xs">
                <span className="text-cyan-300 font-bold block">Column-Major State Matrix Ordering:</span>
                <p className="text-slate-300">
                  A 16-byte input sequence <code>in[0], in[1], ..., in[15]</code> is mapped into a 4×4 two-dimensional byte array called the <strong>State Matrix</strong>:
                </p>
                <div className="grid grid-cols-4 gap-2 text-center max-w-sm mx-auto bg-slate-950 p-3 rounded-lg border border-slate-800 text-cyan-300 font-bold">
                  <div>in[0]</div><div>in[4]</div><div>in[8]</div><div>in[12]</div>
                  <div>in[1]</div><div>in[5]</div><div>in[9]</div><div>in[13]</div>
                  <div>in[2]</div><div>in[6]</div><div>in[10]</div><div>in[14]</div>
                  <div>in[3]</div><div>in[7]</div><div>in[11]</div><div>in[15]</div>
                </div>
                <p className="text-[11px] text-slate-400">
                  Note: Column <code>c</code> contains bytes <code>in[4c]</code> through <code>in[4c + 3]</code>.
                </p>
              </div>

              <h4 className="font-bold text-white text-sm">Key Sizes & Rounds</h4>
              <ul className="list-disc pl-5 text-xs space-y-1.5 text-slate-300">
                <li><strong>AES-128:</strong> 128-bit key (16 bytes, Nk=4) → 10 rounds</li>
                <li><strong>AES-192:</strong> 192-bit key (24 bytes, Nk=6) → 12 rounds</li>
                <li><strong>AES-256:</strong> 256-bit key (32 bytes, Nk=8) → 14 rounds</li>
              </ul>
            </div>
          )}

          {activeTopic === 'transformations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                The Four Core AES Transformations
              </h3>
              <p className="text-xs text-slate-300">
                Each round of AES (except the final round) sequentially applies four distinct mathematical operations to achieve Shannon's principles of <strong>confusion</strong> and <strong>diffusion</strong>:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/60">
                  <strong className="text-purple-300 block text-sm mb-1">1. SubBytes (Non-linear Byte Substitution)</strong>
                  <p className="text-slate-300">
                    Provides <em>confusion</em>. Each byte in the state is replaced with an entry from an invertible 8-bit substitution table (the S-box). The S-box is constructed by taking the multiplicative inverse in GF(2<sup>8</sup>) followed by an affine transformation over GF(2), maximizing non-linearity and resisting linear and differential cryptanalysis.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/60">
                  <strong className="text-blue-300 block text-sm mb-1">2. ShiftRows (Cyclic Row Permutation)</strong>
                  <p className="text-slate-300">
                    Provides <em>diffusion</em> across columns. Row 0 is unchanged. Row 1 is cyclically shifted left by 1 byte, Row 2 by 2 bytes, and Row 3 by 3 bytes. This ensures that the 4 bytes of each column are spread across different columns in subsequent rounds.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-900/60">
                  <strong className="text-emerald-300 block text-sm mb-1">3. MixColumns (Column Diffusion in GF(2⁸))</strong>
                  <p className="text-slate-300">
                    Provides inter-byte diffusion within columns. Each column is multiplied by a fixed maximum-distance-separable (MDS) matrix over GF(2<sup>8</sup>). Changing a single input byte changes all 4 output bytes in that column (Avalanche Effect). <em>MixColumns is omitted in the final round</em>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/60">
                  <strong className="text-amber-300 block text-sm mb-1">4. AddRoundKey (Key Injection)</strong>
                  <p className="text-slate-300">
                    Injects secret key material into the state. Each byte of the State Matrix is bitwise XORed with the corresponding byte of the subkey derived from the Key Schedule.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'math' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Binary className="w-5 h-5 text-cyan-400" />
                Galois Field GF(2⁸) Arithmetic
              </h3>
              <p className="text-xs text-slate-300">
                AES performs its core algebraic operations within the finite field <strong>GF(2<sup>8</sup>)</strong>, also called a Galois Field with 256 elements. Each element corresponds to a byte represented as a degree-7 polynomial with binary coefficients:
              </p>
              <div className="bg-slate-900/80 p-3 rounded-xl font-mono text-cyan-300 text-xs">
                b = b₇x⁷ + b₆x⁶ + b₅x⁵ + b₄x⁴ + b₃x³ + b₂x² + b₁x + b₀
              </div>

              <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                Addition and Multiplication Rules:
              </h4>
              <ul className="list-disc pl-5 text-xs space-y-1.5 text-slate-300">
                <li>
                  <strong>Addition / Subtraction:</strong> Performed as bitwise XOR (<code>⊕</code>) without carry.
                </li>
                <li>
                  <strong>Multiplication:</strong> Polynomial multiplication modulo the irreducible reduction polynomial:
                  <div className="font-mono text-cyan-300 my-1">
                    m(x) = x⁸ + x⁴ + x³ + x + 1 (Hex: 0x11B)
                  </div>
                </li>
                <li>
                  <strong>xtime(b):</strong> Multiplying a byte by <code>x</code> (or <code>0x02</code>) is achieved by shifting left by 1 bit, and if the shifted high bit was 1, XORing with <code>0x1B</code>.
                </li>
              </ul>
            </div>
          )}

          {activeTopic === 'keyschedule' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                AES Key Expansion Algorithm
              </h3>
              <p className="text-xs text-slate-300">
                The initial cipher key (16, 24, or 32 bytes) is expanded into a linear array of 4-byte words <code>w[0] ... w[4*(Nr+1)-1]</code> using the Rijndael key schedule.
              </p>
              <div className="bg-slate-900/80 p-4 rounded-xl space-y-2 font-mono text-xs">
                <div className="text-amber-300 font-bold">Key Expansion Steps:</div>
                <p className="text-slate-300">1. First Nk words are copied directly from the cipher key.</p>
                <p className="text-slate-300">2. For subsequent words <code>w[i]</code>:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>If <code>i mod Nk == 0</code>: <code>temp = SubWord(RotWord(temp)) ⊕ Rcon[i/Nk]</code></li>
                  <li>If <code>Nk &gt; 6</code> and <code>i mod Nk == 4</code> (AES-256 only): <code>temp = SubWord(temp)</code></li>
                  <li><code>w[i] = w[i - Nk] ⊕ temp</code></li>
                </ul>
              </div>
            </div>
          )}

          {activeTopic === 'decryption' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Decryption & Inverse Transformations
              </h3>
              <p className="text-xs text-slate-300">
                Because AES is not a Feistel network, decryption requires inverse transformation functions:
              </p>
              <div className="space-y-2 text-xs">
                <p>• <strong>InvShiftRows:</strong> Cyclically shifts Row 1 right by 1, Row 2 right by 2, Row 3 right by 3 bytes.</p>
                <p>• <strong>InvSubBytes:</strong> Applies the Inverse S-box table (<code>InvSBox[SBox[x]] = x</code>).</p>
                <p>• <strong>InvMixColumns:</strong> Multiplies columns by the inverse MDS polynomial matrix in GF(2<sup>8</sup>).</p>
                <p>• <strong>AddRoundKey:</strong> Self-inverse because bitwise XOR is its own inverse (<code>A ⊕ K ⊕ K = A</code>).</p>
              </div>
            </div>
          )}

          {activeTopic === 'modes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Block Cipher Modes of Operation
              </h3>
              <p className="text-xs text-slate-300">
                Block ciphers encrypt one 128-bit block at a time. To encrypt arbitrary-length messages, a <em>mode of operation</em> is used:
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-950/25 border border-amber-800/60">
                  <strong className="text-amber-300 block mb-1">ECB (Electronic Codebook) - INSECURE for General Data</strong>
                  <p className="text-slate-300">
                    Each 16-byte block is encrypted independently. Identical plaintext blocks produce identical ciphertext blocks, leaking structural patterns. Included in AES LAB for single-block educational study only.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/25 border border-cyan-800/60">
                  <strong className="text-cyan-300 block mb-1">CBC (Cipher Block Chaining)</strong>
                  <p className="text-slate-300">
                    Each plaintext block is XORed with the previous ciphertext block before encryption, randomized by an Initialization Vector (IV). Hides plaintext patterns effectively.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/25 border border-emerald-800/60">
                  <strong className="text-emerald-300 block mb-1">GCM (Galois/Counter Mode) - Modern Industry Standard</strong>
                  <p className="text-slate-300">
                    An Authenticated Encryption with Associated Data (AEAD) mode combining Counter (CTR) mode with Galois authentication tag (GHASH), protecting both confidentiality and integrity simultaneously.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'applications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Real-World Applications of AES
              </h3>
              <p className="text-xs text-slate-300">
                AES is the most extensively deployed cryptographic algorithm on Earth:
              </p>
              <ul className="list-disc pl-5 text-xs space-y-2 text-slate-300">
                <li><strong>Web Traffic (HTTPS & TLS 1.3):</strong> Secures banking, e-commerce, and communications via AES-GCM cipher suites.</li>
                <li><strong>Full-Disk Encryption:</strong> Apple FileVault, Microsoft BitLocker, and Android FBE (File-Based Encryption) use AES-XTS.</li>
                <li><strong>Wireless Networks (WPA3 & WPA2):</strong> Protects Wi-Fi network frames using AES-CCMP / AES-GCMP.</li>
                <li><strong>Hardware Acceleration (Intel AES-NI & ARMv8 Crypto Extensions):</strong> Modern CPUs include dedicated silicon instructions executing AES rounds in single clock cycles.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
