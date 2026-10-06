# Voice-Enabled Chess

A lightweight browser-based chess game with voice command support. Players can move pieces using the mouse or by speaking commands, and the app tracks move history while the computer makes random moves for the opponent.

## Live demo

Open the project in a browser and run the app from the `min project 2` folder.

## Features

- Chess board UI with draggable pieces
- Voice recognition for move commands
- Move history panel
- Play again reset option
- Random computer opponent
- Responsive single-page web app

## Tech Stack

- HTML
- CSS
- JavaScript
- Chessboard.js
- Chess.js
- Web Speech API

## Project structure

```text
voice-enabled-chess/
├── README.md
├── min project 2/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── css/
│   ├── js/
│   └── img/
└── ...
```

## How to run

1. Clone the repository:

```bash
git clone https://github.com/Harsh241104/voice-enabled-chess.git
```

2. Open the project folder:

```bash
cd voice-enabled-chess
```

3. Open `min project 2/index.html` in a browser.

4. Click `Start Voice Command` and speak a valid chess move such as:

- `e4`
- `Nf3`
- `move pawn to e4`
- `castle kingside`

Note: Voice support depends on browser support for the Web Speech API (best in Chrome/Edge).

## Gameplay

- White is treated as the player's side.
- Pieces can be dragged directly on the board.
- Voice input is processed through the browser speech recognition API.
- The app validates moves using `chess.js`.
- After each player move, the computer plays a random legal move.
- Move history is displayed in the bottom panel.

## Notes

This project is a simple demonstration of integrating chess logic and browser voice recognition into a front-end web app.

## Future improvements

- Better voice command parsing
- Human-vs-human mode
- Stockfish or stronger AI opponent
- Move validation feedback and hints
- Better sound and animation
- UI polish and accessibility improvements

## License

This project is currently provided as a personal/open project for learning and experimentation.

## Author

Harsh241104
