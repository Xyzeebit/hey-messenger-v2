'use strict'

window.addEventListener('DOMContentLoaded', function (event) {
    const socket = io();

    socket.on("connection", () => {
        console.log("connected to server");
    });

    socket.on("msg", (msg) => {
        console.log(msg)
    });
    
});