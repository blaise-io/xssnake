import { Shape } from "./shape";

export class ShapeCollection {
    shapes: Shape[];

    constructor(...shapes: Shape[]) {
        this.shapes = shapes;
    }

    add(shape: Shape): void {
        this.shapes.push(shape);
    }

    set(index: number, shape: Shape): void {
        this.shapes[index] = shape;
    }

    each(callback: (Shape, number) => void): void {
        for (let i = 0, m = this.shapes.length; i < m; i++) {
            if (this.shapes[i]) {
                callback(this.shapes[i], i);
            }
        }
    }

}
