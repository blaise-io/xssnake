XSSNAKE
===
**Note: XSSNAKE is in an early stage of development.**

XSSNAKE is an online multiplayer HTML5 game where the winner of the game is
allowed to execute a JavaScript file in the opponent's browser.

XSSNAKE is written in JavaScript. It uses Node.js for the server, Socket.IO for
client–server communication, and Google Closure Compiler with Advanced
compilation to compile to compacter and faster code.

Initial Setup
---
 * Download and install [node.js](http://nodejs.org/)
 * Create a configuration file at `shared/config.js` (rename and adjust
   `shared/config.example.js` to match your environment)
 * Install [socket.io](https://npmjs.org/package/socket.io) by running
   `npm install socket.io` in the server dir

Production
---
 * Compile the source: `node build/compile_source.js`
 * Make sure the `www` dir is accessible by browsers
 * Make sure the `server` and `shared` dirs are accessible by node.js
 * Run the game server: `node server/start.js`
 * Access the game by opening the `www` dir at its public address

Developing and Testing
---
 * Run the game server: `node server/start.js`
 * Access the game by opening `source/source.html`

While testing, it can be useful to automatically reload the server when you
change something. You can do this by installing supervisor: `npm install
supervisor` in the server dir. Run it using:
 `supervisor --watch server,shared -n exit server/start.js`.

If you open `source.html` from a local disk in Chrome (`file://...`), you
have to start the browser with the `--disable-web-security` parameter, or the
browser will not connect to the back-end due to an Access-Control restriction.

Creating/Updating Levels
---
If you adjusted one of the level images, you have to re-build
`shared/parse_levels.js`.

 * [`npm install png-js`](https://npmjs.org/package/png-js) in the build dir
 * Run `node build/parse_levels.js`
 * More info on level images can be found in `source/level_images/README.md`