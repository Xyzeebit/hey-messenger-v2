require('dotenv').config();
const http = require("http");
const express = require('express');
const path = require('path');
const routes = require('./routes');
const init = require('./controllers');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))
app.use(routes);

io.on("connection", (socket) => {
    console.log("connection established");

    init(io, socket);

    socket.on("error", (err) => {
        console.log(err.message);
    });
    
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

server.listen(PORT, () => {
    console.log(`server started on :${PORT}`);
});