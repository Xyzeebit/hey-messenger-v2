require('dotenv').config();
const http = require("http");
const express = require('express');
const path = require('path');
const routes = require('./routes');
const { messaging, errHandler } = require('./controllers');
const dbConnect = require('./libs/dbConnect');
const { default: helmet } = require('helmet');
const cors = require('cors');
const cookieSession = require('cookie-session');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT;

app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(helmet());
app.use(cors());
app.use(cookieSession({
    name: "hey_messenger",
    keys: [process.env.SESSION_KEY],
    overwrite: true,
}));
app.use(express.static(path.join(__dirname, "public")))
app.use(routes);

dbConnect();

io.on("connection", (socket) => {
    console.log("connection established");

    messaging.startIO(io, socket).then(() => {
        
    });

    socket.on("error", (err) => {
        console.log(err.message);
    });
    
});

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use(errHandler);

server.listen(PORT, () => {
    console.log(`server started on :${PORT}`);
});