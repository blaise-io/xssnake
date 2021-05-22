import {
    DIRECTION,
    NETCODE_SYNC_MS,
    VALIDATE_ERR_GAP,
    VALIDATE_ERR_MISMATCHES,
    VALIDATE_ERR_NO_COMMON,
    VALIDATE_SUCCES,
} from "../../shared/const";
import { delta, eq } from "../../shared/util";
import { ServerSnake } from "./serverSnake";

export class ServerSnakeMove {
    private status = -1;

    constructor(
        public parts: Coordinate[],
        public direction: DIRECTION,
        public snake: ServerSnake,
        private latency: number,
    ) {}

    get valid(): boolean {
        if (this.status === -1 && this.isValidJson()) {
            this.status = this.getStatus();
        }
        return VALIDATE_SUCCES === this.status;
    }

    isValidJson(): boolean {
        // TODO: Reimplement
        // let snake;
        // let parts;
        // let direction;
        //
        // snake = new Sanitizer(this.dirtyMove);
        // snake.assertArrayLengthBetween(2, 2);
        //
        // if (!snake.valid()) {
        //     return false;
        // }
        //
        // direction = new Sanitizer(snake.getValueOr()[0]);
        // direction.assertBetween(DIRECTION.LEFT, DIRECTION.DOWN);
        //
        // if (!direction.valid()) {
        //     return false;
        // }
        //
        // parts = new Sanitizer(snake.getValueOr()[1]);
        // parts.assertArray();
        //
        // if (!parts.valid()) {
        //     return false;
        // }
        //
        // this.parts = parts.getValueOr();
        // this.direction = direction.getValueOr();

        return true;
    }

    getStatus(): number {
        let clientParts = this.parts;

        // Crop client snake because we don't trust the length the client sent.
        const numSyncParts = NETCODE_SYNC_MS / this.snake.speed;
        clientParts = clientParts.slice(-numSyncParts);

        // Don't allow gaps in the snake.
        if (this.hasGaps(clientParts)) {
            console.warn("GAPS");
            return VALIDATE_ERR_GAP;
        }

        // Find tile closest to head where client and server matched.
        const serverParts = this.snake.parts.slice();
        const commonPartIndex = this.getCommonPartIndex(clientParts, serverParts);
        if (!commonPartIndex) {
            return VALIDATE_ERR_NO_COMMON;
        }

        // Check if client-server delta does not exceed limit.
        const mismatches = Math.abs(commonPartIndex.server - commonPartIndex.client);
        const maxMismatches = Math.ceil(Math.min(NETCODE_SYNC_MS, this.latency) / this.snake.speed);
        if (mismatches > Math.max(2, maxMismatches)) {
            return VALIDATE_ERR_MISMATCHES;
        }

        // We accept the client's snake at this point, but only the head part
        // is synced so we need to glue the head to the server snake's tail.
        this.parts = serverParts.slice(0, commonPartIndex.server);
        this.parts.push(...clientParts.slice(commonPartIndex.client));
        this.parts.slice(-this.snake.size);

        return VALIDATE_SUCCES;
    }

    hasGaps(parts: Coordinate[]): boolean {
        for (let i = 1, m = parts.length; i < m; i++) {
            // Sanity check
            if (
                parts[i].length !== 2 ||
                typeof parts[i][0] !== "number" ||
                typeof parts[i][1] !== "number"
            ) {
                return false;
            }
            // Delta must be 1
            if (delta(parts[i], parts[i - 1]) !== 1) {
                return true;
            }
        }
        return false;
    }

    getCommonPartIndex(
        clientParts: Coordinate[],
        serverParts: Coordinate[],
    ): { client: number; server: number } | null {
        for (let i = clientParts.length - 1; i >= 0; i--) {
            for (let ii = serverParts.length - 1; ii >= 0; ii--) {
                if (eq(clientParts[i], serverParts[ii])) {
                    return { client: i, server: ii };
                }
            }
        }
        return null;
    }
}
