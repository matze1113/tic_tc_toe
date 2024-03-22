const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

// Erstellen Sie einen HTTP-Server
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html'; // Setzen Sie den Standardpfad auf index.html
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript'
    }[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code == 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Erstellen Sie einen WebSocket-Server
const wss = new WebSocket.Server({ server });

// WebSocket-Verbindung
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // Nachricht vom Client empfangen
        console.log('received: %s', message);

        const data = JSON.parse(message);
        if (data.type === 'chat') {
            // Wenn die empfangene Nachricht vom Typ "chat" ist, senden Sie sie an alle Clients weiter
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });

    // Beispiel: Nachricht an den neu verbundenen Client senden
    ws.send(JSON.stringify({ type: 'welcome', message: 'Welcome to Tic Tac Toe Multiplayer!' }));
});

// Starten Sie den HTTP-Server
const port = process.env.PORT || 3000; // Verwenden Sie den Port 3000 oder den Port, der in der Umgebungsvariable PORT festgelegt ist
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});