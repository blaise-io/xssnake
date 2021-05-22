import { fontWidth } from "../ui/font";

export class ChatMessage {
    private notificationPrefix: string;

    constructor(public author: string | undefined, public body: string) {
        this.notificationPrefix = "#";
    }

    getFormatted(): string {
        if (!this.author) {
            return this.notificationPrefix + this.body;
        } else {
            return this.author + ": " + this.body;
        }
    }

    getOffset(): number {
        return !this.author ? 0 : fontWidth(this.notificationPrefix);
    }
}
