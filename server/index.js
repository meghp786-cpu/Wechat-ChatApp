require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');


connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:5174'];


app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const featureRoutes = require('./routes/featureRoutes');

app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/features', featureRoutes);

app.get('/', (req, res) => {
    res.send('Nexus3D API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: allowedOrigins,
    },
});

app.set('io', io);

require('./socket/socketHandler')(io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
