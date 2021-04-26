import { _ } from "../../shared/util";
import { HASH_ROOM, STORAGE_NAME } from "../const";
import { COPY_MAIN_INSTRUCT } from "../copy/copy";
import { FlowData } from "../flow";
import { AutoJoinStage } from "./autoJoinStage";
import { MenuSnake } from "./components/menuSnake";
import { SelectStage } from "./base/selectStage";
import { SelectMenu } from "./components/selectMenu";
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

    private _getMenu(): SelectMenu {
        const name = storage(STORAGE_NAME) as string;

        const header = name ? "YAY " + name.toUpperCase() + " IS BACK!" : "MULTIPLAYER SNAKE!";

        const menu = new SelectMenu(header, COPY_MAIN_INSTRUCT);
        menu.addOption(null, QuickGameStage, _("QUICK GAME"));
        menu.addOption(null, NameStage, _("MULTIPLAYER"));
        menu.addOption(null, SinglePlayerGameStage, _("SINGLE PLAYER"));
        menu.addOption(null, ColorStage, _("COLOR SCHEME"));
        menu.addOption(null, CreditsStage, _("CREDITS"));

        return menu;
    }
}
