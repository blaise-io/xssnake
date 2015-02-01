# XSSnake

Online multiplayer Snake where the winner of a game is allowed to execute
JavaScript in the browser of other players.

[![Build Status](https://travis-ci.org/blaise-io/xssnake.png?branch=master)](https://travis-ci.org/blaise-io/xssnake)

XSSnake is currently in development. The beta release is planned around 2020.

![XSSnake](https://i.imgur.com/Gsz4ajb.png)

## Technical

XSSnake is written using HTML5 and JavaScript. It works in all browsers that
support Canvas and Websocket. XSSnake uses Node.js and ws for the server
and Google Closure Compiler to compile to minified and optimized code.

[The font used in the game can be downloaded here.](http://fontstruct.com/fontstructions/show/XSSnake)

## Initial Setup

 * Clone or download XSSnake from https://github.com/blaise-io/XSSnake.git
 * Download and install [node.js](http://nodejs.org/)
 * Install server dependencies: `npm install`
 * Configure hostname and port in `shared/config.js`
 * Run `npm start`

## Production

XSSnake is not production-ready yet.

## Developing and Testing

 * Run the game server: `npm start`
 * Access the game by opening `client/debug.html` in your browser

Running unit tests:

 * Client: `grunt karma`
 * Server: `grunt server_test`
 * Both: `npm test` or `grunt test`

If you add client JavaScript files, or add/modify levels or audio, you need
to rebuild files by running `grunt source`.

## Levels

Documented in [`shared/data/readme.md`](shared/data/readme.md).
