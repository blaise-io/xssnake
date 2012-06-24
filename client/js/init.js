var XSS = {
    doc     : $(document),
    settings: {
        width : 256, // Tiles wide
        height: 160, // Tiles high
        s     : 4    // Tile size
    }
};

window.requestAnimationFrame = window.requestAnimationFrame || (function() {
    'use strict';
    return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

$(function() {
    'use strict';

    // Components
    XSS.bootstrap = new XSS.Bootstrap();
    XSS.canvas    = new XSS.Canvas();
    XSS.socket    = new XSS.WebSocket();
    XSS.font      = new XSS.Font();
    XSS.drawables = new XSS.Drawables();
    XSS.effects   = new XSS.Effects();
    XSS.menu      = new XSS.Menu();
});