import * as ws from "ws";
import { SERVER_HOST, SERVER_PATH, SERVER_PORT } from "../shared/config";
import { HEARTBEAT_INTERVAL_MS } from "../shared/const";
import { ServerRooms } from "./room/serverRooms";
import { ServerPlayer } from "./room/serverPlayer";

export interface Socket extends ws {
    pingSent: number;
    pongReceived: number;
    latency: number;
}

export class Server {
    private roomManager = new ServerRooms();
    private ws: ws.Server;
    private pingInterval: NodeJS.Timeout;

    constructor() {
        this.ws = new ws.Server({
            host: SERVER_HOST,
            port: SERVER_PORT,
            path: SERVER_PATH,
            maxPayload: 256,
            clientTracking: true,
        });

        this.ws.on("connection", (socket: Socket) => {
            const player = new ServerPlayer(socket, this.roomManager.emitter);

            socket.pingSent = socket.pongReceived = new Date().getTime();
            socket.latency = 0;

            socket.on("pong", () => {
                socket.pongReceived = new Date().getTime();
                socket.latency = new Date().getTime() - socket.pingSent;
            });

            socket.on("close", async () => {
                player.connected = false;
                await this.roomManager.removePlayer(player);
            });
        });

        this.pingInterval = setInterval(() => {
            ((this.ws.clients as unknown) as Socket[]).forEach((client: Socket) => {
                if (client.pongReceived - client.pingSent > HEARTBEAT_INTERVAL_MS * 2) {
                    return client.terminate();
                }
                client.pingSent = new Date().getTime();
                client.ping();
            });
        }, HEARTBEAT_INTERVAL_MS);

        console.debug(`Running WebSocket server at ${SERVER_HOST}:${SERVER_PATH}${SERVER_PORT}`);
    }
}
