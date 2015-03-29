'use strict';

xss.COPY_AWAITING_PLAYERS_HEADER = 'Msg your friends';
xss.COPY_AWAITING_PLAYERS_BODY = 'You can fit {0} more player{1} in this room! Share the current page URL with your online friends to allow direct access.';
xss.COPY_AWAITING_PLAYERS_START_NOW = 'Press S to start now.';

xss.COPY_CONFIRM_START_HEADER = 'Confirm start';
xss.COPY_CONFIRM_START_BODY = 'Do you really want to start the game before the room is full?';

xss.COPY_CONFIRM_EXIT_HEADER = 'Confirm exit';
xss.COPY_CONFIRM_EXIT_BODY = 'Do you really want to leave this room?';
xss.COPY_CONFIRM_EXIT_BODY_DRAMATIC = 'Do you REALLY want to leave that other player ALL ALONE in this room?';

// Invalid room.
xss.COPY_ERROR = [];
xss.COPY_ERROR[xss.ROOM_INVALID_KEY] = 'Invalid room key'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_NOT_FOUND] = 'Room not found'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_FULL] = 'The room is full!'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_IN_PROGRESS] = 'Game in progress'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_UNKNOWN_ERROR] = 'Unknown errooshiii#^%^'.toUpperCase();

// Dialog common.
xss.COPY_DIALOG_OK = 'Ok'.toUpperCase();
xss.COPY_DIALOG_CANCEL = 'Cancel'.toUpperCase();

// Level sets.
xss.COPY_LEVELSET_BASIC = 'Basic';
xss.COPY_LEVELSET_MOVING = 'Moving';
xss.COPY_LEVELSET_MAZE = 'Mazes';
xss.COPY_LEVELSET_GAME = 'Pactris';

// Stages misc.
xss.COPY_COMMA_SPACE = ', ';
xss.COPY_SPACE_AND_SPACE = ' & ';
xss.COPY_ELLIPSIS = ' …';
xss.COPY_JOINER = ' …\n';
xss.COPY_DEF = ':  ';

// Main stage.
xss.COPY_MAIN_INSTRUCT = [
    'M to mute/unmute sounds',
    (xss.util.isMac() ? 'Cmd+Ctrl+F11' : 'F11') + ' to enter/exit fullscreen',
    'Arrow keys, Esc and ' + xss.UC_ENTER_KEY + ' to navigate'
].join(xss.COPY_JOINER);

// Form stage.
xss.COPY_FORM_INSTRUCT = [
    xss.UC_ARR_UP + ' & ' + xss.UC_ARR_DOWN + ' to select an option',
    xss.UC_ARR_LEFT + ' & ' + xss.UC_ARR_RIGHT + ' to change the value',
    xss.UC_ENTER_KEY + ' to continue'
].join(xss.COPY_JOINER);

// Pre-game dialog.
xss.COPY_COUNTDOWN_TITLE = 'Get ready!';
xss.COPY_COUNTDOWN_BODY = 'Game starting in: {0}';

// Lost connection.
xss.COPY_SOCKET_CONNECTION_LOST = 'Connection lost';
xss.COPY_SOCKET_CANNOT_CONNECT = 'Cannot connect';
xss.COPY_SOCKET_SERVER_AWAY = 'Server went away';

// Game options stage.
xss.COPY_FIELD_TRUE = 'Yes';
xss.COPY_FIELD_FALSE = 'No';
xss.COPY_FIELD_LEVEL_SET = 'Level Set';
xss.COPY_OPTIONS_STAGE_HEADER = 'Game Options';
xss.COPY_FIELD_POWERUPS = 'Power-Ups';
xss.COPY_FIELD_PRIVATE = 'Private Room';
xss.COPY_FIELD_XSS = 'Winner fires XSS';
xss.COPY_FIELD_MAX_PLAYERS = 'Max Players';

xss.COPY_FIELD_BUGS = 'WEIRD BUGS ' + xss.UC_BUG;
xss.COPY_FIELD_TRUE_OPT1 = xss.COPY_FIELD_TRUE;
xss.COPY_FIELD_TRUE_OPT2 = 'Enable';
xss.COPY_FIELD_TRUE_OPT3 = 'OK';
xss.COPY_FIELD_TRUE_OPT4 = 'True';
xss.COPY_FIELD_TRUE_OPT5 = 'Accept';
xss.COPY_FIELD_TRUE_OPT6 = 'Hao';
xss.COPY_FIELD_TRUE_OPT7 = 'Oui!';
xss.COPY_FIELD_TRUE_OPT8 = 'Si Senor';
xss.COPY_FIELD_TRUE_OPT9 = xss.UC_YES;

xss.COPY_BOOL = [xss.COPY_FIELD_FALSE, xss.COPY_FIELD_TRUE];

// Join room by key.
xss.COPY_AUTOJOIN_HEADER = 'Auto-Join room'.toUpperCase();
xss.COPY_AUTOJOIN_CONNECTING = 'Connecting to server…';
xss.COPY_AUTOJOIN_FETCHING = 'Getting room properties…';
xss.COPY_AUTOJOIN_PLAYERS = 'Players ({0})';
xss.COPY_AUTOJOIN_ENTER_NAME = 'Enter your name to join: ';

xss.COPY_CHAT_INSTRUCT = 'Press ' + xss.UC_ENTER_KEY + ' to chat.';

// Game stage connecting
xss.COPY_CONNECTING = 'Connecting...';

// Chat.
xss.COPY_PLAYER_JOINED = '{0} joined.';
xss.COPY_PLAYER_QUIT = '{0} quit.';

// Notify snake crashes.
xss.COPY_SNAKE_CRASHED = ' crashed.';

// Round winner.
xss.COPY_ROUND_DRAW_TITLE = 'Round ended in a draw'.toUpperCase();
xss.COPY_ROUND_WINNER_TITLE = '{0} won!'.toUpperCase();
xss.COPY_ROUND_NEW_BODY = 'New round starting in: {0}';
