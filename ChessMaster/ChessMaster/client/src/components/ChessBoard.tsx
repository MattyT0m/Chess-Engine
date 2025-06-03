import { Square, PIECE_SYMBOLS } from '../types/chess';
import { useChessGame } from '../hooks/useChessGame';

interface ChessBoardProps {
  gameState: ReturnType<typeof useChessGame>['gameState'];
  onSquareClick: (square: Square) => void;
  validMoves: Square[];
}

export default function ChessBoard({ gameState, onSquareClick, validMoves }: ChessBoardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const isSquareSelected = (row: number, col: number): boolean => {
    return gameState.selectedSquare?.row === row && gameState.selectedSquare?.col === col;
  };

  const isValidMoveSquare = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const getSquareClass = (row: number, col: number): string => {
    const isLight = (row + col) % 2 === 0;
    let classes = `chess-square relative ${isLight ? 'square-light' : 'square-dark'}`;
    
    if (isSquareSelected(row, col)) {
      classes += ' square-selected';
    }
    
    if (isValidMoveSquare(row, col)) {
      classes += ' square-valid-move';
    }
    
    return classes;
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        {/* Board coordinates (top) */}
        <div className="flex mb-2 ml-8">
          <div className="grid grid-cols-8 gap-0 w-80 md:w-96">
            {files.map(file => (
              <div key={file} className="text-center text-sm font-medium text-gray-600">
                {file}
              </div>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* Left coordinates */}
          <div className="flex flex-col justify-around mr-2 w-6">
            {ranks.map(rank => (
              <div 
                key={rank} 
                className="text-center text-sm font-medium text-gray-600 h-10 md:h-12 flex items-center justify-center"
              >
                {rank}
              </div>
            ))}
          </div>
          
          {/* Chess Board Grid */}
          <div className="grid grid-cols-8 gap-0 border-2 border-gray-800 w-80 h-80 md:w-96 md:h-96">
            {gameState.board.map((row, rowIndex) =>
              row.map((piece, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getSquareClass(rowIndex, colIndex)}
                  onClick={() => onSquareClick({ row: rowIndex, col: colIndex })}
                >
                  {piece && (
                    <span className="chess-piece">
                      {PIECE_SYMBOLS[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800 mb-2">
            {gameState.isGameOver 
              ? `Game Over - ${gameState.winner === 'white' ? 'White' : 'Black'} Wins!`
              : gameState.inCheck
              ? `Check! ${gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`
              : `${gameState.currentPlayer === 'white' ? 'White' : 'Black'}'s Turn`
            }
          </div>
          <div className="text-sm text-gray-600">
            {gameState.isGameOver 
              ? 'Click New Game to play again'
              : gameState.selectedSquare 
              ? 'Select destination square' 
              : 'Click a piece to start'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
