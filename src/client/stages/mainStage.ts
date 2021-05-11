import { ROOM_KEY_LENGTH } from "../../shared/const";
import { loadLevel } from "../../shared/level/level";
import { BlankLevel } from "../../shared/level/levels/internal/blank";
import { _, getRandomName } from "../../shared/util";
import { isStrOfLen } from "../../shared/util/sanitizer";
import { HASH, STORAGE, UC } from "../const";
import { State } from "../state";
import { clientImageLoader, error, isMac, storage, stylizeUpper } from "../util/clientUtil";
import { getHash } from "../util/url";
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

        const roomKey = getHash(HASH.ROOM);
        this.menu = this.getMenu();

        if (isStrOfLen(roomKey, ROOM_KEY_LENGTH)) {
            this.initializeAutoJoin(roomKey);
        } else if (!State.menuSnake) {
            loadLevel(BlankLevel, clientImageLoader).then((level) => {
                State.menuSnake = new MenuSnake(level);
            });
        }
    }

    construct(): void {
        super.construct();
    }

    private getMenu(): Menu {
        const name = storage.get(STORAGE.NAME) as string;
        const header = stylizeUpper(name ? `Yay ${name} is back!` : "Multiplayer Snake!");

        const menu = new Menu(
            header,
            [
                _("M to mute/unmute sounds"),
                _(`${isMac() ? "Cmd+Ctrl+F11" : "F11"} to enter/exit fullscreen`),
                _("Arrow keys, Esc and " + UC.ENTER_KEY + " to navigate"),
            ].join(" …\n"),
        );

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

    private initializeAutoJoin(roomKey: string) {
        new AutoJoinDialog(
            roomKey,
            (messages) => {
                State.flow.data.roomPlayers = messages[0].players;
                State.flow.data.roomOptions = messages[1].options;
                State.flow.switchStage(AutoJoinStage);
            },
            (msg) => {
                error(msg);
            },
        );
    }
}
