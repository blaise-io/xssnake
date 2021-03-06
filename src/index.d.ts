declare let ENV_DEBUG: boolean;
declare let ENV_IS_CLIENT: boolean;
declare let ENV_VERSION: string;

type Coordinate = [number, number];
type Shift = [number, number];

declare module "*.css" {
    const content: string;
    export default content;
}

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
