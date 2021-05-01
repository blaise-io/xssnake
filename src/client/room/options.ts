import { levelsets } from "../../shared/data/levelsets";
import { RoomOptions } from "../../shared/room/roomOptions";
import { randomArrIndex } from "../../shared/util";
import {
    FIELD_LEVEL_SET,
    FIELD_MAX_PLAYERS,
    FIELD_POWERUPS,
    FIELD_PRIVATE,
    FIELD_XSS,
} from "../const";

export class ClientOptions extends RoomOptions {
    constructor() {
        super();
        this.levelsetIndex = randomArrIndex(levelsets);
    }

    destruct(): void {}

    deserialize(...args: any[]): void {}

    setOptionsFromForm(indexedOptions: (number | boolean)[]): void {
        this.isQuickGame = false;
        this.maxPlayers = indexedOptions[FIELD_MAX_PLAYERS] as number;
        this.levelsetIndex = indexedOptions[FIELD_LEVEL_SET] as number;
        this.hasPowerups = indexedOptions[FIELD_POWERUPS] as boolean;
        this.isPrivate = indexedOptions[FIELD_PRIVATE] as boolean;
        this.isXSS = indexedOptions[FIELD_XSS] as boolean;
    }
}
