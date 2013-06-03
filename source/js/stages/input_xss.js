/*jshint globalstrict:true, es5:true, sub:true, evil:true*/
/*globals XSS, CONST, InputStage, StartGameStage*/
'use strict';

/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
function InputXssStage() {

    this.header = 'Enter your evil';
    this.label = '' +
        'Paste your JS. Keep it short; max 256 chars.\n' +
        'Line breaks will be removed.\n\n' +
        '> ';

    this.minChars = 2;
    this.maxChars = 256;
    this.displayWidth = CONST.MENU_WIDTH - XSS.font.width('> ');
    this.next = StartGameStage;

    InputStage.call(this);
}

XSS.util.extend(InputXssStage.prototype, InputStage.prototype);
