const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const { addUser, removeUser, getuser, getUsersInRoom } = require('./user');

const cors = require('cors');

const PORT=process.env.PORT || 5000;

const router=require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);



io.on("connection", (socket)=>{
    // console.log('We have a new connection!!');
    socket.on("join", ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if(error) return callback(error);

        //emitting from backend to frontend
        socket.emit("message", { user: "admin", text: `${user.name}, Welcome to the room ${user.room}` });
        
        socket.broadcast.to(user.room).emit("message", { user:"admin", text: `${user.name}, has joined the room`});

        socket.join(user.room);

        io.to(user.room).emit("roomData", { room: user.room , users: getUsersInRoom(user.room)});

        callback();

        // if(error){
        //     callback({ error: 'error'});
        // }

    });

    socket.on("sendMessage", (message, callback) => {
        const user = getuser(socket.id);

        io.to(user.room).emit("message", { user: user.name, text: message });
        io.to(user.room).emit("roomData", { room: user.room, users: getUsersInRoom(user.room) });

        callback();
    });

    socket.on("disconnect", ()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit("message", {user: "admin", text: `${user} has left`});
        }
    });
});




app.use(router);

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}));


server.listen(PORT, () => {
    console.log(`Server has start on port ${PORT}`);
});

