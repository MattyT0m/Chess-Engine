import { useState, useCallback } from 'react';
import { GameState, Square, Move, GameMode, Difficulty, ChessPiece } from '../types/chess';
import { 
  initializeBoard, 
  isValidMove, 
  getAllValidMoves, 
  isCheckmate, 
  isStalemate,
  isKingInCheck,
  squareToAlgebraic 
} from '../utils/chessEngine';
import { makeComputerMove } from '../utils/chessAI';

export function useChessGame() {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: initializeBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    gameMode: 'twoPlayer',
    difficulty: null,
    moveHistory: [],
    capturedPieces: [],
    isGameOver: false,
    winner: null,
    inCheck: false,
    moveCount: 0
  }));

  const checkGameState = useCallback((board: (ChessPiece | null)[][], currentPlayer: 'white' | 'black') => {
    const inCheck = isKingInCheck(board, currentPlayer);
    const isCheckmateSituation = isCheckmate(board, currentPlayer);
    const isStalemateSituation = isStalemate(board, currentPlayer);
    
    return {
      inCheck,
      isGameOver: isCheckmateSituation || isStalemateSituation,
      winner: isCheckmateSituation ? (currentPlayer === 'white' ? 'black' : 'white') : null
    };
  }, []);

  const makeMove = useCallback((from: Square, to: Square) => {
    setGameState(prev => {
      if (!isValidMove(prev.board, from, to)) {
        return prev;
      }

      const piece = prev.board[from.row][from.col];
      const capturedPiece = prev.board[to.row][to.col];
      
      if (!piece || piece.color !== prev.currentPlayer) {
        return prev;
      }

      // Create new board
      const newBoard = prev.board.map(row => [...row]);
      newBoard[to.row][to.col] = piece;
      newBoard[from.row][from.col] = null;

      // Create move notation
      const moveNotation = `${squareToAlgebraic(from)}-${squareToAlgebraic(to)}`;
      
      // Create move object
      const move: Move = {
        from,
        to,
        piece,
        captured: capturedPiece || undefined,
        notation: moveNotation
      };

      // Update captured pieces
      const newCapturedPieces = [...prev.capturedPieces];
      if (capturedPiece) {
        newCapturedPieces.push(capturedPiece);
      }

      // Switch players
      const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white';
      
      // Check game state
      const gameStatus = checkGameState(newBoard, nextPlayer);

      return {
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedSquare: null,
        moveHistory: [...prev.moveHistory, move],
        capturedPieces: newCapturedPieces,
        moveCount: prev.moveCount + 1,
        inCheck: gameStatus.inCheck,
        isGameOver: gameStatus.isGameOver,
        winner: gameStatus.winner
      };
    });
  }, [checkGameState]);

  const makeComputerMoveAsync = useCallback(() => {
    setTimeout(() => {
      setGameState(prev => {
        if (prev.isGameOver || prev.gameMode === 'twoPlayer' || !prev.difficulty) {
          return prev;
        }

        const move = makeComputerMove(prev.board, prev.difficulty, prev.currentPlayer);
        if (!move) return prev;

        const piece = prev.board[move.from.row][move.from.col];
        const capturedPiece = prev.board[move.to.row][move.to.col];
        
        if (!piece) return prev;

        // Create new board
        const newBoard = prev.board.map(row => [...row]);
        newBoard[move.to.row][move.to.col] = piece;
        newBoard[move.from.row][move.from.col] = null;

        // Create move notation
        const moveNotation = `${squareToAlgebraic(move.from)}-${squareToAlgebraic(move.to)}`;
        
        // Create move object
        const moveObj: Move = {
          from: move.from,
          to: move.to,
          piece,
          captured: capturedPiece || undefined,
          notation: moveNotation
        };

        // Update captured pieces
        const newCapturedPieces = [...prev.capturedPieces];
        if (capturedPiece) {
          newCapturedPieces.push(capturedPiece);
        }

        // Switch players
        const nextPlayer = prev.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check game state
        const gameStatus = checkGameState(newBoard, nextPlayer);

        return {
          ...prev,
          board: newBoard,
          currentPlayer: nextPlayer,
          selectedSquare: null,
          moveHistory: [...prev.moveHistory, moveObj],
          capturedPieces: newCapturedPieces,
          moveCount: prev.moveCount + 1,
          inCheck: gameStatus.inCheck,
          isGameOver: gameStatus.isGameOver,
          winner: gameStatus.winner
        };
      });
    }, 500);
  }, [checkGameState]);

  const selectSquare = useCallback((square: Square) => {
    setGameState(prev => {
      if (prev.isGameOver) return prev;
      
      // If computer game and it's computer's turn, ignore clicks
      if (prev.gameMode === 'computer' && prev.currentPlayer === 'black') {
        return prev;
      }

      const piece = prev.board[square.row][square.col];
      
      if (prev.selectedSquare === null) {
        // Select a piece
        if (piece && piece.color === prev.currentPlayer) {
          return { ...prev, selectedSquare: square };
        }
        return prev;
      } else {
        // Try to move or deselect
        if (prev.selectedSquare.row === square.row && prev.selectedSquare.col === square.col) {
          // Deselect
          return { ...prev, selectedSquare: null };
        } else {
          // Try to move
          const isValid = isValidMove(prev.board, prev.selectedSquare, square);
          if (isValid) {
            // Move will be handled by makeMove
            return prev;
          } else {
            // Invalid move - select new piece if it's the current player's piece
            if (piece && piece.color === prev.currentPlayer) {
              return { ...prev, selectedSquare: square };
            } else {
              return { ...prev, selectedSquare: null };
            }
          }
        }
      }
    });
  }, []);

  const getValidMoves = useCallback((square: Square): Square[] => {
    const piece = gameState.board[square.row][square.col];
    if (!piece || piece.color !== gameState.currentPlayer) return [];
    
    const allMoves = getAllValidMoves(gameState.board, piece.color);
    return allMoves
      .filter(move => move.from.row === square.row && move.from.col === square.col)
      .map(move => move.to);
  }, [gameState.board, gameState.currentPlayer]);

  const startNewGame = useCallback((mode: GameMode = 'twoPlayer', difficulty: Difficulty | null = null) => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      gameMode: mode,
      difficulty,
      moveHistory: [],
      capturedPieces: [],
      isGameOver: false,
      winner: null,
      inCheck: false,
      moveCount: 0
    });
  }, []);

  const undoMove = useCallback(() => {
    setGameState(prev => {
      if (prev.moveHistory.length === 0) return prev;
      
      const lastMove = prev.moveHistory[prev.moveHistory.length - 1];
      const newBoard = prev.board.map(row => [...row]);
      
      // Restore the piece to its original position
      newBoard[lastMove.from.row][lastMove.from.col] = lastMove.piece;
      newBoard[lastMove.to.row][lastMove.to.col] = lastMove.captured || null;
      
      // Remove captured piece from captured pieces array
      const newCapturedPieces = [...prev.capturedPieces];
      if (lastMove.captured) {
        newCapturedPieces.pop();
      }
      
      // Switch players back
      const previousPlayer = prev.currentPlayer === 'white' ? 'black' : 'white';
      
      // Check game state for the previous player
      const gameStatus = checkGameState(newBoard, previousPlayer);
      
      return {
        ...prev,
        board: newBoard,
        currentPlayer: previousPlayer,
        selectedSquare: null,
        moveHistory: prev.moveHistory.slice(0, -1),
        capturedPieces: newCapturedPieces,
        moveCount: prev.moveCount - 1,
        inCheck: gameStatus.inCheck,
        isGameOver: gameStatus.isGameOver,
        winner: gameStatus.winner
      };
    });
  }, [checkGameState]);

  return {
    gameState,
    makeMove,
    selectSquare,
    getValidMoves,
    startNewGame,
    undoMove,
    makeComputerMoveAsync
  };
}
