import { ClientOptions } from "../room/options";
import { GameStage } from "./base/gameStage";

export class QuickGame extends GameStage {
    getSerializedGameOptions() {
        const options = new ClientOptions();
        options.isQuickGame = true;
        return options.serialize();
    }
}
