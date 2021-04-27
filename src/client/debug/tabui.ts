import { State } from "../state";
import { font } from "../ui/font";

export function debugTabUI(): void {
    window.setTimeout(() => {
        State.shapes = {};
        const text = [
            "This line does not affect alignment.",
            "",
            "Label\tValue A",
            "Second Label\tAligned with A",
            "\tEmpty label",
        ].join("\n");
        State.shapes.testtabs = font(text, 10, 10);
    }, 200);
}
