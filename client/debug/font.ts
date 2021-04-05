import { Shape } from "../../shared/shape";
import { benchmark } from "../../shared/util";
import { NeuteredMenuSnake } from "../stage/menuSnake";
import { State } from "../state/state";
import { font, fontPixels } from "../ui/font";
import { zoom } from "../ui/transformClient";

if (location.search.match(/debug=font/)) {
    State.menuSnake = new NeuteredMenuSnake();
    setTimeout(function () {
        State.flow.destruct();
        const text = [
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz",
            "1234567890 ~@#$%^&*()?/",
            // Problematic chars and kerning:
            "0124zZ2bdp14MN Kern: LYABLE",
        ].join("\n");
        benchmark(20, function () {
            State.shapes.A = new Shape(zoom(2, fontPixels(text)));
            State.shapes.B = font("ABCDEFGHIJKLMNOPQRSTUVWYXZ abcdefghijklmnopqrstuvwxyz", 8, 64);
            State.shapes.C = new Shape(zoom(4, fontPixels("<XSSNAKE>"), 0, 70));
        });
    }, 200);
}
