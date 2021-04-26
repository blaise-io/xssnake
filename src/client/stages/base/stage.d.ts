import { Shape } from "../../../shared/shape";
import { FlowData } from "../../flow";

export interface StageInterface {
    construct(): void;
    destruct(): void;
    getShape(): Shape;
}

interface StageConstructor {
    new (stageflowData: FlowData): StageInterface;
}
