export class ChatMessage {
    private readonly notificationPrefix = "#";

    constructor(public author: string | undefined, public body: string) {}

    getFormatted(): string {
        if (!this.author) {
            return this.notificationPrefix + this.body;
        } else {
            return this.author + ": " + this.body;
        }
    }
}
