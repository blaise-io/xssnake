import { HEIGHT } from "../../../shared/const";
import { Shape } from "../../../shared/shape";
import { indexCarousel, noop } from "../../../shared/util";
import { KEY, MENU_LEFT, MENU_TITLE_HEIGHT, MENU_TOP, MENU_WRAP } from "../../const";
import { State } from "../../state";
import { fontHeight, fontPixels, LINE_HEIGHT, LINE_HEIGHT_MENU } from "../../ui/font";
import { zoom } from "../../ui/transformClient";

export class MenuOption {
    constructor(
        public title: string,
        public description = "",
        public onsubmit: (index: number) => void,
        public onselect: (index: number) => void = noop,
    ) {
        this.title = this.title.toUpperCase();
    }
}

export class Menu {
    options: MenuOption[] = [];

    constructor(public header: string, public footer: string = "", public selected = 0) {}

    add(option: MenuOption): void {
        this.options.push(option);
    }

    get selectedOption(): MenuOption {
        return this.options[this.selected];
    }

    private previous(): number {
        return this.select(indexCarousel(this.selected - 1, this.options.length));
    }

    private next(): number {
        return this.select(indexCarousel(this.selected + 1, this.options.length));
    }

    private select(select: number): number {
        this.selected = select;
        this.selectedOption.onselect(this.selected);
        return select;
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
            const desc = this.selectedOption.description;
            y += LINE_HEIGHT;
            shape.add(fontPixels(desc, x, y, { wrap: MENU_WRAP }));
        }

        return shape;
    }

    handleKeys(event: KeyboardEvent): boolean {
        switch (event.keyCode) {
            case KEY.UP:
                this.previous();
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
