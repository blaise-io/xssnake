import { _, indexCarousel } from "../../shared/util";
import { colorSchemes } from "../bootstrap/registerColorSchemes";
import { STORAGE } from "../const";
import { SelectStage } from "./base/selectStage";
import { Menu, MenuOption } from "./components/menu";
import { State } from "../state";
import { storage } from "../util/clientUtil";

export class ColorStage extends SelectStage {
    constructor() {
        super();
        const selected = indexCarousel(storage.get(STORAGE.COLOR) as number, colorSchemes.length);
        this.menu = new Menu(_("Color Scheme").toUpperCase(), "", selected);
        this.menu.options = colorSchemes.map((colorScheme) => {
            return new MenuOption(
                colorScheme.title,
                colorScheme.desc,
                () => {
                    State.flow.previousStage();
                },
                (index) => {
                    storage.set(STORAGE.COLOR, index);
                    State.canvas.setColorScheme(colorSchemes[index]);
                },
            );
        });
    }
}
