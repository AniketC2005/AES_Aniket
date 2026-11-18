import React from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Layers, 
  KeyRound, 
  BookOpen, 
  CheckCircle2, 
  Info,
  Cpu
} from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'encryption' 
  | 'decryption' 
  | 'visualization' 
  | 'key-expansion' 
  | 'algorithm' 
  | 'tests' 
  | 'about';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  keySize: 128 | 192 | 256;
  setKeySize: (size: 128 | 192 | 256) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  keySize,
  setKeySize
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Cpu className="w-4 h-4" /> },
    { id: 'encryption', label: 'Encrypt', icon: <Lock className="w-4 h-4" /> },
    { id: 'decryption', label: 'Decrypt', icon: <Unlock className="w-4 h-4" /> },
    { id: 'visualization', label: 'Round Simulator', icon: <Layers className="w-4 h-4" /> },
    { id: 'key-expansion', label: 'Key Expansion', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'algorithm', label: 'AES Theory', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tests', label: 'NIST Tests', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <Shield className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white">AES<span className="text-cyan-400">LAB</span></span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                  FIPS 197
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Interactive Cryptography Simulator</p>
            </div>
          </button>

          {/* Key Size Selector on Mobile */}
          <div className="flex md:hidden items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800">
            {([128, 192, 256] as const).map(size => (
              <button
                key={size}
                onClick={() => setKeySize(size)}
                className={`text-xs font-mono px-2 py-1 rounded transition-colors ${
                  keySize === size
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Key Size Selector on Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Cipher:</span>
          <div className="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-800">
            {([128, 192, 256] as const).map(size => (
              <button
                key={size}
                onClick={() => setKeySize(size)}
                className={`text-xs font-mono px-2.5 py-1 rounded transition-all ${
                  keySize === size
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 font-semibold border border-cyan-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title={`Select AES-${size} (${size === 128 ? '10' : size === 192 ? '12' : '14'} rounds)`}
              >
                AES-{size}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
