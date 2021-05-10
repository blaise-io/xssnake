import { debugDialog } from "./debug/dialog";
import { debugFont } from "./debug/font";
import { debugLevel } from "./debug/level";
import { debugLine } from "./debug/line";
import { debugMessages } from "./debug/messages";
import { debugScoreboard } from "./debug/scoreboard";
import { debugTabUI } from "./debug/tabui";

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
        registry[debug]();
    }
}
