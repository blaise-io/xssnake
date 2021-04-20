import { CrosshairLevel } from "../../shared/levels/debug/crosshair";
import { LinesLevel } from "../../shared/levels/debug/lines";
import { ClientGame } from "../game/clientGame";
import { ClientPlayer } from "../room/clientPlayer";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { ClientState } from "../state/clientState";
import { clientImageLoader } from "../util/clientUtil";

export function debugLevel(): void {
    const levels = Object.fromEntries([
        ["lines", LinesLevel],
        ["crosshair", CrosshairLevel],
    ]);

    const levelName: string =
        new URL(window.location.href).searchParams.get("level") ||
        prompt(`&level=${Object.keys(levels).join("|")}`);

    window.setTimeout(() => {
        ClientState.flow.destruct();

        const level = new levels[levelName]();
        level.load(clientImageLoader).then(() => {
            const localPlayer = new ClientPlayer("Blaise", true);
            localPlayer.setSnake(0, level);

            const players = new ClientPlayerRegistry(localPlayer);
            const game = new ClientGame(level, players);

            game.start();
        });
    }, 100);
}
