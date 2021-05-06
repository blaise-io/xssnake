// /**
//  * Spawner
//  * @param {game.Game} game
//  * @constructor
//  */
// import { NC_GAME_SPAWN, SPAWN_APPLE, SPAWN_POWERUP } from "../../shared/const";
// import { eq } from "../../shared/util";
// import { ServerGame } from "./serverGame";
//
// export class Spawner {
//     private spawns: any[];
//     private locations: any[];
//
//     constructor(public game: ServerGame) {
//         this.spawns = [];
//         this.locations = []; // Keep separate list for getEmptyLocation speed
//     }
//
//     destruct() {
//         for (let i = 0, m = this.spawns.length; i < m; i++) {
//             this._destructSpawn(i);
//         }
//     }
//
//     spawn(type: number, location: Coordinate, buffer: boolean): unknown {
//         let spawn;
//         let index;
//         let data;
//         const game = this.game;
//
//         spawn = {
//             // location: location || game.getEmptyLocation(),
//             location: location,
//             type: type,
//         };
//
//         index = this.spawns.length;
//         this.spawns[index] = spawn;
//         this.locations[index] = spawn.location;
//
//         data = [type, index, spawn.location];
//
//         // TODO: game no longer has room?
//         // if (buffer) {
//         //     game.room.buffer(NC_GAME_SPAWN, data);
//         // } else {
//         //     game.room.emitDeprecated(NC_GAME_SPAWN, data);
//         // }
//
//         return spawn;
//     }
//
//     /**
//      * @param {serialized.Client} client
//      * @param {number} index
//      */
//     hit(client, index): void {
//         const spawn = this.spawns[index];
//         this._destructSpawn(index);
//
//         // switch (spawn.type) {
//         //     case SPAWN_APPLE:
//         //         this.game.hitApple(client, index);
//         //         break;
//         //     case SPAWN_POWERUP:
//         //         this.game.hitPowerup(client, index);
//         //         break;
//         // }
//     }
//
//     /**
//      * @param {serialized.Client} client
//      * @param {Coordinate} location
//      * @return {Array}
//      */
//     handleHits(client, location): void {
//         const hits = [];
//         for (let i = 0, m = this.spawns.length; i < m; i++) {
//             if (this.spawns[i] && eq(this.spawns[i].location, location)) {
//                 hits.push(i);
//                 this.hit(client, i);
//             }
//         }
//         return hits;
//     }
//
//     /**
//      * @param {number} type
//      * @return {number}
//      */
//     numOfType(type): void {
//         let num = 0;
//         for (let i = 0, m = this.spawns.length; i < m; i++) {
//             if (this.spawns[i] && this.spawns[i].type === type) {
//                 num++;
//             }
//         }
//         return num;
//     }
//
//     /**
//      * @param {number} index
//      * @private
//      */
//     _destructSpawn(index): void {
//         this.spawns[index]  = undefined;
//         this.locations[index]  = undefined;
//     }
// }
