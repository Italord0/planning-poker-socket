import express from 'express';
import socket from 'socket.io';
import http from 'http';

const port = process.env.PORT || 3001;

const app = express();

const httpServer = http.createServer(app);

const io = socket(httpServer,
    {
        path: '/socket.io',
        cors: {
            origin: '*',
        }
    });


io.on('connection', socket => {
    console.log(` ${socket.id} connected`);
    socket.on('message', message => {
        console.log("Sending message to gameId: " + message.gameId);
        socket.to(message.gameId).emit('message', message.message);
        console.log(`message: ${message.message}`);
    });
    socket.on('disconnect', () => {
        socket.broadcast.to(socket.game).emit('message', {
            message: `${socket.name} left the game`,
        });
    });
    socket.on('join', (joinData) => {

        socket.name = joinData.name
        socket.game = joinData.gameId
        console.log(`${socket.name} joined room ${socket.game}`);

        socket.join(joinData.gameId);

        socket.broadcast.to(joinData.gameId).emit('message', {
            message: `${socket.name} joined the game`,
        });
    });
});

async function getSocketsFromRoom(roomId) {
    return await io.sockets.adapter.rooms.get(roomId);
}

httpServer.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
