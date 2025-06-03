// Chess Game Implementation
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameMode = 'multiplayer';
        this.difficulty = null;
        this.moveHistory = [];
        this.capturedPieces = [];
        this.isGameOver = false;
        this.winner = null;
        this.inCheck = false;
        this.moveCount = 0;
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up black pieces (top)
        const backRank = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let col = 0; col < 8; col++) {
            board[0][col] = { type: backRank[col], color: 'black' };
            board[1][col] = { type: 'pawn', color: 'black' };
        }
        
        // Set up white pieces (bottom)
        for (let col = 0; col < 8; col++) {
            board[6][col] = { type: 'pawn', color: 'white' };
            board[7][col] = { type: backRank[col], color: 'white' };
        }
        
        return board;
    }

    getPieceSymbol(piece) {
        const symbols = {
            white: {
                king: '♔', queen: '♕', rook: '♖',
                bishop: '♗', knight: '♘', pawn: '♙'
            },
            black: {
                king: '♚', queen: '♛', rook: '♜',
                bishop: '♝', knight: '♞', pawn: '♟'
            }
        };
        return symbols[piece.color][piece.type];
    }

    createBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.getPieceSymbol(piece);
                }
                
                boardElement.appendChild(square);
            }
        }
        this.updateBoardDisplay();
        this.updateDisplay();
    }

    updateBoardDisplay() {
        const squares = document.querySelectorAll('.square');
        
        squares.forEach((square, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const piece = this.board[row][col];
            
            // Clear existing piece
            square.textContent = '';
            
            // Add piece if present
            if (piece) {
                square.textContent = this.getPieceSymbol(piece);
            }
            
            // Reset square color classes
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            
            // Re-add selection and valid move highlights if needed
            if (this.selectedSquare && this.selectedSquare.row === row && this.selectedSquare.col === col) {
                square.classList.add('selected');
            }
        });
    }

    handleSquareClick(row, col) {
        if (this.isGameOver) return;
        
        // If computer game and it's computer's turn, ignore clicks
        if (this.gameMode === 'computer' && this.currentPlayer === 'black') {
            return;
        }

        const clickedSquare = { row, col };
        
        if (this.selectedSquare === null) {
            // Select a piece
            const piece = this.board[row][col];
            if (piece && piece.color === this.currentPlayer) {
                this.selectedSquare = clickedSquare;
                this.showValidMoves(row, col);
            }
        } else {
            // Try to move or deselect
            if (this.selectedSquare.row === row && this.selectedSquare.col === col) {
                // Deselect
                this.selectedSquare = null;
                this.clearHighlights();
            } else {
                // Try to move
                if (this.isValidMove(this.selectedSquare, clickedSquare)) {
                    this.makeMove(this.selectedSquare, clickedSquare);
                } else {
                    // Invalid move - select new piece if it's the current player's piece
                    const piece = this.board[row][col];
                    if (piece && piece.color === this.currentPlayer) {
                        this.selectedSquare = clickedSquare;
                        this.clearHighlights();
                        this.showValidMoves(row, col);
                    } else {
                        this.selectedSquare = null;
                        this.clearHighlights();
                    }
                }
            }
        }
        this.updateDisplay();
    }

    isValidMove(from, to) {
        const piece = this.board[from.row][from.col];
        const targetPiece = this.board[to.row][to.col];
        
        if (!piece) return false;
        if (targetPiece && targetPiece.color === piece.color) return false;
        if (from.row === to.row && from.col === to.col) return false;
        
        // Check piece-specific movement rules
        switch (piece.type) {
            case 'pawn':
                return this.isValidPawnMove(from, to, piece);
            case 'rook':
                return this.isValidRookMove(from, to);
            case 'knight':
                return this.isValidKnightMove(from, to);
            case 'bishop':
                return this.isValidBishopMove(from, to);
            case 'queen':
                return this.isValidQueenMove(from, to);
            case 'king':
                return this.isValidKingMove(from, to);
            default:
                return false;
        }
    }

    isValidPawnMove(from, to, piece) {
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        const rowDiff = to.row - from.row;
        const colDiff = Math.abs(to.col - from.col);
        
        // Forward move
        if (colDiff === 0) {
            if (rowDiff === direction && !this.board[to.row][to.col]) {
                return true;
            }
            if (from.row === startRow && rowDiff === 2 * direction && !this.board[to.row][to.col]) {
                return true;
            }
        }
        
        // Capture
        if (colDiff === 1 && rowDiff === direction && this.board[to.row][to.col]) {
            return true;
        }
        
        return false;
    }

    isValidRookMove(from, to) {
        if (from.row !== to.row && from.col !== to.col) return false;
        return this.isPathClear(from, to);
    }

    isValidKnightMove(from, to) {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }

    isValidBishopMove(from, to) {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
        // Must move diagonally (equal row and column differences)
        if (rowDiff !== colDiff || rowDiff === 0) return false;
        return this.isPathClear(from, to);
    }

    isValidQueenMove(from, to) {
        return this.isValidRookMove(from, to) || this.isValidBishopMove(from, to);
    }

    isValidKingMove(from, to) {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
        return rowDiff <= 1 && colDiff <= 1;
    }

    isPathClear(from, to) {
        const rowStep = Math.sign(to.row - from.row);
        const colStep = Math.sign(to.col - from.col);
        let currentRow = from.row + rowStep;
        let currentCol = from.col + colStep;
        
        while (currentRow !== to.row || currentCol !== to.col) {
            if (this.board[currentRow][currentCol] !== null) {
                return false;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    getAllValidMoves(playerColor) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === playerColor) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove({ row, col }, { row: toRow, col: toCol })) {
                                moves.push({ from: { row, col }, to: { row: toRow, col: toCol } });
                            }
                        }
                    }
                }
            }
        }
        
        return moves;
    }

    showValidMoves(row, col) {
        this.clearHighlights();
        const squares = document.querySelectorAll('.square');
        
        // Highlight selected square
        const selectedIndex = row * 8 + col;
        squares[selectedIndex].classList.add('selected');
        
        // Highlight valid moves
        for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
                if (this.isValidMove({ row, col }, { row: toRow, col: toCol })) {
                    const targetIndex = toRow * 8 + toCol;
                    squares[targetIndex].classList.add('valid-move');
                }
            }
        }
    }

    clearHighlights() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
    }

    makeMove(from, to) {
        const piece = this.board[from.row][from.col];
        const capturedPiece = this.board[to.row][to.col];
        
        // Create move notation
        const fromNotation = this.squareToAlgebraic(from);
        const toNotation = this.squareToAlgebraic(to);
        const moveNotation = `${fromNotation}-${toNotation}`;
        
        // Make the move
        this.board[to.row][to.col] = piece;
        this.board[from.row][from.col] = null;
        
        // Update captured pieces
        if (capturedPiece) {
            this.capturedPieces.push(capturedPiece);
        }
        
        // Add to move history
        this.moveHistory.push({
            from, to, piece, captured: capturedPiece, notation: moveNotation
        });
        
        this.moveCount++;
        this.selectedSquare = null;
        this.clearHighlights();
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Check game state
        this.checkGameState();
        
        // Update the board display immediately
        this.updateBoardDisplay();
        this.updateDisplay();
        
        // Make computer move if needed
        if (this.gameMode === 'computer' && this.currentPlayer === 'black' && !this.isGameOver) {
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }

    makeComputerMove() {
        if (this.isGameOver) return;
        
        const moves = this.getAllValidMoves('black');
        if (moves.length === 0) return;
        
        let selectedMove;
        
        switch (this.difficulty) {
            case 'easy':
                selectedMove = moves[Math.floor(Math.random() * moves.length)];
                break;
            case 'medium':
                selectedMove = this.getBestMove(2);
                break;
            case 'hard':
                selectedMove = this.getBestMove(4);
                break;
            default:
                selectedMove = moves[Math.floor(Math.random() * moves.length)];
        }
        
        if (selectedMove) {
            this.makeMove(selectedMove.from, selectedMove.to);
        }
    }

    getBestMove(depth) {
        const moves = this.getAllValidMoves('black');
        let bestMove = null;
        let bestValue = -Infinity;
        
        for (const move of moves) {
            const tempBoard = this.board.map(row => [...row]);
            this.simulateMove(move);
            const value = this.minimax(depth - 1, -Infinity, Infinity, false);
            this.board = tempBoard;
            
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard();
        }
        
        const currentPlayerColor = isMaximizing ? 'black' : 'white';
        const moves = this.getAllValidMoves(currentPlayerColor);
        
        if (moves.length === 0) {
            return isMaximizing ? -1000 : 1000;
        }
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const tempBoard = this.board.map(row => [...row]);
                this.simulateMove(move);
                const evaluation = this.minimax(depth - 1, alpha, beta, false);
                this.board = tempBoard;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const tempBoard = this.board.map(row => [...row]);
                this.simulateMove(move);
                const evaluation = this.minimax(depth - 1, alpha, beta, true);
                this.board = tempBoard;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    simulateMove(move) {
        this.board[move.to.row][move.to.col] = this.board[move.from.row][move.from.col];
        this.board[move.from.row][move.from.col] = null;
    }

    evaluateBoard() {
        const pieceValues = {
            pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0
        };
        
        let score = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const value = pieceValues[piece.type];
                    score += piece.color === 'black' ? value : -value;
                }
            }
        }
        return score;
    }

    checkGameState() {
        const moves = this.getAllValidMoves(this.currentPlayer);
        if (moves.length === 0) {
            this.isGameOver = true;
            this.winner = this.currentPlayer === 'white' ? 'black' : 'white';
        }
    }

    squareToAlgebraic(square) {
        return `${String.fromCharCode(97 + square.col)}${8 - square.row}`;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        
        // Restore the piece to its original position
        this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
        this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured || null;
        
        // Remove captured piece from captured pieces array
        if (lastMove.captured) {
            this.capturedPieces.pop();
        }
        
        this.moveCount--;
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        this.isGameOver = false;
        this.winner = null;
        this.selectedSquare = null;
        this.clearHighlights();
        
        // Update the board display immediately
        this.updateBoardDisplay();
        this.updateDisplay();
    }

    updateDisplay() {
        // Update status
        const statusElement = document.getElementById('gameStatus');
        const modeElement = document.getElementById('gameMode');
        const instructionElement = document.getElementById('gameInstruction');
        
        if (this.isGameOver) {
            statusElement.textContent = `Game Over - ${this.winner === 'white' ? 'White' : 'Black'} Wins!`;
            instructionElement.textContent = 'Click New Game to play again';
        } else {
            statusElement.textContent = `${this.currentPlayer === 'white' ? 'White' : 'Black'} to move`;
            instructionElement.textContent = this.selectedSquare ? 'Select destination square' : 'Click a piece to start';
        }
        
        if (this.gameMode === 'multiplayer') {
            modeElement.textContent = 'Two Player Mode';
        } else {
            modeElement.textContent = `vs Computer (${this.difficulty})`;
        }
        
        // Update info cards
        document.getElementById('moveCount').textContent = this.moveCount;
        document.getElementById('captureCount').textContent = this.capturedPieces.length;
        document.getElementById('currentMode').textContent = this.gameMode === 'multiplayer' ? 'Two Player' : `vs Computer (${this.difficulty})`;
        
        // Update move history
        const historyElement = document.getElementById('moveHistory');
        if (this.moveHistory.length === 0) {
            historyElement.textContent = 'No moves yet';
        } else {
            const moves = [];
            for (let i = 0; i < this.moveHistory.length; i += 2) {
                const moveNumber = Math.floor(i / 2) + 1;
                const whiteMove = this.moveHistory[i];
                const blackMove = this.moveHistory[i + 1];
                
                moves.push(`${moveNumber}. ${whiteMove.notation} ${blackMove ? blackMove.notation : ''}`);
            }
            historyElement.innerHTML = moves.join('<br>');
        }
        
        // Update undo button
        document.getElementById('undoBtn').disabled = this.moveHistory.length === 0;
    }
}

// Global game instance
let game = new ChessGame();

// Game control functions
function startGame(mode, difficulty = null) {
    game = new ChessGame();
    game.gameMode = mode;
    game.difficulty = difficulty;
    game.createBoard();
}

function newGame() {
    startGame(game.gameMode, game.difficulty);
}

function undoMove() {
    game.undoMove();
}

// Initialize the game
window.addEventListener('load', () => {
    game.createBoard();
});