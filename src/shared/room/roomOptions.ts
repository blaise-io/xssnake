export class RoomOptions {
    constructor(
        public maxPlayers = 6,
        public levelSetIndex = 0,
        public isQuickGame = false,
        public hasPowerups = true,
        public isPrivate = false,
        public isOnline = true,
        public isXSS = false,
    ) {}
}
