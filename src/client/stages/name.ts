import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { getRandomItemFrom } from "../../shared/util";
import { MENU_LEFT, NS, STORAGE_NAME, UC_SKULL, UC_WHITE_HEART } from "../const";
import { InputStage } from "../stage_base/inputStage";
import { ClientState } from "../state/clientState";
import { font } from "../ui/font";
import { lifetime } from "../ui/shapeClient";
import { MultiplayerStage } from "./multiplayer";

export class NameStage extends InputStage {
    constructor() {
        super();
        this.next = MultiplayerStage;
        this.name = STORAGE_NAME;
        this.header = "HELLO";
        this.label = "My name is ";
        this.minlength = PLAYER_NAME_MINLENGTH;
        this.maxwidth = PLAYER_NAME_MAXWIDTH;
    }

    getData(): Record<string, string> {
        return {
            name: this.getValue(),
        };
    }

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     * @private
     */
    inputSubmit(error, value, top): void {
        let shape;
        let text;
        let duration = 500;
        if (error) {
            text = error;
        } else {
            ClientState.events.off("keydown", NS.INPUT);
            text = getRandomItemFrom(this._wits).replace(/%s/g, value);
            duration = Math.max(Math.min(text.length * 30, 500), 100);
            setTimeout(
                function () {
                    ClientState.flow.switchStage(this.next);
                }.bind(this),
                duration
            );
        }

        shape = font(text, MENU_LEFT, top);
        lifetime(shape, 0, duration);

        ClientState.shapes.message = shape;
    }

    _wits = [
        "%s%s%s!!!",
        "You have the same name as my mom",
        "LOVELY " + new Array(4).join(UC_WHITE_HEART),
        UC_SKULL,
        "Lamest name EVER",
        "Clever name!",
        "Mmm I love the way you handled that keyboard",
        "asdasdasdasd",
        "Please dont touch anything",
        "Hello %s",
        "Are you excited?",
        "ARE YOU READY TO PARTY???",
        "Is that your real name?",
        "You dont look like a %s…",
        "Are you new here?",
        "I remember you",
        "I dont believe that's your name, but continue anyway",
        "Can I have your number?",
        "My name is NaN",
        "#$%^&*!!",
        "I thought I banned you?",
        "Jesus saves",
        "Is this your first time online?",
        "Are you from the internet?",
        "%s? OMGOMG",
        "Your soul is beautiful!",
        "Your soul is delicous",
    ];
}
