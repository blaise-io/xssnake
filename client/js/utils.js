/*jshint globalstrict:true*/
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

    loadScript: function(url, callback) {
        var script, head;
        script = document.createElement('script');
        script.async = 'async';
        script.src = url;
        script.onload = callback;
        head = document.querySelector('head');
        head.insertBefore(script, head.firstChild);
    },

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

    exec: function(func, args) {
        func.apply(func, args);
    },

    publish: function(topic) {
        var args = Array.prototype.slice.call(arguments).splice(1),
            pubsubsTopic = this.subscriptions[topic];
        if (pubsubsTopic) {
            for (var k in pubsubsTopic) {
                if (pubsubsTopic.hasOwnProperty(k)) {
                    this.exec(pubsubsTopic[k], args);
                }
            }
        }
    },

    subscribe: function(topic, id, callback) {
        if (!this.subscriptions[topic]) {
            this.subscriptions[topic] = [];
        }
        this.subscriptions[topic][id] = callback;
    },

    unsubscribe: function(topic, id) {
        if (typeof id !== 'undefined') {
            delete this.subscriptions[topic][id];
        } else {
            delete this.subscriptions[topic];
        }
    }

};