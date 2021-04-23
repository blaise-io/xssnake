import { ClientOptions } from "../room/options";
import { GameStage } from "./base/gameStage";

export class SinglePlayer extends GameStage {
    getSerializedGameOptions() {
        const options = new ClientOptions();
        options.maxPlayers = 1;
        options.isPrivate = true;
        return options.serialize();
    }
}
