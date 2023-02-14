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
    const usernameInput = document.getElementById("username-signup");
    const signupBtn = document.querySelector("button.signup__btn");


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
    signupBtn.onclick = signup;
    usernameInput.onchange = checkUsername;

    

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

async function checkUsername(evt) {
    const username = document.getElementById('username-signup').value.trim();
    const uerr = document.querySelector('.signup__err');
    const btn = document.querySelector(".btn__next");
    let isValid = true;

    if (username.length < 6 || username.length > 12) {
        uerr.innerText = "Username not in range";
        uerr.classList.remove("hide");
        btn.setAttribute('disabled', true);
        isValid = false;
    }

    if (isValid) {
        uerr.classList.add("hide");
        const resp = await fetch("/check-username", {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username }),
        });

        if (resp.ok) {
            btn.removeAttribute('disabled');
        } else {
            btn.setAttribute('disabled', true);
            uerr.classList.remove('hide');
            const msg = await resp.json();
            uerr.classList.remove("hide");
            uerr.innerText = msg.error;
        }
    }
}

async function signup(evt) {
    const signupErr = document.querySelector(".signup__pwd__err");
    const pwdErr = document.querySelector('.password__err');
    const cpwdErr = document.querySelector(".cpassword__err");
    const pwd = document.getElementById('password').value.trim();
    const cpwd = document.getElementById('cpassword').value.trim();
    const username = document.getElementById("username-signup").value.trim();
    const isValid = true;
    if (pwd.length < 6 || pwd.length > 16) {
        pwdErr.innerText = "Password should be between 6 and 18 characters";
        pwdErr.classList.remove("hide");
        isValid = false;
    }
    if (cpwd !== pwd) {
        cpwdErr.classList.remove('hide');
        isValid = false;
    }

    if (isValid) {
        pwdErr.classList.add('hide');
        cpwdErr.classList.add('hide');

        const resp = await fetch('/signup', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password: pwd, cpassword: cpwd })
        });

        if (resp.status === 201) {
            location.href = '/messenger';
        } else {
            signupErr.classList.remove("hide");
        }
    }

}