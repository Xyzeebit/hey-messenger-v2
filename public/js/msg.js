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
    // const contactList = document.querySelector('.contact__list');
    const contacts = document.querySelectorAll('.contact');

    // component event listeners
    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keyup', handleChatInput);
    textarea.addEventListener('keyup', enableSendButton);
    // contactList.addEventListener('click', selectContact);
    contacts.forEach(contact => contact.addEventListener('click', selectContact));

    
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
        from: user,
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

async function selectContact(evt) {
    const [name, username, imgSrc] = this.children[this.children.length - 1].value.split(':');
    document.querySelector('.chat__window').style.display = 'block';
    const user = document
      .querySelector(".app__user")
      .innerText.replace("@", "");
    const [_, img, h4] = document.querySelector(".name__icon").children;
    img.src = imgSrc;
    img.setAttribute('alt', username);
    h4.innerText = name.trim() === '@' ? username : name;
    
    const messages = await fetchMessages(username);
    
    if (messages && messages.length > 0) {
        messages.forEach(message => addMessage(message, user));
    } else {

    }

}

async function fetchMessages(username) {
    const resp = await fetch('/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username }),
    });
    if (resp.ok) {
        const messages = await resp.json();
        return messages;
    }
}

async function addMessage(data) {
    const resp = await fetch('/messages/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (resp.ok) {
        const text = await resp.json();
        console.log(text)
        return text;
    }
}

async function fetchMessagesMock(username) {
    return [
        {
            message: "how are your?",
            time: Date.now() - 2000,
            from: "donald",
            to: "peters",
        },
        {
            message: "how are your again?",
            time: Date.now() - 1000,
            from: "donald",
            to: "peters",
        },
        {
            message: "I'm fine",
            time: Date.now(),
            from: username,
            to: "donald",
        },
        {
            message: "how is your work",
            time: Date.now() + 1000,
            from: "donald",
            to: "peters",
        },
        {
            message: "we are doing great",
            time: Date.now() + 2000,
            from: username,
            to: "donald",
        },
    ];
}