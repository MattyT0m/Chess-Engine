import { Chess } from 'chess.js';

const room = new WebsimSocket();
let game = new Chess();
let selectedSquare = null;
let isComputerGame = false;
let computerLevel = null;
let playerColor = 'w';

await room.initialize();

function createBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  for (let i = 0; i < 64; i++) {
    const square = document.createElement('div');
    const row = Math.floor(i / 8);
    const col = i % 8;
    square.className = `square ${(row + col) % 2 ? 'black' : 'white'}`;
    square.setAttribute('data-square', algebraicNotation(row, col));
    square.addEventListener('click', handleSquareClick);
    board.appendChild(square);
  }
  updateBoard();
}

function algebraicNotation(row, col) {
  return `${String.fromCharCode(97 + col)}${8 - row}`;
}

function updateBoard() {
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    const pos = square.getAttribute('data-square');
    const piece = game.get(pos);
    square.textContent = piece ? getPieceSymbol(piece) : '';
    square.className = `square ${(parseInt(pos[1]) + pos.charCodeAt(0)) % 2 ? 'black' : 'white'}`;
    if (pos === selectedSquare) {
      square.classList.add('selected');
    }
  });
  
  document.getElementById('status').textContent = getGameStatus();
}

function getPieceSymbol(piece) {
  const symbols = {
    'p': '♟', 'P': '♙',
    'n': '♞', 'N': '♘',
    'b': '♝', 'B': '♗',
    'r': '♜', 'R': '♖',
    'q': '♛', 'Q': '♕',
    'k': '♚', 'K': '♔'
  };
  return symbols[piece.color === 'w' ? piece.type.toUpperCase() : piece.type];
}

function getGameStatus() {
  if (game.isCheckmate()) return 'Checkmate!';
  if (game.isDraw()) return 'Draw!';
  if (game.isCheck()) return 'Check!';
  return `${game.turn() === 'w' ? 'White' : 'Black'}'s turn`;
}

function handleSquareClick(event) {
  const square = event.target.getAttribute('data-square');
  
  if (!isComputerGame || (isComputerGame && game.turn() === playerColor)) {
    if (selectedSquare === null) {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        selectedSquare = square;
        showValidMoves(square);
      }
    } else {
      makeMove(selectedSquare, square);
      selectedSquare = null;
    }
    updateBoard();
  }
}

function showValidMoves(square) {
  const moves = game.moves({ square, verbose: true });
  const squares = document.querySelectorAll('.square');
  squares.forEach(sq => {
    if (moves.some(move => move.to === sq.getAttribute('data-square'))) {
      sq.classList.add('valid-move');
    }
  });
}

function makeMove(from, to) {
  try {
    const move = game.move({ from, to, promotion: 'q' });
    if (move) {
      if (isComputerGame) {
        setTimeout(makeComputerMove, 500);
      } else {
        // Send move to other players in multiplayer
        room.updateRoomState({ lastMove: { from, to } });
      }
    }
  } catch (e) {
    console.error(e);
  }
  
  const squares = document.querySelectorAll('.square');
  squares.forEach(sq => sq.classList.remove('valid-move'));
}

function makeComputerMove() {
  if (game.isGameOver()) return;
  
  const moves = game.moves();
  let move;
  
  switch (computerLevel) {
    case 'easy':
      move = moves[Math.floor(Math.random() * moves.length)];
      break;
    case 'medium':
      // Simple evaluation based on material
      move = getBestMove(2);
      break;
    case 'hard':
      // Deeper search
      move = getBestMove(4);
      break;
  }
  
  if (move) {
    game.move(move);
    updateBoard();
  }
}

function getBestMove(depth) {
  const moves = game.moves();
  let bestMove = null;
  let bestValue = -9999;
  
  for (const move of moves) {
    game.move(move);
    const evaluation = -minimax(depth - 1, -10000, 10000, false);
    game.undo();
    
    if (evaluation >= bestValue) {
      bestValue = evaluation;
      bestMove = move;
    }
  }
  
  return bestMove;
}

function minimax(depth, alpha, beta, isMaximizing) {
  if (depth === 0) return evaluateBoard();
  
  const moves = game.moves();
  
  if (isMaximizing) {
    let maxEval = -9999;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = 9999;
    for (const move of moves) {
      game.move(move);
      const evaluation = minimax(depth - 1, alpha, beta, true);
      game.undo();
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function evaluateBoard() {
  const pieceValues = {
    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
  };
  
  let score = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const square = algebraicNotation(i, j);
      const piece = game.get(square);
      if (piece) {
        const value = pieceValues[piece.type.toLowerCase()];
        score += piece.color === 'w' ? value : -value;
      }
    }
  }
  return score;
}

window.startMultiplayer = () => {
  game = new Chess();
  isComputerGame = false;
  computerLevel = null;
  selectedSquare = null;
  createBoard();
  
  // Subscribe to room state changes for multiplayer moves
  room.subscribeRoomState((state) => {
    if (state.lastMove && state.lastMove !== room.roomState.lastMove) {
      game.move({ from: state.lastMove.from, to: state.lastMove.to, promotion: 'q' });
      updateBoard();
    }
  });
};

window.startComputerGame = (level) => {
  game = new Chess();
  isComputerGame = true;
  computerLevel = level;
  selectedSquare = null;
  playerColor = 'w';  // Player always plays as white
  createBoard();
};

// Initial setup
createBoard();