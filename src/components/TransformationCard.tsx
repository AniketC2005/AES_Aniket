import React from 'react';
import { StateStep } from '../types/aes';
import { 
  ArrowRightLeft, 
  Shuffle, 
  Columns3, 
  Key, 
  RotateCcw, 
  Binary,
  FileText
} from 'lucide-react';

interface TransformationCardProps {
  step: StateStep;
  totalSteps: number;
}

export const TransformationCard: React.FC<TransformationCardProps> = ({
  step,
  totalSteps,
}) => {
  const getIcon = () => {
    switch (step.transformation) {
      case 'INPUT':
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'ADD_ROUND_KEY_INITIAL':
      case 'ADD_ROUND_KEY':
        return <Key className="w-5 h-5 text-amber-400" />;
      case 'SUB_BYTES':
        return <ArrowRightLeft className="w-5 h-5 text-purple-400" />;
      case 'SHIFT_ROWS':
        return <Shuffle className="w-5 h-5 text-blue-400" />;
      case 'MIX_COLUMNS':
        return <Columns3 className="w-5 h-5 text-emerald-400" />;
      case 'INV_SHIFT_ROWS':
      case 'INV_SUB_BYTES':
      case 'INV_MIX_COLUMNS':
        return <RotateCcw className="w-5 h-5 text-rose-400" />;
      default:
        return <Binary className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getBadgeColor = () => {
    switch (step.transformation) {
      case 'SUB_BYTES':
      case 'INV_SUB_BYTES':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'SHIFT_ROWS':
      case 'INV_SHIFT_ROWS':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'MIX_COLUMNS':
      case 'INV_MIX_COLUMNS':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      case 'ADD_ROUND_KEY':
      case 'ADD_ROUND_KEY_INITIAL':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      default:
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60';
    }
  };

  const getMathematicalFormula = () => {
    switch (step.transformation) {
      case 'SUB_BYTES':
        return 'S\'[r, c] = S_Box( S[r, c] )   |   GF(2^8) Multiplicative Inverse + Affine Transform';
      case 'INV_SUB_BYTES':
        return 'S\'[r, c] = Inv_S_Box( S[r, c] )   |   Inverse Affine + GF(2^8) Inversion';
      case 'SHIFT_ROWS':
        return 'S\'[r, c] = S[r, (c + r) mod 4]   |   Row 1: ⟵ 1 byte, Row 2: ⟵ 2 bytes, Row 3: ⟵ 3 bytes';
      case 'INV_SHIFT_ROWS':
        return 'S\'[r, c] = S[r, (c - r + 4) mod 4]   |   Row 1: ⟶ 1 byte, Row 2: ⟶ 2 bytes, Row 3: ⟶ 3 bytes';
      case 'MIX_COLUMNS':
        return 's\'_c(x) = a(x) ⊗ s_c(x) mod (x^4 + 1)   |   a(x) = {03}x^3 + {01}x^2 + {01}x + {02} in GF(2^8)';
      case 'INV_MIX_COLUMNS':
        return 's\'_c(x) = d(x) ⊗ s_c(x) mod (x^4 + 1)   |   d(x) = {0b}x^3 + {0d}x^2 + {09}x + {0e} in GF(2^8)';
      case 'ADD_ROUND_KEY_INITIAL':
        return 'State\'[r, c] = State[r, c] ⊕ RoundKey_0[r, c]   |   Bitwise XOR with initial key';
      case 'ADD_ROUND_KEY':
        return `State\'[r, c] = State[r, c] ⊕ RoundKey_${step.round}[r, c]   |   Key Injection XOR`;
      case 'INPUT':
        return 'State[r, c] = PlaintextByte[r + 4*c]   |   Column-major byte array mapping';
      default:
        return '';
    }
  };

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{step.name}</h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getBadgeColor()}`}>
                {step.transformation}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-400 self-start sm:self-center">
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            Round: <strong className="text-cyan-300">{step.round}</strong>
          </span>
          <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">
            Step: <strong className="text-cyan-300">{step.stepIndex + 1}</strong> / {totalSteps}
          </span>
        </div>
      </div>

      {/* Formula banner */}
      <div className="mt-3 bg-slate-950/70 border border-slate-800/80 rounded-lg px-3.5 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Formula:</span>
          <span className="text-cyan-300">{getMathematicalFormula()}</span>
        </div>
      </div>
    </div>
  );
};
