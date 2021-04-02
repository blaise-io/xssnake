/**
 * @extends {InputStage}
 * @implements {StageInterface}
 * @constructor
 */
InputXssStage = function() {

    this.name = STORAGE_XSS;
    this.header = 'ENTER YOUR EVAL';
    this.label = '' +
        'Paste your JS. Keep it short; max 256 chars.\n' +
        'Line breaks will be removed.\n\n' +
        '> ';

    this.minlength = 2;
    this.maxChars = 256;
    this.displayWidth = MENU_WIDTH - fontWidth('> ');
    this.next = State.flow.GameStage;

    InputStage.call(this);

    this.value = this.value || 'document.title = "LOSER!!"';
};

extend(InputXssStage.prototype, InputStage.prototype);
extend(InputXssStage.prototype, /** @lends {InputXssStage.prototype} */ {

    getData() {
        return {
            xss: this.getValue()
        };
    }
});
