import { Shape } from "../../shared/shape";
import { EventHandler } from "../netcode/eventHandler";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { MenuSnake } from "../stage/menuSnake";
import { StageFlow } from "../stage/stageFlow";
import { AudioPlayer } from "../ui/audioPlayer";
import { Canvas } from "../ui/canvas";

export class ClientState {
    static audio: AudioPlayer;
    static canvas: Canvas;
    static events: EventHandler;
    static flow: StageFlow;
    static shapes: Record<string, Shape>;
    static menuSnake: MenuSnake;
    static keysBlocked = false;
    static player: ClientSocketPlayer;
}
