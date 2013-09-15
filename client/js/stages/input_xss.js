/*globals InputStage, StartGameStage*/
'use strict';

/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
function InputXssStage() {

    this.name = CONST.STORAGE_XSS;
    this.header = 'ENTER YOUR EVAL';
    this.label = '' +
        'Paste your JS. Keep it short; max 256 chars.\n' +
        'Line breaks will be removed.\n\n' +
        '> ';

    this.minChars = 2;
    this.maxChars = 256;
    this.displayWidth = CONST.MENU_WIDTH - XSS.font.width('> ');
    this.next = StartGameStage;

    InputStage.call(this);

    this.value = this.value || 'document.title = "LOSER!!"';
}

XSS.util.extend(InputXssStage.prototype, InputStage.prototype);
XSS.util.extend(InputXssStage.prototype, /** @lends InputXssStage.prototype */ {

    getData: function() {
        return {
            xss: this.getValue()
        };
    }

});
