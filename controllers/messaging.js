const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');

async function getUser(username) {
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
            lastSeen: u.lastSeen,
        };
    }
    throw new Error("user does not exist");
}

async function messenger(req, res) {
    try {
        const user = await getUser(req.session.user.username);
        res.render('messenger', { ...user });
    } catch (err) {
        res.render('404');
    }
}

async function messages(req, res) {
    try {
        const { messages } = await getUser(req.session.user.username);
        if (req.body.hasProperty('username')) {
            const msgs = messages.filter(
              (msg) =>
                msg.from === req.session.user.username && msg.to === req.body.username.trim() ||
                msg.to === req.body.username.trim() && msg.from === req.session.user.username
            );
            res.status(200).send({ messages: msgs });
        } else {
            res.status(401).send({ error: 'missing property in request body' });
        }
    } catch (error) {
        res.status(404).send({ error: 'user not found' });
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
    messages
}