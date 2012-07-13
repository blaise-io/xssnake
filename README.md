XSSNAKE
===

*In an early stage of development, does not work yet.*

XSSNAKE will be an online multiplayer game where the winner of the game is
allowed to execute Javascript in the opponent–s browser.

XSSNAKE is written entirely in Javascript. It uses Node.js for the server,
Socket.IO for cross-browser client–server communication, and Google Closure
Compiler with Advanced compilation to compile to shorter and faster code.


Initial Setup
---

 * Download and install [Node.js](http://nodejs.org/)
 * Install [Socket.IO](http://socket.io/): `npm install socket.io`


Run
---

**Development**

 * Run the game server: `node server/game.js`
 * Open index.html to play

**Production (compiled source)**

 * Compile the source: `node server/build.js`
 * Run the game server: `node server/game.js`
 * Open compiled.html to play