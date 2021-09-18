const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const port = 3010;
const app = express();

// const index = require("./routes/index");
// app.use(index);

const serverhttp = http.createServer(app);

var whitelist = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://antrianqu-socket-dev.quantums.id:3011',
    'http://antrianqu-socket.quantums.id:3011'
]

const io = socketIo(serverhttp, {
    cors: {
        origin: whitelist,
        methods: ["GET", "POST"],
        credentials: true
    }
});


/**
 * REDIS
 */
const redis = require("redis");
var sub = redis.createClient();
var pub = redis.createClient();


app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});


io.on("connection", (socket) => {


    /**
     * Join Room Partner
     * chekc layer form counter
     * update status monitor section
     */
    socket.on('join', ({ room, user }, callback) => {
        var channelKey = 'aqsr_room' + ':' + room;
        io.emit(channelKey, user);
        callback();
    });


    /**
     * Counter -> Monitor
     */
    socket.on('aqsr_play', data => {
        let channelKey = 'aqsr_play' + ':' + data.partner_id;
        io.emit(channelKey, data);
    });


    /**
     *  Monitor -> Counter
     */
    socket.on('aqsr_focus', data => {
        let channelKey = 'aqsr_focus' + ':' + data.partner_id;
        io.emit(channelKey, data);
    });
});

//EVENT LIST
sub.subscribe('aqsr_new_queue', function (err, count) {
    if (err) return;
});
sub.subscribe('aqsr_section_queue', function (err, count) {
    if (err) return;
});

sub.on('message', function (channel, message) {
    message = JSON.parse(message);
    let channelKey = channel + ':' + message.event;
    io.emit(channelKey, message.data);
});

serverhttp.listen(port, () => console.log(`Listening on port ${port}`));