import { ChessPiece, Square, PieceColor, Difficulty, PIECE_VALUES } from '../types/chess';
import { getAllValidMoves, isValidMove } from './chessEngine';

export function makeComputerMove(
  board: (ChessPiece | null)[][],
  difficulty: Difficulty,
  playerColor: PieceColor
): { from: Square; to: Square } | null {
  switch (difficulty) {
    case 'easy':
      return getRandomMove(board, playerColor);
    case 'medium':
      return getBestMove(board, playerColor, 2);
    case 'hard':
      return getBestMove(board, playerColor, 4);
    default:
      return getRandomMove(board, playerColor);
  }
}

function getRandomMove(board: (ChessPiece | null)[][], playerColor: PieceColor): { from: Square; to: Square } | null {
  const validMoves = getAllValidMoves(board, playerColor);
  if (validMoves.length === 0) return null;
  
  return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getBestMove(
  board: (ChessPiece | null)[][],
  playerColor: PieceColor,
  depth: number
): { from: Square; to: Square } | null {
  const validMoves = getAllValidMoves(board, playerColor);
  if (validMoves.length === 0) return null;
  
  let bestMove: { from: Square; to: Square } | null = null;
  let bestValue = -Infinity;
  
  for (const move of validMoves) {
    const tempBoard = simulateMove(board, move);
    const value = minimax(tempBoard, depth - 1, -Infinity, Infinity, false, playerColor);
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function minimax(
  board: (ChessPiece | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiColor: PieceColor
): number {
  if (depth === 0) {
    return evaluateBoard(board, aiColor);
  }
  
  const currentPlayerColor = isMaximizing ? aiColor : (aiColor === 'white' ? 'black' : 'white');
  const validMoves = getAllValidMoves(board, currentPlayerColor);
  
  if (validMoves.length === 0) {
    // No valid moves - could be checkmate or stalemate
    return isMaximizing ? -1000 : 1000;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of validMoves) {
      const tempBoard = simulateMove(board, move);
      const evaluation = minimax(tempBoard, depth - 1, alpha, beta, false, aiColor);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of validMoves) {
      const tempBoard = simulateMove(board, move);
      const evaluation = minimax(tempBoard, depth - 1, alpha, beta, true, aiColor);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

function simulateMove(board: (ChessPiece | null)[][], move: { from: Square; to: Square }): (ChessPiece | null)[][] {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;
  return newBoard;
}

function evaluateBoard(board: (ChessPiece | null)[][], aiColor: PieceColor): number {
  let score = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        const multiplier = piece.color === aiColor ? 1 : -1;
        score += value * multiplier;
        
        // Add positional bonuses
        score += getPositionalValue(piece, { row, col }) * multiplier;
      }
    }
  }
  
  return score;
}

function getPositionalValue(piece: ChessPiece, square: Square): number {
  // Simple positional evaluation
  const { row, col } = square;
  const centerDistance = Math.abs(3.5 - row) + Math.abs(3.5 - col);
  
  switch (piece.type) {
    case 'pawn':
      // Pawns are better when advanced
      return piece.color === 'white' ? (6 - row) * 0.1 : (row - 1) * 0.1;
    case 'knight':
    case 'bishop':
      // Knights and bishops are better in the center
      return (7 - centerDistance) * 0.1;
    case 'king':
      // King safety (prefer corners in endgame, but this is simplified)
      return centerDistance * 0.05;
    default:
      return 0;
  }
}
