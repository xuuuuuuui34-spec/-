export enum Player {
  None = 0,
  Black = 1, // Usually moves first
  White = 2,
}

export enum GameMode {
  Local = 'LOCAL',
  Online = 'ONLINE', // Simulated
  AI = 'AI',
}

export enum AppState {
  Welcome = 'WELCOME',
  Login = 'LOGIN',
  Lobby = 'LOBBY',
  Game = 'GAME',
  GameOver = 'GAMEOVER',
}

export interface CellPosition {
  row: number;
  col: number;
}

export type BoardState = Player[][];

export interface Theme {
  id: string;
  name: string;
  blackPiece: string; // CSS Class or SVG path description
  whitePiece: string;
  boardBg: string;
  cellBg: string;
  accent: string;
}

export interface User {
  username: string;
  phoneNumber: string;
  rank: string;
  wins: number;
}
