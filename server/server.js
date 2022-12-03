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
let usersConnected = 0;

io.on('connection', (sock) => {
    usersConnected++;
    io.emit('usersConnected', usersConnected);

    getRanking();

    if(waitingPlayer) {
        // start a game
        new RpsGame(waitingPlayer, sock);
        waitingPlayer = null;
    } else {
        // make host
        waitingPlayer = sock;
        waitingPlayer.emit('message', 'Waiting for an opponent');
    }

    sock.on('disconnect', function () {
        sock = null;
        usersConnected--;
        io.emit('usersConnected', usersConnected);
    });
});



server.on('error', (err) => {
    console.log('Server error: ', err);
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log('App started on 3000');
});




function getRanking() {
    http.get(/* URL goes here */ url, (resp) => {
        let data = '';

        resp.on('data', (chunk) => {
            data += chunk;
        });

        resp.on('end', () => {
            //console.log(data);
            let rankingJSON = data;
            io.emit('ranking', rankingJSON);
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}
