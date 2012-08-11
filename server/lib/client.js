/*jshint globalstrict:true*/
'use strict';

/**
 * @constructor
 * @param {number} id
 * @param {number} socketid
 */
function Client (id, socketid) {
    this.id = id;
    this.socketid = socketid;
}

Client.prototype = {};

module.exports = Client;