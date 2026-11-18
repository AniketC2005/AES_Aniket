import React from 'react';
import { 
  Shield, 
  GraduationCap, 
  BookOpen, 
  Code2
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">About AES LAB</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive Advanced Encryption Standard Educational Laboratory & Demonstration Suite.
            </p>
          </div>
        </div>
      </div>

      {/* College Practical Demonstration & Project Objectives */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 text-xs leading-relaxed text-slate-300">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Project Overview & Objectives
        </h3>
        <p>
          <strong>AES LAB</strong> is a professional-grade, interactive educational simulator developed to bridge the gap between theoretical cryptographic equations and real-world implementation. Designed specifically for university computer science classrooms, cybersecurity engineering labs, and technical presentations, it visualizes the complete inner workings of the Advanced Encryption Standard (AES) down to individual bytes and Galois Field operations.
        </p>
        <p>
          Rather than wrapping opaque black-box libraries, every single mathematical transformation—including GF(2<sup>8</sup>) field inversion, the affine S-box mapping, byte-level column multiplication, and key schedule expansion—is computed explicitly in clean, open, modular TypeScript.
        </p>
      </div>

      {/* Cryptographic Standards Compliance */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 text-xs text-slate-300">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Standards & Specifications Implemented
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-mono">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-cyan-300 font-bold block">NIST FIPS 197</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Advanced Encryption Standard (AES) formal specification defining the Rijndael algorithm parameters for 128, 192, and 256 bits.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-300 font-bold block">PKCS#7 (RFC 5652)</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Cryptographic Message Syntax standard for 16-byte block alignment padding and strict unpadding validation.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-purple-300 font-bold block">RFC 3602</span>
            <p className="text-[11px] text-slate-400 font-sans">
              The AES-CBC Cipher Algorithm with 16-byte Initialization Vector (IV) and block chaining mechanics.
            </p>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-emerald-300 font-bold block">NIST SP 800-38A</span>
            <p className="text-[11px] text-slate-400 font-sans">
              Recommendation for Block Cipher Modes of Operation (ECB, CBC, and security advisories).
            </p>
          </div>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4 text-xs text-slate-300">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          Technical Stack & Security Architecture
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Frontend Framework:</strong> React 19 with TypeScript for type-safe cryptographic modeling and state tracking.
          </li>
          <li>
            <strong>Styling:</strong> Tailwind CSS v4 configured with dark cybersecurity laboratory aesthetics and responsive design.
          </li>
          <li>
            <strong>Zero Backend Requirement:</strong> Runs 100% inside the user's web browser using native TypedArrays and Web Cryptography APIs for secure random key generation. No plaintext or keys ever leave the local machine.
          </li>
          <li>
            <strong>Automated Test Coverage:</strong> Full Vitest test suite running official NIST FIPS 197 known-answer test vectors.
          </li>
        </ul>
      </div>
    </div>
  );
};
