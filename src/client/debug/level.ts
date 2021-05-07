import { CrosshairLevel } from "../../shared/levels/crosshair";
import { LinesLevel } from "../../shared/levels/lines";
import { PacmanLevel } from "../../shared/levels/pacman";
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

    window.setTimeout(() => {
        State.flow.destruct();

        const level = new levels[levelName]();
        level.load(clientImageLoader).then(() => {
            const localPlayer = new ClientPlayer("Blaise", undefined, true);
            localPlayer.setSnake(0, level);

            const players = new ClientPlayerRegistry(localPlayer);
            const game = new ClientGame(level, players);

            game.start();
        });
    }, 100);
}
