'use strict'

const onlineUsers = [];
let socket;
let currentSelectedContact;
window.addEventListener('DOMContentLoaded', function (event) {
    socket = io();
    const user = document.querySelector('.app__user').innerText.replace('@', '');

    socket.on("connection", () => {
        console.log("connected to server");
    });

    socket.on("my msg", (msg) => {
        // console.log('my chat', msg)
        // ..add message
        // addMessage(msg, user);
        if (msg.from !== user) {
            addMessage(msg, user);
            //..Notify user
        }
    });

    socket.on('is online', checkOnlineUsers);

    //Broadcast that this user is online
    setInterval(() => {
        socket.emit("is online", { id: user, username: user, online: true });
    }, 30000);

    setTimeout(() => {
        createChatIds();
    }, 10000);



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

window.addEventListener('beforeunload', function (evt) {
    const user = document
        .querySelector(".app__user")
        .innerText.replace("@", "");

    socket.emit('is online', { id: user, username: user, online: false });
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
    const time = Date.now();
    const msg = {
        id: time,
        from: user,
        to: currentSelectedContact,
        message: input.value,
        time,
        read: false,
    };
    socket.emit('my msg', msg);
    addMessage(msg, user);
    input.value = '';
    input.style.height = '10px';
    const sendBtn = document.querySelector(".btn__send");
    sendBtn.setAttribute("disabled", true);
}

function addMessage(msg, user) {
    const { id, message, time, from, to } = msg;
    const span = Object.assign(document.createElement("span"), {
        className: `${from === user ? "to" : "from"} chat__bubble`,
        id: id,
      style: `display: flex;
            justify-content: space-between;
            flex-direction: column;
        `,
        innerHTML: `<span class="">${message}</span>
            <span class="chat__time">${new Intl.DateTimeFormat("en-US",
                { timeStyle: 'short' }).format(time)}</span>`,
    });
    const messageList = document.querySelector(".message__list");
    messageList.appendChild(span);
    scrollToBottom();
}

const scrollToBottom = () => {
    const messageList = document.querySelector(".message__list");
    messageList.scrollTop = messageList.scrollHeight;
}

function selectContact(evt) {
    const [name, username, imgSrc] = this.children[this.children.length - 1].value.split(':');
    currentSelectedContact = username;
    document.querySelector('.chat__window').style.display = 'block';
    const user = document
      .querySelector(".app__user")
      .innerText.replace("@", "");
    const [_, img, h4] = document.querySelector(".name__icon").children;
    img.src = imgSrc;
    img.setAttribute('alt', username);
    h4.innerText = name.trim() === '@' ? username : name;

    new Promise(resolve =>  {
        const node = document.querySelector(".text__chat");
        document.querySelector('.chats').remove();
        const div = document.createElement('div');
        div.setAttribute('class', 'message__list chats');
        node.appendChild(div);
        const messages = fetchMessages(username);
        resolve(messages);
    }).then((messages) => {
        messages.forEach((message) => addMessage(message, user));
    });

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

function createChatIds() {
    const contactElements = document.querySelector('.contact__list');
    let contacts = [];
    for (let contact of contactElements.children) {
        if (contact.id) {
            contacts.push(contact.id.trim());
        }
    }
    socket.emit('rooms', contacts)
}

// find online users and notify this user
function checkOnlineUsers({ id, username, online }) {
    console.log(username, 'is online' , online, onlineUsers)
    if (online) {
        const contact = document.getElementById(id.trim());
        if (contact /* && onlineUsers.indexOf(username) === -1 */) {
            const [imgContainer] = contact.children;
            const span = document.createElement("span");
            span.setAttribute("class", "online");
            imgContainer.prepend(span);
            // onlineUsers.push(username);
        }
    } else {
        const onl = document.querySelector(`#${id.trim()} .online`);
        if (onl) {
            onl.remove();
            // onlineUsers = onlineUsers.filter(u => u !== username);
        }
    }
}

// async function addMessage(data) {
//     const resp = await fetch('/messages/add', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     });
//     if (resp.ok) {
//         const text = await resp.json();
//         console.log(text)
//         return text;
//     }
// }
