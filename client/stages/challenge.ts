/* jshint evil: true */
import { randomArrItem, randomRange } from "../../shared/util";
import { DOM_EVENT_KEYDOWN, MENU_LEFT, NS_INPUT } from "../const";
import { InputStage } from "../stage_base/inputStage";
import { State } from "../state/state";
import { font } from "../ui/font";
import { lifetime } from "../ui/shapeClient";
import { InputXssStage } from "./inputXss";

/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
export class ChallengeStage extends InputStage {
    private _challenge: any;

    constructor() {
        super();
        this._challenge = this._getRandomChallenge();

        this.maxwidth = 80;
        this.header = "DANGER DANGER";
        this.label =
            "" +
            "XSS mode allows the winner of a game to execute " +
            "JavaScript in the browser of every loser. This may " +
            "damage you and/or your computer. To confirm that " +
            "you know JavaScript and accept the risk, enter the " +
            "result of the following statement:\n\n> " +
            this._challenge +
            "\n> ";

        this.next = InputXssStage;
    }

    inputSubmit(error, value, top) {
        let shape;
        let text = "ACCESS DENIED!!";

        // Evalevaleval!!!
        // Tolerate answers where user is quoting strings.
        if (value.replace(/['"]/g, "").trim() === String(eval(this._challenge))) {
            text = "> bleep!";
            State.events.off(DOM_EVENT_KEYDOWN, NS_INPUT);
            setTimeout(
                function () {
                    State.flow.switchStage(this.next);
                }.bind(this),
                1000
            );
        }

        shape = font(text, MENU_LEFT, top);
        lifetime(shape, 0, 1000);

        State.shapes.message = shape;
    }

    _challenges = [
        "document.scripts[0].tagName",
        "document.documentElement.tagName",
        "location.protocol.split('').reverse().join('')[%d]",
        "'OUIMERCI!'.charAt(Math.ceil(Math.random())*%d)",
        "Array(%d).join(encodeURI(' '))",
        "parseInt('1000',%d+2)",
        "2e%d",
        "String([1,2,3][3]).charAt(%d)",
        "String(typeof []).charAt(%d)",
        "String(typeof (5%2)).charAt(%d)",
        "(/%s/).test('%s')",
        "'%s%s'.replace(/%s/, 'mew')",
        "'012345'.lastIndexOf('%d')",
        "'%s'+'A'+Math.pow(%d,2)",
        "new Date('2013,0%d,0%d').getMonth()",
        "var A=%d,B=3;do{A++}while(B--); A;",
        "var A=3,B=%d;do{A++}while(B--); B;",
        "var A=%d;A++;++A;A+=1; A;",
        "var A=%d;A--;--A;A-=1; A;",
        '"%d"+%d',
    ];

    _getRandomChallenge() {
        let randomStr;
        let randomDigit;
        let challenge;

        randomStr = randomStr().substr(0, 3).toUpperCase();
        randomDigit = String(randomRange(0, 5));

        challenge = String(randomArrItem(this._challenges));
        challenge = challenge.replace(/%s/g, randomStr);
        challenge = challenge.replace(/%d/g, randomDigit);

        return challenge;
    }
}
