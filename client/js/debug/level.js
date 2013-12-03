'use strict';

xss.DEBUG_NS = 'DEBUG';

// Debug URL: client.html?debug=level:1
var levelIndex = location.search.match(/debug=level:([0-9]+)/);
if (levelIndex) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(xss.debugLevel, 100);
    });
}

xss.debugLevel = function() {
    var time = 0;
    var data = xss.level.levelData(levelIndex[1]);
    var rotatingLine = new xss.animation.RotatingLine(31, 16, 12);

    xss.flow.destruct();
    xss.shapes = xss.shapegen.outerBorder();
    xss.shapes.level = xss.shapegen.level(data);
    xss.menuSnake.addToShapes();

    xss.event.on(xss.PUB_GAME_TICK, xss.DEBUG_NS, function(elapsed) {
        var ns = 'ANIMRL_';
        var pixelObjects = rotatingLine.update(time);
        if (pixelObjects) {
            for (var i = 0, m = pixelObjects.length; i < m; i++) {
                var pixels = xss.transform.zoomGame(pixelObjects[i]);
                xss.shapes[ns + i] = new xss.Shape(pixels);
            }
        }
        time += elapsed;
    });
};
