import { colorSchemes } from "../bootstrap/registerColorSchemes";
import { STORAGE_COLOR } from "../const";
import { SelectStage } from "../stage_base/selectStage";
import { SelectMenu } from "../stage_class_helper/selectMenu";
import { State } from "../state/state";
import { storage } from "../util/clientUtil";

export class ColorStage extends SelectStage {
    constructor() {
        super();
        this.menu = this._getMenu();
        this.menu.select(storage(STORAGE_COLOR));
    }

    /**
   * @return {SelectMenu}
   * @private
   */
    _getMenu() {
        const menu = new SelectMenu("COLOR SCHEME");
        for (let i = 0, m = colorSchemes.length; i < m; i++) {
            const title = colorSchemes[i].title; const desc = colorSchemes[i].desc;
            menu.addOption(null, null, title, desc, this._setColor.bind(this));
        }
        return menu;
    }

    /**
   * @param {number} index
   * @private
   */
    _setColor(index) {
        State.canvas.setColorScheme(colorSchemes[index]);
        storage(STORAGE_COLOR, index);
    }
}
