import React, { useEffect, useState } from 'react';
import { Player, Theme } from '../types';

interface PieceProps {
  player: Player;
  theme: Theme;
  isNew?: boolean;
}

const Piece: React.FC<PieceProps> = ({ player, theme, isNew }) => {
  const [currentPlayer, setCurrentPlayer] = useState(player);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (player !== currentPlayer) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setCurrentPlayer(player);
        setIsFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [player, currentPlayer]);

  if (player === Player.None) return null;

  // Render logic based on theme ID
  const renderContent = () => {
    const isBlack = currentPlayer === Player.Black;
    
    // --- 缝合玩偶 (纽扣) ---
    if (theme.id === 'ragdoll') {
      const bgColor = isBlack 
        ? 'bg-neutral-900 shadow-[inset_0_2px_8px_rgba(255,255,255,0.1),0_4px_6px_rgba(0,0,0,0.5)] border-neutral-800' 
        : 'bg-[#e5e5e5] shadow-[inset_0_2px_8px_rgba(0,0,0,0.1),0_4px_6px_rgba(0,0,0,0.3)] border-neutral-300';
      const threadColor = isBlack ? 'stroke-neutral-600' : 'stroke-neutral-400';
      
      return (
        <div className={`w-full h-full rounded-full border-4 ${bgColor} flex items-center justify-center relative box-border`}>
          {/* Button holes and thread */}
          <svg viewBox="0 0 24 24" className={`w-3/5 h-3/5 ${threadColor} opacity-80`} fill="none" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="8" x2="16" y2="16" />
            <line x1="16" y1="8" x2="8" y2="16" />
            <circle cx="8" cy="8" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
            <circle cx="16" cy="8" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
            <circle cx="8" cy="16" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
            <circle cx="16" cy="16" r="1.5" fill="currentColor" className="stroke-none opacity-60"/>
          </svg>
          {/* Edge gloss */}
          <div className="absolute inset-2 rounded-full border border-white/10"></div>
        </div>
      );
    }

    // --- 远古琥珀 ---
    if (theme.id === 'amber') {
      const gradient = isBlack
        ? 'bg-[radial-gradient(circle_at_30%_30%,_#b45309,_#78350f_60%,_#451a03)] ring-1 ring-amber-900/50' // Dark Amber
        : 'bg-[radial-gradient(circle_at_30%_30%,_#fcd34d,_#fbbf24_60%,_#d97706)] ring-1 ring-amber-500/50'; // Light Amber
      
      return (
        <div className={`w-full h-full rounded-full ${gradient} shadow-[0_0_10px_rgba(245,158,11,0.2),inset_2px_2px_4px_rgba(255,255,255,0.3)] flex items-center justify-center overflow-hidden relative`}>
          {/* Inclusions / Trapped insect feel */}
          <div className="absolute w-full h-full opacity-30 mix-blend-overlay">
            <div className="absolute top-1/3 left-1/4 w-2 h-3 bg-black/40 blur-[1px] rotate-45 rounded-full"></div>
            <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-black/30 rounded-full"></div>
          </div>
          {/* Specular highlight */}
          <div className="absolute top-[15%] left-[15%] w-[30%] h-[20%] bg-gradient-to-br from-white/60 to-transparent rounded-full blur-[2px]"></div>
        </div>
      );
    }

    // --- 庄园金币 ---
    if (theme.id === 'coin') {
      const gradient = isBlack
        ? 'bg-[conic-gradient(from_45deg,#b45309,#d97706,#b45309)]' // Gold
        : 'bg-[conic-gradient(from_45deg,#94a3b8,#cbd5e1,#94a3b8)]'; // Silver
      const innerColor = isBlack ? 'text-amber-900' : 'text-slate-600';
      
      return (
        <div className={`w-full h-full rounded-full p-[2px] ${gradient} shadow-lg relative`}>
           <div className={`w-full h-full rounded-full border-2 border-dashed ${isBlack ? 'border-amber-900/40 bg-[#d97706]' : 'border-slate-500/40 bg-[#cbd5e1]'} flex items-center justify-center`}>
              {/* Coin Pattern */}
              <div className={`w-[70%] h-[70%] border border-current rounded-full flex items-center justify-center ${innerColor} opacity-70`}>
                 <span className="font-serif font-bold text-xs transform scale-75">V</span>
              </div>
           </div>
        </div>
      );
    }

    // --- 血色玫瑰 ---
    if (theme.id === 'rose') {
       const bg = isBlack
        ? 'bg-[radial-gradient(circle,_#991b1b,_#450a0a)]'
        : 'bg-[radial-gradient(circle,_#fecdd3,_#e11d48)]';
       
       return (
         <div className={`w-full h-full rounded-full ${bg} shadow-md flex items-center justify-center relative overflow-hidden`}>
            {/* Simple Rose Petal Suggestion via SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute opacity-30 mix-blend-multiply text-black">
               <path d="M50 50 Q70 20 90 50 T 50 90 Q 30 90 10 50 T 50 10" fill="none" stroke="currentColor" strokeWidth="2" />
               <path d="M50 50 Q30 20 10 50" fill="none" stroke="currentColor" strokeWidth="2" />
               <path d="M50 50 Q70 80 90 50" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
             {/* Center */}
            <div className="w-1.5 h-1.5 bg-black/20 rounded-full blur-[0.5px]"></div>
         </div>
       )
    }

    // Fallback
    return <div className="w-full h-full bg-gray-500 rounded-full" />;
  };

  return (
    <div 
      className={`
        w-[84%] h-[84%] rounded-full
        transition-all duration-500 preserve-3d
        ${isNew ? 'animate-pop-in' : ''}
        ${isFlipping ? 'rotate-y-180 scale-90' : 'rotate-y-0 scale-100'}
      `}
      style={{ transform: isFlipping ? 'rotateY(90deg)' : 'rotateY(0deg)' }}
    >
      {renderContent()}
    </div>
  );
};

export default Piece;