import { HEIGHT } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { noop } from "../../../shared/util";
import { KEY, MENU_LEFT, MENU_TITLE_HEIGHT, MENU_TOP, MENU_WRAP } from "../../const";
import { State } from "../../state";
import { fontHeight, fontPixels, LINE_HEIGHT, LINE_HEIGHT_MENU } from "../../ui/font";
import { zoom } from "../../ui/transformClient";
import { StageConstructor } from "../base/stage";

export class MenuOption {
    constructor(
        public next: StageConstructor,
        public title: string,
        public description = "",
        public onselect: (index: number) => void = () => noop
    ) {
        this.title = this.title.toUpperCase();
    }
}

export class Menu {
    private selected: number;
    private options: MenuOption[];

    constructor(public header: string, public footer: string = "") {
        this.header = header || "";
        this.footer = footer || "";
        this.selected = 0;
        this.options = [];
    }

    addOption(option: MenuOption): void {
        this.options.push(option);
    }

    prev(): number {
        return this.select(this.selected - 1);
    }

    next(): number {
        return this.select(this.selected + 1);
    }

    select(select: number): number {
        const max = this.options.length - 1;

        if (typeof select !== "number") {
            select = 0;
        }
        if (select < 0) {
            select = max;
        } else if (select > max) {
            select = 0;
        }

        this.selected = select;
        this.getSelectedOption().onselect(this.selected);
        return select;
    }

    getSelectedOption(): MenuOption {
        return this.options[this.selected];
    }

    getNextStage(): StageConstructor {
        return this.getSelectedOption().next;
    }

    getShape(): Shape {
        const x = MENU_LEFT;
        let y = MENU_TOP; // Header
        let headerPixels = fontPixels(this.header);
        headerPixels = zoom(2, headerPixels, x, y);
        const shape = new Shape(headerPixels);
        y += MENU_TITLE_HEIGHT;

        // Footer
        shape.add(fontPixels(this.footer, x, HEIGHT - 3 - fontHeight(this.footer)));

        // Draw options
        for (let i = 0, m = this.options.length; i < m; i++) {
            const active = this.selected === i;
            shape.add(fontPixels(this.options[i].title, x, y, { invert: active }));
            y += LINE_HEIGHT_MENU;
        }

        // Help text line(s)
        if (this.options.length) {
            const desc = this.getSelectedOption().description;
            y += LINE_HEIGHT;
            shape.add(fontPixels(desc, x, y, { wrap: MENU_WRAP }));
        }

        return shape;
    }

    handleKeys(event: KeyboardEvent): boolean {
        switch (event.keyCode) {
            case KEY.UP:
                this.prev();
                State.audio.play("menu");
                return true;
            case KEY.DOWN:
                this.next();
                State.audio.play("menu");
                return true;
        }
        return false;
    }
}
