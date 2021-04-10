// import {
//     NC_SNAKE_ACTION,
//     NC_SNAKE_SIZE,
//     NC_SNAKE_SPEED,
//     NC_SNAKE_UPDATE,
//     SCORE_BEHIND,
//     SCORE_LEADING,
//     SCORE_NEUTRAL,
//     SPAWN_APPLE,
//     SPAWN_POWERUP,
// } from "../../shared/const";
// import { delta, randomRange } from "../../shared/util";
// import { ServerRoom } from "../room/serverRoom";
// import { ServerGame } from "./serverGame";
//
// /**
//  * TODO: Is this used?
//  * @deprecated
//  */
// export class Powerup {
//     private room: ServerRoom;
//
//     constructor(public game: ServerGame, public client: unknown) {
//         this.game = game;
//         this.client = client;
//         this._triggerPowerup();
//     }
//
//     /**
//      * @private
//      */
//     _triggerPowerup() {
//         let i,
//             m,
//             random,
//             powerups,
//             cumulative = 0;
//
//         powerups = this._getPowerups();
//
//         for (i = 0, m = powerups.length; i < m; i++) {
//             cumulative += powerups[i][0];
//             powerups[i][0] = cumulative;
//         }
//
//         random = cumulative * Math.random();
//
//         for (i = 0, m = powerups.length; i < m; i++) {
//             if (powerups[i][0] > random) {
//                 powerups[i][1].bind(this)();
//                 break;
//             }
//         }
//     }
//
//     /**
//      * @return {Array}
//      * @private
//      */
//     _getPowerups() {
//         let rank, gainful, neutral, harmful, rounds;
//
//         rounds = this.room.rounds;
//         rank = rounds.score.rank(this.client);
//
//         switch (rank) {
//             case SCORE_LEADING:
//                 gainful = 0.1;
//                 neutral = 0.3;
//                 harmful = 0.6;
//                 break;
//             case SCORE_NEUTRAL:
//                 gainful = 0.4;
//                 neutral = 0.4;
//                 harmful = 0.2;
//                 break;
//             case SCORE_BEHIND:
//                 gainful = 0.7;
//                 neutral = 0.3;
//                 harmful = 0.0;
//                 break;
//         }
//
//         return [
//             // Rareness * Weight, Powerup
//             [1.5 * gainful, this._speedIncPerm],
//             [0.8 * gainful, this._reverseOthers],
//             [1.2 * gainful, this._speedBoostOthers],
//             [1.1 * gainful, this._speedDownOthers],
//             [1.1 * gainful, this._IncTailSelf],
//             [0.7 * gainful, this._cutTailOthers],
//
//             [1.5 * neutral, this._spawnApples],
//             [1.1 * neutral, this._spawnPowerups],
//
//             [0.8 * harmful, this._reverseSelf],
//             [1.3 * harmful, this._speedBoostSelf],
//             [1.1 * harmful, this._incTailOthers],
//             [0.8 * harmful, this._cutTailSelf],
//             [1.5 * harmful, this._speedDownSelf],
//
//             // TODO: Disable some powerups in hard levels
//             // as they will result in immediate death.
//             // TODO: Implement more powerups, like:
//             //  - Spawn stuff near a snake, far from a snake
//             //  - Invincible snake
//             //  - More neutral power-ups
//         ];
//     }
//
//     /**
//      * @return {Array.<netcode.Client>}
//      * @private
//      */
//     _others() {
//         let clients = this.room.players.slice();
//         clients.splice(this.client.model.index, 1);
//         return clients;
//     }
//
//     /**
//      * @param {number} delay
//      * @param {Function} callback
//      * @private
//      */
//     _resetState(delay, callback): void {
//         let timer = setTimeout(callback, delay);
//         this.game.timeouts.push(timer);
//     }
//
//     _speedIncPerm() {
//         let room = this.room,
//             index = this.client.model.index,
//             snake = this.client.snake;
//         snake.speed -= 15;
//         room.buffer(NC_SNAKE_SPEED, [index, snake.speed]);
//         room.buffer(NC_SNAKE_ACTION, [index, "+Speed"]).flush();
//     }
//
//     _speedBoostSelf() {
//         this._speed([this.client], -50, "5s Fast", 5000);
//     }
//
//     _speedBoostOthers() {
//         this._speed(this._others(), -50, "5s Fast", 5000);
//     }
//
//     _speedDownSelf() {
//         this._speed([this.client], 100, "10s S.l.o.o.w", 10 * 1000);
//     }
//
//     _speedDownOthers() {
//         this._speed(this._others(), 100, "10s S.l.o.o.w", 10 * 1000);
//     }
//
//     /**
//      * @param {Array.<netcode.Client>} clients
//      * @param {number} delta
//      * @param {string} label
//      * @param {number} duration
//      * @private
//      */
//     _speed(clients, delta, label, duration): void {
//         let room = this.room;
//         for (let i = 0, m = clients.length; i < m; i++) {
//             let index = clients[i].model.index,
//                 snake = clients[i].snake;
//             snake.speed += delta;
//             room.buffer(NC_SNAKE_SPEED, [index, snake.speed]);
//             room.buffer(NC_SNAKE_ACTION, [index, label]);
//         }
//         room.flush();
//
//         this._resetState(duration, function () {
//             for (let i = 0, m = clients.length; i < m; i++) {
//                 let index = clients[i].model.index,
//                     snake = clients[i].snake;
//                 snake.speed -= delta;
//                 room.buffer(NC_SNAKE_SPEED, [index, snake.speed]);
//             }
//             room.flush();
//         });
//     }
//
//     _spawnApples() {
//         let r = randomRange(3, 10);
//         this._spawn(SPAWN_APPLE, r, "+Apples");
//     }
//
//     _spawnPowerups() {
//         let r = randomRange(2, 5);
//         this._spawn(SPAWN_POWERUP, r, "+Power-ups");
//     }
//
//     // /**
//     //  * @param {number} type
//     //  * @param {number} amount
//     //  * @param {string} message
//     //  * @private
//     //  */
//     // _spawn(type, amount, message): void {
//     //     let index, spawn, game = this.game;
//     //
//     //     index = this.client.model.index;
//     //
//     //     class spawn {
//     //         constructor() {
//     //             game.spawner.spawn(type);
//     //         };
//     //     }
//     //
//     //     game.room.emit(NC_SNAKE_ACTION, [index, message]);
//     //
//     //     for (let i = 0; i < amount; i++) {
//     //         setTimeout(spawn, i * 100);
//     //     }
//     // }
//
//     _reverseSelf() {
//         this._reverse([this.client]);
//     }
//
//     _reverseOthers() {
//         this._reverse(this._others());
//     }
//
//     /**
//      * @param {Array.<netcode.Client>} clients
//      * @private
//      */
//     _reverse(clients): void {
//         let snake,
//             room = this.room;
//         for (let i = 0, m = clients.length; i < m; i++) {
//             snake = clients[i].snake;
//             snake.reverse();
//             room.buffer(NC_SNAKE_ACTION, [i, "Reverse"]);
//             room.buffer(NC_SNAKE_UPDATE, [i, snake.parts, snake.direction]);
//         }
//         room.flush();
//     }
//
//     _IncTailSelf() {
//         this._tail([this.client], 20, "Long tail");
//     }
//
//     _incTailOthers() {
//         this._tail(this._others(), 20, "Long tail");
//     }
//
//     _cutTailSelf() {
//         this._tail([this.client], -10, "Cut tail");
//     }
//
//     _cutTailOthers() {
//         this._tail(this._others(), -10, "Cut tail");
//     }
//
//     /**
//      * @param {Array.<netcode.Client>} clients
//      * @param {number} delta
//      * @param {string} message
//      * @private
//      */
//     _tail(clients, delta, message): void {
//         let room = this.room;
//         for (let i = 0, m = clients.length; i < m; i++) {
//             let index = clients[i].model.index,
//                 snake = clients[i].snake;
//             snake.size = Math.max(1, snake.size + delta);
//             room.buffer(NC_SNAKE_ACTION, [index, message]);
//             room.buffer(NC_SNAKE_SIZE, [index, snake.size]);
//         }
//         room.flush();
//     }
// }
