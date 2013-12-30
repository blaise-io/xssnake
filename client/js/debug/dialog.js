'use strict';

// Debug URL: client.html?debug=dialog
xss.debug.levelIndex = location.search.match(/debug=dialog/);
if (xss.debug.levelIndex) {
    window.setTimeout(function() {
        new xss.Dialog(
            'HEADER TITLE',
            'Body text lol', {
            type: xss.Dialog.TYPE.ALERT
        });
    }, 500);
}
