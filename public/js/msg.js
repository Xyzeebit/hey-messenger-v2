'use strict'

const onlineUsers = [];
let socket;
let currentSelectedContact;
let searchResult;
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
        if (msg.from !== user && msg.from === currentSelectedContact) {
            addMessage(msg, user);
        }
        // ..Notify user
        if (currentSelectedContact !== msg.from && msg.from !== user) {
            
            const badge = document.querySelector("#" + msg.from + " .badge");
            
            if (badge) {
                const str = badge.getAttribute('data-count');
                const count = parseInt(str) + 1;
                badge.setAttribute('data-count', count);
                if (count > 0) {
                    if (count < 10) {
                        badge.innerText = count;
                    } else {
                        badge.innerText = '9+'
                    }
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = "none";
                }
            }
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
    const contacts = document.querySelectorAll('.contact');
    const searchBox = document.getElementById('search-box');
    const searchList = document.querySelector('.search__list');

    // component event listeners
    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keyup', handleChatInput);
    textarea.addEventListener('keyup', enableSendButton);
    contacts.forEach(contact => contact.addEventListener('click', selectContact));
    searchBox.addEventListener('keyup', onChange);
    searchBox.addEventListener('focus', onFocus);
    searchBox.addEventListener('blur', onBlur);
    
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
    clearMessageCounter(username.trim());
}

function clearMessageCounter(id) {
    const badge = document.querySelector('#' + id + ' .badge');
    if (badge) {
        badge.setAttribute('data-count', 0);
        badge.style.display = 'none';
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

function onChange(evt) { 
    if (evt.target.value.trim().length < 3) {
        return;
    }

    document.querySelector(".search__list").style.display = "block";
    document.querySelector(".search__progress").style.display = "flex";
    const list = document.querySelector(".search__list ul");

    new Promise((resolve) => {
        const result = searchUser(evt.target.value.trim());
        for (let el of list.children) {
            el.remove();
        }

        resolve(result);
    }).then(results => {
        results.forEach(result => usersResult(result, list));
        document.querySelector(".search__progress").style.display = "none";
    });
}

async function searchUser(query) {
    const resp = await fetch(`/search?s=${query}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (resp.ok) {
        const result = await resp.json();
        return result;
    }
}

function usersResult(searchResult, list) {
    console.log(searchResult)
    const li = Object.assign(document.createElement("li"), {
      className: "search__item",
      innerHTML: `<img src="/img/${searchResult.photo}" alt="${
        searchResult.username
      }" width="50" height="50">
                            <div>
                                <p>${
                                  searchResult.name
                                    ? searchResult.name
                                    : searchResult.username
                                }</p>
                                <small style="${
                                  searchResult.name ? "block" : "none"
                                }">@${searchResult.username}</small>
                            </div>`,
    });
    li.setAttribute("data-username", searchResult.username);
    li.setAttribute("data-id", searchResult.id);
    li.setAttribute("data-name", searchResult.name ?? "");
    li.setAttribute("data-img", searchResult.photo);
    li.onclick = handleSearch;
    list.appendChild(li);
}

function onFocus() {
    // document.querySelector(".search__list").style.display = 'block';
    // document.querySelector(".search__progress").style.display = "flex";
}

function onBlur() {
    document.querySelector(".search__list").style.display = "none";
    document.querySelector(".search__progress").style.display = "none";
}

function handleSearch(evt) {
    console.log(evt)

}