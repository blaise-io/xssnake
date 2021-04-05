import { ClientOptions } from "../room/options";
import { Game } from "../stage_base/gameStage";

export class QuickGame extends Game {
    getSerializedGameOptions() {
        const options = new ClientOptions();
        options.isQuickGame = true;
        return options.serialize();
    }
}
