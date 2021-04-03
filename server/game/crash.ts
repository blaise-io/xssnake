import { CRASH_OPPONENT_DRAW} from "../../shared/const";
import { Player } from "../../shared/room/player";

// TODO: Not used?
export class Crash {
    location: Coordinate;
    parts: Coordinate[];
    time: Date;
    draw: boolean;

    constructor(public type: number, public client: Player, public opponent: Player) {
        this.location = null;

        this.parts = client.snake.parts.slice();
        this.time = new Date();
        this.draw = this.detectDraw();
    }

    detectDraw() {
        let diff;
        if (this.opponent) {
            diff = this.client.snake.direction + this.opponent.snake.direction;
            if (Math.abs(diff) === 2) {
                this.type = CRASH_OPPONENT_DRAW;
                return true;
            }
        }
        return false;
    }

    // emitNotice() {
    //     var data = [
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
