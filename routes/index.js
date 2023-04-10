const express = require('express');
const router = express.Router();
const { auth, messaging } = require('../controllers');

router.get("/", (req, res) => {
    res.render("index", { id: null });
});

router.route('/login')
    .post(auth.checkLoginRequestBody, auth.login);

router.route('/check-username').post(auth.checkSignupUsername);
router.route('/signup').post(auth.checkSignupPasswords, auth.signUp);

router.route('/messenger')
    .get(auth.hasSession, auth.requireAuthentication, auth.hasAuthorization, messaging.messenger);

router.route('/messages')
    .get((req, res) => res.redirect('/'))
    .post(auth.hasSession, auth.requireAuthentication, auth.hasAuthorization, messaging.messages);

router.route('/search')
    .get(auth.hasSession, auth.requireAuthentication, auth.hasAuthorization, messaging.search);
    
router.get('/logout', auth.signOut);

module.exports = router;