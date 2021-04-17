// Debug URL: client.html?debug=tab
import { NeuteredMenuSnake } from "../stage/menuSnake";
import { ClientState } from "../state/clientState";
import { font } from "../ui/font";

if (location.search.match(/debug=tab/)) {
    ClientState.menuSnake = new NeuteredMenuSnake();
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
