import { useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useChessGame } from './hooks/useChessGame';
import ChessBoard from './components/ChessBoard';
import GameControls from './components/GameControls';
import { Square, GameMode, Difficulty } from './types/chess';

function ChessApp() {
  const { 
    gameState, 
    makeMove, 
    selectSquare, 
    getValidMoves, 
    startNewGame, 
    undoMove,
    makeComputerMoveAsync 
  } = useChessGame();

  // Get valid moves for selected square
  const validMoves = gameState.selectedSquare ? getValidMoves(gameState.selectedSquare) : [];

  // Handle square clicks
  const handleSquareClick = (square: Square) => {
    const selected = gameState.selectedSquare;
    if (selected && 
        (selected.row !== square.row || selected.col !== square.col)) {
      // Try to make a move
      makeMove(selected, square);
    } else {
      // Select or deselect square
      selectSquare(square);
    }
  };

  // Handle starting new games
  const handleStartNewGame = (mode: GameMode, difficulty?: Difficulty) => {
    startNewGame(mode, difficulty || null);
  };

  // Trigger computer move when it's computer's turn
  useEffect(() => {
    if (gameState.gameMode === 'computer' && 
        gameState.currentPlayer === 'black' && 
        !gameState.isGameOver) {
      makeComputerMoveAsync();
    }
  }, [gameState.currentPlayer, gameState.gameMode, gameState.isGameOver, makeComputerMoveAsync]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chess Game</h1>
          <p className="text-gray-600">Play chess locally or against the computer</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          {/* Game Board */}
          <ChessBoard 
            gameState={gameState}
            onSquareClick={handleSquareClick}
            validMoves={validMoves}
          />

          {/* Game Controls Sidebar */}
          <GameControls 
            gameState={gameState}
            onStartNewGame={handleStartNewGame}
            onUndoMove={undoMove}
          />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ChessApp />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
