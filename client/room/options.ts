/**
 * @constructor
 * @extends {room.Options}
 */
import { Options } from "../../shared/room/options";
import {
    FIELD_LEVEL_SET,
    FIELD_MAX_PLAYERS,
    FIELD_POWERUPS,
    FIELD_PRIVATE,
    FIELD_XSS,
} from "../const";
import { State } from "../state/state";

export class ClientOptions extends Options {
    constructor() {
        super();
        this.levelset = State.levelsetRegistry.getRandomLevelsetIndex();
    }

    setOptionsFromForm(indexedOptions) {
        this.isQuickGame = false;
        this.maxPlayers = indexedOptions[FIELD_MAX_PLAYERS];
        this.levelset = indexedOptions[FIELD_LEVEL_SET];
        this.hasPowerups = indexedOptions[FIELD_POWERUPS];
        this.isPrivate = indexedOptions[FIELD_PRIVATE];
        this.isXSS = indexedOptions[FIELD_XSS];
    }
}
