import { Shape } from "../../../shared/shape";

export interface StageInterface {
    construct(): void;
    destruct(): void;
    getShape(): Shape;
}

interface StageConstructor {
    new (): StageInterface;
}
