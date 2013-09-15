# Level images

The PNG images in this directory contain the raw data for levels.
If you change one of the images, you have to rebuild `server/shared/levels.js`.
You should not edit levels.js directly.

## Build `server/shared/levels.js`

 1. Run `npm install pngparse` to install [pngparse](https://npmjs.org/package/pngparse)
 1. Run `node build/levels.js`

## Pixel Color Legend

    Black        rgb(0,0,0)         Wall
    White        rgb(255,255,255)   Open Space
    Red          rgb(255,0,0)       Spawn Player 1
    Lime         rgb(0,255,0)       Spawn Player 2
    Blue         rgb(0,0,255)       Spawn Player 3
    Yellow       rgb(255,255,0)     Spawn Player 4
    Turqoise     rgb(0,255,255)     Spawn Player 5
    Fuchsia      rgb(255,0,255)     Spawn Player 6
    Dark-Gray    rgb(99,99,99)      Player Direction at Spawn
    Light-Gray   rgb(222,222,222)   Unsuitable for Apple/Power-up Spawning

## Level Requirements

 * Every level must contain exactly 6 spawn pixels.
 * Every level must contain exactly 6 direction pixels.
 * A direction pixel must be placed next to a spawn pixel.

The build script will tell you if anything is wrong.
