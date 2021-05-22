import { Shape } from "../shared/shape";
import { ClientSocketPlayer } from "./room/clientSocketPlayer";
import { MenuSnake } from "./stages/components/menuSnake";
import { StageFlow } from "./flow";
import { AudioPlayer } from "./ui/audioPlayer";
import { Canvas } from "./ui/canvas/canvas";

export class State {
    static audio: AudioPlayer;
    static canvas: Canvas;
    static flow: StageFlow;
    static shapes: Record<string, Shape>;
    static menuSnake: MenuSnake;
    static keysBlocked = false;
    static player: ClientSocketPlayer;
}
