/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, CONST, InputStage, MultiplayerStage*/
'use strict';

/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
function NameStage() {
    this.name = CONST.STORAGE_NAME;
    this.header = 'HELLO';
    this.label = 'My name is ';
    this.next = MultiplayerStage;
    this.minChars = 2;
    this.maxValWidth = CONST.UI_WIDTH_NAME;

    InputStage.call(this);
}

XSS.util.extend(NameStage.prototype, InputStage.prototype);
XSS.util.extend(NameStage.prototype, /** @lends NameStage.prototype */ {

    /**
     * @param {string} error
     * @param {string} value
     * @param {number} top
     * @private
     */
    inputSubmit: function(error, value, top) {
        var shape, text, duration = 500;
        if (error) {
            text = error;
        } else {
            XSS.event.off(CONST.EVENT_KEYDOWN, CONST.NS_INPUT);
            text = XSS.util.randomItem(this._wits).replace(/%s/g, value);
            duration = Math.max(Math.min(text.length * 30, 500), 100);
            setTimeout(function() {
                XSS.flow.switchStage(this.next);
            }.bind(this), duration);
        }

        shape = XSS.font.shape(text, CONST.MENU_LEFT, top);
        shape.lifetime(0, duration);

        XSS.shapes.message = shape;
    },

    _wits: [
        '%s%s%s!!!',
        'You have the same name as my mom',
        'LOVELY ' + new Array(4).join(CONST.UC_HEART),
        CONST.UC_SKULL,
        'Lamest name EVER',
        'Clever name!',
        'Mmm I love the way you handled that keyboard',
        'asdasdasdasd',
        'Please dont touch anything',
        'Hello %s',
        'Is that your real name?',
        'You dont look like a %s...',
        'Are you new here?',
        'I remember you',
        'I dont believe that\'s your name, but continue anyway',
        'Can I have your number?',
        'My name is NaN',
        '#$%^&*!!',
        'I thought I banned you?',
        'Jesus saves',
        'Is this your first time online?',
        'Are you from the internet?',
        '%s? OMGOMG',
        'Your soul is beautiful!',
        'Your soul is delicous'
    ]

});
