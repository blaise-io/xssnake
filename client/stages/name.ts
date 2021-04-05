/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
import { PLAYER_NAME_MAXWIDTH, PLAYER_NAME_MINLENGTH } from "../../shared/const";
import { randomArrItem } from "../../shared/util";
import {
    DOM_EVENT_KEYDOWN, MENU_LEFT, NS_INPUT, STORAGE_NAME, UC_SKULL, UC_WHITE_HEART,
} from "../const";
import { InputStage } from "../stage_base/inputStage";
import { State } from "../state/state";
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
        let shape; let text; let duration = 500;
        if (error) {
            text = error;
        } else {
            State.events.off(DOM_EVENT_KEYDOWN, NS_INPUT);
            text = randomArrItem(this._wits).replace(/%s/g, value);
            duration = Math.max(Math.min(text.length * 30, 500), 100);
            setTimeout(function() {
                State.flow.switchStage(this.next);
            }.bind(this), duration);
        }

        shape = font(text, MENU_LEFT, top);
        lifetime(shape, 0, duration);

        State.shapes.message = shape;
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
  ]
}
