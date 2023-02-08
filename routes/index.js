const express = require('express');
const router = express.Router();

const users = [
    {
        id: "user1",
        name: "Peters",
        messages: [],
    },
    {
        id: "user2",
        name: "Dave",
        messages: [],
    },
    {
        id: "user3",
        name: "Rick",
        messages: [],
    },
];

router.get("/", (req, res) => {
    res.render("index", { users });
});

module.exports = router;