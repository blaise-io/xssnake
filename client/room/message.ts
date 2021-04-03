/**
 * @param {string|null|undefined=} author
 * @param {string=} body
 * @constructor
 */
import { fontWidth } from "../ui/font";

export class Message {
    private notificationPrefix: string;

    constructor(public author, public body) {
        this.author = author;
        this.body = body;
        this.notificationPrefix = "#";
    }

    getFormatted() {
        if (this.author === null) {
            return this.notificationPrefix + this.body;
        } else {
            return this.author + ": " + this.body;
        }
    }

    getOffset() {
        return this.author === null ? 0 : fontWidth(this.notificationPrefix);
    }

}
