# XSSNAKE

Online multiplayer Snake where the winner of a game is allowed to execute
JavaScript in the browser of other players.

[![Build Status](https://travis-ci.org/blaise-io/xssnake.png?branch=master)](https://travis-ci.org/blaise-io/xssnake)

XSSNAKE is currently in development. The beta release is planned around 2014.

![XSSNAKE](http://i.imgur.com/h4BTxp1.png)

XSSNAKE is written in HTML5 and JavaScript. It works in all browsers that
support Canvas and Websocket. XSSNAKE uses Node.js for the server,
SockJS for client–server communication, and Google Closure Compiler with
Advanced Compilation to check for errors and to compile to minified and
optimized code.

[The font used in the game can be downloaded here.](http://fontstruct.com/fontstructions/show/xssnake)

## Initial Setup

 * Clone or download XSSNAKE from https://github.com/blaise-io/xssnake.git
 * Download and install [node.js](http://nodejs.org/)
 * Install server dependencies: `npm install`
 * Download and install bower: `npm install -g bower`
 * Install client dependencies: `bower install`
 * Configure hostname and port in `shared/config.js`
 * Run `npm start`

## Production

XSSNAKE is not production-ready yet.

## Developing and Testing

 * Run the game server: `npm start`
 * Access the game by opening `client/debug.html` in your browser

If you add client JavaScript files, or add/modify levels or audio, you need
to rebuild files by running `grunt source`.

## Levels

Documented in [`shared/data/readme.md`](shared/data/readme.md).
