export class EventHandler {
    _topics: Record<string, Record<string, CallableFunction>>;

    constructor() {
        this._topics = {};
    }

    trigger(topic: string, ...eventData: unknown[]): void {
        const topics = this._topics[topic];
        if (topics) {
            const topicKeys = Object.keys(topics);
            for (let i = 0, m = topicKeys.length; i < m; i++) {
                const key = topicKeys[i];
                topics[key](...eventData);
            }
        }
    }

    on(topic: number | string, key: string, callback: CallableFunction): void {
        if (!this._topics[topic]) {
            this._topics[topic] = {};
        }
        this._topics[topic][key] = callback;

        if ("on" + topic in document) {
            console.log(`Deprecated: on${topic}`);
            document.addEventListener(
                topic as keyof DocumentEventMap,
                callback as (event: Event) => void,
                false,
            );
        }
    }

    // once(topic: number | string, key: string, callback: CallableFunction): void {
    //     const callbackAndOff = function (...args) {
    //         callback(...args);
    //         this.off(topic, key);
    //     }.bind(this);
    //     this.on(topic, key, callbackAndOff);
    // }

    off(topic: number | string, key?: string): void {
        if (topic in this._topics) {
            if (typeof key !== "undefined") {
                if ("on" + topic in document) {
                    const callback = this._topics[topic][key];
                    document.removeEventListener(
                        topic.toString() as keyof DocumentEventMap,
                        callback as (event: Event) => void,
                        false,
                    );
                }
                delete this._topics[topic][key];
            } else {
                delete this._topics[topic];
            }
        }
    }
}
