const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
    origin: ["http://localhost:3000"], 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
};

app.use(cors(corsOptions));

// Initialize Socket.IO
const io = socketIo(server, {
    cors: {
        origin: ['http://localhost:3000', 'localhost:3000'],
        methods: ['GET', 'POST'],
    },
});

// Endpoint to Retrieve Data
app.get('/data', (req, res) => {
    try {
        const files = fs.readdirSync("./data").filter(file => file.endsWith('.json'));
        const data = files.map(file => JSON.parse(fs.readFileSync(`./data/${file}`, 'utf-8')));
        res.send(data);
    } catch (error) {
        console.error('Error reading data:', error);
        res.status(500).send({ error: 'Failed to read data' });
    }
});

const port = 3000;

// Rooms Structure:
// rooms = {
//   roomCode: {
//     players: ['user1', 'user2'],
//     sockets: { socketId1: 'user1', socketId2: 'user2' }
//   }
// }
const rooms = {};

// Mapping from socket.id to room and user
// socketToRoom = {
//   socketId1: { roomCode: 'ABC123', userName: 'user1' },
//   socketId2: { roomCode: 'ABC123', userName: 'user2' }
// }
const socketToRoom = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle Room Creation
    socket.on('create-room', (roomCode, userName) => {
        // Validate Inputs
        if (typeof roomCode !== 'string' || roomCode.trim() === '') {
            socket.emit('invalid-room-code', { message: 'Invalid room code.' });
            return;
        }

        if (typeof userName !== 'string') {
            socket.emit('username-too-short', { message: 'Username must be longer than 4 characters.' });
            return;
        }

        if (rooms[roomCode]) {
            socket.emit('room-exists', { roomCode, message: 'Room already exists.' });
            return;
        }

        // Create Room with Initial Player
        rooms[roomCode] = { 
            players: [userName],
            sockets: { [socket.id]: userName }
        };
        socket.join(roomCode);
        socketToRoom[socket.id] = { roomCode, userName };
        socket.emit('room-created', { roomCode, userName });
        console.log(`Room ${roomCode} created by ${userName}`);
    });

    // Handle Joining a Room
    socket.on('join-room', (roomCode, userName) => {
        // Validate Inputs
        if (typeof roomCode !== 'string' || roomCode.trim() === '') {
            socket.emit('invalid-room-code', { message: 'Invalid room code.' });
            return;
        }

        if (typeof userName !== 'string' || userName.length <= 4) {
            socket.emit('username-too-short', { roomCode, message: 'Username must be longer than 4 characters.' });
            return;
        }

        const room = rooms[roomCode];
        if (!room) {
            socket.emit('room-not-found', { roomCode, message: 'Room not found.' });
            return;
        }

        // Check if Room is Full
        const MAX_PLAYERS = 4;
        if (room.players.length >= MAX_PLAYERS) {
            socket.emit('room-full', { roomCode, message: 'Room is full.' });
            return;
        }

        // Check if Username is Already in the Room
        if (room.players.includes(userName)) {
            socket.emit('user-already-in', { roomCode, message: 'User is already in the room.' });
            return;
        }

        // Add User to the Room
        room.players.push(userName);
        room.sockets[socket.id] = userName;
        socket.join(roomCode);
        socketToRoom[socket.id] = { roomCode, userName };
        io.to(roomCode).emit('room-joined', { roomCode, userName });
        console.log(`${userName} joined room ${roomCode}`);
    });

    // Handle Manual User Leaving a Room
    socket.on('leave-room', () => {
        const userData = socketToRoom[socket.id];
        if (userData) {
            const { roomCode, userName } = userData;
            removeUserFromRoom(socket, roomCode, userName);
        } else {
            socket.emit('not-in-room', { message: 'You are not in any room.' });
        }
    });

    // Handle Disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        const userData = socketToRoom[socket.id];
        if (userData) {
            const { roomCode, userName } = userData;
            removeUserFromRoom(socket, roomCode, userName);
        }
    });
});

// Function to Remove a User from a Room
function removeUserFromRoom(socket, roomCode, userName) {
    const room = rooms[roomCode];
    if (room) {
        // Remove User from Players Array
        room.players = room.players.filter(name => name !== userName);

        // Remove Socket from Sockets Mapping
        delete room.sockets[socket.id];

        // Remove Socket from the Room
        socket.leave(roomCode);

        // Remove from socketToRoom Mapping
        delete socketToRoom[socket.id];

        // Notify Other Users in the Room
        io.to(roomCode).emit('user-left', { roomCode, userName });
        console.log(`${userName} left room ${roomCode}`);

        // Delete Room if Empty
        if (room.players.length === 0) {
            delete rooms[roomCode];
            io.emit('room-deleted', { roomCode, message: 'Room has been deleted as it became empty.' });
            console.log(`Room ${roomCode} deleted because it became empty.`);
        }
    }
}

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
