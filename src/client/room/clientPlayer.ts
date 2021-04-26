import { Level } from "../../shared/level/level";
import { Player } from "../../shared/room/player";
import { ClientSnake } from "../game/clientSnake";

export class ClientPlayer extends Player {
    snake: ClientSnake;

    constructor(name = "", public local = false) {
        super(name);
        this.snake = undefined;
    }

    deserialize(serialized: [string, number]): void {
        super.deserialize(serialized);
        if (!this.connected && this.snake) {
            this.snake.setCrashed();
        }
    }

    setSnake(index: number, level: Level): void {
        this.snake = new ClientSnake(index, this.local, this.name, this.emitFn, level);
    }

    emitFn(direction: number): void {
        console.log(direction);
    }

    unsetSnake(): void {
        if (this.snake) {
            this.snake.destruct();
        }
    }
}
