import { Levelset } from "../levelset/levelset";
import { _ } from "../util";

export class Game extends Levelset {
    constructor() {
        super();
        this.title = _("Pactris");
    }
}
