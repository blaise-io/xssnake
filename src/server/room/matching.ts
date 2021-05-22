import { RoomOptions } from "../../shared/room/roomOptions";
import { ServerRoom } from "./serverRoom";

export function getMatchingRoom(
    rooms: ServerRoom[],
    requestOptions: RoomOptions,
): ServerRoom | undefined {
    for (let i = 0, m = rooms.length; i < m; i++) {
        const room = rooms[i];
        if (room.isAwaitingPlayers()) {
            if (matches(room.options, requestOptions)) {
                return room;
            }
        }
    }
}

function matches(considered: RoomOptions, requested: RoomOptions): boolean {
    if (considered.isPrivate || requested.isPrivate) {
        return false;
    }

    if (requested.isXSS !== considered.isXSS) {
        return false;
    }

    if (requested.isQuickGame) {
        return true;
    }

    return (
        requested.levelSetIndex === considered.levelSetIndex &&
        requested.hasPowerups === considered.hasPowerups &&
        requested.maxPlayers <= considered.maxPlayers
    );
}
