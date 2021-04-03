import { ClientOptions } from "../room/options";
import { Game } from "../stage_base/gameStage";

export class SinglePlayer extends Game {

    getSerializedGameOptions() {
        const options = new ClientOptions();
        options.maxPlayers = 1;
        options.isPrivate = true;
        return options.serialize();
    }

}
