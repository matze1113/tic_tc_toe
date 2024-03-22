document.addEventListener("DOMContentLoaded", function() {
    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('reset');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendMessageButton = document.getElementById('send-message');

    let currentPlayer = 'X';
    let gameOver = false;

    function checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (let pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
                cells[a].classList.add('winner');
                cells[b].classList.add('winner');
                cells[c].classList.add('winner');
                gameOver = true;
                return cells[a].textContent;
            }
        }

        if ([...cells].every(cell => cell.textContent !== '')) {
            gameOver = true;
            return 'draw';
        }

        return null;
    }

    function handleClick(event) {
        if (gameOver || this.textContent !== '') return;

        this.textContent = currentPlayer;
        const move = parseInt(this.dataset.index);
        ws.send(JSON.stringify({ type: 'move', player: currentPlayer, move }));

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        const winner = checkWinner();
        if (winner) {
            if (winner === 'draw') {
                alert('It\'s a draw!');
            } else {
                alert(`Player ${winner} wins!`);
            }
            gameOver = true;
        }
    }

    function resetGame() {
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('winner');
        });
        currentPlayer = 'X';
        gameOver = false;
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message !== '') {
            // Hier kannst du die Nachricht an den Server senden
            ws.send(JSON.stringify({ type: 'chat', message: message }));
            chatInput.value = ''; // Leere das Eingabefeld nach dem Senden der Nachricht
        }
    }

    function displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
    }

    cells.forEach(cell => cell.addEventListener('click', handleClick));
    resetButton.addEventListener('click', resetGame);
    sendMessageButton.addEventListener('click', sendMessage);
});

const ws = new WebSocket('ws://3.123.36.168:3000');

ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'start') {
        // Start des Spiels, den aktuellen Spieler anzeigen usw.
    } else if (data.type === 'update') {
        // Spielzustand aktualisieren (z.B. Spielbrett)
        updateGameBoard(data.move);
    } else if (data.type === 'chat') {
        // Nachricht vom Chat empfangen
        displayMessage(data.message);
        console.log(data.message); // Chat-Nachricht in der Konsole anzeigen
    }
}

function updateGameBoard(move) {
    // Aktualisieren Sie das Spielbrett basierend auf dem empfangenen Spielzug
    const cell = document.querySelector(`.cell[data-index="${move}"]`);
    if (cell) {
        cell.textContent = currentPlayer === 'X' ? 'O' : 'X';
    }
    console.log(`Player ${currentPlayer} made a move at cell ${move}`); // Spielzug in der Konsole anzeigen
}

function displayMessage(message) {
    // Hier kannst du die empfangene Chat-Nachricht anzeigen
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
}

