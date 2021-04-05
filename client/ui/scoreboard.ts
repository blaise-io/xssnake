import { HEIGHT } from "../../shared/const";
import { Player } from "../../shared/room/player";
import { NS_SCORE } from "../const";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state/state";
import { font, fontPixels, fontWidth } from "./font";
import { animate } from "./shapeClient";

export class ScoreboardUI {
    private x0: number;
    private x1: number;
    private animating: boolean;
    private queue: boolean;
    private queueTimer: number;
    private y0: number;
    private y1: number;
    private podiumSize: number;
    private lineHeight: number;
    private animationDuration: number;
    private animationPause: number;
    private columnSpacing: any;
    private oldPlayerOrder: Player[];

    constructor(public players: ClientPlayerRegistry) {

        this.animating = false;
        this.queue = false;
        this.queueTimer = 0;

        this.x0 = 3;
        this.x1 = 56;
        this.y0 = HEIGHT - 24;
        this.y1 = HEIGHT - 2;
        this.podiumSize = 6;
        this.lineHeight = 7;
        this.animationDuration = 200;
        this.animationPause = 200;
        this.columnSpacing = fontWidth(" ");

        this.oldPlayerOrder = this.getPlayersSortedByScore();

        this.updateScoreboard();
    }


    destruct() {
        clearInterval(this.queueTimer);
        this.destructShapes();
    }

    destructShapes() {
        for (let i = 0; i < this.podiumSize; i++) {
            State.shapes[NS_SCORE + i] = null;
        }
    }

    debounceUpdate() {
        if (this.animating) {
            this.queue = true;
        } else {
            this.updateScoreboard();
        }
    }

    updateScoreboard() {
        let indexNew; let newOrder; let oldOrder;
        newOrder = this.getPlayersSortedByScore();
        oldOrder = this.oldPlayerOrder;

        for (let i = 0, m = this.podiumSize; i < m; i++) {
            if (i >= oldOrder.length) {
                // New player.
                this.paint(this.players.players[i], i, i);
                this.queue = true;
            } else if (typeof oldOrder[i] === "undefined") {
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
    }

    paint(player, oldIndex, newIndex) {
        let oldCoordinate; let newCoordinate; let shape;
        oldCoordinate = this.getCoordinatesForIndex(oldIndex);
        shape = this.getPlayerScoreShape(player, oldCoordinate);
        State.shapes[NS_SCORE + oldIndex] = shape;

        if (oldIndex !== newIndex) {
            newCoordinate = this.getCoordinatesForIndex(newIndex);
            this.animateToNewPos(shape, oldCoordinate, newCoordinate);
        }
    }

    animateToNewPos(shape, oldCoordinate, newCoordinate) {
        this.animating = true;
        animate(shape, {
            to: [
                newCoordinate[0] - oldCoordinate[0],
                newCoordinate[1] - oldCoordinate[1],
            ],
            duration: this.animationDuration,
            doneCallback: this.animateCallback.bind(this),
        });
    }

    animateCallback() {
        this.queueTimer = window.setTimeout(
            this.queueUpdate.bind(this),
            this.animationPause
        );
    }

    queueUpdate() {
        this.animating = false;
        if (this.queue) {
            this.queue = false;
            this.updateScoreboard();
        }
    }

    getPlayerScoreShape(player, coordinate) {
        let shape; let scoreX; let name = "-"; let score = 0;

        if (player && player.connected) {
            name = player.name;
            score = player.score;
        }

        scoreX = coordinate[0] + this.itemWidth();
        scoreX -= fontWidth(String(score)) + this.columnSpacing;
        shape = font(name, coordinate[0], coordinate[1]);
        shape.add(fontPixels(String(score), scoreX, coordinate[1]));

        if (player && player.local) {
            this.markLocalPlayer(shape);
        }

        return shape;
    }

    markLocalPlayer(shape) {
        const bbox = shape.bbox(1);
        bbox.y1 = bbox.y0 + this.lineHeight;
        bbox.setDimensions();
        shape.invert();
    }

    itemWidth() {
        return Math.floor(this.x1 - this.x0 / 2);
    }

    getCoordinatesForIndex(index) {
        // 0 3
        // 1 4
        // 2 5
        return [
            this.x0 + (index + 1 <= this.podiumSize / 2 ? 0 : this.itemWidth()),
            this.y0 + (index % (this.podiumSize / 2)) * this.lineHeight,
        ];
        // More chaotic?
        // 0 1
        // 2 3
        // 4 5
        //return [
        //    this.x0 + (index % 2 ? this.itemWidth() : 0),
        //    this.y0 + (Math.floor(index / 2) * this.lineHeight)
        //];
    }

    getPlayersSortedByScore() {
        const players = this.players.players.slice();
        players.sort(function(a, b) {
            return (b.connected ? b.score : -1) - (a.connected ? a.score : -1);
        });
        return players;
    }

}
