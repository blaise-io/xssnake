/*jshint globalstrict:true */
/*globals XSS*/

'use strict';

/**
 * Utils
 * @constructor
 */
function Utils() {
    this.subscriptions = {};
}

Utils.prototype = {

    /**
     * @param {string} url
     * @param {function()} callback
     */
    loadScript: function(url, callback) {
        var script, head;
        script = document.createElement('script');
        script.async = 'async';
        script.src = url;
        script.onload = callback;
        script.onerror = function() {
            throw new Error('Could not load ' + url);
        };
        head = document.querySelector('head');
        head.insertBefore(script, head.firstChild);
    },

    /**
     * @param {!Object} destination
     * @param {!Object} source
     * @return {!Object}
     */
    extend: function(destination, source) {
        for (var k in source) {
            if (source.hasOwnProperty(k)) {
                destination[k] = source[k];
            }
        }
        return destination;
    },

    addListener: {
        keydown: function(listener) {
            return XSS.doc.addEventListener('keydown', listener, false);
        },
        keyup  : function(listener) {
            return XSS.doc.addEventListener('keyup', listener, false);
        }
    },

    removeListener: {
        keydown: function(listener) {
            return XSS.doc.removeEventListener('keydown', listener, false);
        },
        keyup  : function(listener) {
            return XSS.doc.removeEventListener('keyup', listener, false);
        }
    },

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