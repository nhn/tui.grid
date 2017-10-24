/**
* @fileoverview Object that conatins constant values
* @author NHN Ent. FE Development Team
*/

'use strict';

var _ = require('underscore');

var keyCode = {
    TAB: 9,
    ENTER: 13,
    CTRL: 17,
    ESC: 27,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    CHAR_A: 65,
    CHAR_C: 67,
    CHAR_F: 70,
    CHAR_R: 82,
    CHAR_V: 86,
    LEFT_WINDOW_KEY: 91,
    F5: 116,
    BACKSPACE: 8,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    HOME: 36,
    END: 35,
    DEL: 46,
    UNDEFINED: 229
};

module.exports = {
    keyCode: keyCode,
    keyName: _.invert(keyCode),
    renderState: {
        LOADING: 'LOADING',
        DONE: 'DONE',
        EMPTY: 'EMPTY'
    },
    dimension: {
        CELL_BORDER_WIDTH: 1,
        TABLE_BORDER_WIDTH: 1,
        RESIZE_HANDLE_WIDTH: 7
    },
    frame: {
        L: 'L',
        R: 'R'
    },
    attrName: {
        ROW_KEY: 'data-row-key',
        COLUMN_NAME: 'data-column-name',
        COLUMN_INDEX: 'data-column-index',
        EDIT_TYPE: 'data-edit-type',
        GRID_ID: 'data-grid-id'
    },
    themeName: {
        DEFAULT: 'default',
        STRIPED: 'striped',
        CLEAN: 'clean'
    },
    selectionType: {
        CELL: 'CELL',
        ROW: 'ROW',
        COLUMN: 'COLUMN'
    },
    summaryType: {
        SUM: 'sum',
        AVG: 'avg',
        CNT: 'cnt',
        MAX: 'max',
        MIN: 'min'
    },
    summaryPosition: {
        TOP: 'top',
        BOTTOM: 'bottom'
    }
};
