import { Theme } from './types';

export const BOARD_SIZE = 8;

// 第五人格风格主题定义
export const THEMES: Theme[] = [
  {
    id: 'ragdoll',
    name: '缝合玩偶',
    // 纽扣风格：黑色纽扣 vs 白色纽扣，带有缝线孔细节
    blackPiece: 'button-black',
    whitePiece: 'button-white',
    boardBg: 'bg-[#292524]', // Stone-800
    cellBg: 'bg-[#1c1917] border-[#44403c]', // Stone-900 border-Stone-700
    accent: 'text-amber-600',
  },
  {
    id: 'amber',
    name: '远古琥珀',
    // 晶莹剔透，内部有杂质
    blackPiece: 'amber-dark',
    whitePiece: 'amber-light',
    boardBg: 'bg-[#1a0f0a]', // Very dark brown
    cellBg: 'bg-[#27150c] border-[#451a03]', 
    accent: 'text-orange-500',
  },
  {
    id: 'coin',
    name: '庄园金币',
    // 金属浮雕感
    blackPiece: 'coin-gold',
    whitePiece: 'coin-silver',
    boardBg: 'bg-[#0f172a]', // Slate-900
    cellBg: 'bg-[#1e293b] border-[#334155]',
    accent: 'text-yellow-500',
  },
  {
    id: 'rose',
    name: '血色玫瑰',
    // 鲜艳的红与苍白的白
    blackPiece: 'rose-red',
    whitePiece: 'rose-white',
    boardBg: 'bg-[#2a0a0a]',
    cellBg: 'bg-[#450a0a] border-[#7f1d1d]',
    accent: 'text-rose-600',
  },
];

export const MOCK_USERS = [
  { username: "侦探_奥尔菲斯", rank: "求生者 V", wins: 142 },
  { username: "监管者_杰克", rank: "恶梦 I", wins: 320 },
  { username: "园丁_艾玛", rank: "求生者 III", wins: 45 },
  { username: "调香师_薇拉", rank: "求生者 II", wins: 89 },
  { username: "红蝶_美智子", rank: "恶梦 III", wins: 210 },
];