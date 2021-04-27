import { NeuteredMenuSnake } from "../stages/components/menuSnake";
import { State } from "../state";
import { debugDialog } from "./dialog";
import { debugFont } from "./font";
import { debugLevel } from "./level";
import { debugLine } from "./line";
import { debugMessages } from "./messages";
import { debugScoreboard } from "./scoreboard";
import { debugTabUI } from "./tabui";

export function runDebug(): void {
    const registry = Object.fromEntries([
        ["dialog", debugDialog],
        ["font", debugFont],
        ["line", debugLine],
        ["level", debugLevel],
        ["messages", debugMessages],
        ["scoreboard", debugScoreboard],
        ["tabui", debugTabUI],
    ]);

    const debug = new URL(window.location.href).searchParams.get("debug");
    if (debug) {
        State.menuSnake = new NeuteredMenuSnake();
        registry[debug]();
    }
}
