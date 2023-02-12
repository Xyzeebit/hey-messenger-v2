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
    const loginBtn = document.querySelector('button.login');
    const signupBtn = document.querySelector('button.signup');
    const tabContent = document.querySelector('.tab__content');
    const nextBtn = this.document.querySelector('button.btn__next');

    // form.addEventListener("submit", (evt) => {
    //     evt.preventDefault();
    //     const input = evt.target.chatbox;
    //     socket.emit('chat', input.value);
    // });

    loginBtn.addEventListener('click', function(evt) {
        this.classList.contains('current')
          ? evt.preventDefault()
          : switchTab(loginBtn, signupBtn);
        
        slideRight(tabContent, false);
    });
    signupBtn.addEventListener("click", function(evt) {
        this.classList.contains("current")
          ? evt.preventDefault()
          : switchTab(loginBtn, signupBtn);
        
        slideRight(tabContent, true);
    });
    
    nextBtn.onclick = showPassword;

    

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

function login() {
    
}