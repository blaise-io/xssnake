/*jshint globalstrict:true, sub:true, evil:true*/
/*globals XSS, CONST, ScreenStage, Shape */
'use strict';

/**
 * @extends {ScreenStage}
 * @implements {StageInterface}
 * @constructor
 */
function CreditsStage() {
    ScreenStage.call(this);
}

XSS.util.extend(CreditsStage.prototype, ScreenStage.prototype);
XSS.util.extend(CreditsStage.prototype, /** @lends CreditsStage.prototype */ {

    getShape: function() {
        var body, left = CONST.MENU_LEFT, top = CONST.MENU_TOP;

        body = 'Concept, Code, Bugs, Font & ' + CONST.UC_SKULL + ':\n' +
            'Blaise Kal, 2012-2013.\n\n' +
            'Website: www.blaise.io\n' +
            'Email: blaisekal@gmail.com\n\n' +
            'Thank you for playing!';

        return new Shape(
            XSS.transform.zoomX2(XSS.font.pixels('CREDITS'), left, top, true),
            XSS.font.pixels(body, left, top + CONST.MENU_TITLE_HEIGHT)
        );
    }

});
