// Debug URL: client.html?debug=tab
import { State } from "../state/state";
import { font } from "../ui/font";

if (location.search.match(/debug=tab/)) {
    State.menuSnake = true; // Prevent spawn.
    setTimeout(function() {
        State.shapes = {};
        const text = [
            'This line does not affect alignment.',
            '',
            'Label\tValue A',
            'Second Label\tAligned with A',
            '\tEmpty label'
        ].join('\n');
        State.shapes.testtabs = font(text, 10, 10);
    }, 200);
}
