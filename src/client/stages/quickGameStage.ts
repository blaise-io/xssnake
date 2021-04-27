import { FlowData } from "../flow";
import { GameStage } from "./base/gameStage";

// TODO: Remove, GameStage should be vanilla and be based on roomoptions
export class QuickGameStage extends GameStage {
    constructor(flowData: FlowData) {
        super(flowData);
        this.flowData.roomOptions.isQuickGame = true;
    }
}
