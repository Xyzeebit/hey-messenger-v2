function initSocket(io, socket) {
    socket.on("chat", (msg) => {
        const sender = Math.random();
        if (sender > 0.5) {
            socket.emit("msg", { sender: "owner", msg });
        } else {
            socket.emit("msg", { sender: "friend", msg });
        }
    });
}



module.exports = initSocket;