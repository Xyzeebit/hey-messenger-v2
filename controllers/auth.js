const User = require('../models/userSchema');
const Messages = require('../models/messagesSchema');

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

}