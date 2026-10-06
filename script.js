document.addEventListener('DOMContentLoaded', () => {
    let board = null; // Initialize the chessboard
    let game = new Chess(); // Create new Chess.js game instance
    const moveHistory = document.getElementById('move-history'); // Get move history container
    let moveCount = 1; // Initialize the move count
    let userColor = 'w'; // Initialize the user's color as white

    // Initialize Speech Recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log(`You said: ${command}`);
        processCommand(command);
    };

    recognition.onspeechend = () => {
        recognition.stop();
    };

    recognition.onerror = (event) => {
        console.error(`Error occurred in recognition: ${event.error}`);
    };

    const startListening = () => {
        recognition.start();
    };

    // Function to make a random move for the computer
    const makeRandomMove = () => {
        const possibleMoves = game.moves();

        if (game.game_over()) {
            alert("Checkmate!");
        } else {
            const randomIdx = Math.floor(Math.random() * possibleMoves.length);
            const move = possibleMoves[randomIdx];
            game.move(move);
            board.position(game.fen());
            recordMove(move, moveCount); // Record and display the move with move count
            moveCount++; // Increment the move count
        }
    };

    // Function to record and display a move in the move history
    const recordMove = (move, count) => {
        const formattedMove = count % 2 === 1 ? `${Math.ceil(count / 2)}. ${move}` : `${move} -`;
        moveHistory.textContent += formattedMove + ' ';
        moveHistory.scrollTop = moveHistory.scrollHeight; // Auto-scroll to the latest move
    };

    // Function to handle the start of a drag position
    const onDragStart = (source, piece) => {
        // Allow the user to drag only their own pieces based on color
        return !game.game_over() && piece.search(userColor) === 0;
    };

    // Function to handle a piece drop on the board
    const onDrop = (source, target) => {
        const move = game.move({
            from: source,
            to: target,
            promotion: 'q',
        });

        if (move === null) return 'snapback';

        window.setTimeout(makeRandomMove, 250);
        recordMove(move.san, moveCount); // Record and display the move with move count
        moveCount++;
    };

    // Function to handle the end of a piece snap animation
    const onSnapEnd = () => {
        board.position(game.fen());
    };

    // Function to process voice commands
    const processCommand = (command) => {
        const move = game.move(command, { promotion: 'q' }); // Execute the move

        if (move !== null) {
            board.position(game.fen());
            recordMove(move.san, moveCount); // Record and display the move with move count
            moveCount++;
            window.setTimeout(makeRandomMove, 250);
        } else {
            console.log('Invalid move');
        }
    };

    // Function to reset the game
    const resetGame = () => {
        game = new Chess(); // Reset Chess.js game instance
        board.position('start'); // Reset board position
        moveHistory.textContent = ''; // Clear move history
        moveCount = 1; // Reset move count
    };

    // Initialize the chessboard with Chessboard.js
    board = Chessboard('board', {
        draggable: true,
        position: 'start',
        onDragStart,
        onDrop,
        onSnapEnd
    });

    // Add event listener for the "Play Again" button
    document.querySelector('.play-again').addEventListener('click', resetGame);

    // Add an event listener to start listening for voice commands
    document.getElementById('start-voice').addEventListener('click', startListening);
});
