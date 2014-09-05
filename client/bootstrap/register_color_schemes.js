'use strict';

xss.bootstrap.registerColorSchemes = function() {
    xss.colorSchemes = [
        new xss.ColorScheme(
            'My First LED Screen',
            'Without backlight in the sun',
            '#787', '#797', '#000'
        ),
        new xss.ColorScheme(
            'Public Transport',
            'I’m a bus',
            '#111', '#222', '#dc0'
        ),
        new xss.ColorScheme(
            'Vampire Campfire',
            'Bloody pixels',
            '#000', '#100', '#f00',
            0.8
        ),
        new xss.ColorScheme(
            'VFD',
            'Party like it’s 1959',
            '#000', '#111', '#68F',
            0.8
        ),
        new xss.ColorScheme(
            '1337',
            'SO HACK omg 0wN3d N00b!!!1\n<MARQUEE>TESTLOL</MARQUEE>',
            '#010', '#000', '#0f0'
        ),
        new xss.ColorScheme(
            'Panda',
            '(O)____(o)',
            '#000', '#111', '#fff'
        )
    ];
};
