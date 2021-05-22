import { ShapeCollection } from "../shapeCollection";

export interface ShapeAnimation {
    update(ms: number, preGame: boolean): ShapeCollection;
}
