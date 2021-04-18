import { Shape } from "../../shared/shape";
import { benchmark } from "../../shared/util";
import { NeuteredMenuSnake } from "../stage/menuSnake";
import { ClientState } from "../state/clientState";
import { font, fontPixels } from "../ui/font";
import { zoom } from "../ui/transformClient";

export function debugFont(): void {
    ClientState.menuSnake = new NeuteredMenuSnake();
    setTimeout(function () {
        ClientState.flow.destruct();
        const text = [
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            "abcdefghijklmnopqrstuvwxyz",
            "1234567890 ~@#$%^&*()?/",
            // Problematic chars and kerning:
            "0124zZ2bdp14MN Kern: LYABLE",
        ].join("\n");
        benchmark(20, function () {
            ClientState.shapes.A = new Shape(zoom(2, fontPixels(text)));
            ClientState.shapes.B = font(
                "ABCDEFGHIJKLMNOPQRSTUVWYXZ abcdefghijklmnopqrstuvwxyz",
                8,
                64
            );
            ClientState.shapes.C = new Shape(zoom(4, fontPixels("<XSSNAKE>"), 0, 70));
        });
    }, 200);
}
