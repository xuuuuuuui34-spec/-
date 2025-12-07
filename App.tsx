import React, { useState, useEffect, useRef } from 'react';
import { AppState, GameMode, Player, BoardState, Theme, User, CellPosition } from './types';
import { THEMES } from './constants';
import { createInitialBoard, getValidMoves, applyMove, countPieces, hasValidMoves } from './utils/gameLogic';
import Board from './components/Board';
import Auth from './components/Auth';
import Lobby from './components/Lobby';
import { getBestMove } from './services/geminiService';
import { playSound } from './utils/audio';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Welcome);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Default to 'ragdoll' theme
  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.Local);
  const [opponentName, setOpponentName] = useState<string>('对手');

  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Black);
  const [validMoves, setValidMoves] = useState<CellPosition[]>([]);
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [lastMove, setLastMove] = useState<CellPosition | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [scores, setScores] = useState({ black: 2, white: 2 });
  const [message, setMessage] = useState<string>("");
  
  // Settings menu toggle
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (appState === AppState.Game) {
      const moves = getValidMoves(board, currentPlayer);
      setValidMoves(moves);
      setScores(countPieces(board));
      playSound('start');
    }
  }, [appState]);

  useEffect(() => {
    if (appState !== AppState.Game || winner) return;

    const moves = getValidMoves(board, currentPlayer);
    setValidMoves(moves);
    setScores(countPieces(board));

    if (moves.length === 0) {
      const opponent = currentPlayer === Player.Black ? Player.White : Player.Black;
      if (!hasValidMoves(board, opponent)) {
        endGame();
      } else {
        const playerName = currentPlayer === Player.Black ? '黑方' : '白方';
        setMessage(`${playerName} 无棋可下，跳过`);
        setTimeout(() => {
           setMessage("");
           setCurrentPlayer(opponent);
        }, 1500);
      }
      return;
    }

    const isAITurn = (gameMode === GameMode.Online || gameMode === GameMode.AI) && currentPlayer === Player.White;

    if (isAITurn && !isProcessingAI) {
      setIsProcessingAI(true);
      const makeAIMove = async () => {
        try {
          await new Promise(r => setTimeout(r, Math.random() * 500 + 600));
          const move = await getBestMove(board, currentPlayer, 'hard');
          handleMove(move.row, move.col);
        } catch (e) {
          console.error(e);
        } finally {
          setIsProcessingAI(false);
        }
      };
      makeAIMove();
    }

  }, [board, currentPlayer, appState, gameMode, winner]);

  const handleMove = (row: number, col: number) => {
    if (winner) return;

    playSound('move');
    const newBoard = applyMove(board, currentPlayer, row, col);
    setBoard(newBoard);
    setLastMove({ row, col });
    
    const nextPlayer = currentPlayer === Player.Black ? Player.White : Player.Black;
    setCurrentPlayer(nextPlayer);
  };

  const endGame = () => {
    const { black, white } = countPieces(board);
    if (black > white) setWinner(Player.Black);
    else if (white > black) setWinner(Player.White);
    else setWinner('Draw');
    setAppState(AppState.GameOver);
    playSound('win');
  };

  const resetGame = () => {
    setBoard(createInitialBoard());
    setCurrentPlayer(Player.Black);
    setWinner(null);
    setLastMove(null);
    setAppState(AppState.Game);
    setMessage("");
    setShowSettings(false);
  };

  const handleJoinGame = (oppName?: string, isAI: boolean = false) => {
    setOpponentName(oppName || '玩家2');
    setGameMode(isAI ? (oppName ? GameMode.Online : GameMode.AI) : GameMode.Local);
    resetGame();
  };

  // --- RENDERING ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-[100dvh] relative overflow-hidden bg-[#0c0a09]">
      <div className="absolute inset-0 bg-noise opacity-20"></div>
      
      <div className="z-10 text-center p-8 animate-[fadeIn_1s_ease-out]">
        <h1 className="text-5xl md:text-8xl gothic-heading text-[#e7e5e4] mb-4 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          Gothic Reversi
        </h1>
        <p className="text-lg md:text-2xl font-serif italic text-[#a8a29e] mb-12">
          - 庄园之谜 -
        </p>
        
        <div className="relative group inline-block">
          <button
            onClick={() => setAppState(AppState.Login)}
            className="relative px-12 md:px-16 py-3 md:py-4 bg-[#292524] border-2 border-[#57534e] text-[#d6d3d1] font-bold text-lg md:text-xl uppercase tracking-[0.2em] transition-all hover:bg-[#450a0a] hover:border-[#7f1d1d] hover:text-white shadow-2xl overflow-hidden active:scale-95"
          >
            <span className="relative z-10">开始侦查</span>
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 transform skew-x-12 origin-left"></div>
          </button>
          
          <div className="mt-16 opacity-60 hover:opacity-100 transition-opacity duration-700">
             <p className="font-handwriting text-[#b45309] text-lg -rotate-3" style={{ fontFamily: 'cursive' }}>
               made by 婕
             </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Compact Player Panel for Mobile / Full for Desktop
  const renderPlayerPanel = (isBlack: boolean, score: number, isActive: boolean) => {
      const name = isBlack ? (currentUser?.username || "我方 (黑)") : (gameMode === GameMode.Local ? "对方 (白)" : opponentName);
      const activeClass = isActive ? 'border-amber-600 ring-1 md:ring-2 ring-amber-900/40 bg-[#1a1816]' : 'border-[#44403c] opacity-80 bg-[#1c1917]';
      const pieceIcon = isBlack 
        ? <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-black border border-gray-700 shadow-sm"></div>
        : <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white border border-gray-300 shadow-sm"></div>;

      return (
        <div className={`
            relative w-full lg:max-w-[300px] 
            h-16 lg:h-auto
            p-2 lg:p-6 
            border-y md:border-2 lg:rounded-lg transition-all duration-500
            ${activeClass} shadow-xl
            flex flex-row lg:flex-col items-center justify-between gap-2 lg:gap-4
        `}>
             <div className="flex items-center gap-3 flex-1 overflow-hidden">
                 <div className={`
                     w-10 h-10 lg:w-16 lg:h-16 rounded-full border-2 border-[#57534e] flex items-center justify-center shrink-0
                     text-lg lg:text-2xl font-serif font-bold text-[#a8a29e] bg-[#292524] shadow-inner
                 `}>
                     {name.charAt(0)}
                 </div>
                 <div className="flex flex-col items-start min-w-0">
                     <div className="flex items-center gap-2 w-full">
                         {pieceIcon}
                         <span className="text-[#d6d3d1] font-serif font-bold text-sm lg:text-lg truncate block max-w-[100px] lg:max-w-none">{name}</span>
                     </div>
                     <span className={`text-[10px] lg:text-xs typewriter mt-0.5 ${isActive ? 'text-amber-500 animate-pulse' : 'text-[#78716c]'}`}>
                         {isActive ? "Thinking..." : "Waiting"}
                     </span>
                 </div>
             </div>

             <div className="flex flex-col items-end lg:items-center pl-2 border-l border-[#44403c] lg:border-l-0 lg:pl-0">
                 <span className="text-2xl lg:text-5xl gothic-heading text-[#e7e5e4] leading-none">{score}</span>
                 <div className="text-[9px] lg:text-[10px] text-[#57534e] uppercase tracking-widest mt-1">Pieces</div>
             </div>

             {/* Progress Bar (Desktop only or very subtle on mobile) */}
             <div className="hidden lg:block w-full h-1.5 bg-[#292524] mt-2 rounded-full overflow-hidden">
                 <div 
                    className={`h-full transition-all duration-700 ${isBlack ? 'bg-amber-700' : 'bg-[#a8a29e]'}`}
                    style={{ width: `${(score / 64) * 100}%` }}
                 ></div>
             </div>
        </div>
      );
  };

  const renderGame = () => (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-[#0c0a09] relative overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

      {/* Floating Controls (Top Right) */}
      <div className="absolute top-2 right-2 lg:top-4 lg:right-4 z-40 flex items-center gap-2">
         <button 
            onClick={() => setShowSettings(!showSettings)}
            className="w-10 h-10 bg-[#1c1917]/90 backdrop-blur border border-[#57534e] text-[#a8a29e] active:text-[#e7e5e4] active:border-[#b91c1c] transition-all flex items-center justify-center rounded shadow-lg"
            title="Settings"
         >
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
         </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
          <div className="absolute top-14 right-2 z-50 w-64 bg-[#1c1917] border border-[#57534e] shadow-2xl p-4 animate-[fadeIn_0.2s_ease-out]">
              <div className="absolute inset-0 bg-noise opacity-20 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="typewriter text-xs text-[#78716c] mb-3 uppercase border-b border-[#44403c] pb-2">外观样式 (Theme)</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {THEMES.map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t)}
                        className={`
                          p-2 border text-xs text-center transition-all font-serif rounded-sm
                          ${theme.id === t.id ? 'border-amber-700 bg-[#451a03] text-amber-200' : 'border-[#44403c] text-[#78716c] hover:border-[#a8a29e]'}
                        `}
                      >
                        {t.name}
                      </button>
                    ))}
                </div>
                <h3 className="typewriter text-xs text-[#78716c] mb-3 uppercase border-b border-[#44403c] pb-2">游戏控制 (Control)</h3>
                <div className="space-y-2">
                  <button onClick={resetGame} className="w-full py-2 bg-[#292524] text-[#d6d3d1] border border-[#44403c] active:bg-[#44403c] text-xs uppercase">重置对局</button>
                  <button onClick={() => setAppState(AppState.Lobby)} className="w-full py-2 bg-[#450a0a] text-[#fecaca] border border-[#7f1d1d] active:bg-[#7f1d1d] text-xs uppercase">退出游戏</button>
                </div>
              </div>
          </div>
      )}

      {/* --- Layout: Desktop (Left) / Mobile (Top) --- */}
      <div className="order-1 lg:order-1 w-full lg:w-1/4 h-16 lg:h-full lg:p-8 flex items-center lg:justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto w-full flex justify-center h-full lg:h-auto">
              {renderPlayerPanel(true, scores.black, currentPlayer === Player.Black)}
          </div>
      </div>

      {/* --- Layout: Center Board --- */}
      <div className="order-2 lg:order-2 flex-1 w-full h-full flex flex-col items-center justify-center relative z-10 p-2 overflow-hidden">
          {message && (
             <div className="absolute top-4 z-30 typewriter text-amber-500 bg-black/80 px-4 py-2 border border-amber-900/50 shadow-lg text-sm animate-pulse rounded">
               >> {message}
             </div>
          )}
          
          <div className="relative aspect-square transition-all duration-500 ease-out flex items-center justify-center" 
               style={{ 
                   // Calculation: 100dvh - (Header 64px + Footer 64px + Padding ~32px)
                   width: 'min(95vw, calc(100dvh - 160px))', 
                   maxWidth: '650px',
               }}>
               <Board
                  board={board}
                  currentPlayer={currentPlayer}
                  onMove={handleMove}
                  validMoves={validMoves}
                  theme={theme}
                  disabled={winner !== null || (isProcessingAI && currentPlayer === Player.White)}
                  lastMove={lastMove}
               />
          </div>
      </div>

      {/* --- Layout: Desktop (Right) / Mobile (Bottom) --- */}
      <div className="order-3 lg:order-3 w-full lg:w-1/4 h-16 lg:h-full lg:p-8 flex items-center lg:justify-center z-20 pointer-events-none">
          <div className="pointer-events-auto w-full flex justify-center h-full lg:h-auto">
              {renderPlayerPanel(false, scores.white, currentPlayer === Player.White)}
          </div>
      </div>

      {/* Game Over Modal */}
      {appState === AppState.GameOver && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="paper-texture p-6 md:p-12 w-full max-w-sm text-center shadow-2xl rotate-1 border border-[#a8a29e] relative animate-[popIn_0.4s_ease-out]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#451a03]/20 blur-sm"></div>
              
              <h2 className="text-3xl md:text-4xl gothic-heading text-[#292524] mb-2">
                {winner === 'Draw' ? "平局" : "胜利"}
              </h2>
              <div className="w-full h-px bg-[#78716c] my-4"></div>
              <p className="text-lg md:text-xl font-serif text-[#7f1d1d] font-bold mb-6 md:mb-8">
                 {winner === 'Draw' 
                    ? "无人幸存" 
                    : `${winner === Player.Black ? (currentUser?.username || "黑方") : (gameMode === GameMode.Local ? "白方" : opponentName)} 赢得了游戏`}
              </p>

              <div className="space-y-3">
                <button onClick={resetGame} className="w-full py-3 bg-[#1c1917] text-[#e7e5e4] uppercase tracking-widest font-bold active:bg-[#292524] transition-colors shadow-lg text-sm md:text-base">
                  再次挑战
                </button>
                <button onClick={() => setAppState(AppState.Lobby)} className="w-full py-3 border border-[#78716c] text-[#57534e] uppercase tracking-widest active:border-black active:text-black transition-colors text-sm md:text-base">
                  返回大厅
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );

  return (
    <div className={`h-[100dvh] font-serif text-[#d6d3d1] overflow-hidden`}>
      {appState === AppState.Welcome && renderWelcome()}
      {appState === AppState.Login && (
        <div className="h-[100dvh] flex items-center justify-center bg-[#0c0a09] relative overflow-hidden px-4">
           <div className="absolute inset-0 bg-noise opacity-20"></div>
           <Auth onLogin={(u) => { setCurrentUser(u); setAppState(AppState.Lobby); }} onGuest={() => { setCurrentUser(null); setAppState(AppState.Lobby); }} />
        </div>
      )}
      {appState === AppState.Lobby && (
        <div className="h-[100dvh] bg-[#0c0a09] relative overflow-y-auto">
          <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none fixed"></div>
          <Lobby currentUser={currentUser} onJoinGame={handleJoinGame} onLogout={() => setAppState(AppState.Welcome)} />
        </div>
      )}
      {(appState === AppState.Game || appState === AppState.GameOver) && renderGame()}
    </div>
  );
};

export default App;