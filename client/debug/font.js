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
            // Problematic chars and kerning:
            '0124zZ2bdp14MN Kern: LYABLE'
        ].join('\n');
        xss.util.benchmark(20, function() {
            xss.shapes.A = new xss.Shape(xss.transform.zoom(2, xss.font.pixels(text)));
            xss.shapes.B = xss.font.shape('ABCDEFGHIJKLMNOPQRSTUVWYXZ abcdefghijklmnopqrstuvwxyz', 8, 64);
            xss.shapes.C = new xss.Shape(xss.transform.zoom(4, xss.font.pixels('<XSSNAKE>'), 0, 70));
        });
    }, 200);
}
