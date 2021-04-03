// Global namespace.
// This is to allow code sharing between client and server.
import { SERVER_ENDPOINT } from "../shared/config";

// Include all server dependencies.
const grunt = require("grunt");
let server = require("../build/server.js");
const files = grunt.file.expand(server.concat.src);
for (let i = 0, m = files.length; i < m; i++) {
    require(__dirname + "/../" + files[i]);
}

// Don't start server when testing.
// istanbul ignore if
if (typeof jasmine === "undefined") {
    bootstrap.server();
    bootstrap.registerLevels(function() {
        server = new netcode.Server();
        console.log("XSSnake running at " + SERVER_ENDPOINT);
    });
}
