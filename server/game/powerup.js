'use strict';

/**
 * Powerup
 * @param {xss.game.Game} game
 * @param {xss.netcode.Client} client
 * @constructor
 */
xss.game.Powerup = function(game, client) {
    this.game = game;
    this.room = game.room;
    this.client = client;
    this._triggerPowerup();
};

xss.game.Powerup.prototype = {

    /**
     * @private
     */
    _triggerPowerup: function() {
        var i, m, random, powerups, cumulative = 0;

        powerups = this._getPowerups();

        for (i = 0, m = powerups.length; i < m; i++) {
            cumulative += powerups[i][0];
            powerups[i][0] = cumulative;
        }

        random = cumulative * Math.random();

        for (i = 0, m = powerups.length; i < m; i++) {
            if (powerups[i][0] > random) {
                powerups[i][1].bind(this)();
                break;
            }
        }
    },

    /**
     * @return {Array}
     * @private
     */
    _getPowerups: function() {
        var rank, gainful, neutral, harmful, rounds;

        rounds = this.room.rounds;
        rank = rounds.score.rank(this.client);

        switch (rank) {
            case xss.SCORE_LEADING:
                gainful = 0.1;
                neutral = 0.3;
                harmful = 0.6;
                break;
            case xss.SCORE_NEUTRAL:
                gainful = 0.4;
                neutral = 0.4;
                harmful = 0.2;
                break;
            case xss.SCORE_BEHIND:
                gainful = 0.7;
                neutral = 0.3;
                harmful = 0.0;
                break;
        }

        return [
            // Rareness * Weight, Powerup
            [1.5 * gainful, this._speedIncPerm],
            [0.8 * gainful, this._reverseOthers],
            [1.2 * gainful, this._speedBoostOthers],
            [1.1 * gainful, this._speedDownOthers],
            [1.1 * gainful, this._IncTailSelf],
            [0.7 * gainful, this._cutTailOthers],

            [1.5 * neutral, this._spawnApples],
            [1.1 * neutral, this._spawnPowerups],

            [0.8 * harmful, this._reverseSelf],
            [1.3 * harmful, this._speedBoostSelf],
            [1.1 * harmful, this._incTailOthers],
            [0.8 * harmful, this._cutTailSelf],
            [1.5 * harmful, this._speedDownSelf]

            // TODO: Disable some powerups in hard levels
            // as they will result in immediate death.
            // TODO: Implement more powerups, like:
            //  - Spawn stuff near a snake, far from a snake
            //  - Invincible snake
            //  - More neutral power-ups
        ];
    },

    /**
     * @return {Array.<xss.netcode.Client>}
     * @private
     */
    _others: function() {
        var clients = this.room.players.slice();
        clients.splice(this.client.model.index, 1);
        return clients;
    },

    /**
     * @param {number} delay
     * @param {Function} callback
     * @private
     */
    _resetState: function(delay, callback) {
        var timer = setTimeout(callback, delay);
        this.game.timeouts.push(timer);
    },

    _speedIncPerm: function() {
        var room = this.room,
            index = this.client.model.index,
            snake = this.client.snake;
        snake.speed -= 15;
        room.buffer(xss.NC_SNAKE_SPEED, [index, snake.speed]);
        room.buffer(xss.NC_SNAKE_ACTION, [index, '+Speed']).flush();
    },

    _speedBoostSelf: function() {
        this._speed([this.client], -50, '5s Fast', 5000);
    },

    _speedBoostOthers: function() {
        this._speed(this._others(), -50, '5s Fast', 5000);
    },

    _speedDownSelf: function() {
        this._speed([this.client], 100, '10s S.l.o.o.w', 10 * 1000);
    },

    _speedDownOthers: function() {
        this._speed(this._others(), 100, '10s S.l.o.o.w', 10 * 1000);
    },

    /**
     * @param {Array.<xss.netcode.Client>} clients
     * @param {number} delta
     * @param {string} label
     * @param {number} duration
     * @private
     */
    _speed: function(clients, delta, label, duration) {
        var room = this.room;
        for (var i = 0, m = clients.length; i < m; i++) {
            var index = clients[i].model.index,
                snake = clients[i].snake;
            snake.speed += delta;
            room.buffer(xss.NC_SNAKE_SPEED, [index, snake.speed]);
            room.buffer(xss.NC_SNAKE_ACTION, [index, label]);
        }
        room.flush();

        this._resetState(duration, function() {
            for (var i = 0, m = clients.length; i < m; i++) {
                var index = clients[i].model.index,
                    snake = clients[i].snake;
                snake.speed -= delta;
                room.buffer(xss.NC_SNAKE_SPEED, [index, snake.speed]);
            }
            room.flush();
        });
    },

    _spawnApples: function() {
        var r = xss.util.randomRange(3, 10);
        this._spawn(xss.SPAWN_APPLE, r, '+Apples');
    },

    _spawnPowerups: function() {
        var r = xss.util.randomRange(2, 5);
        this._spawn(xss.SPAWN_POWERUP, r, '+Power-ups');
    },

    /**
     * @param {number} type
     * @param {number} amount
     * @param {string} message
     * @private
     */
    _spawn: function(type, amount, message) {
        var index, spawn, game = this.game;

        index = this.client.model.index;
        spawn = function() {
            game.spawner.spawn(type);
        };

        game.room.emit(xss.NC_SNAKE_ACTION, [index, message]);

        for (var i = 0; i < amount; i++) {
            setTimeout(spawn, i * 100);
        }
    },

    _reverseSelf: function() {
        this._reverse([this.client]);
    },

    _reverseOthers: function() {
        this._reverse(this._others());
    },

    /**
     * @param {Array.<xss.netcode.Client>} clients
     * @private
     */
    _reverse: function(clients) {
        var snake, room = this.room;
        for (var i = 0, m = clients.length; i < m; i++) {
            snake = clients[i].snake;
            snake.reverse();
            room.buffer(xss.NC_SNAKE_ACTION, [i, 'Reverse']);
            room.buffer(xss.NC_SNAKE_UPDATE, [i, snake.parts, snake.direction]);
        }
        room.flush();
    },

    _IncTailSelf: function() {
        this._tail([this.client], 20, 'Long tail');
    },

    _incTailOthers: function() {
        this._tail(this._others(), 20, 'Long tail');
    },

    _cutTailSelf: function() {
        this._tail([this.client], -10, 'Cut tail');
    },

    _cutTailOthers: function() {
        this._tail(this._others(), -10, 'Cut tail');
    },

    /**
     * @param {Array.<xss.netcode.Client>} clients
     * @param {number} delta
     * @param {string} message
     * @private
     */
    _tail: function(clients, delta, message) {
        var room = this.room;
        for (var i = 0, m = clients.length; i < m; i++) {
            var index = clients[i].model.index,
                snake = clients[i].snake;
            snake.size = Math.max(1, snake.size + delta);
            room.buffer(xss.NC_SNAKE_ACTION, [index, message]);
            room.buffer(xss.NC_SNAKE_SIZE, [index, snake.size]);
        }
        room.flush();
    }

};
