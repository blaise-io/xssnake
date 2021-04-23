import { ClientOptions } from "../room/options";
import { GameStage } from "./base/gameStage";

export class QuickGame extends GameStage {
    getSerializedGameOptions(): [number, number, number, number, number, number] {
        const options = new ClientOptions();
        options.isQuickGame = true;
        return options.serialize();
    }
}
