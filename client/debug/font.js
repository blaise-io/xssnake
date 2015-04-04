'use strict';

// Debug URL: client.html?debug=tab
xss.debug.tab = location.search.match(/debug=font/);
if (xss.debug.tab) {
    xss.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        xss.flow.destruct();

        var text = [
            'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            'abcdefghijklmnopqrstuvwxyz',
            '1234567890 ~@#$%^&*()?/',
            '<XSSNAKE>',
            // Problematic chars:
            '0124zZ2bdp14MN'
        ].join('\n');
        xss.util.benchmark(20, function() {
            xss.shapes.testtabs = new xss.Shape(xss.transform.zoomAnti(xss.font.pixels(text)));
        });
    }, 200);
}
