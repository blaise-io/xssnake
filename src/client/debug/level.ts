import { loadLevel } from "../../shared/level/level";
import { CrosshairLevel } from "../../shared/level/levels/crosshair";
import { LinesLevel } from "../../shared/level/levels/lines";
import { PacmanLevel } from "../../shared/level/levels/pacman";
import { getRandomItemFrom } from "../../shared/util";
import { ClientGame } from "../game/clientGame";
import { ClientPlayer } from "../room/clientPlayer";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { clientImageLoader } from "../util/clientUtil";

export function debugLevel(): void {
    const levels = Object.fromEntries([
        ["lines", LinesLevel],
        ["crosshair", CrosshairLevel],
        ["pacman", PacmanLevel],
    ]);

    const levelName: string =
        new URL(window.location.href).searchParams.get("level") ||
        prompt(`&level=${Object.keys(levels).join(" | ")}`) ||
        getRandomItemFrom(Object.keys(levels));

    window.setTimeout(async () => {
        State.flow.destruct();

        const level = await loadLevel(levels[levelName], clientImageLoader);
        const localPlayer = new ClientPlayer("Blaise", undefined, true);
        const players = new ClientPlayerRegistry(localPlayer);
        const game = new ClientGame(level, players);

        game.start();
    }, 100);
}
