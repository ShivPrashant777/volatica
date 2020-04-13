var socket = io();
var msgContainer = document.getElementById('msg-container');
var users = document.querySelector('.users');
var userList = document.getElementById('users-list');
var logo = document.getElementById('logo');
var roomName = document.getElementById('room-name');
var usersToggle = document.getElementById('users-toggle');
var messages = document.getElementById('messages');  

// Users Toggle for phones
toggle = false;
usersToggle.addEventListener('click', function(){
    if (toggle == false){
        users.style.display = "block";
        toggle = true;
    } else {
        users.style.display = "none";
        toggle = false;
    }
});


// Light Theme
var light = false;
logo.addEventListener("click", function(){
    if (light == false) {
        document.documentElement.setAttribute('data-theme', 'light');    
        light = true;      
    } else {
        document.documentElement.setAttribute('data-theme', 'dark'); 
        light = false;
    }
});

function autoScrollDown(){
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function sendMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="sender">${message.username} <span>${message.time}</span> </p>
    <p class="text">
        ${message.text}
    </p>`;
    document.getElementById('msg-container').appendChild(div);
    autoScrollDown();
} 

// Socket Functions
socket.on('newUser', function(user){    
    socket.emit('joinRoom', {username: user.username, room: user.room});

    socket.on('getUsers', function(data){
        roomName.innerHTML = data.room;
        userList.innerHTML = `
        ${data.users.map(person => `<li>${person.username}</li>`).join('')}`
    });

    $('form').submit(function(event){
        event.preventDefault();
        socket.emit('getMsg', {msg: $('#m').val(), sender: user.username, room: user.room});  // Send to server
        $('#m').val('')
        return false;
    });
})

// Receive from server
socket.on('sendMsg', function(data){
    sendMessage(data);
});








