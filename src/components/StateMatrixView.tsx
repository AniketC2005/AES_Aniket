import React, { useState } from 'react';

interface StateMatrixViewProps {
  matrix: number[][]; // 4x4 array
  title?: string;
  subtitle?: string;
  changedCells?: boolean[][];
  highlightColor?: 'cyan' | 'blue' | 'amber' | 'emerald';
  compact?: boolean;
  onCellClick?: (row: number, col: number, byteValue: number) => void;
  selectedCell?: { row: number; col: number } | null;
}

export const StateMatrixView: React.FC<StateMatrixViewProps> = ({
  matrix,
  title,
  subtitle,
  changedCells,
  highlightColor = 'cyan',
  compact = false,
  onCellClick,
  selectedCell,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; val: number } | null>(null);

  const getHighlightClass = (isChanged: boolean, isSelected: boolean) => {
    if (isSelected) {
      return 'border-cyan-400 bg-cyan-500/25 text-white ring-2 ring-cyan-400/50 scale-[1.03] z-10';
    }
    if (!isChanged) {
      return 'border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40';
    }
    switch (highlightColor) {
      case 'amber':
        return 'border-amber-500/50 bg-amber-500/15 text-amber-200 font-semibold shadow-xs shadow-amber-500/10';
      case 'emerald':
        return 'border-emerald-500/50 bg-emerald-500/15 text-emerald-200 font-semibold shadow-xs shadow-emerald-500/10';
      case 'blue':
        return 'border-blue-500/50 bg-blue-500/15 text-blue-200 font-semibold shadow-xs shadow-blue-500/10';
      case 'cyan':
      default:
        return 'border-cyan-500/50 bg-cyan-500/15 text-cyan-200 font-semibold shadow-xs shadow-cyan-500/10';
    }
  };

  return (
    <div className="flex flex-col bg-[#0b101c] border border-slate-800/90 rounded-xl p-4 shadow-md transition-all">
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            {title && <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">{title}</h4>}
            {subtitle && <p className="text-[11px] text-slate-400 font-mono">{subtitle}</p>}
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
            4×4 State
          </span>
        </div>
      )}

      {/* Matrix Grid */}
      <div className="inline-block mx-auto">
        {/* Column Headers (c0, c1, c2, c3) */}
        <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-1 mb-1 text-[10px] font-mono text-slate-400 text-center">
          <div className="w-5"></div>
          {['c0', 'c1', 'c2', 'c3'].map((col, idx) => (
            <div key={idx} className="font-semibold text-slate-400">
              {col}
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1">
          {matrix.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-[auto_repeat(4,1fr)] gap-1 items-center">
              {/* Row Header (r0, r1, r2, r3) */}
              <div className="w-5 text-[10px] font-mono text-slate-400 font-semibold text-right pr-1">
                r{rIdx}
              </div>

              {/* 4 Cells */}
              {row.map((val, cIdx) => {
                const isChanged = changedCells ? !!changedCells[rIdx][cIdx] : false;
                const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                const hexStr = (val & 0xff).toString(16).padStart(2, '0').toUpperCase();

                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => onCellClick?.(rIdx, cIdx, val)}
                    onMouseEnter={() => setHoveredCell({ row: rIdx, col: cIdx, val })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`relative font-mono rounded-lg border transition-all text-center flex flex-col items-center justify-center cursor-pointer select-none ${
                      compact ? 'w-10 h-10 text-xs' : 'w-12 h-12 md:w-14 md:h-14 text-sm'
                    } ${getHighlightClass(isChanged, isSelected)}`}
                  >
                    <span>{hexStr}</span>
                    {!compact && (
                      <span className="text-[8px] text-slate-400 opacity-70">
                        {rIdx + 4 * cIdx}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Cell Hover Popover / Info Bar */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 min-h-[30px] text-[11px] font-mono flex items-center justify-between text-slate-400">
        {hoveredCell ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 font-semibold">
                State[{hoveredCell.row}][{hoveredCell.col}]
              </span>
              <span className="text-slate-400">(Byte {hoveredCell.row + 4 * hoveredCell.col})</span>
            </div>
            <div className="flex items-center gap-3">
              <span>Hex: <strong className="text-slate-200">0x{hoveredCell.val.toString(16).padStart(2, '0').toUpperCase()}</strong></span>
              <span>Dec: <strong className="text-slate-200">{hoveredCell.val}</strong></span>
              <span>Bin: <strong className="text-slate-200">{hoveredCell.val.toString(2).padStart(8, '0')}</strong></span>
            </div>
          </>
        ) : (
          <span className="text-slate-400 text-[10px]">
            Hover over any cell to view binary, decimal & byte index. Column-major: s[r,c] = byte[r + 4c]
          </span>
        )}
      </div>
    </div>
  );
};
