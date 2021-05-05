import { DIRECTION } from "../../shared/const";
import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { ClientSnake } from "../game/clientSnake";

export class ClientPlayer extends Player {
    snake: ClientSnake;

    static fromPlayer(player: Player): ClientPlayer {
        return new ClientPlayer(
            player.name,
            player.connected,
            player.local,
            player.score,
            player.snake,
        );
    }

    // /** @deprecated */
    // deserialize(serialized: [string, number]): void {
    //     super.deserialize(serialized);
    //     if (!this.connected && this.snake) {
    //         this.snake.setCrashed();
    //     }
    // }

    setSnake(index: number, level: Level): void {
        this.snake = new ClientSnake(
            index,
            this.local,
            this.name,
            (direction) => {
                this.emitSnake(direction);
            },
            level,
        );
    }

    emitSnake(direction: DIRECTION): void {
        console.log(direction);
    }

    unsetSnake(): void {
        if (this.snake) {
            this.snake.destruct();
        }
    }
}
