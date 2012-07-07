/**
 * Session
 * Handle player sessions
 */

/*jshint globalstrict:true */
'use strict';

var fs         = require('fs');
var util       = require('util');
var server     = require('./server.js');
var clientData = global.xss.clientData;
var clients    = global.xss.clients;
var events     = global.xss.events;



var setClientData = function(client, key, data) {
    clientData[client] = clientData[client] || {};
    clientData[client][key] = data;
};

var getClientData = function() {
    return (arguments.length === 2) ? clientData[arguments[0]][arguments[1]] : clientData[arguments[0]];
};

var deleteClientData = function() {
    return (arguments.length === 2) ? delete clientData[arguments[0]][arguments[1]] : delete clientData[arguments[0]];
};

var addClient = function(client) {
    setClientData(client, 'state', 'connected');
//    server.sendOthers('notice', util.format('%s has connected', name));
//    server.sendAll('playerlist', getPlayerList());
};

var handleDisconnect = function(client) {
    var opponent = getClientData(client, 'opponent');
    if (opponent) {
        server.send(opponent, 'opponent_disconnected', {
            name: getClientData(opponent, 'name'),
            load: '_start.html'
        });
    }
    removeClient(client);
};

var recoverAfterOpponentDisconnect = function(data, client) {
    deleteClientData(client, 'opponent');
    // Reset to mode selection screen
    setClientData(client, 'state', 'connected');
    server.send(client, 'request_mode');
};

var removeClient = function(client) {
    server.sendOthers('disconnect', {
        name: getClientData(client, 'name'),
        id: client
    });
    deleteClientData(client);
};

var sendNameRequest = function(data, client) {
    server.send(client, 'request_name');
};

var sendStartHTML = function(client) {
    server.send(client, 'start', {
        load: '_start.html'
    });
};

var getGameData = function(opponent) {
    return {
        opponent: {
            id: opponent,
            name: getClientData(opponent, 'name')
        },
        load: '_game.html'
    };
};

var setPlayerName = function(name, client) {
    setClientData(client, 'name', name);
    server.send(client, 'request_mode');
};

var findOpponent = function(client, mode) {
    var clientDataItem;
    for (var opponent in clients) {
        if (clients.hasOwnProperty(opponent) && opponent !== client) {
            clientDataItem = getClientData(opponent);
            if (clientDataItem.mode === mode && clientDataItem.state === 'waiting') {
                return opponent;
            }
        }
    }
    return false;
};

var pairClients = function(client1, client2) {
    setClientData(client1, 'opponent', client2);
    setClientData(client2, 'opponent', client1);
    setClientData(client1, 'state', 'paired');
    setClientData(client2, 'state', 'paired');
    server.send(client1, 'paired', getGameData(client2));
    server.send(client2, 'paired', getGameData(client1));
};

var handleMode = function(mode, client) {
    var opponent;

    mode = (mode === 'XSS') ? 'XSS' : 'safe';
    opponent = findOpponent(client, mode);
    setClientData(client, 'mode', mode);

    if (opponent !== false) {
        pairClients(client, opponent);
    } else {
        setClientData(client, 'state', 'waiting');
        server.send(client, 'waiting');
    }
};

var addListeners = function() {

    // Server events
    events.addListener('/xss/server/connect', sendStartHTML);
    events.addListener('/xss/server/connect', addClient);
    events.addListener('/xss/server/disconnect', handleDisconnect);

    // Messaged events
    events.addListener('/xss/message/start_ok', sendNameRequest);
    events.addListener('/xss/message/disconnect_ok', recoverAfterOpponentDisconnect);
    events.addListener('/xss/message/name', setPlayerName);
    events.addListener('/xss/message/mode', handleMode);
};

var start = function() {
    addListeners();
};

module.exports = {
    setClientData  : setClientData,
    getClientData  : getClientData,
    dropClientData : deleteClientData,
    addClient      : addClient,
    removeClient   : removeClient,
    start          : start
};