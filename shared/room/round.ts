/**
 * @param {room.PlayerRegistry} players
 * @param {room.Options} options
 * @constructor
 */
export class Round {
    constructor(Round) {
    this.players = players;
    this.options = options;
    /** @type {Number} */
    this.levelsetIndex = null;
    /** @type {Number} */
    this.levelIndex = null;
    /** @type {levelset.Levelset} */
    this.levelset = null;
    /** @type {level.Level} */
    this.level = null;

    this.index = 0;
    this.started = false;
};



    serialize() {
        return [this.levelsetIndex, this.levelIndex];
    },

    deserialize(serialized) {
        this.levelsetIndex = serialized[0];
        this.levelIndex = serialized[1];
    },

    getLevel(levelsetIndex, levelIndex) {
        var levelset = State.levelsetRegistry.getLevelset(levelsetIndex);
        return levelset.getLevel(levelIndex);
    }

};
