/*jshint globalstrict:true */

'use strict';


/**
 * Pubsub
 * @constructor
 */
function PublishSubscribe() {
    this.subscriptions = {};
}

PublishSubscribe.prototype = {

    /**
     * @param {string} topic
     */
    publish: function(topic) {
        var args = Array.prototype.slice.call(arguments).splice(1),
            pubsubsTopic = this.subscriptions[topic];
        if (pubsubsTopic) {
            for (var key in pubsubsTopic) {
                if (pubsubsTopic.hasOwnProperty(key)) {
                    this._exec(pubsubsTopic[key], args);
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
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = [];
        }
        this.subscriptions[topic][key] = callback;
    },

    /**
     * @param {string} topic
     * @param {string=} key
     */
    unsubscribe: function(topic, key) {
        if (typeof key !== 'undefined') {
            delete this.subscriptions[topic][key];
        } else {
            delete this.subscriptions[topic];
        }
    },

    /**
     * @param {Object} func
     * @param {Array} args
     * @private
     */
    _exec: function(func, args) {
        func.apply(func, args);
    }

};