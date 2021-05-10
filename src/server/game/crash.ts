import { CRASH_INTO } from "../../shared/game/snakeMove";
import { Player } from "../../shared/room/player";

// Used in game.bak
export class Crash {
    location?: Coordinate;
    parts: Coordinate[];
    time: Date;
    draw: boolean;

    constructor(public type: number, public client: Player, public opponent: Player) {
        this.parts = client.snake!.parts.slice();
        this.time = new Date();
        this.draw = this.detectDraw();
    }

    detectDraw(): boolean {
        if (this.opponent && this.opponent.snake) {
            const diff = this.client.snake!.direction + this.opponent.snake!.direction;
            if (Math.abs(diff) === 2) {
                this.type = CRASH_INTO.OPPONENT_HEAD;
                return true;
            }
        }
        return false;
    }

    // emitNotice() {
    //     let data = [
    //         NOTICE_CRASH,
    //         this.type,
    //         this.client.model.index
    //     ];
    //     if (this.opponent) {
    //         data.push(this.opponent.model.index);
    //     }
    //     this.client.room.emit(NC_CHAT_NOTICE, data);
    // }
}
