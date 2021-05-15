export const SERVER_TICK_INTERVAL = 1000 / 20;
export const SERVER_MAX_TOLERATED_LATENCY = 150;

export const SERVER_EVENT = {
    PLAYER_DISCONNECT: Symbol(),
    PLAYER_COLISSION: Symbol(),
    ROUND_END: Symbol(),
};
