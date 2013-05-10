# XSSNAKE

Online multiplayer Snake where the winner of a game is allowed to execute
Javascript in the browser of other players.

XSSNAKE is currently in development. The beta release is planned in Q3 2013.

![XSSNAKE](http://i.imgur.com/h4BTxp1.png)

XSSNAKE is written in HTML5 and Javascript. It works in all browsers that
support Canvas and Websocket. XSSNAKE uses Node.js for the server,
SockJS for client–server communication, and Google Closure Compiler with
Advanced Compilation to check for errors and to compile to minified and
optimized code.

[The font used in the game can be downloaded here.](http://fontstruct.com/fontstructions/show/xssnake)

## Initial Setup

 * Clone or download XSSNAKE from https://github.com/blaise-io/xssnake.git
 * Create a configuration file by copying `server/shared/config.example.js` to
   `server/shared/config.js`
 * Adjust the contents of `server/shared/config.js` to match your environment
 * Download and install [node.js](http://nodejs.org/)
 * Install [SockJS](https://npmjs.org/package/sockjs) by running
   `npm install sockjs`
 * Install [gcc-rest](https://github.com/blaise-io/gcc-rest) by running
   `npm install gcc-rest`

## Production

 * Compile the client source: `node build/client.js`.  
   This will create the file `index.html` in the `www` dir.
 * Make sure the `www` dir is accessible by browsers
 * Make sure the `server` dir is accessible by node.js
 * Run the game server: `node server/start.js`
 * Access the game by navigating your browser to the `www` dir's public address

## Developing and Testing

 * Run the game server: `node server/start.js`
 * Access the game by opening `source/source.html` in your browser

If you open `source/source.html` from a local disk in Chrome (`file://...`), you
may have to start the browser with the `--disable-web-security` parameter to
work around an Access-Control restriction.

If you modify code, it can be useful to compile the code to see if you
made any errors.

 * Compile server code: `node build/server.js` (Warning: this contains a
   hack to inline node.js modules to allow compiling with Google Closure.
   Check `build/lib/server_compile.js` code comments for details.)
 * Compile client code: `node build/client.js` to check for errors.

## Creating/Updating Levels

If you adjust one of the level images, you have to rebuild
`server/shared/levels.js` by running `node build/levels.js`.
This is documented in [`source/levels/README.md`](https://github.com/blaise-io/xssnake/tree/master/source/levels).

## Creating/Updating Audio Files

If you adjust one of the audio files, you have to rebuild
`source/js/audio.js` by running `node build/audio.js`.
