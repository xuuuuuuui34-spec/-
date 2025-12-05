import React from 'react';
import { BoardState, Player, CellPosition, Theme } from '../types';
import Piece from './Piece';

interface BoardProps {
  board: BoardState;
  currentPlayer: Player;
  onMove: (row: number, col: number) => void;
  validMoves: CellPosition[];
  theme: Theme;
  disabled: boolean;
  lastMove: CellPosition | null;
}

const Board: React.FC<BoardProps> = ({ board, currentPlayer, onMove, validMoves, theme, disabled, lastMove }) => {
  const handleCellClick = (row: number, col: number) => {
    if (disabled) return;
    const isValid = validMoves.some(m => m.row === row && m.col === col);
    if (isValid) {
      onMove(row, col);
    }
  };

  return (
    <div className={`
      relative p-3 shadow-2xl ${theme.boardBg} 
      border-[6px] border-[#292524] 
      shadow-[0_20px_50px_rgba(0,0,0,0.7)]
      /* Ensure the outer frame is square if content is square */
      inline-block
    `}>
      {/* Texture Overlay (Scratches) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
      
      {/* Corner Ornaments (Metal Brackets) - Adjusted for sharp corners */}
      <div className="absolute -top-[6px] -left-[6px] w-8 h-8 border-t-4 border-l-4 border-amber-800/60 z-10"></div>
      <div className="absolute -top-[6px] -right-[6px] w-8 h-8 border-t-4 border-r-4 border-amber-800/60 z-10"></div>
      <div className="absolute -bottom-[6px] -left-[6px] w-8 h-8 border-b-4 border-l-4 border-amber-800/60 z-10"></div>
      <div className="absolute -bottom-[6px] -right-[6px] w-8 h-8 border-b-4 border-r-4 border-amber-800/60 z-10"></div>

      <div 
        className="grid grid-cols-8 gap-[2px] bg-[#1c1917]/80 p-1 relative z-0"
        style={{ width: 'min(92vw, 480px)', height: 'min(92vw, 480px)' }}
      >
        {board.map((row, r) => (
          row.map((cell, c) => {
            const isValid = validMoves.some(m => m.row === r && m.col === c);
            const isLastMove = lastMove?.row === r && lastMove?.col === c;

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`
                  relative flex items-center justify-center aspect-square
                  ${theme.cellBg}
                  ${isValid && !disabled ? 'cursor-pointer hover:bg-white/5' : ''}
                  transition-colors duration-200
                `}
              >
                {/* Board grid markers */}
                {(r === 2 || r === 6) && (c === 2 || c === 6) && (
                   <div className="absolute w-1.5 h-1.5 rounded-full bg-black/40 shadow-sm"></div>
                )}

                {cell !== Player.None && (
                   <Piece player={cell} theme={theme} isNew={isLastMove} />
                )}

                {/* Valid Move Indicator (Sketchy Circle) */}
                {isValid && !disabled && (
                  <div className={`absolute w-4 h-4 border-2 border-dashed border-white/20 rounded-full animate-pulse opacity-50`}></div>
                )}
                
                {/* Last Move Indicator (Red Cross/Highlight) */}
                {isLastMove && (
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-red-500/70"></div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default Board;