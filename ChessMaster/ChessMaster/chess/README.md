# Chess Game

A complete chess game implementation with AI opponent and beautiful graphics.

## Features

- **Two Player Mode**: Play locally with a friend
- **Computer AI**: Three difficulty levels (Easy, Medium, Hard)
- **Move Validation**: Complete chess rules implementation
- **Visual Feedback**: Highlighted valid moves and selected pieces
- **Move History**: Track all moves made during the game
- **Undo Function**: Take back moves when needed
- **Responsive Design**: Works on desktop and mobile devices

## Files

- `index.html` - Main game interface
- `chess.js` - Complete chess engine and AI implementation
- `img/` - Chess piece graphics (SVG format)
  - All 12 chess pieces in both white and black colors

## How to Play

1. Open `index.html` in any modern web browser
2. Choose your game mode:
   - **Two Player**: Play against another person
   - **vs Computer (Easy)**: Random moves
   - **vs Computer (Medium)**: 2-move lookahead
   - **vs Computer (Hard)**: 4-move lookahead with advanced evaluation
3. Click on a piece to select it
4. Valid moves will be highlighted in green
5. Click on a highlighted square to move
6. Use the "Undo Move" button to take back moves
7. Start a "New Game" at any time

## Game Rules

All standard chess rules are implemented:
- Piece movement (pawns, rooks, knights, bishops, queens, kings)
- Pawn special moves (two-square first move, diagonal capture)
- Check and checkmate detection
- Stalemate detection

## Technical Details

- Pure JavaScript implementation
- No external dependencies
- SVG graphics for crisp piece rendering
- Minimax algorithm with alpha-beta pruning for AI
- Responsive CSS design
- Local storage not required - fully self-contained

## Browser Compatibility

Works in all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Installation

No installation required! Simply download all files and open `index.html` in your browser.

Enjoy playing chess!