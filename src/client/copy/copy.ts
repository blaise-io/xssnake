import {
    ROOM_FULL,
    ROOM_IN_PROGRESS,
    ROOM_INVALID_KEY,
    ROOM_NOT_FOUND,
    ROOM_UNKNOWN_ERROR,
} from "../../shared/const";
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

// Invalid room.
export const COPY_ERROR = [];
COPY_ERROR[ROOM_INVALID_KEY] = "Invalid room key".toUpperCase();
COPY_ERROR[ROOM_NOT_FOUND] = "Room not found".toUpperCase();
COPY_ERROR[ROOM_FULL] = "The room is full!".toUpperCase();
COPY_ERROR[ROOM_IN_PROGRESS] = "Game in progress".toUpperCase();
COPY_ERROR[ROOM_UNKNOWN_ERROR] = "Unknown errooshiii#^%^".toUpperCase();

// Dialog common.
export const COPY_DIALOG_OK = "Ok".toUpperCase();
export const COPY_DIALOG_CANCEL = "Cancel".toUpperCase();

// Level sets.
export const COPY_LEVELSET_BASIC = "Basic";
export const COPY_LEVELSET_MOVING = "Moving";
export const COPY_LEVELSET_MAZE = "Mazes";
export const COPY_LEVELSET_GAME = "Pactris";

// Stages misc.
export const COPY_COMMA_SPACE = ", ";
export const COPY_SPACE_AND_SPACE = " & ";
export const COPY_ELLIPSIS = " …";
export const COPY_JOINER = " …\n";
export const COPY_DEF = ":  ";

// Main stage.
export const COPY_MAIN_INSTRUCT = [
    "M to mute/unmute sounds",
    (isMac() ? "Cmd+Ctrl+F11" : "F11") + " to enter/exit fullscreen",
    "Arrow keys, Esc and " + UC.ENTER_KEY + " to navigate",
].join(COPY_JOINER);

// Form stage.
export const COPY_FORM_INSTRUCT = [
    UC.ARR_UP + " & " + UC.ARR_DOWN + " to select an option",
    UC.ARR_LEFT + " & " + UC.ARR_RIGHT + " to change the value",
    UC.ENTER_KEY + " to continue",
].join(COPY_JOINER);

// Pre-game dialog.
export const COPY_COUNTDOWN_TITLE = "Get ready!";
export const COPY_COUNTDOWN_BODY = "Game starting in: {0}";

// Lost connection.
export const COPY_SOCKET_CONNECTION_LOST = "Connection lost";
export const COPY_SOCKET_CANNOT_CONNECT = "Cannot connect";
export const COPY_SOCKET_SERVER_AWAY = "Server went away";

// Game options stage.
export const COPY_FIELD_TRUE = "Yes";
export const COPY_FIELD_FALSE = "No";
export const COPY_FIELD_LEVEL_SET = "Level Set";
export const COPY_OPTIONS_STAGE_HEADER = "Game Options";
export const COPY_FIELD_POWERUPS = "Power-Ups";
export const COPY_FIELD_PRIVATE = "Private Room";
export const COPY_FIELD_XSS = "Winner fires XSS";
export const COPY_FIELD_MAX_PLAYERS = "Max Players";

export const COPY_FIELD_BUGS = "WEIRD BUGS " + UC.BUG;
export const COPY_FIELD_TRUE_OPT1 = COPY_FIELD_TRUE;
export const COPY_FIELD_TRUE_OPT2 = "Enable";
export const COPY_FIELD_TRUE_OPT3 = "OK";
export const COPY_FIELD_TRUE_OPT4 = "True";
export const COPY_FIELD_TRUE_OPT5 = "Accept";
export const COPY_FIELD_TRUE_OPT6 = "Hao";
export const COPY_FIELD_TRUE_OPT7 = "Oui!";
export const COPY_FIELD_TRUE_OPT8 = "Si Senor";
export const COPY_FIELD_TRUE_OPT9 = UC.YES;

export const COPY_BOOL = [COPY_FIELD_FALSE, COPY_FIELD_TRUE];

// Join room by key.
export const COPY_AUTOJOIN_HEADER = "Auto-Join room".toUpperCase();
export const COPY_AUTOJOIN_CONNECTING = "Connecting to server…";
export const COPY_AUTOJOIN_FETCHING = "Getting room properties…";
export const COPY_AUTOJOIN_PLAYERS = "Players ({0})";

export const COPY_CHAT_INSTRUCT = "Press " + UC.ENTER_KEY + " to chat.";

// Game stage connecting
export const COPY_CONNECTING = "Connecting...";

// Chat.
export const COPY_PLAYER_JOINED = "{0} joined.";
export const COPY_PLAYER_QUIT = "{0} quit.";

// Notify snake crashes.
export const COPY_SNAKE_CRASHED = " crashed.";

// Round winner.
export const COPY_ROUND_DRAW_TITLE = "Round ended in a draw".toUpperCase();
export const COPY_ROUND_WINNER_TITLE = "{0} won!".toUpperCase();
export const COPY_ROUND_NEW_BODY = "New round starting in: {0}";
