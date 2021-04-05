import { COPY_LEVELSET_GAME } from "../../client/copy/copy";
import { Levelset } from "../levelset/levelset";

export class Game extends Levelset {
    constructor() {
        super();
        this.title = COPY_LEVELSET_GAME;
    }
}
