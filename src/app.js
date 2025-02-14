const express = require('express');
const { connectionDB } = require('./config/database');
const app = express();
const cookieParser = require('cookie-parser');
const profileRouter = require('./routes/profile');
const authRouter = require('./routes/auth');
const requestRouter = require('./routes/request');
const userRouter = require('./routes/user');
const messageRouter = require('./routes/message');
const Message = require('./models/message');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const server = http.createServer(app);
const axios = require('axios');

require("dotenv").config();

const PORT = process.env.PORT || 5000;

const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
}
);

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(cookieParser());


app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', messageRouter);

io.on('connection', (socket) => {
    //socket object represents connected client
    console.log('A user connected:', socket.id);
    
    //listens join event from the client
    socket.on('join', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined`);
    })
    socket.on('messageRead', async (data) => {
        try {
            const message = await Message.findById({_id: data});
            if(message==null){
                return res.status(400).send("message not found");
            }
            message.status = "read";
            message.save();
        } catch(err) {
            res.status(404).send("ERROR: " + err.message);
        }
    })
    // Listen for custom events from clients
    socket.on('sendMessage', async (data) => {
        const { receiverId, senderId, message } = data;
        const token = socket.handshake.auth.token;
    
        try {
            const res = await axios.post(
                `http://localhost:5000/sendMessage/${receiverId}/${senderId}`,
                { message: message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const savedMessage = res.data;
            io.to(receiverId).emit('message', savedMessage);
        } catch (error) {
            console.error('Error sending message:', error.message);
            socket.emit('error', 'Message could not be sent');
        }
    
    });
    

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

connectionDB()
    .then( () => {
        console.log("Database connnection sucessfully......");
        server.listen(process.env.PORT, () => {
            console.log(`Server is listening on port 5000`);
        });
    })
    .catch (() => {
        console.log("Database cannot be connected!!");
    });
