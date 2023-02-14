const express = require('express');
const router = express.Router();
const { auth } = require('../controllers');

router.get("/", (req, res) => {
    res.render("index");
});

router.route('/login')
    .post(auth.checkLoginRequestBody, auth.login);

router.route('/check-username').post(auth.checkSignupUsername);
router.route('/signup').post(auth.checkSignupPasswords, auth.signUp);

router.get('/messenger', (req, res) => {
    res.send("messages");
});

router.get('/logout', auth.signOut);

module.exports = router;