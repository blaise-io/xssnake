# XSSNAKE

Online multiplayer Snake where the winner of a game is allowed to execute
JavaScript in the browser of other players.

![XSSNAKE](http://i.imgur.com/scMK2.png)

[Font can be downloaded here.](http://fontstruct.com/fontstructions/show/xssnake)

XSSNAKE is written in HTML5 and JavaScript. It works in all browsers that
support HTML5's Canvas and Websocket. XSSNAKE uses Node.js for the server,
Socket.IO for client–server communication, and Google Closure Compiler with
Advanced Compilation to check for errors and to compile to minified and
optimized code.

**Note: XSSNAKE is in an early stage of development.**

## Initial Setup

 * Clone or download XSSNAKE from https://github.com/blaise-io/xssnake.git
 * Create a configuration file by copying `server/shared/config.example.js` to
   `server/shared/config.js`
 * Adjust the contents of `server/shared/config.js` to match your environment
 * Download and install [node.js](http://nodejs.org/)
 * Install [socket.io](https://npmjs.org/package/socket.io) by running
   `npm install socket.io`
 * Install [gcc-rest](https://github.com/blaise-io/gcc-rest) by running
   `npm install gcc-rest`

## Production

 * Compile the client source: `node build/client.js`
 * Make sure the `www` dir is accessible by browsers
 * Make sure the `server` dir is accessible by node.js
 * Run the game server: `node server/start.js`
 * Access the game by navigating your browser to the `www` dir's public address

## Developing and Testing

 * Run the game server: `node server/start.js`
 * Access the game by opening `source/source.html` in your browser

While testing, it can be useful to automatically reload the server when you
change something. You can do this by installing supervisor: `npm install
supervisor -g`. Run it using `supervisor -w server -n exit server/start.js`.

If you open `source/source.html` from a local disk in Chrome (`file://...`), you
have to start the browser with the `--disable-web-security` parameter to
work around an Access-Control restriction.

After you modify code, it can be useful to compile the code to see if you
made any errors.

 * Compile server code: `node build/server.js` (Warning: this contains a
   hack to inline node.js modules to allow compiling with Google Closure.
   Check `build/lib/server_compile.js` code comments for details.)
 * Compile client code: `node build/client.js`

## Creating/Updating Levels

If you adjusted one of the level images, you have to rebuild
`server/shared/levels.js`. See instructions below. More info on level images
can be found in `source/levels/README.md`.

 * Install [png-js](https://npmjs.org/package/png-js) by running
   `npm install png-js`
 * Run `node build/levels.js`
