/**
 * @constructor
 * @extends {SelectStage}
 */
import { HASH_ROOM, STORAGE_NAME } from "../const";
import { COPY_MAIN_INSTRUCT } from "../copy/copy";
import { MenuSnake } from "../stage/menuSnake";
import { SelectStage } from "../stage_base/selectStage";
import { SelectMenu } from "../stage_class_helper/selectMenu";
import { State } from "../state/state";
import { storage, urlHash } from "../util/clientUtil";
import { AutoJoinWizard } from "./autoJoinWizard";
import { ColorStage } from "./color";
import { CreditsStage } from "./credits";
import { NameStage } from "./name";
import { QuickGame } from "./quickGame";
import { SinglePlayer } from "./singlePlayer";

export class MainStage extends SelectStage {
    private data: any;

    constructor() {
        super();

        const roomKey = urlHash(HASH_ROOM);
        this.menu = this._getMenu();

        if (roomKey) {
            new AutoJoinWizard(roomKey);
        } else if (!State.menuSnake) {
            State.menuSnake = new MenuSnake();
        }
    }

    construct() {
        this.data = {};
        super.construct();
    }

    /**
     * @return {Object}
     */
    getData() {
        return this.data;
    }

    /**
     * @return {SelectMenu}
     * @private
     */
    _getMenu() {
        const name = storage(STORAGE_NAME);

        const header = name ?
            "YAY " + name.toUpperCase() + " IS BACK!" :
            "MULTIPLAYER SNAKE!";

        const menu = new SelectMenu(header, COPY_MAIN_INSTRUCT);
        menu.addOption(null, QuickGame, "QUICK GAME");
        menu.addOption(null, NameStage, "MULTIPLAYER");
        menu.addOption(null, SinglePlayer, "SINGLE PLAYER");
        menu.addOption(null, ColorStage, "COLOR SCHEME");
        menu.addOption(null, CreditsStage, "CREDITS");

        return menu;
    }
}
