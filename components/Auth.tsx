import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onGuest: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onGuest }) => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 5) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('code');
    }, 800);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const mockUser: User = {
        username: `侦探_${phone.slice(-4)}`,
        phoneNumber: phone,
        rank: "幸存者",
        wins: 0
      };
      onLogin(mockUser);
    }, 800);
  };

  return (
    <div className="relative w-full max-w-md mx-auto p-1">
      {/* Paper Stack Effect */}
      <div className="absolute top-2 left-2 w-full h-full bg-[#d6d3d1] rounded shadow-lg rotate-1 z-0"></div>
      <div className="absolute top-1 left-1 w-full h-full bg-[#e5e5e5] rounded shadow-md -rotate-1 z-0"></div>
      
      {/* Main File Content */}
      <div className="relative z-10 paper-texture p-8 md:p-10 rounded shadow-2xl border border-[#a8a29e] text-[#292524] animate-[fadeIn_0.5s_ease-out]">
        
        {/* Stamp */}
        <div className="absolute top-4 right-4 w-20 h-20 border-4 border-red-900/30 rounded-full flex items-center justify-center -rotate-12 pointer-events-none select-none">
          <span className="text-red-900/30 font-bold uppercase text-xs tracking-widest text-center">Identity<br/>Verified</span>
        </div>

        <div className="mb-8 text-center">
          <h2 className="text-3xl gothic-heading text-[#1c1917] mb-2 tracking-widest border-b-2 border-black/80 inline-block pb-1">
            访客登记
          </h2>
          <p className="typewriter text-xs mt-2 text-[#57534e]">CASE FILE NO. 2023-B</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="typewriter text-xs font-bold uppercase">联系方式 / Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号..."
                className="w-full bg-transparent border-b-2 border-[#57534e] p-2 typewriter text-lg text-[#1c1917] placeholder-[#a8a29e] focus:outline-none focus:border-[#b91c1c] transition-colors"
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1c1917] text-[#e7e5e4] py-3 font-serif font-bold uppercase tracking-widest hover:bg-[#44403c] transition-colors shadow-lg clip-path-button"
            >
              {loading ? "查询中..." : "获取密匙"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
             <div className="space-y-1">
              <label className="typewriter text-xs font-bold uppercase">密匙 / Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="1234"
                className="w-full bg-transparent border-b-2 border-[#57534e] p-2 typewriter text-xl text-center text-[#b91c1c] tracking-[1em] focus:outline-none focus:border-[#b91c1c]"
                maxLength={4}
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7f1d1d] text-[#e7e5e4] py-3 font-serif font-bold uppercase tracking-widest hover:bg-[#991b1b] transition-colors shadow-lg"
            >
              {loading ? "解密中..." : "进入庄园"}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs underline typewriter text-[#78716c] hover:text-black"
            >
              返回重置
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button onClick={onGuest} className="typewriter text-xs text-[#78716c] hover:text-[#b91c1c] transition-colors">
            >> 以匿名身份潜入
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;