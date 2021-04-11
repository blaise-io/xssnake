import { ROOM_CAPACITY } from "../const";
import { Sanitizer } from "../util/sanitizer";

export class RoomOptions {
    isQuickGame: boolean;
    maxPlayers: number;
    levelset: number;
    hasPowerups: boolean;
    isPrivate: boolean;
    isXSS: boolean;

    constructor() {
        this.isQuickGame = false;
        this.maxPlayers = 6;
        this.levelset = 0;
        this.hasPowerups = true;
        this.isPrivate = false;
        this.isXSS = false;
    }

    destruct(): void {}

    serialize(): [number, number, number, number, number, number] {
        return [
            this.maxPlayers,
            this.levelset,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS),
        ];
    }

    deserialize(serialized: UntrustedData): void {
        this.maxPlayers = new Sanitizer(serialized[0])
            .assertBetween(1, ROOM_CAPACITY)
            .getValueOr(ROOM_CAPACITY) as number;

        this.levelset = new Sanitizer(serialized[1])
            // .assertBetween(0, State.levelsetRegistry.levelsets.length - 1)
            .getValueOr(0) as number;

        this.isQuickGame = Boolean(serialized[2]);
        this.hasPowerups = Boolean(serialized[3]);
        this.isPrivate = Boolean(serialized[4]);
        this.isXSS = Boolean(serialized[5]);
    }
}
