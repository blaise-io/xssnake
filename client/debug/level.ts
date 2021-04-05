// Debug URL: debug.html?debug=LinesLevel
import { levels } from "../../shared/data/levels";
import { Levelset } from "../../shared/levelset/levelset";
import { ClientGame } from "../game/clientGame";
import { ClientPlayer } from "../room/clientPlayer";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { NeuteredMenuSnake } from "../stage/menuSnake";
import { State } from "../state/state";

const match = location.search.match(/debug=(.+Level)$/);
if (match) {
    State.menuSnake = new NeuteredMenuSnake();

    document.addEventListener("DOMContentLoaded", function () {
        const player = new ClientPlayer();
        player.local = true;

        const players = new ClientPlayerRegistry();
        players.add(player);
        players.localPlayer = player;

        const levelObject = match[1];
        const levelset = new Levelset();
        const level = new levels[levelObject](levelset.getConfig());

        level.preload(function () {
            State.flow.destruct();
            const game = new ClientGame(level, players);
            game.start();
        });
    });
}
