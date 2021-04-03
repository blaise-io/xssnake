/**
 * @constructor
 */
import { State } from "../../client/state/state";
import { ROOM_CAPACITY } from "../const";

export class Options {
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

    destruct() {}

    /**
     * @return {Array.<number>}
     */
    serialize() {
        return [
            this.maxPlayers,
            this.levelset,
            Number(this.isQuickGame),
            Number(this.hasPowerups),
            Number(this.isPrivate),
            Number(this.isXSS)
        ];
    }

    /**
     * @param {?} serialized
     */
    deserialize(serialized) {
        this.maxPlayers = new Sanitizer(serialized[0])
            .assertBetween(1, ROOM_CAPACITY)
            .getValueOr(ROOM_CAPACITY);

        this.levelset = new Sanitizer(serialized[1])
            .assertBetween(0, State.levelsetRegistry.levelsets.length - 1)
            .getValueOr(0);

        this.isQuickGame = Boolean(serialized[2]);
        this.hasPowerups = Boolean(serialized[3]);
        this.isPrivate = Boolean(serialized[4]);
        this.isXSS = Boolean(serialized[5]);
    }

}
