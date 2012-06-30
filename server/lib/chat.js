/**
 * Chat
 * Handles chat and chat messages
 * in both lobby and private chat.
 */

/*jshint globalstrict:true */
'use strict';

var server  = require('./server.js');
var events  = global.xss.events;

var handleChatMessage = function(data, client) {
    var name = data.name.trim(),
        text = data.text.trim();
    if (name && text) {
        server.sendAll('chat', {name: name, text: text});
    }
};

var addListeners = function() {
    events.addListener('/xss/message/chat', handleChatMessage);
};

var start = function() {
    addListeners();
};

module.exports = {
    start: start
};