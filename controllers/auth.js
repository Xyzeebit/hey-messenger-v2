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
        if (!user)
            return res.status(401).send({ error: "User not found" });
        if (!user.verifyPassword(req.body.password)) {
            return res.status(401).send({ error: "Invalid username or password" });
        }
        user.lastSeen = Date.now();
        await user.save();
        // Sign token for 1hr
        const expire = Math.floor(Date.now() / 1000) + 60 * 60;
        const payload = {
          id: user._id,
          username: user.username,
          exp: expire,
        };
        const token = generateToken(payload);
        res.cookie("t", token, { expire });
        const _user = {
            token,
            id: user._id,
            name: user.name,
            username: user.username,
            contacts: user.contacts,
            isOnline: user.isOnline,
            photo: user.photo,
            lastSeen: user.lastSeen,
            messages: user.messages,
            isLoggedIn: true,
        };
        res.status(200).send({ user: _user });
    } catch (err) {
        return res.status(400).send({ error: "unable to login" });
    }
}

function generateToken(payload) {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: "HS512",
    });
    return token;
}

const signOut = (req, res) => {
    res.clearCookie("t");
    return res.status(200).send({
        message: "signed out",
    });
};

const requireAuthentication = (req, res, next) => {
    try {
        const user = jwt.verify(req.user.token, process.env.JWT_SECRET);
        req.auth = user;
        next();
    } catch (err) {
        next(err);
    }
}

const hasAuthorization = (req, res, next) => {
    const authorized = req.user && req.auth && req.user.id == req.auth.id;
    if (!authorized) {
        // return res.status(403).send({
        //     error: "User is not authorized",
        // });
        const err = new Error("user not authorized");
        next(err);
    }
    next();
};

module.exports = {
    checkLoginRequestBody,
    login,
    requireAuthentication,
    hasAuthorization,
}