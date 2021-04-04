export class EventHandler {
    _topics: any;

    constructor() {
        this._topics = {};
    }

    /**
     * @param {number|string} topic
     * @param {...*} eventData
     */
    trigger(topic, ...eventData)): void {
        let topicKeys, topics = this._topics[topic];
        if (topics) {
            topicKeys = Object.keys(topics);
            for (let i = 0, m = topicKeys.length; i < m; i++) {
                const key = topicKeys[i];
                if (topics.hasOwnProperty(key)) {
                    topics[key](...eventData);
                }
            }
        }
    }

    /**
     * @param {number|string} topic
     * @param {string} key
     * @param {Function} callback
     */
    on(topic, key, callback)): void {
        if (!this._topics[topic]) {
            this._topics[topic] = {};
        }
        this._topics[topic][key] = callback;
        if ("on" + topic in document) {
            document.addEventListener(String(topic), callback, false);
        }
    }

    /**
     * @param {number|string} topic
     * @param {string} key
     * @param {function((Event|null))} callback
     */
    once(topic, key, callback)): void {
        const callbackAndOff = function() {
            callback.apply(callback, arguments);
            this.off(topic, key);
        }.bind(this);
        this.on(topic, key, callbackAndOff);
    }

    /**
     * @param {number|string} topic
     * @param {string=} key
     */
    off(topic, key)): void {
        let callback;
        if (topic in this._topics) {
            if (typeof key !== "undefined") {
                if ("on" + topic in document) {
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
