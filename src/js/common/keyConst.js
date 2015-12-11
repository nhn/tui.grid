/**
* @fileoverview Constants that defines the key-name and key-code pare.
* @author NHN Ent. FE Development Team
*/
'use strict';

var keyCodeMap = {
    'TAB': 9,
    'ENTER': 13,
    'CTRL': 17,
    'ESC': 27,
    'LEFT_ARROW': 37,
    'UP_ARROW': 38,
    'RIGHT_ARROW': 39,
    'DOWN_ARROW': 40,
    'CHAR_A': 65,
    'CHAR_C': 67,
    'CHAR_F': 70,
    'CHAR_R': 82,
    'CHAR_V': 86,
    'LEFT_WINDOW_KEY': 91,
    'F5': 116,
    'BACKSPACE': 8,
    'SPACE': 32,
    'PAGE_UP': 33,
    'PAGE_DOWN': 34,
    'HOME': 36,
    'END': 35,
    'DEL': 46,
    'UNDEFINED': 229
}

module.exports = {
    keyCode: keyCodeMap,
    keyName: _.invert(keyCodeMap)
};
