import React, { useState, useEffect } from 'react';
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
  };

  const handleJoinGame = (oppName?: string, isAI: boolean = false) => {
    setOpponentName(oppName || '玩家2');
    setGameMode(isAI ? (oppName ? GameMode.Online : GameMode.AI) : GameMode.Local);
    resetGame();
  };

  // --- RENDERING ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-[#0c0a09]">
      <div className="absolute inset-0 bg-noise opacity-20"></div>
      
      {/* Decorative spiderweb or cracks could go here via SVG */}
      
      <div className="z-10 text-center p-8 animate-[fadeIn_1s_ease-out]">
        <h1 className="text-6xl md:text-8xl gothic-heading text-[#e7e5e4] mb-4 tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
          Gothic Reversi
        </h1>
        <p className="text-xl md:text-2xl font-serif italic text-[#a8a29e] mb-12">
          - 庄园之谜 -
        </p>
        
        <div className="relative group inline-block">
          <button
            onClick={() => setAppState(AppState.Login)}
            className="relative px-16 py-4 bg-[#292524] border-2 border-[#57534e] text-[#d6d3d1] font-bold text-xl uppercase tracking-[0.2em] transition-all hover:bg-[#450a0a] hover:border-[#7f1d1d] hover:text-white shadow-2xl overflow-hidden"
          >
            <span className="relative z-10">开始侦查</span>
            {/* Hover effect slash */}
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

  const renderGame = () => (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#0c0a09] relative">
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

      {/* Sidebar (Game Info) */}
      <div className="w-full lg:w-80 bg-[#1c1917] border-r border-[#292524] p-6 flex flex-col justify-between z-20 shadow-2xl relative">
        {/* Paper texture overlay on sidebar */}
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/paper.png')] pointer-events-none"></div>

        <div className="relative z-10">
          <h2 className="text-2xl gothic-heading text-[#d6d3d1] mb-6 tracking-widest border-b border-[#44403c] pb-4">
            对局记录
          </h2>
          
          {/* Score Cards */}
          <div className="space-y-4 mb-8">
            <div className={`p-4 border-l-4 transition-all ${currentPlayer === Player.Black ? 'border-amber-600 bg-[#292524]' : 'border-[#44403c] bg-[#1c1917]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-serif text-[#d6d3d1] text-sm">{currentUser?.username || "我方 (黑)"}</span>
                <span className="text-2xl gothic-heading text-[#e7e5e4]">{scores.black}</span>
              </div>
              <div className="w-full h-1 bg-[#44403c] mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-amber-700 transition-all duration-500" style={{ width: `${(scores.black / 64) * 100}%` }}></div>
              </div>
            </div>

            <div className={`p-4 border-l-4 transition-all ${currentPlayer === Player.White ? 'border-amber-600 bg-[#292524]' : 'border-[#44403c] bg-[#1c1917]'}`}>
              <div className="flex items-center justify-between">
                <span className="font-serif text-[#d6d3d1] text-sm">{gameMode === GameMode.Local ? "对方 (白)" : opponentName}</span>
                <span className="text-2xl gothic-heading text-[#e7e5e4]">{scores.white}</span>
              </div>
              <div className="w-full h-1 bg-[#44403c] mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-[#a8a29e] transition-all duration-500" style={{ width: `${(scores.white / 64) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* Style Selector */}
          <div className="mb-6">
            <h3 className="typewriter text-xs text-[#78716c] mb-3 uppercase">选择棋子样式 (Style)</h3>
            <div className="grid grid-cols-2 gap-2">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t)}
                  className={`
                    p-2 border text-xs text-center transition-all font-serif
                    ${theme.id === t.id ? 'border-amber-700 bg-[#451a03] text-amber-200' : 'border-[#44403c] text-[#78716c] hover:border-[#a8a29e]'}
                  `}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <button onClick={resetGame} className="w-full py-3 bg-[#292524] text-[#d6d3d1] border border-[#44403c] hover:bg-[#44403c] transition-colors uppercase text-xs tracking-widest">
            重置对局
          </button>
          <button onClick={() => setAppState(AppState.Lobby)} className="w-full py-3 text-[#78716c] hover:text-[#b91c1c] transition-colors uppercase text-xs tracking-widest">
            退出 / 认输
          </button>
        </div>
      </div>

      {/* Main Board Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#0c0a09]">
        {/* Dynamic Background Spotlights */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-900/10 rounded-full blur-[100px] pointer-events-none"></div>

        {message && (
          <div className="absolute top-10 z-30 typewriter text-amber-500 bg-black/80 px-4 py-2 border border-amber-900/50">
            {'>> '} {message}
          </div>
        )}

        <div className="z-20 scale-[0.85] md:scale-100 transition-transform">
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

        {/* Game Over Overlay */}
        {appState === AppState.GameOver && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
             {/* Note Card Style */}
            <div className="paper-texture p-8 md:p-12 max-w-sm w-full text-center shadow-2xl rotate-1 border border-[#a8a29e] relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#451a03]/20 blur-sm"></div>
              
              <h2 className="text-4xl gothic-heading text-[#292524] mb-2">
                {winner === 'Draw' ? "平局" : "胜利"}
              </h2>
              <div className="w-full h-px bg-[#78716c] my-4"></div>
              <p className="text-xl font-serif text-[#7f1d1d] font-bold mb-8">
                 {winner === 'Draw' 
                    ? "无人幸存" 
                    : `${winner === Player.Black ? (currentUser?.username || "黑方") : (gameMode === GameMode.Local ? "白方" : opponentName)} 赢得了游戏`}
              </p>

              <div className="space-y-3">
                <button onClick={resetGame} className="w-full py-3 bg-[#1c1917] text-[#e7e5e4] uppercase tracking-widest font-bold hover:bg-[#292524] transition-colors">
                  再次挑战
                </button>
                <button onClick={() => setAppState(AppState.Lobby)} className="w-full py-3 border border-[#78716c] text-[#57534e] uppercase tracking-widest hover:border-black hover:text-black transition-colors">
                  返回大厅
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-serif text-[#d6d3d1]`}>
      {appState === AppState.Welcome && renderWelcome()}
      {appState === AppState.Login && (
        <div className="min-h-screen flex items-center justify-center bg-[#0c0a09] relative overflow-hidden">
           <div className="absolute inset-0 bg-noise opacity-20"></div>
           <Auth onLogin={(u) => { setCurrentUser(u); setAppState(AppState.Lobby); }} onGuest={() => { setCurrentUser(null); setAppState(AppState.Lobby); }} />
        </div>
      )}
      {appState === AppState.Lobby && (
        <div className="min-h-screen bg-[#0c0a09] relative">
          <div className="absolute inset-0 bg-noise opacity-15 pointer-events-none"></div>
          <Lobby currentUser={currentUser} onJoinGame={handleJoinGame} onLogout={() => setAppState(AppState.Welcome)} />
        </div>
      )}
      {(appState === AppState.Game || appState === AppState.GameOver) && renderGame()}
    </div>
  );
};

export default App;
