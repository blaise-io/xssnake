'use strict';

// Debug URL: client.html?debug=dialog
xss.debug.dialog = location.search.match(/debug=dialog/);
if (xss.debug.dialog) {
    window.setTimeout(function() {
        new xss.Dialog(
            'HEADER TITLE',
            'Body text lol', {
            type: xss.Dialog.TYPE.ALERT
        });
    }, 500);
}
