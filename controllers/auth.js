const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');
const jwt = require('jsonwebtoken');

async function checkLoginRequestBody(req, res, next) {
    try {
        const { username, password } = req.body;
        if (username.trim().length < 6)
            throw ("username must be at least 6 characters");
        if (username.trim().length > 12)
            throw ("username not exceed 12 characters");
        if (password.trim().length < 6)
            throw ("password must be at least 6 characters");
        if (password.trim().length > 32)
            throw ("password should not exceed 16 characters");
        next();
    } catch (err) {
        next(err);
    }
}

async function login(req, res) {
    try {
        const user = await User.findOne({ username: req.body.username.trim() })
            .populate('messages')
            .exec();
        if (user.verifyPassword(req.body.password.trim())) {
            user.lastSeen = Date.now();
            await user.save();

            const payload = {
                id: user._id,
                username: user.username,
                // Sign token for 1hr
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
            };
            const token = generateToken(payload);
            
            const _user = {
                id: user._id,
                name: user.name,
                username: user.username,
                contacts: user.contacts,
                isOnline: user.isOnline,
                photo: user.photo,
                lastSeen: user.lastSeen,
                messages: user.messages,
                isLoggedIn: true,
            }
            res.status(200).send(_user);
        }
    } catch (err) {
        res.status(400).send({ error: "unable to login to account" });
    }
}

function generateToken(payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS512",
    });
    return token;
}