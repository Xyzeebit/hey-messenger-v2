'use strict'

window.addEventListener('DOMContentLoaded', function (event) {
    const socket = io();

    const form = document.getElementById("form");

    form.addEventListener("submit", (evt) => {
        evt.preventDefault();
    });


    socket.on("connection", () => {
        console.log("connected to server");
    });

    socket.emit('data', 10);


    socket.on('num', console.log);

});