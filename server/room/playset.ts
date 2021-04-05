/**
 * @param {number} levelsetIndex
 * @constructor
 */
LevelPlayset = function(levelsetIndex) {
    this.levelsetIndex = levelsetIndex;
    this.levelset = State.levelsetRegistry.getLevelset(this.levelsetIndex);
    /** @type {Array.<number>} */
    this.played = [];
};



    destruct() {
        this.levelset = null;
        this.played = null;
    }

    getNext() {
        let nextLevelsetIndex = this.levelset.getRandomLevelIndex(this.played);
        this.played.push(nextLevelsetIndex);
        return nextLevelsetIndex;
    }

};
