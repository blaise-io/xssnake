declare let __IS_CLIENT__: boolean;
type Coordinate = [number, number];
type Shift = [number, number];
type WebsocketData = (string | number | (string | number)[])[];
type UntrustedData = unknown;

declare module "*.mp3" {
    const content: string;
    export default content;
}

declare module "*.ogg" {
    const content: string;
    export default content;
}

declare module "*.png" {
    const content: string;
    export default content;
}
