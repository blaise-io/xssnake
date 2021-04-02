/**
 * @extends {ScreenStage}
 * @implements {StageInterface}
 * @constructor
 */
CreditsStage = function() {
    ScreenStage.call(this);
};

extend(CreditsStage.prototype, ScreenStage.prototype);
extend(CreditsStage.prototype, /** @lends {CreditsStage.prototype} */ {

    getShape() {
        var body, icons, left = MENU_LEFT, top = MENU_TOP;

        icons = [
            UC_BULB,
            '{}',
            UC_FONT,
            UC_BUG,
            UC_MUSIC,
            UC_SKULL
        ];

        body = icons.join(' + ') + '\n' +
            'BLAISE KAL  2012 - 2015\n\n' +
            'www.blaise.io\n' +
            'blaise.kal@gmail.com\n\n' +
            'Thank you for playing!\n' +
            'KEEP THE SNAKE ALIVE';

        return new Shape(
            zoom(2, fontPixels('CREDITS'), left, top),
            fontPixels(body, left, top + MENU_TITLE_HEIGHT)
        );
    }
});
