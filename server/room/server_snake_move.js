'use strict';

xss.game.ServerSnakeMove = function(dirtyMove, player) {
    this.dirtyMove = dirtyMove;
    this.player = player;
    this.parts = null;
    this.direction = null;
    this.status = -1;
};

xss.game.ServerSnakeMove.prototype = {

    isValid: function() {
        if (this.isValidJson()) {
            this.status = this.getStatus();
            return xss.VALIDATE_SUCCES === this.status;
        }
    },

    isValidJson: function() {
        var snake, parts, direction;

        snake = new xss.util.Sanitizer(this.dirtyMove);
        snake.assertArrayLengthBetween(2, 2);

        if (!snake.valid()) {
            return false;
        }

        direction = new xss.util.Sanitizer(snake.getValueOr()[0]);
        direction.assertBetween(xss.DIRECTION_LEFT, xss.DIRECTION_DOWN);

        if (!direction.valid()) {
            return false;
        }

        parts = new xss.util.Sanitizer(snake.getValueOr()[1]);
        parts.assertArray();

        if (!parts.valid()) {
            return false;
        }

        this.parts = parts.getValueOr();
        this.direction = direction.getValueOr();

        return true;
    },

    getStatus: function() {
        var numSyncParts, serverParts, commonPartIndices, mismatches, snake, clientParts;

        snake = this.player.snake;
        clientParts = this.parts;

        // Crop client snake because we don't trust the length the client sent.
        numSyncParts = xss.NETCODE_SYNC_MS / this.player.snake.speed;
        clientParts = clientParts.slice(-numSyncParts);

        // Don't allow gaps in the snake.
        if (this.hasGaps(clientParts)) {
            return xss.VALIDATE_ERR_GAP;
        }

        // Find tile cloest to head where client and server matched.
        serverParts = snake.parts.slice(-numSyncParts);
        commonPartIndices = this.getCommonPartIndices(clientParts, serverParts);

        // Reject if there was no common.
        if (!commonPartIndices) {
            return xss.VALIDATE_ERR_NO_COMMON;
        }

        // Check if client-server delta does not exceed limit.
        mismatches = Math.abs(commonPartIndices[1] - commonPartIndices[0]);
        if (mismatches > this.player.getMaxMismatchesAllowed()) {
            return xss.VALIDATE_ERR_MISMATCHES;
        }

        // Glue snake back together.
        this.parts = serverParts;
        this.parts = snake.parts.concat(
            serverParts.slice(0, commonPartIndices[1] + 1),
            clientParts.slice(commonPartIndices[0] + 1)
        );

        return xss.VALIDATE_SUCCES;
    },

    /**
     * @param {Array.<Array>} parts
     * @return {boolean}
     */
    hasGaps: function(parts) {
        for (var i = 1, m = parts.length; i < m; i++) {
            // Sanity check
            if (parts[i].length !== 2 ||
                typeof parts[i][0] !== 'number' ||
                typeof parts[i][1] !== 'number'
            ) {
                return false;
            }
            // Delta must be 1
            if (xss.util.delta(parts[i], parts[i - 1]) !== 1) {
                return true;
            }
        }
        return false;
    },

    /**
     * @param {Array.<Array>} clientParts
     * @param {Array.<Array>} serverParts
     * @return {Array.<Array>} common
     */
    getCommonPartIndices: function(clientParts, serverParts) {
        for (var i = clientParts.length - 1; i >= 0; i--) {
            for (var ii = serverParts.length - 1; ii >= 0; ii--) {
                if (xss.util.eq(clientParts[i], serverParts[ii])) {
                    return [i, ii];
                }
            }
        }
        return null;
    }

};
