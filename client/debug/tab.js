'use strict';

// Debug URL: client.html?debug=tab
xss.debug.tab = location.search.match(/debug=tab/);
if (xss.debug.tab) {
    xss.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        xss.shapes = {};
        var text = [
            'This line does not affect alignment.',
            '',
            'Label\tValue A',
            'Second Label\tAligned with A',
            '\tEmpty label'
        ].join('\n');
        xss.shapes.testtabs = xss.font.shape(text, 10, 10);
    }, 200);
}
