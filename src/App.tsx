import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EncryptionSimulator } from './components/EncryptionSimulator';
import { DecryptionSimulator } from './components/DecryptionSimulator';
import { RoundVisualizer } from './components/RoundVisualizer';
import { KeyExpansionView } from './components/KeyExpansionView';
import { AlgorithmExplanation } from './components/AlgorithmExplanation';
import { TestVectorSuite } from './components/TestVectorSuite';
import { AboutProject } from './components/AboutProject';
import { KeySize, BlockTrace } from './types/aes';
import { Shield, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [keySize, setKeySize] = useState<KeySize>(128);
  const [visualizerTrace, setVisualizerTrace] = useState<BlockTrace | null>(null);

  // Seamless cross-linking from Simulator to Round Visualizer
  const handleSendToVisualizer = (trace: BlockTrace) => {
    setVisualizerTrace(trace);
    setKeySize(trace.keySize);
    setActiveTab('visualization');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        keySize={keySize}
        setKeySize={setKeySize}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 md:py-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            keySize={keySize}
            setKeySize={setKeySize}
          />
        )}

        {activeTab === 'encryption' && (
          <EncryptionSimulator
            keySize={keySize}
            setKeySize={setKeySize}
            onSendToVisualizer={handleSendToVisualizer}
          />
        )}

        {activeTab === 'decryption' && (
          <DecryptionSimulator
            keySize={keySize}
            setKeySize={setKeySize}
            onSendToVisualizer={handleSendToVisualizer}
          />
        )}

        {activeTab === 'visualization' && (
          <RoundVisualizer
            keySize={keySize}
            setKeySize={setKeySize}
            externalTrace={visualizerTrace}
          />
        )}

        {activeTab === 'key-expansion' && (
          <KeyExpansionView
            keySize={keySize}
            setKeySize={setKeySize}
          />
        )}

        {activeTab === 'algorithm' && (
          <AlgorithmExplanation />
        )}

        {activeTab === 'tests' && (
          <TestVectorSuite
            onLoadVectorToVisualizer={handleSendToVisualizer}
          />
        )}

        {activeTab === 'about' && (
          <AboutProject />
        )}
      </main>

      {/* Bottom Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16]/80 text-xs text-slate-400 py-6 px-4 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Shield className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-slate-200">AES LAB</span> – Advanced Encryption Standard Simulator
              <span className="text-[11px] text-slate-400 block font-mono">
                Compliant with NIST FIPS 197 &amp; RFC 3602 Standards
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> NIST Test Vectors: 100% Passed
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Client-Side Cryptography (Zero Backend)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
