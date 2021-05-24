// import { NS } from "../../client/const";
// import { State } from "../../client/state/state";
// import { setGameTransform } from "../../client/ui/shapeClient";

import { ShapeAnimation } from "../levelanims/types";
import { ShapeCollection } from "../shapeCollection";

export class LevelAnimationRegistry extends Array {
    animations: ShapeAnimation[] = [];
    walls: ShapeCollection[] = [];
    started = false;
    progress = 0;

    constructor() {
        super();
    }

    // register(animation: ShapeAnimation): void {
    //     this.animations.push(animation);
    // }

    update(delta: number, started: boolean): void {
        this.progress += delta;
        this.started = started;
        this.walls = this.updateAnimations();
        this.updateShapes();
    }

    updateAnimations(): ShapeCollection[] {
        const walls = [];
        for (let i = 0, m = this.animations.length; i < m; i++) {
            const shapeCollection = this.updateAnimation(this.animations[i]);
            if (shapeCollection) {
                walls.push(shapeCollection);
            }
        }
        return walls;
    }

    updateAnimation(animation: ShapeAnimation): ShapeCollection {
        return animation.update(this.progress, this.started);
    }

    updateShapes(): void {
        for (let i = 0, m = this.walls.length; i < m; i++) {
            if (this.walls[i]) {
                // this._updateShapes(i, this.walls[i]);
            }
        }
    }

    // private _updateShapes(animIndex, shapeCollection) {
    //     const shapes = shapeCollection;
    //     for (let i = 0, m = shapes.length; i < m; i++) {
    //         this._updateShape([NS.ANIM, animIndex, i].join("_"), shapes[i]);
    //     }
    // }
    //
    // private _updateShape(key: string, shape) {
    //     if (shape) {
    //         if (!shape.headers.transformed) {
    //             setGameTransform(shape);
    //             shape.headers.transformed = true;
    //         }
    //         State.shapes[key] = shape;
    //     } else {
    //         delete State.shapes[key]  ;
    //     }
    // }
}
