export class EventHandler {
    _topics: Record<string, Record<string, CallableFunction>>;

    constructor() {
        this._topics = {};
    }

    trigger(topic: string, ...eventData: unknown[]): void {
        let topicKeys;
        const topics = this._topics[topic];
        if (topics) {
            topicKeys = Object.keys(topics);
            for (let i = 0, m = topicKeys.length; i < m; i++) {
                const key = topicKeys[i];
                topics[key](...eventData);
            }
        }
    }

    on(topic: number|string, key: string, callback: CallableFunction): void {
        if (!this._topics[topic]) {
            this._topics[topic] = {};
        }
        this._topics[topic][key] = callback;
        if ("on" + topic in document) {
            document.addEventListener(
                topic as keyof DocumentEventMap,
                callback as (Event) => void,
                false
            );
        }
    }

    once(topic: number|string, key: string, callback: CallableFunction): void {
        const callbackAndOff = function(...args) {
            callback(...args);
            this.off(topic, key);
        }.bind(this);
        this.on(topic, key, callbackAndOff);
    }

    off(topic: number|string, key?: string): void {
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
