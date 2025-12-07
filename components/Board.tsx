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
      relative p-1 md:p-3 shadow-2xl ${theme.boardBg} 
      border-2 md:border-[6px] border-[#292524] 
      shadow-[0_10px_30px_rgba(0,0,0,0.7)]
      w-full h-full
      flex items-center justify-center
      rounded-sm
    `}>
      {/* Texture Overlay (Scratches) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay"></div>
      
      {/* Corner Ornaments (Metal Brackets) - Smaller on mobile */}
      <div className="absolute -top-[2px] -left-[2px] w-4 h-4 md:w-8 md:h-8 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-amber-800/60 z-10"></div>
      <div className="absolute -top-[2px] -right-[2px] w-4 h-4 md:w-8 md:h-8 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-amber-800/60 z-10"></div>
      <div className="absolute -bottom-[2px] -left-[2px] w-4 h-4 md:w-8 md:h-8 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-amber-800/60 z-10"></div>
      <div className="absolute -bottom-[2px] -right-[2px] w-4 h-4 md:w-8 md:h-8 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-amber-800/60 z-10"></div>

      <div 
        className="grid grid-cols-8 gap-[1px] md:gap-[2px] bg-[#1c1917]/80 p-0.5 md:p-1 relative z-0 w-full h-full"
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
                  ${isValid && !disabled ? 'cursor-pointer' : ''}
                  transition-colors duration-200
                  overflow-hidden
                `}
              >
                {/* Board grid markers */}
                {(r === 2 || r === 6) && (c === 2 || c === 6) && (
                   <div className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-black/40 shadow-sm z-0"></div>
                )}

                {cell !== Player.None && (
                   <div className="w-full h-full p-[2%] z-10">
                     <Piece player={cell} theme={theme} isNew={isLastMove} />
                   </div>
                )}

                {/* Valid Move Indicator (Sketchy Circle) */}
                {isValid && !disabled && (
                  <div className={`absolute w-3 h-3 md:w-4 md:h-4 border border-dashed border-white/30 rounded-full animate-pulse opacity-60`}></div>
                )}
                
                {/* Last Move Indicator (Red Cross/Highlight) */}
                {isLastMove && (
                  <div className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 border-t border-r border-red-500/70"></div>
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