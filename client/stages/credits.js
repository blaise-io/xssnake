'use strict';

/**
 * @extends {xss.ScreenStage}
 * @implements {xss.StageInterface}
 * @constructor
 */
xss.CreditsStage = function() {
    xss.ScreenStage.call(this);
};

xss.extend(xss.CreditsStage.prototype, xss.ScreenStage.prototype);
xss.extend(xss.CreditsStage.prototype, /** @lends {xss.CreditsStage.prototype} */ {

    getShape: function() {
        var body, icons, left = xss.MENU_LEFT, top = xss.MENU_TOP;

        icons = [
            xss.UC_BULB,
            '{}',
            xss.UC_FONT,
            xss.UC_BUG,
            xss.UC_MUSIC,
            xss.UC_SKULL
        ];

        body = icons.join(' + ') + '\n' +
            'BLAISE KAL  2012 - 2015\n\n' +
            'www.blaise.io\n' +
            'blaise.kal@gmail.com\n\n' +
            'Thank you for playing!\n' +
            'KEEP THE SNAKE ALIVE';

        return new xss.Shape(
            xss.transform.zoom(2, xss.font.pixels('CREDITS'), left, top),
            xss.font.pixels(body, left, top + xss.MENU_TITLE_HEIGHT)
        );
    }
});
