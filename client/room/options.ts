import { RoomOptions } from "../../shared/room/roomOptions";
import {
    FIELD_LEVEL_SET,
    FIELD_MAX_PLAYERS,
    FIELD_POWERUPS,
    FIELD_PRIVATE,
    FIELD_XSS,
} from "../const";
import { State } from "../state/state";

export class ClientOptions extends RoomOptions {
    constructor() {
        super();
        this.levelset = State.levelsetRegistry.getRandomLevelsetIndex();
    }

    setOptionsFromForm(indexedOptions: (number | boolean)[]): void {
        this.isQuickGame = false;
        this.maxPlayers = indexedOptions[FIELD_MAX_PLAYERS] as number;
        this.levelset = indexedOptions[FIELD_LEVEL_SET] as number;
        this.hasPowerups = indexedOptions[FIELD_POWERUPS] as boolean;
        this.isPrivate = indexedOptions[FIELD_PRIVATE] as boolean;
        this.isXSS = indexedOptions[FIELD_XSS] as boolean;
    }
}
