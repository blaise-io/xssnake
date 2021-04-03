const events = require('events');
const WebSocketServer = require('ws').Server;

/**
 * @constructor
 */
export class Server {
    constructor(Server) {
        this.emitter = new events.EventEmitter();
        this.roomManager = new ServerRoomManager(this);
        this.ws = this.start();
    }



    destruct() {
        this.roomManager.destruct();
        this.roomManager = null;
        this.ws.close();
    }

    start() {
        const ws = new WebSocketServer({
            host: SERVER_HOST,
            port: SERVER_PORT,
            path: SERVER_PATH
        });

        ws.on('connection', function(connection) {
            new ServerPlayer(this, connection);
        }.bind(this));

        return ws;
    }

}
