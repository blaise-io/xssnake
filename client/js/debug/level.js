/* jshint devel: true */
'use strict';

xss.debug.NS = 'DEBUG';

// Debug URL: client.html?debug=level:0
xss.debug.levelIndex = location.search.match(/debug=level:([0-9]+)/);
if (xss.debug.levelIndex) {
    document.addEventListener('DOMContentLoaded', function() {
        window.setTimeout(function() {
            xss.levels.allImagesLoaded = xss.debug.level;
        }, 0);
    });
}

xss.debug.level = function() {
    var levelData = xss.levels.getLevelData(xss.debug.levelIndex[1]);
    var level = new xss.Level(levelData);
    var gameMock = {
        _animKeys            : {},
        _updateAnimatedShapes: xss.Game.prototype._updateAnimatedShapes,
        _updateShapes        : xss.Game.prototype._updateShapes
    };

    console.info(levelData);

    xss.flow.destruct();
    xss.shapes = xss.shapegen.outerBorder();
    xss.shapes.level = xss.shapegen.level(levelData);
    xss.menuSnake.addToShapes();

    xss.event.on(xss.PUB_GAME_TICK, xss.debug.NS, function(delta) {
        gameMock._updateAnimatedShapes(level.updateAnimateds(delta));
    });
};
