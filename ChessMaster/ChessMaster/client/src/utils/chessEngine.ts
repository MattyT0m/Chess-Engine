import { ChessPiece, Square, PieceColor, PieceType } from '../types/chess';

export function initializeBoard(): (ChessPiece | null)[][] {
  const initialBoard: (ChessPiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up black pieces (top)
  const backRank: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    initialBoard[0][col] = { type: backRank[col], color: 'black' };
    initialBoard[1][col] = { type: 'pawn', color: 'black' };
  }
  
  // Set up white pieces (bottom)
  for (let col = 0; col < 8; col++) {
    initialBoard[6][col] = { type: 'pawn', color: 'white' };
    initialBoard[7][col] = { type: backRank[col], color: 'white' };
  }
  
  return initialBoard;
}

export function isValidMove(board: (ChessPiece | null)[][], from: Square, to: Square): boolean {
  const piece = board[from.row][from.col];
  const targetPiece = board[to.row][to.col];
  
  if (!piece) return false;
  if (targetPiece && targetPiece.color === piece.color) return false;
  if (from.row === to.row && from.col === to.col) return false;
  
  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(board, from, to, piece);
    case 'rook':
      return isValidRookMove(board, from, to);
    case 'knight':
      return isValidKnightMove(from, to);
    case 'bishop':
      return isValidBishopMove(board, from, to);
    case 'queen':
      return isValidQueenMove(board, from, to);
    case 'king':
      return isValidKingMove(from, to);
    default:
      return false;
  }
}

function isValidPawnMove(board: (ChessPiece | null)[][], from: Square, to: Square, piece: ChessPiece): boolean {
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);
  
  // Forward move
  if (colDiff === 0) {
    if (rowDiff === direction && !board[to.row][to.col]) {
      return true;
    }
    if (from.row === startRow && rowDiff === 2 * direction && !board[to.row][to.col]) {
      return true;
    }
  }
  
  // Capture
  if (colDiff === 1 && rowDiff === direction && board[to.row][to.col]) {
    return true;
  }
  
  return false;
}

function isValidRookMove(board: (ChessPiece | null)[][], from: Square, to: Square): boolean {
  if (from.row !== to.row && from.col !== to.col) return false;
  return isPathClear(board, from, to);
}

function isValidKnightMove(from: Square, to: Square): boolean {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function isValidBishopMove(board: (ChessPiece | null)[][], from: Square, to: Square): boolean {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  if (rowDiff !== colDiff) return false;
  return isPathClear(board, from, to);
}

function isValidQueenMove(board: (ChessPiece | null)[][], from: Square, to: Square): boolean {
  return isValidRookMove(board, from, to) || isValidBishopMove(board, from, to);
}

function isValidKingMove(from: Square, to: Square): boolean {
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  return rowDiff <= 1 && colDiff <= 1;
}

function isPathClear(board: (ChessPiece | null)[][], from: Square, to: Square): boolean {
  const rowStep = Math.sign(to.row - from.row);
  const colStep = Math.sign(to.col - from.col);
  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;
  
  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
}

export function getAllValidMoves(board: (ChessPiece | null)[][], playerColor: PieceColor): { from: Square; to: Square }[] {
  const moves: { from: Square; to: Square }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === playerColor) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (isValidMove(board, { row, col }, { row: toRow, col: toCol })) {
              moves.push({ from: { row, col }, to: { row: toRow, col: toCol } });
            }
          }
        }
      }
    }
  }
  
  return moves;
}

export function isKingInCheck(board: (ChessPiece | null)[][], playerColor: PieceColor): boolean {
  // Find the king
  let kingPosition: Square | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type === 'king' && piece.color === playerColor) {
        kingPosition = { row, col };
        break;
      }
    }
    if (kingPosition) break;
  }
  
  if (!kingPosition) return false;
  
  // Check if any opponent piece can attack the king
  const opponentColor = playerColor === 'white' ? 'black' : 'white';
  const opponentMoves = getAllValidMoves(board, opponentColor);
  
  return opponentMoves.some(move => 
    move.to.row === kingPosition!.row && move.to.col === kingPosition!.col
  );
}

export function isCheckmate(board: (ChessPiece | null)[][], playerColor: PieceColor): boolean {
  if (!isKingInCheck(board, playerColor)) return false;
  
  const validMoves = getAllValidMoves(board, playerColor);
  
  // Check if any move can get the king out of check
  for (const move of validMoves) {
    const tempBoard = board.map(row => [...row]);
    tempBoard[move.to.row][move.to.col] = tempBoard[move.from.row][move.from.col];
    tempBoard[move.from.row][move.from.col] = null;
    
    if (!isKingInCheck(tempBoard, playerColor)) {
      return false;
    }
  }
  
  return true;
}

export function isStalemate(board: (ChessPiece | null)[][], playerColor: PieceColor): boolean {
  if (isKingInCheck(board, playerColor)) return false;
  
  const validMoves = getAllValidMoves(board, playerColor);
  return validMoves.length === 0;
}

export function squareToAlgebraic(square: Square): string {
  return `${String.fromCharCode(97 + square.col)}${8 - square.row}`;
}

export function algebraicToSquare(algebraic: string): Square {
  return {
    row: 8 - parseInt(algebraic[1]),
    col: algebraic.charCodeAt(0) - 97
  };
}
