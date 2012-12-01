/*jshint globalstrict:true */

'use strict';


/**
 * Pubsub
 * @constructor
 */
function PublishSubscribe() {
    this._subscriptions = {};
}

PublishSubscribe.prototype = {

    /**
     * @param {string} topic
     */
    publish: function(topic) {
        var args = Array.prototype.slice.call(arguments, 1),
            subscriptions = this._subscriptions[topic];
        if (subscriptions) {
            for (var key in subscriptions) {
                if (subscriptions.hasOwnProperty(key)) {
                    this._exec(subscriptions[key], args);
                }
            }
        }
    },

    /**
     * @param {string} topic
     * @param {string} key
     * @param {Object} callback
     */
    subscribe: function(topic, key, callback) {
        if (!this._subscriptions[topic]) {
            this._subscriptions[topic] = [];
        }
        this._subscriptions[topic][key] = callback;
    },

    /**
     * @param {string} topic
     * @param {?string} key
     */
    unsubscribe: function(topic, key) {
        if (topic in this._subscriptions) {
            if (typeof key !== 'undefined') {
                delete this._subscriptions[topic][key];
            } else {
                delete this._subscriptions[topic];
            }
        }
    },

    /**
     * @param {Object} func
     * @param {Array} args
     * @private
     */
    _exec: function(func, args) {
        // Wrapped in setTimeout to prevent locks
        setTimeout(function() {
            func.apply(func, args);
        }, 0);
    }

};