import { NC_OPTIONS_SERIALIZE } from "../../shared/const";
import { RoomOptions } from "../../shared/room/roomOptions";
import { ServerPlayer } from "./serverPlayer";

export class ServerOptions extends RoomOptions {
    constructor(dirtyOptions: UntrustedData) {
        super();

        if (dirtyOptions) {
            this.deserialize(dirtyOptions);
        }
    }

    emit(player: ServerPlayer): void {
        player.emit(NC_OPTIONS_SERIALIZE, this.serialize());
    }

    matches(request: ServerOptions): boolean {
        // TODO: Write as separate if () { return }
        return (
            !this.isPrivate &&
            !request.isPrivate &&
            request.isXSS === this.isXSS &&
            (request.isQuickGame ||
                (request.levelset === this.levelset &&
                    request.hasPowerups === this.hasPowerups &&
                    request.maxPlayers <= this.maxPlayers))
        );
    }
}
