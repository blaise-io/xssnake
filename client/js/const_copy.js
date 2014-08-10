'use strict';

xss.COPY_AWAITING_PLAYERS_HEADER = 'Msg your friends';
xss.COPY_AWAITING_PLAYERS_BODY = 'You can fit {0} more player{1} in this room! Share the current page URL with your online friends to allow direct access.';
xss.COPY_AWAITING_PLAYERS_START_NOW = ' Press S to start now.';

xss.COPY_CONFIRM_START_HEADER = 'Confirm start';
xss.COPY_CONFIRM_START_BODY = 'Do you really want to start the game before the room is full?';

xss.COPY_ERROR = [];
xss.COPY_ERROR[xss.ROOM_INVALID] = 'Invalid room key'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_NOT_FOUND] = 'Room not found'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_FULL] = 'The room is full!'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_IN_PROGRESS] = 'Game in progress'.toUpperCase();
xss.COPY_ERROR[xss.ROOM_UNKNOWN_ERROR] = 'Unknown errooshiii#^%^'.toUpperCase();

xss.COPY_DIALOG_OK = 'Ok'.toUpperCase();
xss.COPY_DIALOG_CANCEL = 'Cancel'.toUpperCase();

xss.COPY_LEVELSET_BASIC = 'BASIC';
xss.COPY_LEVELSET_MOVING = 'MOVING';
xss.COPY_LEVELSET_MAZE = 'MAZES';
xss.COPY_LEVELSET_GAME = 'GAME WORLDS';

xss.COPY_FIELD_LEVEL_SET = 'Level Set';

xss.COPY_JOIN_INSTRUCT = ' –\n';

xss.COPY_MAIN_INSTRUCT = [
    'M to mute/unmute sounds',
    (xss.util.isMac() ? 'Cmd+Ctrl+F11' : 'F11') + ' to enter/exit fullscreen',
    'Arrow keys, Esc and ' + xss.UC_ENTER_KEY + ' to navigate'
].join(xss.COPY_JOIN_INSTRUCT);

xss.COPY_FORM_INSTRUCT = [
    xss.UC_ARR_UP + ' & ' + xss.UC_ARR_DOWN + ' to select an option',
    xss.UC_ARR_LEFT + ' & ' + xss.UC_ARR_RIGHT + ' to change a value',
    xss.UC_ENTER_KEY + ' to continue'
].join(xss.COPY_JOIN_INSTRUCT);
