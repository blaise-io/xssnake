XSSNAKE
===

*In an early stage of development, does not work yet.*

XSSNAKE will be an online multiplayer game where the winner of the game is
allowed to execute Javascript in the opponent's browser.

XSSNAKE is written entirely in Javascript. It uses Node.js for the server,
Socket.IO for cross-browser client–server communication, and Google Closure
Compiler with Advanced compilation to compile to compacter and faster code.


Initial Setup / Dependencies
---

 * Download and install [Node.js](http://nodejs.org/)
 * `npm install` these packages:
   [`socket.io`](https://npmjs.org/package/socket.io),
   [`png-js`](https://npmjs.org/package/png-js).

Run
---

**Development**

 * Create a configuration file at `shared/config.js` (an example can be found at
   `shared/config.example.js`)
 * Run the game server: `node server/game.js`
 * Open index.html to test

**Production (compiled source)**

 * Create a configuration file at `shared/config.js`.
 * Compile the source: `node server/build.js`
 * Run the game server: `node server/game.js`
 * Open compiled.html to play

Generating level data
---
If you adjusted one of the level images, you will have to re-build
`shared/levels.js`. See the readme at `data/level_images/README.md`.