const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');

async function getUserData(username) {
    const u = await User.findOne({ username }).populate("messages").exec();

    if (u) {
        return {
            id: u._id,
            username: u.username,
            name: u.name,
            isOnline: true,
            messages: u.messages,
            contacts: u.contacts,
            photo: u.photo,
        };
    }
    throw new Error("Access error");
}

async function messenger(req, res) {
    try {
        const user = await getUserData(req.session.user.username);
        res.render('messenger', { ...user });
    } catch (err) {
        res.render('404');
    }
}

function startIO(io, socket) {
    
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




module.exports = {
    startIO,
    messenger,
}