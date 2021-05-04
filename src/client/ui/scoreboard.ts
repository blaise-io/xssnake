import { CANVAS } from "../../shared/const";
import { Shape } from "../../shared/shape";
import { NS } from "../const";
import { ClientPlayer } from "../room/clientPlayer";
import { ClientPlayerRegistry } from "../room/clientPlayerRegistry";
import { State } from "../state";
import { font, fontPixels, fontWidth } from "./font";
import { animate } from "./shapeClient";

export class ScoreboardUI {
    private x0 = 3;
    private x1 = 56;
    private y0 = CANVAS.HEIGHT - 24;
    private y1 = CANVAS.HEIGHT - 2;
    private animating: boolean;
    private queue: boolean;
    private queueTimer: number;
    private podiumSize = 6;
    private lineHeight = 7;
    private animationDuration = 200;
    private animationPause = 200;
    private columnSpacing = fontWidth(" ");
    private oldPlayerOrder: ClientPlayer[];

    constructor(public players: ClientPlayerRegistry) {
        this.animating = false;
        this.queue = false;
        this.queueTimer = 0;
        this.oldPlayerOrder = this.getPlayersSortedByScore();

        this.updateScoreboard();
    }

    destruct(): void {
        clearInterval(this.queueTimer);
        this.destructShapes();
    }

    destructShapes(): void {
        for (let i = 0; i < this.podiumSize; i++) {
            State.shapes[NS.SCORE + i] = undefined;
        }
    }

    debounceUpdate(): void {
        if (this.animating) {
            this.queue = true;
        } else {
            this.updateScoreboard();
        }
    }

    updateScoreboard(): void {
        const newOrder = this.getPlayersSortedByScore();
        const oldOrder = this.oldPlayerOrder;
        for (let i = 0, m = this.podiumSize; i < m; i++) {
            if (i >= oldOrder.length) {
                // New player.
                this.paint(this.players[i], i, i);
                this.queue = true;
            } else if (typeof oldOrder[i] === "undefined") {
                // Player placeholder.
                this.paint(null, i, i);
            } else if (-1 === this.players.indexOf(oldOrder[i])) {
                // Player left.
                this.paint(null, i, this.players.length);
                this.queue = true;
            } else {
                // Existing player.
                const indexNew = newOrder.indexOf(oldOrder[i]);
                this.paint(oldOrder[i], i, indexNew);
            }
        }
        this.oldPlayerOrder = newOrder;
    }

    paint(player: ClientPlayer, oldIndex: number, newIndex: number): void {
        const oldCoordinate = this.getCoordinatesForIndex(oldIndex);
        const shape = this.getPlayerScoreShape(player, oldCoordinate);
        State.shapes[NS.SCORE + oldIndex] = shape;

        if (oldIndex !== newIndex) {
            const newCoordinate = this.getCoordinatesForIndex(newIndex);
            this.animateToNewPos(shape, oldCoordinate, newCoordinate);
        }
    }

    animateToNewPos(shape: Shape, oldCoordinate: Coordinate, newCoordinate: Coordinate): void {
        this.animating = true;
        animate(shape, {
            to: [newCoordinate[0] - oldCoordinate[0], newCoordinate[1] - oldCoordinate[1]],
            duration: this.animationDuration,
            doneCallback: this.animateCallback.bind(this),
        });
    }

    animateCallback(): void {
        this.queueTimer = window.setTimeout(this.queueUpdate.bind(this), this.animationPause);
    }

    queueUpdate(): void {
        this.animating = false;
        if (this.queue) {
            this.queue = false;
            this.updateScoreboard();
        }
    }

    getPlayerScoreShape(player: ClientPlayer, coordinate: Coordinate): Shape {
        let name = "-",
            score = 0;
        if (player && player.connected) {
            name = player.name;
            score = player.score;
        }

        let scoreX = coordinate[0] + this.itemWidth();
        scoreX -= fontWidth(String(score)) + this.columnSpacing;
        const shape = font(name, coordinate[0], coordinate[1]);
        shape.add(fontPixels(String(score), scoreX, coordinate[1]));

        if (player && player.local) {
            this.markLocalPlayer(shape);
        }

        return shape;
    }

    markLocalPlayer(shape: Shape): void {
        const bbox = shape.bbox(1);
        bbox.y1 = bbox.y0 + this.lineHeight;
        bbox.setDimensions();
        shape.invert();
    }

    itemWidth(): number {
        return Math.floor(this.x1 - this.x0 / 2);
    }

    getCoordinatesForIndex(index: number): Coordinate {
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

    getPlayersSortedByScore(): ClientPlayer[] {
        const players = this.players.slice();
        players.sort(function (a, b) {
            return (b.connected ? b.score : -1) - (a.connected ? a.score : -1);
        });
        return players;
    }
}
