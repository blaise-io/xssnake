import { ROOM_KEY_LENGTH } from "../../shared/const";
import { _, getRandomName } from "../../shared/util";
import { isStrOfLen } from "../../shared/util/sanitizer";
import { HASH, STORAGE } from "../const";
import { COPY_MAIN_INSTRUCT } from "../copy/copy";
import { State } from "../state";
import { error, storage, urlHash } from "../util/clientUtil";
import { AutoJoinStage } from "./autoJoinStage";
import { GameStage } from "./base/gameStage";
import { SelectStage } from "./base/selectStage";
import { ColorStage } from "./colorStage";
import { AutoJoinDialog } from "../ui/autoJoinDialog";
import { Menu, MenuOption } from "./components/menu";
import { MenuSnake } from "./components/menuSnake";
import { CreditsStage } from "./creditsStage";
import { NameStage } from "./nameStage";

export class MainStage extends SelectStage {
    constructor() {
        super();

        const roomKey = urlHash(HASH.ROOM);
        this.menu = this.getMenu();

        if (isStrOfLen(roomKey, ROOM_KEY_LENGTH)) {
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

    private getMenu(): Menu {
        const name = storage.get(STORAGE.NAME) as string;
        const header = (name
            ? `Yay ${name.toUpperCase()} is back!`
            : "Multiplayer Snake!"
        ).toUpperCase();

        const menu = new Menu(header, COPY_MAIN_INSTRUCT);

        menu.add(
            new MenuOption(_("Quick Game"), "", () => {
                State.flow.data.roomOptions.isQuickGame = true;
                State.flow.data.name = (storage.get(STORAGE.NAME) as string) || getRandomName();
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
                State.flow.data.name = (storage.get(STORAGE.NAME) as string) || _("You");
                State.flow.data.roomOptions.maxPlayers = 1;
                State.flow.data.roomOptions.isOnline = false;
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
