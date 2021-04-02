export class ColorScheme {
    constructor(
        public title: string,
        public desc: string,
        public bg: string,
        public off: string,
        public on: string,
        public ghosting: number=0.6,
    ) {}
}
