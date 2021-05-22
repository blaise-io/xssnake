import { _, getRandomItemFrom, randomRange, randomStr } from "../../shared/util";
import { MENU_POS } from "../const";
import { InputStage } from "./base/inputStage";
import { State } from "../state";
import { font } from "../ui/font";
import { lifetime } from "../ui/shapeClient";
import { InputXssStage } from "./inputXssStage";

export class ChallengeStage extends InputStage {
    private _challenge: string;

    name = null;
    maxwidth = 80;
    header = _("Danger Danger");
    next = InputXssStage;
    label: string;

    constructor() {
        super();
        this._challenge = this._getRandomChallenge();
        this.label = _(
            "XSS mode allows the winner of a game to execute " +
                "JavaScript in the browser of every loser. This may " +
                "damage you and/or your computer. To confirm that " +
                "you know JavaScript and accept the risk, enter the " +
                "result of the following statement:",
        );
        this.label += `\n\n${this._challenge}\n\n> `;
        this.shape = this.getLabelAndValueShape();
    }

    inputSubmit(error: string, value: string, top: number): void {
        let text = "ACCESS DENIED!!";

        // Evalevaleval!!!
        // Tolerate answers where user is quoting strings.
        if (value.replace(/['"]/g, "").trim() === String(eval(this._challenge))) {
            text = "> bleep!";
            this.eventHandler.destruct();
            setTimeout(() => {
                State.flow.switchStage(this.next);
            }, 1000);
        }

        const shape = font(text, MENU_POS.LEFT, top);
        lifetime(shape, 0, 1000);

        State.shapes.message = shape;
    }

    _challenges = [
        "document.scripts[0].tagName",
        "document.documentElement.tagName",
        "location.protocol.split('').reverse().join('')[%d]",
        "'OUIMERCIFROMAGE'.charAt(Math.ceil(Math.random())*%d)",
        "Array(%d).join(encodeURI(' '))",
        "2e%d",
        "String([1,2,3][3]).charAt(%d)",
        "String(typeof []).charAt(%d)",
        "String(typeof (5%2)).charAt(%d)",
        "(/%s/).tests('%s')",
        "'%s%s'.replace(/%s/, 'mew')",
        "'012345'.lastIndexOf('%d')",
        "'%s'+'A'+Math.pow(%d,2)",
        "new Date('2013,0%d,0%d').getMonth()",
        "let A=%d,B=3;do{A++}while(B--); A;",
        "let A=3,B=%d;do{A++}while(B--); B;",
        "let A=%d;A++;++A;A+=1; A;",
        "let A=%d;A--;--A;A-=1; A;",
        '"%d"+%d',
    ];

    _getRandomChallenge(): string {
        const upperCaseStr = randomStr(3).toUpperCase();
        const digit = String(randomRange(0, 5));

        let challenge = String(getRandomItemFrom(this._challenges));
        challenge = challenge.replace(/%s/g, upperCaseStr);
        challenge = challenge.replace(/%d/g, digit);

        return challenge;
    }
}
