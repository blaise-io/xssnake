export enum PixelStyle {
    rectangular,
    circular,
}

export class ColorScheme {
    constructor(
        public title: string,
        public desc: string,
        public bg: string,
        public off: string,
        public on: string,
        public gap = 1,
        public ghosting = 0.6, // 0 is no ghosting, 1 never clear
        public style = PixelStyle.rectangular,
    ) {}
}
