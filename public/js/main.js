'use strict'

window.addEventListener('DOMContentLoaded', function (event) {
    const socket = io();

    
    socket.on("connection", () => {
        console.log("connected to server");
    });

    const form = document.getElementById("form");
    const chats = document.querySelector('.chats')

    form.addEventListener("submit", (evt) => {
        evt.preventDefault();
        const input = evt.target.chatbox;
        socket.emit('chat', input.value);
    });

    const send = (sender, text) => {
        const chat = document.createElement("div");
        chat.className = sender === "owner" ? "chat__bubble to" : "chat__bubble from";
        chat.innerText = text;
        chats.appendChild(chat)
    }

    socket.on('msg', ({ sender, msg}) => {
        send(sender, msg)
    })

});