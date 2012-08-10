/*jshint globalstrict:true*/
'use strict';

/**
 * @constructor
 */
function Client (id, socket) {
    this.id = id;
    this.socket = socket;
    this._data = {};
}

Client.prototype = {

    /**
     * @param {string} key
     * @param {*} value
     */
    data: function(key, value) {
        this._data[key] = value;
    }

};

module.exports = Client;