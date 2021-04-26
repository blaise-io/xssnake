// import { HEARTBEAT_INTERVAL_MS, NC_PING, NC_PONG } from "../../shared/const";
// import { SERVER_MAX_TOLERATED_LATENCY } from "../const";
// import { ServerPlayer } from "../room/serverPlayer";
//
// export class ServerHeartbeat {
//     latency: number;
//     pingSent: number;
//
//     constructor(public player: ServerPlayer) {
//         this.latency = 0;
//         this.pingSent = 0;
//         this.bindEvents();
//     }
//
//     destruct() {
//         this.player.emitterDeprecated.removeAllListeners(String(NC_PING));
//         this.player.emitterDeprecated.removeAllListeners(String(NC_PONG));
//         this.player  = undefined;
//     }
//
//     isAlive() {
//         const pingSent = this.pingSent || +new Date();
//         return +new Date() - pingSent < HEARTBEAT_INTERVAL_MS * 2;
//     }
//
//     bindEvents() {
//         this.player.emitterDeprecated.on(String(NC_PING), this.ping.bind(this));
//         this.player.emitterDeprecated.on(String(NC_PONG), this.pong.bind(this));
//     }
//
//     ping() {
//         this.pingSent = +new Date();
//         this.player.emit(NC_PONG);
//     }
//
//     pong() {
//         this.latency = Math.min(SERVER_MAX_TOLERATED_LATENCY, (+new Date() - this.pingSent) / 2);
//     }
// }
