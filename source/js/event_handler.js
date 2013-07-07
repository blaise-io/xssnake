/*jshint globalstrict:true, expr:true, sub:true*/
/*globals XSS, CONST*/
'use strict';

/**
 * Pubsub
 * @constructor
 */
function EventHandler() {
    this._topics = {};
}

EventHandler.prototype = {

    /**
     * @param {string} topic
     */
    trigger: function(topic) {
        var topics = this._topics[topic];
        if (topics) {
            for (var key in topics) {
                if (topics.hasOwnProperty(key)) {
                    topics[key].apply(topics[key], [].slice.call(arguments, 1));
                }
            }
        }
    },

    /**
     * @param {string} topic
     * @param {string} key
     * @param {function((Event|null))} callback
     */
    on: function(topic, key, callback) {
        if (!this._topics[topic]) {
            this._topics[topic] = {};
        }
        this._topics[topic][key] = callback;
        if ('on' + topic in document) {
            document.addEventListener(topic, callback, false);
        }
    },

    /**
     * @param {string} topic
     * @param {string} key
     * @param {function((Event|null))} callback
     */
    once: function(topic, key, callback) {
        var callbackAndOff = function() {
            callback.apply(callback, arguments);
            this.off(topic, key);
        }.bind(this);
        this.on(topic, key, callbackAndOff);
    },

    /**
     * @param {string} topic
     * @param {string=} key
     */
    off: function(topic, key) {
        var callback;
        if (topic in this._topics) {
            if (typeof key !== 'undefined') {
                if ('on' + topic in document) {
                    callback = this._topics[topic][key];
                    document.removeEventListener(topic, callback, false);
                }
                delete this._topics[topic][key];
            } else {
                delete this._topics[topic];
            }
        }
    }

};
