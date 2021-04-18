import { NeuteredMenuSnake } from "../stage/menuSnake";
import { ClientState } from "../state/clientState";
import { debugDialog } from "./dialog";
import { debugFont } from "./font";
import { debugLevel } from "./level";
import { debugMessages } from "./messages";
import { debugScoreboard } from "./scoreboard";
import { debugTab } from "./tab";

export function runDebug(): void {
    const registry = Object.fromEntries([
        ["dialog", debugDialog],
        ["font", debugFont],
        ["level", debugLevel],
        ["messages", debugMessages],
        ["scoreboard", debugScoreboard],
        ["tab", debugTab],
    ]);

    const debug = new URL(window.location.href).searchParams.get("debug");
    if (debug) {
        ClientState.menuSnake = new NeuteredMenuSnake();
        registry[debug]();
    }
}
