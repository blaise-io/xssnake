/**
 * Pings server every N seconds.
 *
 * @param {room.ClientSocketPlayer} player
 * @constructor
 */
import { HEARTBEAT_INTERVAL_MS, NC_PING, NC_PONG } from "../../shared/const";
import { NS_HEARTBEAT } from "../const";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { State } from "../state/state";

export class ClientHeartbeat {
    private latency: number;
    private pingSent: number;
    private interval: number;

    constructor(public player: ClientSocketPlayer) {
        this.latency = 0;
        this.pingSent = 0;

        this.bindEvents();
        this.ping();

        this.interval = window.setInterval(
            this.ping.bind(this),
            HEARTBEAT_INTERVAL_MS
        );
    };

    destruct() {
        this.player = null;
        clearInterval(this.interval);
        State.events.off(NC_PONG, NS_HEARTBEAT);
    }

    bindEvents() {
        State.events.on(NC_PONG, NS_HEARTBEAT, this.pong.bind(this));
    }

    ping() {
        if (this.pingSent) {
            // Last ping did not pong.
            // return this.player.timeout();
            console.error('this.player.timeout()');
        }
        this.pingSent = +new Date();
        this.player.emit(NC_PING);
    }

    pong() {
        this.latency = (this.pingSent - +new Date()) / 2;
        this.player.emit(NC_PONG);
        this.pingSent = null;
    }

};
