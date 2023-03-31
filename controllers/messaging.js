const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');

async function getUser(username) {
    const u = await User.findOne({ username }).populate("messages");
    
    if (u) {
        return {
            id: u._id,
            username: u.username,
            name: u.name,
            isOnline: true,
            messages: u.messages || [],
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
        const { username, messages } = await getUser(req.session.user.username);
        // console.log(username, messages)
        if (req.body.username) {
            const msgs = mockMsgs.filter(
              (msg) =>
                (msg.from === req.session.user.username &&
                  msg.to === req.body.username.trim()) ||
                (msg.to === req.session.user.username &&
                  msg.from === req.body.username.trim())
            );
            // console.log(msgs)
            res.status(200).send(msgs);
        } else {
            res.status(400).send({ error: 'missing property in request body' });
        }
    } catch (error) {
        res.status(404).send({ error: 'user not found' });
    }
}

const mockMsgs = [
  {
    from: "donald",
    to: "nikita",
    message: "Hello Niki, how are your?",
    time: Date.now() - 86400,
    read: true,
  },
  {
    from: "nikita",
    to: "donald",
    message: "Hi, I'm doing great",
    time: Date.now() - 16400,
    read: true,
  },
  {
    from: "donald",
    to: "lsmith",
    message: "Have you read my report yet?",
    time: Date.now() - 60400,
    read: true,
  },
  {
    from: "lsmith",
    to: "donald",
    message: "What report?",
    time: Date.now() - 88400,
    read: true,
  },
  {
    from: "donald",
    to: "nikita",
    message: "Lee don't event know about the report",
    time: Date.now() - 12000,
    read: true,
  },
];


function startIO(io, socket) {
    
    socket.on("rooms", (rooms) => {
        for (let room of rooms) {
            socket.join(room);
        }
    });

    socket.on("is online", (data) => {
        socket.broadcast.emit("is online",
            {
                id: data.id,
                username: data.username,
                online: data.online
            }
        );
    });

    socket.on("my msg", (msg) => {
        mockMsgs.push(msg);
        io.to(msg.to).emit("my msg", msg);
    });

}




module.exports = {
    startIO,
    messenger,
    messages
}