'use strict';

/**
 * @extends {xss.InputStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.NameStage = function() {
    this.next = xss.MultiplayerStage;
    this.name = xss.STORAGE_NAME;
    this.header = 'HELLO';
    this.label = 'My name is ';
    this.minlength = xss.PLAYER_NAME_MINLENGTH;
    this.maxwidth = xss.PLAYER_NAME_MAXWIDTH;

    xss.InputStage.call(this);
};

xss.extend(xss.NameStage.prototype, xss.InputStage.prototype);
xss.extend(xss.NameStage.prototype, /** @lends {xss.NameStage.prototype} */ {

    /**
     * @return {Object}
     */
    getData: function() {
        return {
            name: this.getValue()
        };
    },

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
            xss.event.off(xss.DOM_EVENT_KEYDOWN, xss.NS_INPUT);
            text = xss.util.randomArrItem(this._wits).replace(/%s/g, value);
            duration = Math.max(Math.min(text.length * 30, 500), 100);
            setTimeout(function() {
                xss.flow.switchStage(this.next);
            }.bind(this), duration);
        }

        shape = xss.font.shape(text, xss.MENU_LEFT, top);
        shape.lifetime(0, duration);

        xss.shapes.message = shape;
    },

    _wits: [
        '%s%s%s!!!',
        'You have the same name as my mom',
        'LOVELY ' + new Array(4).join(xss.UC_WHITE_HEART),
        xss.UC_SKULL,
        'Lamest name EVER',
        'Clever name!',
        'Mmm I love the way you handled that keyboard',
        'asdasdasdasd',
        'Please dont touch anything',
        'Hello %s',
        'Are you excited?',
        'ARE YOU READY TO PARTY???',
        'Is that your real name?',
        'You dont look like a %s…',
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

