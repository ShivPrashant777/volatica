const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const moment = require('moment');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

var room = "";
var userName = "";
var users = [];

// User and Message Manipulation Functions
    function formatMessage(username, text) {
        return {
            username,
            text,
            time: moment().format('h:mm a')
        }
    };

    function joinUser(id, username, room) {
        const user = {id, username, room};
        users.push(user);
        return user;
    };

    function removeUser(id) {
        const index = users.findIndex(user => user.id === id)
        if (index !== -1){
            users.splice(index, 1);
        }
    };

    function getRoomUsers(room) {
        return users.filter(user => user.room === room);
    };

// Routes
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/', function(req, res){
    userName = req.body.username;
    room = req.body.room;
    res.sendFile(__dirname + '/public/chat.html');
});

// Socket Functions
io.on('connect', function(socket){
    // Join Room
    const NEWUSER = joinUser(socket.id, userName, room);
    socket.emit('newUser', {username: NEWUSER.username, room: NEWUSER.room});
    socket.on('joinRoom', function(data){
        socket.join(data.room);
        console.log(users);

        // Get Room Users
        io.in(data.room).emit('getUsers', {room: data.room, users: getRoomUsers(data.room)});
        // Greet User And Notify other room users
        socket.emit('sendMsg', formatMessage("Admin", "You are now connected to Volatica"));
        var greetMsg = data.username + " has joined the chat";
        socket.broadcast.to(data.room).emit('sendMsg', formatMessage("Admin", greetMsg));

    }); 

    // Get msg from client
    socket.on('getMsg', function(data){
        if (data.msg != ''){
            socket.emit('sendMsg', formatMessage("You", data.msg)); // Send to user
            socket.broadcast.to(data.room).emit('sendMsg', formatMessage(data.sender, data.msg)); // Send to all clients except user
        }
    });

    // Disconnect 
    socket.on('disconnect', function(){
        leaveMsg = NEWUSER.username + " has left the chat";
        io.emit('sendMsg', formatMessage("Admin", leaveMsg));
        removeUser(socket.id);
        console.log(NEWUSER.username + ' Disconnected');
        // Get Room Users after they leave
        io.in(NEWUSER.room).emit('getUsers', {room: NEWUSER.room, users: getRoomUsers(NEWUSER.room)});
    });
});

// Server
port = process.env.PORT || 5000;
http.listen(port, () => {
    console.log(`Server Started on port ${port}`);
});