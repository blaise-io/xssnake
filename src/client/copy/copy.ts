import { UC } from "../const";
import { isMac } from "../util/clientUtil";

export const COPY_AWAITING_PLAYERS_HEADER = "Msg your friends";
export const COPY_AWAITING_PLAYERS_BODY =
    "You can fit {0} more player{1} in this room! Share the current page URL with your online friends to allow direct access.";
export const COPY_AWAITING_PLAYERS_START_NOW = "Press S to start now.";

export const COPY_CONFIRM_START_HEADER = "Confirm start";
export const COPY_CONFIRM_START_BODY =
    "Do you really want to start the game before the room is full?";

export const COPY_CONFIRM_EXIT_HEADER = "Confirm exit";
export const COPY_CONFIRM_EXIT_BODY = "Do you really want to leave this room?";
export const COPY_CONFIRM_EXIT_BODY_DRAMATIC =
    "Do you REALLY want to leave that other player ALL ALONE in this room?";

// Dialog common.
export const COPY_DIALOG_OK = "Ok".toUpperCase();
export const COPY_DIALOG_CANCEL = "Cancel".toUpperCase();

// Main stage.
export const COPY_MAIN_INSTRUCT = [
    "M to mute/unmute sounds",
    (isMac() ? "Cmd+Ctrl+F11" : "F11") + " to enter/exit fullscreen",
    "Arrow keys, Esc and " + UC.ENTER_KEY + " to navigate",
].join(" …\n");

// Pre-game dialog.
export const COPY_COUNTDOWN_TITLE = "Get ready!";
export const COPY_COUNTDOWN_BODY = "Game starting in: {0}";

// Game options stage.

export const COPY_CHAT_INSTRUCT = "Press " + UC.ENTER_KEY + " to chat.";

// Game stage connecting
export const COPY_CONNECTING = "Connecting...";

// Chat.
export const COPY_PLAYER_JOINED = "{0} joined.";
export const COPY_PLAYER_QUIT = "{0} quit.";

// Round winner.
export const COPY_ROUND_DRAW_TITLE = "Round ended in a draw".toUpperCase();
export const COPY_ROUND_WINNER_TITLE = "{0} won!".toUpperCase();
export const COPY_ROUND_NEW_BODY = "New round starting in: {0}";
