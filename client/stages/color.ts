import { colorSchemes } from "../bootstrap/registerColorSchemes";
import { STORAGE_COLOR } from "../const";
import { SelectStage } from "../stage_base/selectStage";
import { SelectMenu } from "../stage_class_helper/selectMenu";
import { State } from "../state/state";
import { storage } from "../util/clientUtil";

export class ColorStage extends SelectStage {
    constructor() {
        super();

        this.menu = new SelectMenu("COLOR SCHEME");
        for (let i = 0, m = colorSchemes.length; i < m; i++) {
            this.menu.addOption(
                null, null, colorSchemes[i].title, colorSchemes[i].desc, this.setColor.bind(this)
            );
        }
        this.menu.select(storage(STORAGE_COLOR));
    }

    private setColor(index: number): void {
        State.canvas.setColorScheme(colorSchemes[index]);
        storage(STORAGE_COLOR, index);
    }
}
