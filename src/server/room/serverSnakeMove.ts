import {
    DIRECTION_DOWN,
    DIRECTION_LEFT,
    NETCODE_SYNC_MS,
    VALIDATE_ERR_GAP,
    VALIDATE_ERR_MISMATCHES,
    VALIDATE_ERR_NO_COMMON,
    VALIDATE_SUCCES,
} from "../../shared/const";
import { delta, eq } from "../../shared/util";
import { Sanitizer } from "../../shared/util/sanitizer";

export class ServerSnakeMove {
    private status: number;
    parts: Coordinate[];
    direction: number;

    constructor(public dirtyMove, public player) {
        this.parts = null;
        this.direction = null;
        this.status = -1;
    }

    isValid() {
        if (this.isValidJson()) {
            this.status = this.getStatus();
            return VALIDATE_SUCCES === this.status;
        }
    }

    isValidJson() {
        let snake;
        let parts;
        let direction;

        snake = new Sanitizer(this.dirtyMove);
        snake.assertArrayLengthBetween(2, 2);

        if (!snake.valid()) {
            return false;
        }

        direction = new Sanitizer(snake.getValueOr()[0]);
        direction.assertBetween(DIRECTION_LEFT, DIRECTION_DOWN);

        if (!direction.valid()) {
            return false;
        }

        parts = new Sanitizer(snake.getValueOr()[1]);
        parts.assertArray();

        if (!parts.valid()) {
            return false;
        }

        this.parts = parts.getValueOr();
        this.direction = direction.getValueOr();

        return true;
    }

    getStatus() {
        let numSyncParts;
        let serverParts;
        let commonPartIndices;
        let mismatches;
        let snake;
        let clientParts;

        snake = this.player.snake;
        clientParts = this.parts;

        // Crop client snake because we don't trust the length the client sent.
        numSyncParts = NETCODE_SYNC_MS / this.player.snake.speed;
        clientParts = clientParts.slice(-numSyncParts);

        // Don't allow gaps in the snake.
        if (this.hasGaps(clientParts)) {
            return VALIDATE_ERR_GAP;
        }

        // Find tile cloest to head where client and server matched.
        serverParts = snake.parts.slice(-numSyncParts);
        commonPartIndices = this.getCommonPartIndices(clientParts, serverParts);

        // Reject if there was no common.
        if (!commonPartIndices) {
            return VALIDATE_ERR_NO_COMMON;
        }

        // Check if client-server delta does not exceed limit.
        mismatches = Math.abs(commonPartIndices[1] - commonPartIndices[0]);
        if (mismatches > this.player.getMaxMismatchesAllowed()) {
            return VALIDATE_ERR_MISMATCHES;
        }

        // Glue snake back together.
        this.parts = serverParts;
        this.parts = snake.parts.concat(
            serverParts.slice(0, commonPartIndices[1] + 1),
            clientParts.slice(commonPartIndices[0] + 1)
        );

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

    getCommonPartIndices(clientParts: Coordinate[], serverParts: Coordinate[]): Coordinate | null {
        for (let i = clientParts.length - 1; i >= 0; i--) {
            for (let ii = serverParts.length - 1; ii >= 0; ii--) {
                if (eq(clientParts[i], serverParts[ii])) {
                    return [i, ii];
                }
            }
        }
        return null;
    }
}
