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
    this.data = {};
}

Client.prototype = {

    getSocket: function() {

    }

};

module.exports = Client;