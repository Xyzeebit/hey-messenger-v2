'use strict'

window.addEventListener('DOMContentLoaded', function (event) {
    const socket = io();

    socket.on("connection", () => {
        console.log("connected to server");
    });

    socket.on("msg", (msg) => {
        console.log(msg)
    });



    // component selectors
    const textarea = document.querySelector('.input__area');
    const sendBtn = document.querySelector('.btn__send');

    // component event listeners
    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keyup', handleChatInput);
    textarea.addEventListener('keyup', enableSendButton);

    
});

const handleChatInput = (evt) => {
    evt.target.style.height = "1px";
    if(evt.target.scrollHeight >= 200) {
        evt.target.style.height = 200 + "px";
    } else {
        evt.target.style.height = evt.target.scrollHeight + "px";
    }
}

const enableSendButton = evt => {
    const sendBtn = document.querySelector(".btn__send");
    if (evt.target.value.trim()) {
        sendBtn.removeAttribute('disabled');
    } else {
        sendBtn.setAttribute("disabled", true);
    }
}

const sendMessage = evt => {
    const input = document.querySelector(".input__area");
    const span = Object.assign(document.createElement("span"), {
        className: "to chat__bubble",
        innerText: input.value,
    });
    const messageList = document.querySelector('.message__list');
    messageList.appendChild(span);
    input.value = '';
}

const scrollToBottom = () => {
    
}