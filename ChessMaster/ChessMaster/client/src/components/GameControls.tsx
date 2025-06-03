import { GameMode, Difficulty } from '../types/chess';
import { useChessGame } from '../hooks/useChessGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameControlsProps {
  gameState: ReturnType<typeof useChessGame>['gameState'];
  onStartNewGame: (mode: GameMode, difficulty?: Difficulty) => void;
  onUndoMove: () => void;
}

export default function GameControls({ gameState, onStartNewGame, onUndoMove }: GameControlsProps) {
  const formatMoveHistory = () => {
    const moves = [];
    for (let i = 0; i < gameState.moveHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = gameState.moveHistory[i];
      const blackMove = gameState.moveHistory[i + 1];
      
      moves.push({
        number: moveNumber,
        white: whiteMove.notation,
        black: blackMove?.notation || ''
      });
    }
    return moves;
  };

  return (
    <div className="w-full lg:w-80 space-y-6">
      {/* Game Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => onStartNewGame('twoPlayer')}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Two Player Local
          </Button>
          <Button 
            onClick={() => onStartNewGame('computer', 'easy')}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            vs Computer (Easy)
          </Button>
          <Button 
            onClick={() => onStartNewGame('computer', 'medium')}
            className="w-full bg-yellow-600 hover:bg-yellow-700"
          >
            vs Computer (Medium)
          </Button>
          <Button 
            onClick={() => onStartNewGame('computer', 'hard')}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            vs Computer (Hard)
          </Button>
        </CardContent>
      </Card>

      {/* Game Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Game Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => onStartNewGame(gameState.gameMode, gameState.difficulty || undefined)}
            className="w-full bg-gray-600 hover:bg-gray-700"
          >
            New Game
          </Button>
          <Button 
            onClick={onUndoMove}
            disabled={gameState.moveHistory.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400"
          >
            Undo Move
          </Button>
        </CardContent>
      </Card>

      {/* Move History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Move History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {formatMoveHistory().map(move => (
              <div 
                key={move.number} 
                className="text-sm text-gray-600 p-2 rounded hover:bg-gray-50"
              >
                <span className="font-medium">{move.number}.</span> {move.white} {move.black}
              </div>
            ))}
            {gameState.moveHistory.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-4">
                No moves yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Game Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Moves:</span>
            <span className="font-medium">{gameState.moveCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Captures:</span>
            <span className="font-medium">{gameState.capturedPieces.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Game Mode:</span>
            <span className="font-medium">
              {gameState.gameMode === 'twoPlayer' 
                ? 'Two Player' 
                : `vs Computer (${gameState.difficulty})`
              }
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
