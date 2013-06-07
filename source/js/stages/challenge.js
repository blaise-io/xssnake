/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, CONST, InputStage, InputXssStage, MultiplayerStage*/
'use strict';

/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
function ChallengeStage() {
    this._challenge = this._getRandomChallenge();

    this.maxValWidth = 50;
    this.header = 'DANGER DANGER';
    this.label = '' +
        'XSS mode allows the winner of a game to execute\n' +
        'Javascript in the browser of every loser. This may\n' +
        'damage you and/or your computer. To confirm that\n' +
        'you know Javascript and accept the risk, enter the\n' +
        'result of this statement:\n\n> ' +
        this._challenge + '\n> ';

    this.next = InputXssStage;

    InputStage.call(this);
}

XSS.util.extend(ChallengeStage.prototype, InputStage.prototype);
XSS.util.extend(ChallengeStage.prototype, /** @lends {ChallengeStage.prototype} */ {

    inputSubmit: function(error, value, top) {
        var shape, text = '> ACCESS DENIED!!';

        // Evalevaleval!!!
        if (value.replace(/['"]/g, '') === String(eval(this._challenge))) {
            text = '> bleep!';
            XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_INPUT);
            setTimeout(function() {
                XSS.flow.switchStage(this.next);
            }.bind(this), 1000);
        }

        shape = XSS.font.shape(text, CONST.MENU_LEFT, top);
        shape.lifetime(0, 1000);

        XSS.shapes.message = shape;
    },

    _challenges: [
        'document.scripts[0].tagName',
        'document.documentElement.tagName',
        'location.protocol.split(\'\').reverse().join()[0]',
        '\'ouimerci!\'.charAt(Math.ceil(Math.random())*%d)',
        'Array(%d).join(encodeURI(\' \'))',
        'String(parseInt(\'FF\', 16))',
        'JSON.stringify({A:\'%s\'})',
        'String([1,2,3][3]).charAt(%d)',
        'String(typeof []).charAt(%d)',
        'String(typeof (5%2)).charAt(%d)',
        'String(/%s/.test(\'%s\'))',
        '\'%s%s\'.replace(/%s/, \'mew\')',
        '\'012345\'.lastIndexOf(\'%d\')',
        '\'%s\'+\'A\'+Math.pow(%d,2)',
        'String(new Date(\'2013-0%d-0%d\').getMonth())',
        'var A=%d,B=3;do{A++}while(B--); A;',
        'var A=3,B=%d;do{A++}while(B--); B;',
        'var A=%d;A++;++A;A+=1; A;',
        'var A=%d;A--;--A;A-=1; A;'
    ],

    _getRandomChallenge: function() {
        var randomStr, randomDigit, challenge;

        randomStr = XSS.util.randomStr().substr(0, 3).toUpperCase();
        randomDigit = String(XSS.util.randomRange(0, 5));

        challenge = String(XSS.util.randomItem(this._challenges));
        challenge = challenge.replace(/%s/g, randomStr);
        challenge = challenge.replace(/%d/g, randomDigit);

        return challenge;
    }

});
