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
 * Adjust the contents of `server/shared/config.js` to match your environment
 * Download and install [node.js](http://nodejs.org/)
 * Install dependencies: `npm install`

## Production

 * Compile the client source: `node build/client.js`.  
   This will create the file `index.html` in the `www` dir.
 * Make sure the `www` dir is accessible by browsers
 * Make sure the `server` dir is accessible by node.js
 * Run the game server: `npm start`
 * Access the game by navigating your browser to the `www` dir's public address

Optionally you can compile the server code using `node build/server.js` and
start the compiled server using `node server/compiled_start.js`. This may have
decrease server load a little, but it will also make debugging painful.

## Developing and Testing

 * Run the game server: `npm start`
 * Access the game by opening `client/client.html` in your browser
 * Check if the client and server still compile: `npm test`
 * Current build status: [![Build Status](https://travis-ci.org/blaise-io/xssnake.png?branch=master)](https://travis-ci.org/blaise-io/xssnake)

## Creating/Updating Levels

If you adjust one of the level images, you have to rebuild
`server/shared/levels.js` by running `node build/levels.js`.
This is documented in [`client/levels/README.md`](https://github.com/blaise-io/xssnake/tree/master/client/levels).

## Creating/Updating Audio Files

If you adjust one of the audio files, you have to rebuild
`client/js/audio.js` by running `node build/audio.js`.
