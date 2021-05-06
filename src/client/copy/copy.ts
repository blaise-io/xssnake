import { UC } from "../const";
import { isMac, stylizeUpper } from "../util/clientUtil";

export const COPY_AWAITING_PLAYERS_HEADER = "Msg your friends";
export const COPY_AWAITING_PLAYERS_BODY =
    "You can fit {0} more player{1} in this room! Share the current page URL with your online friends to allow direct access.";
export const COPY_AWAITING_PLAYERS_START_NOW = "Press S to start now.";

// Dialog common.
export const COPY_DIALOG_OK = stylizeUpper("Ok");
export const COPY_DIALOG_CANCEL = stylizeUpper("Cancel");

// Main stage.
export const COPY_MAIN_INSTRUCT = [
    "M to mute/unmute sounds",
    (isMac() ? "Cmd+Ctrl+F11" : "F11") + " to enter/exit fullscreen",
    "Arrow keys, Esc and " + UC.ENTER_KEY + " to navigate",
].join(" …\n");

// Pre-game dialog.
export const COPY_COUNTDOWN_TITLE = "Get ready!";
export const COPY_COUNTDOWN_BODY = "Game starting in: {0}";

// Game stage connecting
export const COPY_CONNECTING = "Connecting...";

// Chat.
export const COPY_PLAYER_JOINED = "{0} joined.";
export const COPY_PLAYER_QUIT = "{0} quit.";
