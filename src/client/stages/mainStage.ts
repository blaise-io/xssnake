import { _ } from "../../shared/util";
import { HASH_ROOM, STORAGE_NAME } from "../const";
import { COPY_MAIN_INSTRUCT } from "../copy/copy";
import { AutoJoinStage } from "./autoJoinStage";
import { GameStage } from "./base/gameStage";
import { MenuSnake } from "./components/menuSnake";
import { SelectStage } from "./base/selectStage";
import { Menu, MenuOption } from "./components/menu";
import { State } from "../state";
import { error, storage, urlHash } from "../util/clientUtil";
import { AutoJoinDialog } from "./components/autoJoinDialog";
import { ColorStage } from "./colorStage";
import { CreditsStage } from "./creditsStage";
import { NameStage } from "./nameStage";

export class MainStage extends SelectStage {
    constructor() {
        super();

        const roomKey = urlHash(HASH_ROOM);
        this.menu = this._getMenu();

        if (roomKey) {
            this.initializeAutoJoin(roomKey);
        } else if (!State.menuSnake) {
            State.menuSnake = new MenuSnake();
        }
    }

    private initializeAutoJoin(roomKey) {
        new AutoJoinDialog(
            roomKey,
            (clientRoom) => {
                State.flow.data.room = clientRoom;
                State.flow.switchStage(AutoJoinStage);
            },
            (msg) => {
                error(msg);
            },
        );
    }

    construct(): void {
        super.construct();
    }

    private _getMenu(): Menu {
        const name = storage(STORAGE_NAME) as string;

        const header = (name
            ? `Yay ${name.toUpperCase()} is back!`
            : "Multiplayer Snake!"
        ).toUpperCase();

        const menu = new Menu(header, COPY_MAIN_INSTRUCT);

        menu.add(
            new MenuOption(_("Quick Game"), "", () => {
                State.flow.data.roomOptions.isQuickGame = true;
                State.flow.switchStage(GameStage);
            }),
        );
        menu.add(
            new MenuOption(_("Multiplayer"), "", () => {
                State.flow.switchStage(NameStage);
            }),
        );
        menu.add(
            new MenuOption(_("Single Player"), "", () => {
                State.flow.data.roomOptions.maxPlayers = 1;
                State.flow.data.roomOptions.isPrivate = true;
                State.flow.switchStage(GameStage);
            }),
        );
        menu.add(
            new MenuOption(_("Color Scheme"), "", () => {
                State.flow.switchStage(ColorStage);
            }),
        );
        menu.add(
            new MenuOption(_("Credits"), "", () => {
                State.flow.switchStage(CreditsStage);
            }),
        );

        return menu;
    }
}
