/**
 * Spawner
 * @param {game.Game} game
 * @constructor
 */
export class Spawner {
    constructor(Spawner) {
        this.game = game;
        this.spawns = [];
        this.locations = []; // Keep separate list for getEmptyLocation speed
    }



    destruct() {
        for (let i = 0, m = this.spawns.length; i < m; i++) {
            this._destructSpawn(i);
        }
    }

    /**
     * @param {number} type
     * @param {Coordinate=} location
     * @param {boolean=} buffer
     * @return {Object}
     */
    spawn(type, location, buffer) {
        let spawn; let index; let data; const game = this.game;

        spawn = {
            location: location || game.getEmptyLocation(),
            type    : type
        };

        index = this.spawns.length;
        this.spawns[index] = spawn;
        this.locations[index] = spawn.location;

        data = [type, index, spawn.location];

        if (buffer) {
            game.room.buffer(NC_GAME_SPAWN, data);
        } else {
            game.room.emit(NC_GAME_SPAWN, data);
        }

        return spawn;
    }

    /**
     * @param {netcode.Client} client
     * @param {number} index
     */
    hit(client, index) {
        const spawn = this.spawns[index];
        this._destructSpawn(index);

        switch (spawn.type) {
        case SPAWN_APPLE:
            this.game.hitApple(client, index);
            break;
        case SPAWN_POWERUP:
            this.game.hitPowerup(client, index);
            break;
        }
    }

    /**
     * @param {netcode.Client} client
     * @param {Coordinate} location
     * @return {Array}
     */
    handleHits(client, location) {
        const hits = [];
        for (let i = 0, m = this.spawns.length; i < m; i++) {
            if (this.spawns[i] && eq(this.spawns[i].location, location)) {
                hits.push(i);
                this.hit(client, i);
            }
        }
        return hits;
    }

    /**
     * @param {number} type
     * @return {number}
     */
    numOfType(type) {
        let num = 0;
        for (let i = 0, m = this.spawns.length; i < m; i++) {
            if (this.spawns[i] && this.spawns[i].type === type) {
                num++;
            }
        }
        return num;
    }

    /**
     * @param {number} index
     * @private
     */
    _destructSpawn(index) {
        this.spawns[index] = null;
        this.locations[index] = null;
    }

}
