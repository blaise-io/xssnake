'use strict';

import { State } from "../state/state";

State.shapes.push(2)

export class EventHandler {
    private _topics: {};

    constructor() {
        this._topics = {};
    }

    /**
     * @param {number|string} topic
     * @param {...*} eventData
     */
    trigger(topic, eventData) {
        var topicKeys, topics = this._topics[topic];
        if (topics) {
            topicKeys = Object.keys(topics);
            for (var i = 0, m = topicKeys.length; i < m; i++) {
                var key = topicKeys[i];
                if (topics.hasOwnProperty(key)) {
                    topics[key].apply(topics[key], [].slice.call(arguments, 1));
                }
            }
        }
    }

    /**
     * @param {number|string} topic
     * @param {string} key
     * @param {Function} callback
     */
    on(topic, key, callback) {
        if (!this._topics[topic]) {
            this._topics[topic] = {};
        }
        this._topics[topic][key] = callback;
        if ('on' + topic in document) {
            document.addEventListener(String(topic), callback, false);
        }
    }

    /**
     * @param {number|string} topic
     * @param {string} key
     * @param {function((Event|null))} callback
     */
    once(topic, key, callback) {
        var callbackAndOff = function() {
            callback.apply(callback, arguments);
            this.off(topic, key);
        }.bind(this);
        this.on(topic, key, callbackAndOff);
    }

    /**
     * @param {number|string} topic
     * @param {string=} key
     */
    off(topic, key) {
        var callback;
        if (topic in this._topics) {
            if (typeof key !== 'undefined') {
                if ('on' + topic in document) {
                    callback = this._topics[topic][key];
                    document.removeEventListener(String(topic), callback, false);
                }
                delete this._topics[topic][key];
            } else {
                delete this._topics[topic];
            }
        }
    }
}
