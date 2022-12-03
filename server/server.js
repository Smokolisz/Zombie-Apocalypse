const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const RpsGame = require('./rps-game');

const app = express();

const clientPath = `${__dirname}/../client`;
console.log(`Serving static from ${clientPath}`);

app.use(express.static(clientPath));

const server = https = http.createServer(app);

const io = socketio(server);

let waitingPlayer = null;

io.on('connection', (sock) => {
    console.log('Someone connected'); //del
    sock.emit('initPlayer', 'Hi, you are connected');

    if(waitingPlayer) {
        // start a game
        new RpsGame(waitingPlayer, sock);
        waitingPlayer = null;
    } else {
        // make host
        waitingPlayer = sock;
        waitingPlayer.emit('message', 'Waiting for an opponent');
    }

    sock.on('message', (text) => {
        io.emit('message', text);
    });

    sock.on('disconnect', function () {
        console.log("disconnected");
        sock = null;
    });
});



server.on('error', (err) => {
    console.log('Server error: ', err);
});

const PORT = process.env.PORT || 3000; //delete

server.listen(PORT, () => {
    console.log('RPS started on 3000');
});