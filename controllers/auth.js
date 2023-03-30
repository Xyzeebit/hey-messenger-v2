const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');
const jwt = require('jsonwebtoken');

async function checkLoginRequestBody(req, res, next) {
    try {
        const { username, password } = req.body;
        if (username === undefined || username.trim().length < 6)
            throw new Error("username must be at least 6 characters");
        if (username && username.trim().length > 12)
            throw new Error("username should not exceed 12 characters");
        if (password === undefined || password.trim().length < 6)
            throw new Error("password must be at least 6 characters");
        if (password && password.trim().length > 32)
            throw new Error("password should not exceed 16 characters");
        next();
    } catch (err) {
        next(err);
    }
}

async function checkSignupUsername(req, res) {
    try {
        const { username } = req.body;
        if (username.trim().length < 6)
          throw new Error("username must be at least 6 characters");
        if (username.trim().length > 12)
            throw new Error("username should not exceed 12 characters");
        
        const user = await User.findOne({ username: username.trim() });
        if (user)
            throw new Error("username already taken");
        return res.status(200).send({ message: "username is available" });
    } catch (error) {
        return res.status(409).send({ error: error.message });
    }
}

async function checkSignupPasswords(req, res, next) {
    try {
        const { password, cpassword } = req.body;
        if (password.trim().length < 6)
            throw new Error("password must be at least 6 characters");
        if (password.trim().length > 32)
            throw new Error("password should not exceed 16 characters");
        if (cpassword !== password)
            throw new Error("passwords do not match");
        next();
    } catch (err) {
        next(err);
    }
}

async function signUp(req, res) {
    try {
        let user = new User({ username: req.body.username.trim() });
        user.setPassword(req.body.password.trim());
        user = await user.save();
        
        const expire = Math.floor(Date.now() / 1000) + 60 * 60;
        const payload = {
          id: user._id,
          username: user.username,
          exp: expire,
        };
        const token = generateToken(payload);
        // res.cookie("t", token, { expire });
        req.session.user = {
            t: token,
            id: user._id,
            username: user.username,
        }
        const _user = {
            token,
            id: user._id,
            name: user.name,
            username: user.username,
            // contacts: user.contacts,
            isOnline: user.isOnline,
            photo: user.photo,
            lastSeen: user.lastSeen,
            // messages: user.messages,
            isLoggedIn: true,
        };


        res.status(201).send({ user: _user });
        
    } catch (err) {
        return res.status(400).send({
            error: 'cannot create account'
        });
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
        user.isOnline = true;
        await user.save();
        // Sign token for 1hr
        const expire = Math.floor(Date.now() / 1000) + 60 * 60;
        const payload = {
          id: user._id,
          username: user.username,
          exp: expire,
        };
        const token = generateToken(payload);
        // res.cookie("t", token, { expire });
        req.session.user = {
            t: token,
            id: user._id,
            username: user.username,
        };
        const _user = {
            token,
            id: user._id,
            name: user.name,
            username: user.username,
            // contacts: user.contacts,
            isOnline: user.isOnline,
            photo: user.photo,
            lastSeen: user.lastSeen,
            // messages: user.messages,
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

const signOut = async (req, res) => {
    // res.clearCookie("t");
    try {
        await User.findOneAndUpdate({ username: req.session.user.username }, { isOnline: false });
        req.session = null;
        return res.status(200).send({
            message: "signed out",
        });
    } catch (error) {
        req.session = null;
        return res.status(200).send({
            message: "signed out",
        });
    }
    
};

const requireAuthentication = async (req, res, next) => {
    try {
        const user = jwt.verify(req.session.user.t, process.env.JWT_SECRET);
        req.auth = user;
        next();
    } catch (err) {
        res.redirect('/');
    }
}

const hasSession = async (req, res, next) => {
    if (req.session && req.session.user && req.session.user.t) {
        next();
    } else {
        res.redirect('/');
    }
}

const hasAuthorization = async (req, res, next) => {
    const authorized = req.session.user && req.auth && req.session.user.id == req.auth.id;
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
    hasSession,
    checkSignupUsername,
    checkSignupPasswords,
    signUp,
    signOut,
}