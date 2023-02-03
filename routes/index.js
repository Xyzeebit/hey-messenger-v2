const express = require('express');
const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", { name: "Donald" });
});

module.exports = router;