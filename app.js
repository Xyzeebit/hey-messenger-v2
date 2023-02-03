require('dotenv').config();
const express = require('express');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))
app.use(routes);

app.listen(PORT, () => {
    console.log(`server started on :${PORT}`);
});