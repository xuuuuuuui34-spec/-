import { BoardState, Player, CellPosition, GameMode } from '../types';
import { BOARD_SIZE } from '../constants';

export const createInitialBoard = (): BoardState => {
  const board: BoardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(Player.None));
  const mid = BOARD_SIZE / 2;
  board[mid - 1][mid - 1] = Player.White;
  board[mid][mid] = Player.White;
  board[mid - 1][mid] = Player.Black;
  board[mid][mid - 1] = Player.Black;
  return board;
};

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

const isValidPos = (row: number, col: number) => row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;

export const getFlippablePieces = (board: BoardState, player: Player, row: number, col: number): CellPosition[] => {
  if (board[row][col] !== Player.None) return [];

  const opponent = player === Player.Black ? Player.White : Player.Black;
  const flippable: CellPosition[] = [];

  DIRECTIONS.forEach(([dr, dc]) => {
    let r = row + dr;
    let c = col + dc;
    const potentialFlips: CellPosition[] = [];

    while (isValidPos(r, c) && board[r][c] === opponent) {
      potentialFlips.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (isValidPos(r, c) && board[r][c] === player && potentialFlips.length > 0) {
      flippable.push(...potentialFlips);
    }
  });

  return flippable;
};

export const isValidMove = (board: BoardState, player: Player, row: number, col: number): boolean => {
  return getFlippablePieces(board, player, row, col).length > 0;
};

export const getValidMoves = (board: BoardState, player: Player): CellPosition[] => {
  const moves: CellPosition[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (isValidMove(board, player, r, c)) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
};

export const applyMove = (board: BoardState, player: Player, row: number, col: number): BoardState => {
  const newBoard = board.map(row => [...row]);
  const flippable = getFlippablePieces(board, player, row, col);
  
  newBoard[row][col] = player;
  flippable.forEach(({ row: r, col: c }) => {
    newBoard[r][c] = player;
  });

  return newBoard;
};

export const countPieces = (board: BoardState) => {
  let black = 0;
  let white = 0;
  board.forEach(row => row.forEach(cell => {
    if (cell === Player.Black) black++;
    if (cell === Player.White) white++;
  }));
  return { black, white };
};

export const hasValidMoves = (board: BoardState, player: Player): boolean => {
  return getValidMoves(board, player).length > 0;
};
