/**
 * @fileoverview Key event generator
 * @author NHN Ent. FE Development Lab
 */

'use strict';

var _ = require('underscore');
var GridEvent = require('./gridEvent');

var keyCodeMap = {
    backspace: 8,
    tab: 9,
    enter: 13,
    ctrl: 17,
    esc: 27,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    a: 65,
    c: 67,
    v: 86,
    space: 32,
    pageUp: 33,
    pageDown: 34,
    home: 36,
    end: 35,
    del: 46
};
var keyNameMap = _.invert(keyCodeMap);

/**
 * K-V object for matching keystroke and event command
 * K: keystroke (order : ctrl -> shift -> keyName)
 * V: [key event type, command]
 * @type {Object}
 * @ignore
 */
var keyStrokeCommandMap = {
    'up': ['move', 'up'],
    'down': ['move', 'down'],
    'left': ['move', 'left'],
    'right': ['move', 'right'],
    'pageUp': ['move', 'pageUp'],
    'pageDown': ['move', 'pageDown'],
    'home': ['move', 'firstColumn'],
    'end': ['move', 'lastColumn'],
    'enter': ['edit', 'currentCell'],
    'space': ['edit', 'currentCell'],
    'tab': ['edit', 'nextCell'],
    'backspace': ['delete'],
    'del': ['delete'],
    'shift-tab': ['edit', 'prevCell'],
    'shift-up': ['select', 'up'],
    'shift-down': ['select', 'down'],
    'shift-left': ['select', 'left'],
    'shift-right': ['select', 'right'],
    'shift-pageUp': ['select', 'pageUp'],
    'shift-pageDown': ['select', 'pageDown'],
    'shift-home': ['select', 'firstColumn'],
    'shift-end': ['select', 'lastColumn'],
    'ctrl-a': ['select', 'all'],
    'ctrl-c': ['clipboard', 'copy'],
    'ctrl-v': ['clipboard', 'paste'],
    'ctrl-home': ['move', 'firstCell'],
    'ctrl-end': ['move', 'lastCell'],
    'ctrl-shift-home': ['select', 'firstCell'],
    'ctrl-shift-end': ['select', 'lastCell']
};

/**
 * Returns the keyStroke string
 * @param {Event} ev - Keyboard event
 * @returns {String}
 * @ignore
 */
function getKeyStrokeString(ev) {
    var keys = [];

    if (ev.ctrlKey || ev.metaKey) {
        keys.push('ctrl');
    }
    if (ev.shiftKey) {
        keys.push('shift');
    }
    keys.push(keyNameMap[ev.keyCode]);

    return keys.join('-');
}

/* Keyboard Event Generator
 * @module event/keyEvent
 * @ignore
 */
module.exports = {
    generate: function(ev) {
        var keyStroke = getKeyStrokeString(ev);
        var commandInfo = keyStrokeCommandMap[keyStroke];
        var gridEvent;

        if (commandInfo) {
            gridEvent = new GridEvent(ev, {
                type: 'key:' + commandInfo[0],
                command: commandInfo[1]
            });
        }

        return gridEvent;
    }
};
