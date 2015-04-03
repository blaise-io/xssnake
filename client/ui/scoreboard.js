'use strict';

/**
 * @param {xss.room.ClientPlayerRegistry} players
 * @constructor
 */
xss.ui.Scoreboard = function(players) {
    this.players = players;

    this.animating = false;
    this.queue = false;
    this.queueTimer = 0;

    this.x0 = 3;
    this.x1 = 56;
    this.y0 = xss.HEIGHT - 24;
    this.y1 = xss.HEIGHT - 2;
    this.podiumSize = 6;
    this.lineHeight = 7;
    this.animationDuration = 200;
    this.animationPause = 200;
    this.columnSpacing = xss.font.width(' ');

    this.oldPlayerOrder = this.getPlayersSortedByScore();

    this.updateScoreboard();
};

xss.ui.Scoreboard.prototype = {

    destruct: function() {
        clearInterval(this.queueTimer);
        this.destructShapes();
    },

    destructShapes: function() {
        for (var i = 0; i < this.podiumSize; i++) {
            xss.shapes[xss.NS_SCORE + i] = null;
        }
    },

    debounceUpdate: function() {
        if (this.animating) {
            this.queue = true;
        } else {
            this.updateScoreboard();
        }
    },

    updateScoreboard: function() {
        var indexNew, newOrder, oldOrder;
        newOrder = this.getPlayersSortedByScore();
        oldOrder = this.oldPlayerOrder;

        for (var i = 0, m = this.podiumSize; i < m; i++) {
            if (i >= oldOrder.length) {
                // New player.
                this.paint(this.players.players[i], i, i);
                this.queue = true;
            } else if (typeof oldOrder[i] === 'undefined') {
                // Player placeholder.
                this.paint(null, i, i);
            } else if (-1 === this.players.players.indexOf(oldOrder[i])) {
                // Player left.
                this.paint(null, i, this.players.getTotal());
                this.queue = true;
            } else {
                // Existing player.
                indexNew = newOrder.indexOf(oldOrder[i]);
                this.paint(oldOrder[i], i, indexNew);
            }
        }
        this.oldPlayerOrder = newOrder;
    },

    paint: function(player, oldIndex, newIndex) {
        var oldCoordinate, newCoordinate, shape;
        oldCoordinate = this.getCoordinatesForIndex(oldIndex);
        shape = this.getPlayerScoreShape(player, oldCoordinate);
        xss.shapes[xss.NS_SCORE + oldIndex] = shape;

        if (oldIndex !== newIndex) {
            newCoordinate = this.getCoordinatesForIndex(newIndex);
            this.animateToNewPos(shape, oldCoordinate, newCoordinate);
        }
    },

    animateToNewPos: function(shape, oldCoordinate, newCoordinate) {
        this.animating = true;
        shape.animate({
            to: [
                newCoordinate[0] - oldCoordinate[0],
                newCoordinate[1] - oldCoordinate[1]
            ],
            callback: this.animateCallback.bind(this),
            duration: this.animationDuration
        });
    },

    animateCallback: function() {
        this.queueTimer = setTimeout(
            this.queueUpdate.bind(this),
            this.animationPause
        );
    },

    queueUpdate: function() {
        this.animating = false;
        if (this.queue) {
            this.queue = false;
            this.updateScoreboard();
        }
    },

    getPlayerScoreShape: function(player, coordinate) {
        var shape, scoreX, name = '-', score = 0;

        if (player && player.connected) {
            name = player.name;
            score = player.score;
        }

        scoreX = coordinate[0] + this.itemWidth();
        scoreX -= xss.font.width(String(score)) + this.columnSpacing;
        shape = xss.font.shape(name, coordinate[0], coordinate[1]);
        shape.add(xss.font.pixels(String(score), scoreX, coordinate[1]));

        if (player && player.local) {
            this.markLocalPlayer(shape);
        }

        return shape;
    },

    markLocalPlayer: function(shape) {
        var bbox = shape.bbox(1);
        bbox.y1 = bbox.y0 + this.lineHeight;
        bbox.setDimensions();
        shape.invert();
    },

    itemWidth: function() {
        return Math.floor(this.x1 - this.x0 / 2);
    },

    getCoordinatesForIndex: function(index) {
        // 0 3
        // 1 4
        // 2 5
        return [
            this.x0 + (index + 1 <= this.podiumSize / 2 ? 0 : this.itemWidth()),
            this.y0 + (index % (this.podiumSize / 2)) * this.lineHeight
        ];
        // More chaotic?
        // 0 1
        // 2 3
        // 4 5
        //return [
        //    this.x0 + (index % 2 ? this.itemWidth() : 0),
        //    this.y0 + (Math.floor(index / 2) * this.lineHeight)
        //];
    },

    getPlayersSortedByScore: function() {
        var players = this.players.players.slice();
        players.sort(function(a, b) {
            return (b.connected ? b.score : -1) - (a.connected ? a.score : -1);
        });
        return players;
    }

};
