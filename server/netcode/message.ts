/**
 * @param {string} jsonStr
 * @constructor
 */
export class Message {
    constructor(Message) {
        this.isClean = null;
        this.event = null;
        this.data = null;
        this.process(jsonStr);
    }

    process(jsonStr) {
        const message = this.sanitize(jsonStr);
        if (message) {
            this.isClean = true;
            this.event = message.event;
            this.data = message.data;
        }
    }

    sanitize(messageJsonStr) {
        let sanitizer;
        let arrayValidator;
        let eventNumberValidator;
        let messageJson;

        sanitizer = new Sanitizer(messageJsonStr).assertStringOfLength(3, 512).assertJSON();
        if (!sanitizer.valid()) {
            return null;
        }

        messageJson = sanitizer.json();
        arrayValidator = new Sanitizer(messageJson).assertArrayLengthBetween(1, 20);
        if (!arrayValidator.valid()) {
            return null;
        }

        eventNumberValidator = new Sanitizer(messageJson[0]).assertType("number");
        if (!eventNumberValidator.valid()) {
            return null;
        }

        // Maybe we should validate whether the message only contains
        // numbers, strings and arrays.

        return {
            event: eventNumberValidator.getValueOr(-1),
            data: messageJson.slice(1), // Validate in event listener.
        };
    }
}
