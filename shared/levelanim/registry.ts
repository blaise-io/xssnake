import { NS_ANIM } from "../../client/const";
import { State } from "../../client/state/state";

export class LevelAnimationRegistry {
    public animations = []
    public walls = []
    public started = false
    public progress = 0

    public register(animation) {
        this.animations.push(animation);
    }

    public update(delta, started) {
        this.progress += delta;
        this.started = started;
        this.walls = this.updateAnimations();
        this.updateShapes();
    }

    public updateAnimations() {
        var walls = [];
        for (var i = 0, m = this.animations.length; i < m; i++) {
            var shapeCollection = this.updateAnimation(this.animations[i]);
            if (shapeCollection) {
                walls.push(shapeCollection);
            }
        }
        return walls;
    }

    public updateAnimation(animation) {
        return animation.update(this.progress, this.started);
    }

    public updateShapes() {
        for (var i = 0, m = this.walls.length; i < m; i++) {
            if (this.walls[i]) {
                this._updateShapes(i, this.walls[i]);
            }
        }
    }

    private _updateShapes(animIndex, shapeCollection) {
        var shapes = shapeCollection.shapes;
        for (var i = 0, m = shapes.length; i < m; i++) {
            this._updateShape([NS_ANIM, animIndex, i].join('_'), shapes[i]);
        }
    }

    private _updateShape(key: string, shape) {
        if (shape) {
            if (!shape.headers.transformed) {
                shape.setGameTransform();
                shape.headers.transformed = true;
            }
            State.shapes[key] = shape;
        } else {
            State.shapes[key] = null;
        }
    }

}
