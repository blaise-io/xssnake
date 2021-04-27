import { _ } from "../../shared/util";
import { colorSchemes } from "../bootstrap/registerColorSchemes";
import { STORAGE_COLOR } from "../const";
import { SelectStage } from "./base/selectStage";
import { Menu, MenuOption } from "./components/menu";
import { State } from "../state";
import { storage } from "../util/clientUtil";

export class ColorStage extends SelectStage {
    constructor() {
        super();

        this.menu = new Menu(_("Color Scheme").toUpperCase());
        for (let i = 0, m = colorSchemes.length; i < m; i++) {
            this.menu.addOption(
                new MenuOption(undefined, colorSchemes[i].title, colorSchemes[i].desc, (index) => {
                    this.setColor(index);
                })
            );
        }
        this.menu.select(storage(STORAGE_COLOR) as number);
    }

    private setColor(index: number): void {
        State.canvas.setColorScheme(colorSchemes[index]);
        storage(STORAGE_COLOR, index);
    }
}
