// Debug URL: client.html?debug=tab
debug.tab = location.search.match(/debug=tab/);
if (debug.tab) {
    State.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        State.shapes = {};
        var text = [
            'This line does not affect alignment.',
            '',
            'Label\tValue A',
            'Second Label\tAligned with A',
            '\tEmpty label'
        ].join('\n');
        State.shapes.testtabs = font(text, 10, 10);
    }, 200);
}
