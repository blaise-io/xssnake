Creating/modifying level images
===

These images contain the XSSNAKE's levels. Generate level data from these images
by running `node server/levels.js` in your browser and by saving the output to
shared/levels.js. The level data is used by both client and server.

Make sure to save the levels as 0.png, 1.png, 2.png, etc., without gaps.

**Important:** Because of compatability with
[PNG.js](https://github.com/devongovett/png.js), use a PNG with Color Type
**24bit RGB+Alpha**.

Pixel color legend
---

    White   rgb(255,255,0)  Open Space
    Black   rgb(0,0,0)      Wall
    Red     rgb(255,0,0)    Spawn Player 1
    Green   rgb(0,255,0)    Spawn Player 2
    Blue    rgb(0,0,255)    Spawn Player 3
    Yellow  rgb(255,255,0)  Spawn Player 4
    Gray    rgb(99,99,99)   Player Direction after spawn

Any other color will throw an error. Alpha channel will be ignored.

Required data
---

 * Every level must contain exactly 4 spawn pixels.
 * Every level must contain exactly 4 direction pixels.
 * Direction pixels must be placed next to a spawn pixel.