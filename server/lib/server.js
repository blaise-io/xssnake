/*jshint globalstrict:true */

'use strict';

var fs = require('fs'),
    http = require('http'),
    socketio = require('socket.io'),
    xss = global.xss;

var start = function() {
    var app = http.createServer(httpRequestHandler),
        io = socketio.listen(app, { log: false });

    app.listen(80);

    io.sockets.on('connection', function(socket) {
        addSocketEventHandlers(socket);
    });
};

var addSocketEventHandlers = function(socket) {
    var clientID;

    // Emit connect
    clientID = registerClient(socket);
    socket.emit('/xss/connect', {id: clientID});

    // Handle disconnect
    socket.on('disconnect', function() {
        unRegisterClient(clientID);
    });

    socket.on('/xss/name', function(data) {
        console.log(data);
    });

    socket.on('/xss/game', function(data) {
        console.log(data);
    });
};

var registerClient = function(socket) {
    var clientID = ++xss.clientPK;
    xss.clients[clientID] = socket;
    return clientID;
};

var unRegisterClient = function(clientID) {
    delete xss.clients[clientID];
};

var httpRequestHandler = function(req, res) {
    var file, onIndexFileRead;

    file = __dirname + '/../index2.html';
    onIndexFileRead = function(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + file);
        }
        res.writeHead(200);
        res.end(data);
    };

    fs.readFile(file, onIndexFileRead);
};

var send = function(client, action, data) {
    if (!xss.clients[client]) {
        console.warn('Attempting to send data to a disconnected client:', client);
    } else {
        xss.clients[client].emit(action, data);
    }
};

var sendAll = function(action, data) {
    for (var client in xss.clients) {
        if (xss.clients.hasOwnProperty(client)) {
            send(client, action, data);
        }
    }
};

var sendOthers = function(action, data, exclude) {
    for (var client in xss.clients) {
        if (xss.clients.hasOwnProperty(client) && exclude !== client) {
            send(client, action, data);
        }
    }
};

module.exports = {
    start: start,
    send: send,
    sendAll: sendAll,
    sendOthers: sendOthers
};