const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');

async function getUser() {
    try {
        const { messages } = await User.findOne({ username: "donald" }).populate('messages').exec();
        console.log(messages);
    } catch (error) {
        console.log(error.message)
    }
}

function initSocket(io, socket) {
    // getUser();
    socket.on("rooms", (rooms) => {
        for (let room of rooms) {
            socket.join(room);
        }
    });

    socket.on("is online", (username) => {
        socket.broadcast.emit("is online", username);
    });

    socket.on("my chat", (msg) => {
        io.to(msg.chatId).emit("my chat", msg);
    });

}



module.exports = initSocket;