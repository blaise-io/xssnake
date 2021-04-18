import { ClientState } from "../state/clientState";
import { font } from "../ui/font";

export function debugTab(): void {
    setTimeout(function () {
        ClientState.shapes = {};
        const text = [
            "This line does not affect alignment.",
            "",
            "Label\tValue A",
            "Second Label\tAligned with A",
            "\tEmpty label",
        ].join("\n");
        ClientState.shapes.testtabs = font(text, 10, 10);
    }, 200);
}
