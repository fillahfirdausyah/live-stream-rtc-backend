const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: '*',
  },
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.send('Web Socket Server is running..');
});

const onConnection = (socket) => {
  console.log('user connected..');
  socket.on('join-as-streamer', (roomId, streamerId) => {
    console.log('Streamer Joined Room', roomId, streamerId);
    // socket.broadcast.emit('streamer-joined', streamerId);

    socket.join(roomId);
    socket.to(roomId).emit('streamer-joined', streamerId);
  });

  socket.on('disconnect-as-streamer', (streamerId) => {
    socket.broadcast.emit('streamer-disconnected', streamerId);
  });

  socket.on('join-as-viewer', (roomId, viewerId) => {
    console.log('Viewer Joined Room', roomId, viewerId);
    socket.join(roomId);
    // socket.broadcast.emit('viewer-connected', viewerId);

    socket.to(roomId).emit('viewer-joined', viewerId);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected..');
  });
};

io.on('connection', onConnection);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
