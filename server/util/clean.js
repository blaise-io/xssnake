'use strict';

xss.util.clean = {

    /**
     * @param {*} name
     * @return {string}
     */
    username: function(name) {
        if (new xss.util.Validator(name).assertStringOfLength(2, 20).valid()) {
            return String(name);
        } else {
            return 'Idiot' + xss.util.randomStr(3);
        }
    },

        /**
     * @param {Object} dirty
     * @return {Object}
     */
    roomPreferences: function(dirty) {
        var clean = {}, Validator = xss.util.Validator;

        clean[xss.FIELD_MAX_PLAYERS] = new Validator(dirty[xss.FIELD_MAX_PLAYERS])
            .assertRange(1, xss.ROOM_CAPACITY)
            .value(xss.ROOM_CAPACITY);

        clean[xss.FIELD_LEVEL_SET] = new Validator(dirty[xss.FIELD_LEVEL_SET])
            .assertRange(0, xss.levelSetRegistry.levelsets.length - 1)
            .value(xss.FIELD_VALUE_MEDIUM);

        clean[xss.FIELD_POWERUPS] = new Validator(dirty[xss.FIELD_POWERUPS])
            .assertType('boolean')
            .value(true);

        clean[xss.FIELD_PRIVATE] = new Validator(dirty[xss.FIELD_PRIVATE])
            .assertType('boolean')
            .value(false);

        clean[xss.FIELD_XSS] = new Validator(dirty[xss.FIELD_XSS])
            .assertType('boolean')
            .value(false);

        clean[xss.FIELD_QUICK_GAME] = new Validator(dirty[xss.FIELD_QUICK_GAME])
            .assertType('boolean')
            .value(false);

        return clean;
    }

};
