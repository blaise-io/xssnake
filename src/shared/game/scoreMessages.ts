import { AUDIENCE } from "../messages";
import { Message, MessageId } from "../room/types";

export class ScoreMessage implements Message {
    static id: MessageId;
    static audience = AUDIENCE.CLIENT;

    constructor(public score: number[]) {}

    static deserialize(trustedNetcode: string): ScoreMessage {
        return new ScoreMessage(JSON.parse(trustedNetcode));
    }

    get serialized(): string {
        return JSON.stringify(this.score);
    }
}
