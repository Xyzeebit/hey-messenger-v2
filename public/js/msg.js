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
    const user = document.querySelector('.app__user').innerText.replace('@', '');
    const msg = {
        message: input.value,
        time: Date.now(),
        from: 'donald'
    }

    addMessage(msg, user);
    input.value = '';
    const sendBtn = document.querySelector(".btn__send");
    sendBtn.setAttribute("disabled", true);
    scrollToBottom();
}

function addMessage(msg, user) {
    const { message, time, from } = msg;
    const span = Object.assign(document.createElement("span"), {
      className: `${from === user ? "to" : "from"} chat__bubble`,
      style: `display: flex;
            justify-content: space-between;
            flex-direction: column;
        `,
        innerHTML: `<span class="">${message}</span>
            <span class="chat__time">${new Intl.DateTimeFormat(
        "en-US",
        {
          hour: "numeric",
            minute: "numeric",
          timeStyle: 'short',
        }
      ).format(time)}</span>`,
    });
    const messageList = document.querySelector(".message__list");
    messageList.appendChild(span);
}

const scrollToBottom = () => {
    const messageList = document.querySelector(".message__list");
    messageList.scrollTop = messageList.scrollHeight;
}

const selectContact = evt => {
    
}