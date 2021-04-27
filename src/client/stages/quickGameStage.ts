import { FlowData } from "../flow";
import { GameStage } from "./base/gameStage";

export class QuickGameStage extends GameStage {
    constructor(flowData: FlowData) {
        super(flowData);
        this.flowData.roomOptions.isQuickGame = true;
    }
}