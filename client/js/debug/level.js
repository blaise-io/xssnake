'use strict';

xss.debug.NS = 'DEBUG';

// Debug URL: client.html?debug=level:1
xss.debug.levelIndex = location.search.match(/debug=level:([0-9]+)/);
if (xss.debug.levelIndex) {
    document.addEventListener('DOMContentLoaded', function() {
        window.setTimeout(function() {
            xss.levels.allImagesLoaded = xss.debug.level;
        }, 0);
    });
}

xss.debug.level = function() {
    var time = 0;
    var levelData = xss.levels.getLevelData(xss.debug.levelIndex[1]);

    xss.flow.destruct();
    xss.shapes = xss.shapegen.outerBorder();
    xss.shapes.level = xss.shapegen.level(levelData);
    xss.menuSnake.addToShapes();

    if (!levelData.animation) {
        console.info('No animation in level.');
        return;
    }

    var animatedObjects = levelData.animation();
    xss.event.on(xss.PUB_GAME_TICK, xss.debug.NS, function(elapsed) {
        var ns = 'ANIM';
        for (var i = 0, m = animatedObjects.length; i < m; i++) {
            var animations = animatedObjects[i].update(time);
            if (animations) {
                for (var ii = 0, mm = animations.length; ii < mm; ii++) {
                    var pixels = xss.transform.zoomGame(animations[ii]);
                    xss.shapes[ns + (i*1000) + ii] = new xss.Shape(pixels);
                }
            }
        }
        time += elapsed;
    });
};
