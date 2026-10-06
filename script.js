document.addEventListener('DOMContentLoaded', () => {
    let board = null; // Initialize the chessboard
    let game = new Chess(); // Create new Chess.js game instance
    const moveHistory = document.getElementById('move-history'); // Get move history container
    let moveCount = 1; // Initialize the move count
    let userColor = 'w'; // Initialize the user's color as white
    const voiceButton = document.getElementById('start-voice');
    const voiceStatus = document.getElementById('voice-status');

    const setVoiceStatus = (message, state) => {
        voiceStatus.textContent = message;
        voiceStatus.dataset.state = state;
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setVoiceStatus('Listening… Speak one legal move in chess notation.', 'listening');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.trim();
            processCommand(transcript);
        };

        recognition.onspeechend = () => {
            recognition.stop();
        };

        recognition.onend = () => {
            if (voiceStatus.dataset.state === 'listening') {
                setVoiceStatus('Listening stopped. Select Start Voice Command to try again.', 'idle');
            }
        };

        recognition.onerror = (event) => {
            console.error(`Error occurred in recognition: ${event.error}`);
            const message = event.error === 'not-allowed' || event.error === 'service-not-allowed'
                ? 'Microphone access was denied. Allow microphone access and try again.'
                : event.error === 'no-speech'
                    ? 'No speech was detected. Select Start Voice Command and try again.'
                    : `Speech recognition error: ${event.error}. Try again.`;
            setVoiceStatus(message, 'error');
        };
    } else {
        voiceButton.disabled = true;
        setVoiceStatus('Voice commands are not supported by this browser. You can still move pieces by dragging them.', 'error');
    }

    const startListening = () => {
        if (!recognition) return;

        try {
            recognition.start();
        } catch (error) {
            console.error('Unable to start speech recognition.', error);
            setVoiceStatus('Could not start the microphone. Check its permission and try again.', 'error');
        }
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
    const processCommand = (transcript) => {
        const normalizedCommand = transcript.toLowerCase().replace(/[.!?,]/g, '').trim();
        const pieceAliases = {
            pawn: 'p',
            p: 'p',
            knight: 'n',
            night: 'n',
            n: 'n',
            bishop: 'b',
            b: 'b',
            rook: 'r',
            r: 'r',
            queen: 'q',
            q: 'q',
            king: 'k',
            k: 'k'
        };
        const spokenRanks = {
            one: '1',
            two: '2',
            three: '3',
            four: '4',
            five: '5',
            six: '6',
            seven: '7',
            eight: '8'
        };
        const pieceCommandPattern = /^(?:move\s+)?(pawn|p|knight|night|n|bishop|b|rook|r|queen|q|king|k)\s+(?:to\s+)?([a-h])\s*(1|2|3|4|5|6|7|8|one|two|three|four|five|six|seven|eight)$/;
        const captureCommandPattern = /^(?:move\s+)?(pawn|p|knight|night|n|bishop|b|rook|r|queen|q|king|k)\s+capture\s+(?:(?:to|on)\s+)?([a-h])\s*(1|2|3|4|5|6|7|8|one|two|three|four|five|six|seven|eight)$/;
        const compactPieceCommandPattern = /^(p|n|b|r|q|k)([a-h][1-8])$/;
        const captureMatch = normalizedCommand.match(captureCommandPattern);
        const commandMatch = captureMatch
            || normalizedCommand.match(pieceCommandPattern)
            || normalizedCommand.match(compactPieceCommandPattern);

        let move = null;
        if (commandMatch) {
            const isCompactCommand = compactPieceCommandPattern.test(normalizedCommand);
            const targetSquare = isCompactCommand
                ? commandMatch[2]
                : commandMatch[2] + (spokenRanks[commandMatch[3]] || commandMatch[3]);
            const piece = pieceAliases[commandMatch[1]];
            const candidates = game.moves({ verbose: true }).filter((legalMove) =>
                legalMove.piece === piece
                && legalMove.to === targetSquare
                && (!captureMatch || legalMove.captured)
            );
            const candidateSources = [...new Set(candidates.map((candidate) => candidate.from))];

            if (captureMatch && candidates.length === 0) {
                setVoiceStatus(
                    `Heard: “${transcript}” — No legal ${commandMatch[1]} capture on ${targetSquare}.`,
                    'error'
                );
                return;
            }

            if (candidateSources.length > 1) {
                setVoiceStatus(
                    `Heard: “${transcript}” — More than one ${commandMatch[1]} can ${captureMatch ? 'capture on' : 'move to'} ${targetSquare}. Use standard chess notation or drag the piece.`,
                    'error'
                );
                return;
            }

            if (candidateSources.length === 1) {
                const selectedMove = candidates.find((candidate) => candidate.promotion === 'q') || candidates[0];
                move = game.move({
                    from: selectedMove.from,
                    to: selectedMove.to,
                    promotion: 'q'
                });
            }
        } else {
            const algebraicNotation = transcript.replace(/[.!?,]/g, '').trim();
            move = game.move(algebraicNotation, { promotion: 'q' });
        }

        if (move !== null) {
            board.position(game.fen());
            recordMove(move.san, moveCount); // Record and display the move with move count
            moveCount++;
            setVoiceStatus(`Heard: “${transcript}” — Legal move: ${move.san}.`, 'success');
            window.setTimeout(makeRandomMove, 250);
        } else {
            setVoiceStatus(`Heard: “${transcript}” — Not a legal move in this position. Try again using chess notation.`, 'error');
        }
    };

    // Function to reset the game
    const resetGame = () => {
        game = new Chess(); // Reset Chess.js game instance
        board.position('start'); // Reset board position
        moveHistory.textContent = ''; // Clear move history
        moveCount = 1; // Reset move count
        if (recognition) {
            setVoiceStatus('Game reset. Select Start Voice Command to speak a move.', 'idle');
        }
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
    voiceButton.addEventListener('click', startListening);
});
