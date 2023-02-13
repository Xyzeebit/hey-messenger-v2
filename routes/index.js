const express = require('express');
const router = express.Router();
const { auth } = require('../controllers');

router.get("/", (req, res) => {
    res.render("index");
});

router.route('/login')
    .post(auth.checkLoginRequestBody, auth.login);

module.exports = router;