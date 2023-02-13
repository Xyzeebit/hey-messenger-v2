'use strict'

window.addEventListener('DOMContentLoaded', function (event) {
    const socket = io();

    
    socket.on("connection", () => {
        console.log("connected to server");
    });


    addHeaderShadow();
    slideInHome();
    getStarted();








    // const form = document.getElementById("form");
    const chats = document.querySelector('.chats');
    const loginTabBtn = document.querySelector('button.login');
    const signupTabBtn = document.querySelector('button.signup');
    const tabContent = document.querySelector('.tab__content');
    const nextBtn = document.querySelector('button.btn__next');
    const loginBtn = document.querySelector("button.submit__form_button");

    // form.addEventListener("submit", (evt) => {
    //     evt.preventDefault();
    //     const input = evt.target.chatbox;
    //     socket.emit('chat', input.value);
    // });

    loginTabBtn.addEventListener('click', function(evt) {
        this.classList.contains('current')
          ? evt.preventDefault()
          : switchTab(loginTabBtn, signupTabBtn);
        
        slideRight(tabContent, false);
    });
    signupTabBtn.addEventListener("click", function(evt) {
        this.classList.contains("current")
          ? evt.preventDefault()
          : switchTab(loginTabBtn, signupTabBtn);
        
        slideRight(tabContent, true);
    });
    
    nextBtn.onclick = showPassword;
    loginBtn.onclick = login;

    

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

const addHeaderShadow = () => {
    setTimeout(() => {
        document.querySelector(".intro h1.app__title span").classList.add("shadow");
    }, 1000);
}

const slideInHome = () => {
    setTimeout(() => {
        document
          .querySelector(".intro img")
            .classList.add("slide__in");
        document
          .querySelector(".welcome__text p")
          .classList.add("slide__in");
    }, 1000);
}

const getStarted = () => {
    const btn = document.querySelector("button.start__button");
    const forms = document.getElementById("forms");
    btn.onclick = function(evt) {
        forms.scrollIntoView({ behavior: 'smooth' }, true);
        setTimeout(() => {
            document
                .querySelector(".intro__forms h1.app__title span")
                .classList.add("shadow");

            document
                .querySelector(".intro__forms img")
                .classList.add("slide__in");
        }, 500);
    }
}

function switchTab(eleft, eright) {
    eleft.classList.toggle("current");
    eright.classList.toggle("current");
}

function slideRight(el, slide) {
    if (slide) {
        el.classList.add('slide__right');
    } else {
        el.classList.remove('slide__right');
    }
}

function showPassword(evt) {
    const u = document.querySelector(".uname__container");
    const p = document.querySelector(".pwd__container");
    u.style.display = 'none';
    p.style.display = 'flex';
}

async function login(evt) {
    const uname = document.getElementById('username').value.trim();
    const pwd = document.getElementById('pwd').value.trim();
    const loginErr = document.querySelector(".login__err");
    let isValid = true;
    if (uname.length < 6 || uname.length > 12) {
        loginErr.innerText = "Username not in range";
        loginErr.classList.remove('hide');
        isValid = false;
    }
    if (pwd.length < 6 || pwd.length > 16) {
        loginErr.innerText = "Password not in range"
        loginErr.classList.remove("hide");
        isValid = false;
    }
    
    if (isValid) {
        loginErr.classList.add("hide");
        const resp = await fetch('/login', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({ username: uname, password: pwd }),
        });
        if (resp.ok) {
            location.href = '/messenger'
        } else {
            loginErr.innerText = "*Invalid username or password"
            loginErr.classList.remove("hide");
        }
    }
}