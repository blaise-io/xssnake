Creating/modifying level images
===

These images contain the XSSNAKE's levels. Generate level data from these images
by running `node build/parse_levels.js`, which will update `shared/levels.js`.
The level data is used by both client and server.

Because of compatibility with the [png-js](https://npmjs.org/package/png-js)
library, PNGs must have **24bit RGB+Alpha** as the Color Type.

Pixel Color Legend
---
    White   rgb(255,255,255)   Open Space
    Black   rgb(0,0,0)         Wall
    Red     rgb(255,0,0)       Spawn Player 1
    Green   rgb(0,255,0)       Spawn Player 2
    Blue    rgb(0,0,255)       Spawn Player 3
    Yellow  rgb(255,255,0)     Spawn Player 4
    Gray    rgb(99,99,99)      Initital player direction after spawn

Any other color will throw an error. Alpha channels will be ignored.

Level Requirements
---
 * Every level must contain exactly 4 spawn pixels.
 * Every level must contain exactly 4 direction pixels.
 * Direction pixels must be placed next to a spawn pixel.