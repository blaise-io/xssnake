import { getRandomItemFrom, randomRange, randomStr } from "../../shared/util";
import { MENU_LEFT, NS } from "../const";
import { InputStage } from "../stage_base/inputStage";
import { ClientState } from "../state/clientState";
import { font } from "../ui/font";
import { lifetime } from "../ui/shapeClient";
import { InputXssStage } from "./inputXss";

export class ChallengeStage extends InputStage {
    private _challenge: string;

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

    inputSubmit(error: string, value: string, top: number): void {
        let text = "ACCESS DENIED!!";

        // Evalevaleval!!!
        // Tolerate answers where user is quoting strings.
        if (value.replace(/['"]/g, "").trim() === String(eval(this._challenge))) {
            text = "> bleep!";
            ClientState.events.off("keydown", NS.INPUT);
            setTimeout(
                function () {
                    ClientState.flow.switchStage(this.next);
                }.bind(this),
                1000
            );
        }

        const shape = font(text, MENU_LEFT, top);
        lifetime(shape, 0, 1000);

        ClientState.shapes.message = shape;
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
