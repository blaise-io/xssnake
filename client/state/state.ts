import { Registry } from "../../shared/levelset/registry";
import { Shape } from "../../shared/shape";
import { EventHandler } from "../netcode/eventHandler";
import { ClientSocketPlayer } from "../room/clientSocketPlayer";
import { MenuSnake } from "../stage/menuSnake";
import { StageFlow } from "../stage/stageFlow";
import { AudioPlayer } from "../ui/audioPlayer";
import { Canvas } from "../ui/canvas";

export class State {
    public static audio: AudioPlayer
    public static canvas: Canvas
    public static events: EventHandler
    public static flow: StageFlow
    public static shapes: Record<string, Shape>
    public static levelsetRegistry: Registry
    public static menuSnake: MenuSnake | string
    public static keysBlocked = false
    public static player: ClientSocketPlayer
}
