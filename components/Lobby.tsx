import React, { useEffect, useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';

interface LobbyProps {
  currentUser: User | null;
  onJoinGame: (opponentName?: string, isAI?: boolean) => void;
  onLogout: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ currentUser, onJoinGame, onLogout }) => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => prev.map(u => Math.random() > 0.8 ? { ...u, wins: u.wins + 1 } : u));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickMatch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      const randomOpponent = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
      onJoinGame(randomOpponent.username, true); 
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b-2 border-[#44403c] pb-4 gap-4">
        <div>
          <h2 className="text-4xl gothic-heading text-[#d6d3d1] tracking-widest drop-shadow-lg">
            庄园大厅
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500/50 rounded-full animate-pulse"></div>
            <p className="typewriter text-[#a8a29e] text-sm">
              当前身份: <span className="text-[#e7e5e4] border-b border-[#78716c]">{currentUser?.username || "未知访客"}</span>
            </p>
          </div>
        </div>
        <button onClick={onLogout} className="text-xs text-[#78716c] hover:text-white transition-colors uppercase tracking-widest border border-[#44403c] px-3 py-1">
          [ 离开庄园 ]
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Match Card */}
          <div className="group relative bg-[#1c1917] p-1 stitch-border transition-transform hover:-translate-y-1">
            <div className="bg-[#292524] p-6 flex flex-col items-center text-center space-y-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-noise opacity-30"></div>
              <h3 className="text-2xl gothic-heading text-[#e7e5e4] z-10">随机匹配</h3>
              <p className="text-[#a8a29e] text-xs font-serif z-10">在迷雾中寻找你的宿命对手。</p>
              <button
                onClick={handleQuickMatch}
                disabled={searching}
                className={`
                  w-full py-3 mt-4 bg-[#450a0a] text-[#fecaca] font-bold uppercase tracking-widest
                  border border-[#7f1d1d] hover:bg-[#7f1d1d] transition-all z-10
                  ${searching ? 'cursor-wait opacity-80' : ''}
                `}
              >
                {searching ? "搜寻信号..." : "开始匹配"}
              </button>
            </div>
          </div>

          {/* Local Game Card */}
          <div className="group relative bg-[#1c1917] p-1 border border-[#44403c] transition-transform hover:-translate-y-1">
             <div className="bg-[#292524]/50 p-6 flex flex-col items-center text-center space-y-3">
              <h3 className="text-xl gothic-heading text-[#d6d3d1]">面对面推理</h3>
              <p className="text-[#78716c] text-xs font-serif">与身边的伙伴进行一场博弈。</p>
              <button
                onClick={() => onJoinGame(undefined, false)}
                className="w-full py-2 border border-[#57534e] text-[#a8a29e] hover:text-[#e7e5e4] hover:border-[#d6d3d1] transition-all uppercase text-xs"
              >
                双人模式
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: User List (The "Notebook" look) */}
        <div className="lg:col-span-8 relative">
          <div className="absolute -top-2 -left-2 w-full h-full bg-[#1c1917] border border-[#292524] rotate-1 z-0"></div>
          <div className="relative z-10 paper-texture p-6 min-h-[400px] text-[#292524] shadow-xl">
            <h3 className="gothic-heading text-xl mb-4 border-b-2 border-black/20 pb-2 text-[#450a0a]">
              大厅名单 <span className="text-sm font-normal text-[#57534e] ml-2 typewriter">(RECORD)</span>
            </h3>
            
            <div className="space-y-0">
              {users.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-b border-dashed border-[#a8a29e] hover:bg-black/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#292524] rounded-full flex items-center justify-center text-white font-serif border-2 border-[#57534e] shadow-sm">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1c1917] font-serif">{user.username}</p>
                      <p className="text-xs typewriter text-[#57534e]">{user.rank}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-bold text-[#b45309]">{user.wins} 胜</span>
                     <button 
                       onClick={() => onJoinGame(user.username, true)}
                       className="px-3 py-1 border border-[#1c1917] text-[#1c1917] text-xs hover:bg-[#1c1917] hover:text-[#e7e5e4] transition-colors uppercase"
                     >
                       挑战
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;