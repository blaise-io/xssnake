import { _ } from "../../shared/util";
import { HASH_ROOM, STORAGE_NAME } from "../const";
import { COPY_MAIN_INSTRUCT } from "../copy/copy";
import { FlowData } from "../flow";
import { AutoJoinStage } from "./autoJoinStage";
import { MenuSnake } from "./components/menuSnake";
import { SelectStage } from "./base/selectStage";
import { Menu, MenuOption } from "./components/menu";
import { State } from "../state";
import { error, storage, urlHash } from "../util/clientUtil";
import { AutoJoinDialog } from "./components/autoJoinDialog";
import { ColorStage } from "./colorStage";
import { CreditsStage } from "./creditsStage";
import { NameStage } from "./nameStage";
import { QuickGameStage } from "./quickGameStage";
import { SinglePlayerGameStage } from "./singlePlayerGameStage";

export class MainStage extends SelectStage {
    private data: Record<string, never>;

    constructor(private flowData: FlowData) {
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
                this.flowData.room = clientRoom;
                State.flow.switchStage(AutoJoinStage);
            },
            (msg) => {
                error(msg);
            }
        );
    }

    construct(): void {
        this.data = {};
        super.construct();
    }

    private _getMenu(): Menu {
        const name = storage(STORAGE_NAME) as string;

        const header = (name
            ? `Yay ${name.toUpperCase()} is back!`
            : "Multiplayer Snake!"
        ).toUpperCase();

        const menu = new Menu(header, COPY_MAIN_INSTRUCT);

        menu.addOption(new MenuOption(QuickGameStage, _("QUICK GAME")));
        menu.addOption(new MenuOption(NameStage, _("MULTIPLAYER")));
        menu.addOption(new MenuOption(SinglePlayerGameStage, _("SINGLE PLAYER")));
        menu.addOption(new MenuOption(ColorStage, _("COLOR SCHEME")));
        menu.addOption(new MenuOption(CreditsStage, _("CREDITS")));

        return menu;
    }
}
