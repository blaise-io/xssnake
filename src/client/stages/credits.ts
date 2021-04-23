import { Shape } from "../../shared/shape";
import { MENU_LEFT, MENU_TITLE_HEIGHT, MENU_TOP, UC } from "../const";
import { ScreenStage } from "./base/screenStage";
import { fontPixels } from "../ui/font";
import { zoom } from "../ui/transformClient";

export class CreditsStage extends ScreenStage {
    getShape(): Shape {
        const left = MENU_LEFT;
        const top = MENU_TOP;

        const icons = [UC.BULB, "{}", UC.FONT, UC.BUG, UC.MUSIC, UC.SKULL];

        const body =
            icons.join(" + ") +
            "\n" +
            "BLAISE KAL  2012 - 2020\n\n" +
            "www.blaise.io\n" +
            "blaise.kal@gmail.com\n\n" +
            "Thank you for playing!\n" +
            "KEEP THE SNAKE ALIVE";

        return new Shape(
            zoom(2, fontPixels("CREDITS"), left, top),
            fontPixels(body, left, top + MENU_TITLE_HEIGHT)
        );
    }
}
