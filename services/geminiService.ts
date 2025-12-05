import { GoogleGenAI, Type } from "@google/genai";
import { BoardState, Player, CellPosition } from '../types';
import { getValidMoves } from '../utils/gameLogic';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBestMove = async (
  board: BoardState, 
  player: Player,
  difficulty: 'easy' | 'hard' = 'hard'
): Promise<CellPosition> => {
  const validMoves = getValidMoves(board, player);
  if (validMoves.length === 0) {
    throw new Error("No valid moves available for AI");
  }
  
  // For 'easy' difficulty, we just return a random valid move to save tokens/latency
  if (difficulty === 'easy') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // Serialize board for the prompt
  const boardStr = board.map(row => 
    row.map(cell => cell === Player.Black ? 'B' : cell === Player.White ? 'W' : '.').join(' ')
  ).join('\n');

  const playerStr = player === Player.Black ? 'Black' : 'White';

  const prompt = `
    You are an expert Reversi (Othello) player. 
    Current Board State (B=Black, W=White, .=Empty):
    ${boardStr}

    You are playing as ${playerStr}.
    Available valid moves (row, col) 0-indexed:
    ${JSON.stringify(validMoves)}

    Analyze the board. Prioritize corners, stability, and mobility.
    Return the JSON object of the best move: { "row": number, "col": number }.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            row: { type: Type.INTEGER },
            col: { type: Type.INTEGER }
          },
          required: ["row", "col"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const move = JSON.parse(text) as CellPosition;
    
    // Fallback verification
    const isValid = validMoves.some(m => m.row === move.row && m.col === move.col);
    return isValid ? move : validMoves[0];

  } catch (error) {
    console.error("Gemini AI error, falling back to random move:", error);
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }
};
