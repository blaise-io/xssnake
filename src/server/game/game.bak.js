// 'use strict';
//
// /**
//  * @param {room.Round} round
//  * @param {number} levelIndex
//  * @constructor
//  */
// game.Game = function(round, levelIndex) {
//     this.round = round;
//     this.room = round.room;
//     this.server = this.room.server;
//     this.levelIndex = levelIndex;
//
//     this.options = this.room.options;
//
//     this.spawner = new game.Spawner(this);
//     this.model = new model.GameStage();
//
//     /** @type {Array.<number>} */
//     this.timeouts = [];
//
//     /** @type {Array.<game.Snake>} */
//     this.snakes = [];
//
//     this._mainGameLoopBound = this._serverGameLoop.bind(this);
// };
//
// game.GameStage.prototype = {
//
//     destruct: function() {
//         this.stop();
//         this.spawner.destruct();
//         for (let i = 0, m = this.timeouts.length; i < m; i++) {
//             clearTimeout(this.timeouts[i]);
//         }
//
//         this.room  = undefined;
//         this.round  = undefined;
//         this.server  = undefined;
//         this.level  = undefined;
//         this.spawner  = undefined;
//         this.snakes = [];
//     },
//
//     start: function() {
//         let levelData = levels.getLevelData(this.levelIndex);
//         this.level = new Level(
//             levelData,
//             this.room.seed,
//             new Date() - this.model.created
//         );
//
//         this.spawnSnakes();
//
//         this.server.emitter.on(SE_SERVER_TICK, this._mainGameLoopBound);
//         this.model.started = true;
//         this.spawner.spawn(SPAWN_APPLE);
//         if (this.options[FIELD_POWERUPS]) {
//             this._spawnSomethingAfterDelay();
//         }
//     },
//
//     stop: function() {
//         let pubsub = this.server.emitter;
//         if (pubsub.listeners(SE_SERVER_TICK)) {
//             pubsub.removeListener(SE_SERVER_TICK, this._mainGameLoopBound);
//         }
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @param {Array.<Array>} clientParts
//      * @param {number} direction
//      * @return {number}
//      */
//     updateSnake: function(client, clientParts, direction): void {
//         let crash, sync, serverParts, common, mismatches, snake = client.snake;
//
//         // Always allow a new direction
//         client.snake.direction = direction;
//
//         // Crop client snake because we don't trust the length the client sent
//         sync = NETCODE_SYNC_MS / client.snake.speed;
//         clientParts = clientParts.slice(-sync);
//
//         // Don't allow gaps in the snake
//         if (this._containsGaps(clientParts)) {
//             this._emitSnakeRoom(client);
//             return UPDATE_ERR_GAP;
//         }
//
//         // Find latest tile where client and server matched
//         serverParts = client.snake.parts.slice(-sync);
//         common = this._findCommon(clientParts, serverParts);
//
//         // Reject if there was no common
//         if (!common) {
//             this._emitSnakeRoom(client);
//             return UPDATE_ERR_NO_COMMON;
//         }
//
//         // Check if client-server delta does not exceed limit
//         mismatches = Math.abs(common[1] - common[0]);
//         if (mismatches > this._maxMismatches(client)) {
//             this._emitSnakeRoom(client);
//             return UPDATE_ERR_MISMATCHES;
//         }
//
//         // Glue snake back together
//         snake.parts.splice(-sync);
//         snake.parts = snake.parts.concat(
//             serverParts.slice(0, common[1] + 1),
//             clientParts.slice(common[0] + 1)
//         );
//         snake.trimParts();
//
//         // Handle new location
//         crash = this._isCrash(client, snake.parts);
//         snake.limbo = crash;
//
//         if (crash) {
//             this._crashSnake(client, snake.parts);
//             this.room.rounds.delegateCrash();
//         } else {
//             this.spawner.handleHits(client, snake.getHead());
//             this._broadcastSnakeRoom(client);
//         }
//
//         return UPDATE_SUCCES;
//     },
//
//     /**
//      * @param client
//      */
//     removeClient: function(client): void {
//         if (client.snake) {
//             this._crashSnake(client);
//             this.snakes.splice(client.model.index, 1);
//         }
//     },
//
//     /**
//      * @param client
//      */
//     emitState: function(client): void {
//         this.bufferSnakesState(client);
//         this.bufferSpawnsState(client);
//         client.flush();
//     },
//
//     /**
//      * @param client
//      */
//     bufferSnakesState: function(client): void {
//         for (let i = 0, m = this.snakes.length; i < m; i++) {
//             let data = [i, this.snakes[i].parts, this.snakes[i].direction];
//             client.buffer(NC_SNAKE_UPDATE, data);
//         }
//     },
//
//     /**
//      * Send all apples and powerups
//      * @param client
//      */
//     bufferSpawnsState: function(client): void {
//         let spawner = this.spawner,
//             spawns = spawner.spawns;
//         for (let i = 0, m = spawns.length; i < m; i++) {
//             let spawn = spawns[i];
//             if (spawn) {
//                 client.buffer(NC_GAME_SPAWN, [
//                     spawn.type, i, spawn.location
//                 ]);
//             }
//         }
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @param {number} index
//      */
//     hitApple: function(client, index): void {
//         let size = client.snake.size += 3;
//
//         this.room.buffer(NC_GAME_DESPAWN, index);
//         this.room.buffer(NC_SNAKE_SIZE, [client.model.index, size]);
//         this.room.buffer(NC_SNAKE_ACTION, [client.model.index, 'Nom']);
//         this.room.rounds.score.bufferApplePoints(client);
//         this.room.flush();
//
//         // There should always be at least one apple in the game.
//         if (0 === this.spawner.numOfType(SPAWN_APPLE)) {
//             this.spawner.spawn(SPAWN_APPLE);
//         }
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @param {number} index
//      */
//     hitPowerup: function(client, index): void {
//         this.room.emit(NC_GAME_DESPAWN, index);
//         return new game.Powerup(this, client);
//     },
//
//     /**
//      * @return {Array.<Coordinate>}
//      */
//     getNonEmptyLocations: function() {
//         let locations = this.spawner.locations.slice();
//         for (let i = 0, m = this.snakes.length; i < m; i++) {
//             let parts = this.snakes[i].parts;
//             for (let ii = 0, mm = parts.length; ii < mm; ii++) {
//                 locations.push(parts[ii]);
//             }
//         }
//         return locations;
//     },
//
//     /**
//      * @return {Coordinate}
//      */
//     getEmptyLocation: function() {
//         let locations = this.getNonEmptyLocations();
//         return this.level.getEmptyLocation(locations);
//     },
//
//     spawnSnakes: function() {
//         let clients = this.room.players;
//         for (let i = 0, m = clients.length; i < m; i++) {
//             let snake = this._spawnSnake(i);
//             this.snakes[i] = snake;
//             clients[i].snake = snake;
//         }
//     },
//
//     showLotsOfApples: function() {
//         let locations, levelData, spawnRow, y = 1;
//
//         this._spawnPause = true;
//
//         locations = this.getNonEmptyLocations();
//         levelData = this.level.levelData;
//
//         spawnRow = function() {
//             for (let x = y % 4, mm = levelData.width; x < mm; x += 4) {
//                 if (this.level.isEmptyLocation(locations, [x, y])) {
//                     this.spawner.spawn(SPAWN_APPLE, [x, y], true);
//                 }
//             }
//             this.room.flush();
//             y += 3;
//             if (y < levelData.height) {
//                 setTimeout(spawnRow, 50);
//             }
//         }.bind(this);
//
//         spawnRow();
//     },
//
//     /**
//      * @param {Array.<Array>} parts
//      * @return {boolean}
//      * @private
//      */
//     _containsGaps: function(parts): void {
//         for (let i = 1, m = parts.length; i < m; i++) {
//             // Sanity check
//             if (parts[i].length !== 2 ||
//                 typeof parts[i][0] !== 'number' ||
//                 typeof parts[i][1] !== 'number'
//             ) {
//                 return false;
//             }
//             // Delta must be 1
//             if (util.delta(parts[i], parts[i - 1]) !== 1) {
//                 return true;
//             }
//         }
//         return false;
//     },
//
//     /**
//      * @param {Array.<Array>} clientParts
//      * @param {Array.<Array>} serverParts
//      * @return {Coordinate} common
//      * @private
//      */
//     _findCommon: function(clientParts, serverParts): void {
//         for (let i = clientParts.length - 1; i >= 0; i--) {
//             for (let ii = serverParts.length - 1; ii >= 0; ii--) {
//                 if (util.eq(clientParts[i], serverParts[ii])) {
//                     return [i, ii];
//                 }
//             }
//         }
//         return null;
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @return {number}
//      * @private
//      */
//     _maxMismatches: function(client): void {
//         let rtt = Math.min(NETCODE_SYNC_MS, client.player.model.latency);
//         return Math.ceil((rtt + 20) / client.snake.speed);
//     },
//
//     /**
//      * @private
//      */
//     _spawnSomethingAfterDelay: function() {
//         let delay, range = SPAWN_SOMETHING_EVERY;
//         delay = util.randomRange(range[0] * 1000, range[1] * 1000);
//         this.timeouts.push(
//             setTimeout(this._spawnSomething.bind(this), delay)
//         );
//     },
//
//     /**
//      * @private
//      */
//     _spawnSomething: function() {
//         let powerupsEnabled, randomResultApple, type;
//
//         if (this._spawnPause) {
//             return;
//         }
//
//         powerupsEnabled = this.options[FIELD_POWERUPS];
//         randomResultApple = Math.random() <= SPAWN_CHANCE_APPLE;
//
//         type = (!powerupsEnabled || randomResultApple) ?
//             SPAWN_APPLE : SPAWN_POWERUP;
//
//         this.spawner.spawn(type);
//         this._spawnSomethingAfterDelay();
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @private
//      */
//     _emitSnakeRoom: function(client): void {
//         let data = [client.model.index, client.snake.parts, client.snake.direction];
//         this.room.emit(NC_SNAKE_UPDATE, data);
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @private
//      */
//     _broadcastSnakeRoom: function(client): void {
//         let data = [
//             client.model.index,
//             client.snake.parts,
//             client.snake.direction
//         ];
//         client.broadcast(NC_SNAKE_UPDATE, data);
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @param {Array.<Coordinate>} parts
//      * @return {game.Crash}
//      * @private
//      */
//     _isCrash: function(client, parts): void {
//         let eq, clients, level, crash;
//
//         eq = util.eq;
//         clients = this.room.players;
//         level = this.level;
//
//         for (let i = 0, m = parts.length; i < m; i++) {
//             let part = parts[i];
//
//             // Wall
//             if (level.isWall(part[0], part[1])) {
//                 return new game.Crash(CRASH_WALL, client);
//             }
//
//             // Moving wall
//             if (level.isMovingWall(part)) {
//                 crash = new game.Crash(CRASH_MOVING_WALL, client);
//                 crash.location = part;
//                 return crash;
//             }
//
//             // Self
//             if (m > 4) {
//                 if (m - 1 !== i && eq(part, parts[m - 1])) {
//                     return new game.Crash(CRASH_SELF, client);
//                 }
//             }
//
//             // Opponent
//             for (let ii = 0, mm = clients.length; ii < mm; ii++) {
//                 if (client !== clients[ii] && clients[ii].snake.hasCoordinate(part)) {
//                     return new game.Crash(CRASH_OPPONENT, client, clients[ii]);
//                 }
//             }
//         }
//
//         return null;
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @param {Array.<Coordinate>=} parts
//      * @param {boolean=} emit
//      * @private
//      */
//     _crashSnake: function(client, parts, emit): void {
//         let snake = client.snake;
//         if (snake.limbo) {
//             if (emit !== false) {
//                 snake.limbo.emitNotice();
//             }
//             parts = snake.limbo.parts;
//         }
//         parts = parts || snake.parts;
//         snake.crashed = true;
//         this.room.emit(NC_SNAKE_CRASH, [
//             client.model.index, parts, snake.limbo.location
//         ]);
//     },
//
//     /**
//      * @param {number} delta
//      * @private
//      */
//     _serverGameLoop: function(delta): void {
//         let shift, clients = this.room.players;
//         shift = this.level.gravity.getShift(delta);
//         this.level.updateMovingWalls(delta, true);
//         for (let i = 0, m = clients.length; i < m; i++) {
//             this._updateClient(clients[i], delta, shift);
//         }
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @param {number} delta
//      * @param {Shift} shift
//      * @private
//      */
//     _updateClient: function(client, delta, shift): void {
//         let snake = client.snake;
//         if (!snake.crashed) {
//             if (snake.elapsed >= snake.speed) {
//                 snake.elapsed -= snake.speed;
//                 this._applyNewPosition(client);
//                 snake.trimParts();
//             }
//             snake.shiftParts(shift);
//             snake.elapsed += delta;
//         }
//     },
//
//     /**
//      * @param {game.Snake} snake
//      * @return {Coordinate}
//      * @private
//      */
//     _getPredictPosition: function(snake): void {
//         let head, shift;
//         head = snake.getHead();
//         shift = [[-1, 0], [0, -1], [1, 0], [0, 1]][snake.direction];
//         return [head[0] + shift[0], head[1] + shift[1]];
//     },
//
//     /**
//      * @param {serialized.Client} client
//      * @private
//      */
//     _applyNewPosition: function(client): void {
//         let predict, predictParts, snake, crash, opponent;
//
//         snake = client.snake;
//         predict = this._getPredictPosition(snake);
//
//         predictParts = snake.parts.slice(1);
//         predictParts.push(predict);
//
//         // A snake is in limbo when the server predicts that a snake has
//         // crashed. The prediction is wrong when the client made a turn
//         // in time but that message was received too late by the server
//         // because of network latency. When the turn message is received by
//         // the server, and it seems like the server made a wrong prediction,
//         // the snake returns back to life. The snake will be crashed When the
//         // limbo time exceeds the latency.
//         if (snake.limbo && !this._canReturnFromLimbo(client)) {
//             this._crashSnake(client);
//             opponent = snake.limbo.opponent;
//             if (opponent && snake.limbo.draw) {
//                 this._crashSnake(opponent, null, false);
//             }
//             this.room.rounds.delegateCrash();
//         } else {
//             crash = this._isCrash(client, predictParts);
//             if (crash) {
//                 snake.limbo = crash;
//             } else {
//                 snake.move(predict);
//                 this.spawner.handleHits(client, predict);
//             }
//         }
//     },
//
//     /**
//      * Snake is considered dead (crashed) when in limbo for too long.
//      * @param {serialized.Client} client
//      * @return {boolean}
//      */
//     _canReturnFromLimbo: function(client): void {
//        return +new Date() - client.snake.limbo.time < client.player.model.latency;
//     },
//
//     /**
//      * @param {number} index
//      * @return {game.Snake}
//      * @private
//      */
//     _spawnSnake: function(index): void {
//         let spawn, direction, snake, size, speed;
//
//         spawn = this.level.getSpawn(index);
//         direction = this.level.getSpawnDirection(index);
//         size = SNAKE_SIZE;
//         speed = SNAKE_SPEED;
//
//         snake = new game.Snake(spawn, direction, size, speed);
//         snake.elapsed = 0;
//
//         return snake;
//     }
//
// };
