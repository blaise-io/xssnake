/**
 * @param {Array=} dirtyOptions
 * @constructor
 * @extends {room.Options}
 */
export class ServerOptions {
    constructor(ServerOptions) {
    room.Options.call(this);

    if (dirtyOptions) {
        this.deserialize(dirtyOptions);
    }
};

extend(room.ServerOptions.prototype, room.Options.prototype);
extend(room.ServerOptions.prototype, /** @lends {room.ServerOptions.prototype} */ {

    /**
     * @param {room.ServerPlayer} player
     */
    emit(player): void {
        player.emit(NC_OPTIONS_SERIALIZE, this.serialize());
    }

    /**
     * @param {room.ServerOptions} request
     * @return {boolean}
     */
    matches(request): void {
        return (
            !this.isPrivate &&
            !request.isPrivate &&
            request.isXSS === this.isXSS &&
            (request.isQuickGame || (
                request.levelset === this.levelset &&
                request.hasPowerups === this.hasPowerups &&
                request.maxPlayers <= this.maxPlayers
            ))
        );
    }

});
