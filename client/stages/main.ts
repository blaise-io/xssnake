/**
 * @constructor
 * @extends {SelectStage}
 */
import { MenuSnake } from "../stage/menuSnake";
import { State } from "../state/state";
import { AutoJoinWizard } from "./autoJoinWizard";

export class MainStage extends SelectStage {

    constructor() {
        super()

        var roomKey = urlHash(HASH_ROOM);
        this.menu = this._getMenu();

        if (roomKey) {
            new AutoJoinWizard(roomKey);
        } else if (!State.menuSnake) {
            State.menuSnake = new MenuSnake();
        }
    };

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
        var menu, header, footer;

        header = function() {
            var name = storage(STORAGE_NAME);
            return name ?
                'YAY ' + name.toUpperCase() + ' IS BACK!' :
                'MULTIPLAYER SNAKE!';
        };

        footer = COPY_MAIN_INSTRUCT;

        menu = new SelectMenu(header, footer);
        menu.addOption(null, QuickGame, 'QUICK GAME');
        menu.addOption(null, NameStage, 'MULTIPLAYER');
        menu.addOption(null, SinglePlayer, 'SINGLE PLAYER');
        menu.addOption(null, ColorStage, 'COLOR SCHEME');
        menu.addOption(null, CreditsStage, 'CREDITS');

        return menu;
    }

});

