export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type GameMode = 'twoPlayer' | 'computer';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface Square {
  row: number;
  col: number;
}

export interface Move {
  from: Square;
  to: Square;
  piece: ChessPiece;
  captured?: ChessPiece;
  notation: string;
}

export interface GameState {
  board: (ChessPiece | null)[][];
  currentPlayer: PieceColor;
  selectedSquare: Square | null;
  gameMode: GameMode;
  difficulty: Difficulty | null;
  moveHistory: Move[];
  capturedPieces: ChessPiece[];
  isGameOver: boolean;
  winner: PieceColor | null;
  inCheck: boolean;
  moveCount: number;
}

export const PIECE_SYMBOLS = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
} as const;

export const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0
} as const;
