/**
* @fileoverview class name constants.
* @author NHN Ent. FE Development Team
*/

'use strict';

var _ = require('underscore');

var PREFIX = 'tui-grid-';

var classNames = {
    CONTAINER: 'container',
    CLIPBOARD: 'clipboard',

    // common
    NO_SCROLL_X: 'no-scroll-x',
    NO_SCROLL_Y: 'no-scroll-y',

    // icon
    ICO_ARROW: 'icon-arrow',
    ICO_ARROW_LEFT: 'icon-arrow-left',
    ICO_ARROW_RIGHT: 'icon-arrow-right',

    // layer
    LAYER_STATE: 'layer-state',
    LAYER_STATE_CONTENT: 'layer-state-content',
    LAYER_STATE_LOADING: 'layer-state-loading',
    LAYER_EDITING: 'layer-editing',
    LAYER_FOCUS: 'layer-focus',
    LAYER_FOCUS_BORDER: 'layer-focus-border',
    LAYER_FOCUS_DEACTIVE: 'layer-focus-deactive',
    LAYER_SELECTION: 'layer-selection',
    LAYER_DATE_PICKER: 'layer-datepicker',

    // border line
    BORDER_LINE: 'border-line',
    BORDER_TOP: 'border-line-top',
    BORDER_LEFT: 'border-line-left',
    BORDER_RIGHT: 'border-line-right',
    BORDER_BOTTOM: 'border-line-bottom',

    // layout (area)
    CONTENT_AREA: 'content-area',
    LSIDE_AREA: 'lside-area',
    RSIDE_AREA: 'rside-area',
    HEAD_AREA: 'head-area',
    BODY_AREA: 'body-area',
    SUMMARY_AREA: 'summary-area',
    SUMMARY_AREA_TOP: 'summary-area-top',
    SUMMARY_AREA_BOTTOM: 'summary-area-bottom',
    SUMMARY_AREA_RIGHT: 'summary-area-right',
    SUMMARY_AREA_RIGHT_TOP: 'summary-area-right-top',
    SUMMARY_AREA_RIGHT_BOTTOM: 'summary-area-right-bottom',

    FROZEN_BORDER_TOP: 'frozen-border-top',
    FROZEN_BORDER_BOTTOM: 'frozen-border-bottom',

    // header
    COLUMN_RESIZE_CONTAINER: 'column-resize-container',
    COLUMN_RESIZE_HANDLE: 'column-resize-handle',
    COLUMN_RESIZE_HANDLE_LAST: 'column-resize-handle-last',

    // body
    BODY_CONTAINER: 'body-container',
    BODY_TABLE_CONTAINER: 'table-container',

    // scrollbar
    SCROLLBAR_HEAD: 'scrollbar-head',
    SCROLLBAR_BORDER: 'scrollbar-border',
    SCROLLBAR_RIGHT_BOTTOM: 'scrollbar-right-bottom',
    SCROLLBAR_LEFT_BOTTOM: 'scrollbar-left-bottom',

    // pagination
    PAGINATION: 'pagination',
    PAGINATION_PRE: 'pre',
    PAGINATION_PRE_OFF: 'pre-off',
    PAGINATION_PRE_END: 'pre-end',
    PAGINATION_PRE_END_OFF: 'pre-end-off',
    PAGINATION_NEXT: 'next',
    PAGINATION_NEXT_OFF: 'next-off',
    PAGINATION_NEXT_END: 'next-end',
    PAGINATION_NEXT_END_OFF: 'next-end-off',

    // table
    TABLE: 'table',

    // row style
    ROW_ODD: 'row-odd',
    ROW_EVEN: 'row-even',

    // cell style
    CELL: 'cell',
    CELL_HEAD: 'cell-head',
    CELL_ROW_ODD: 'cell-row-odd',
    CELL_ROW_EVEN: 'cell-row-even',
    CELL_EDITABLE: 'cell-editable',
    CELL_DUMMY: 'cell-dummy',
    CELL_REQUIRED: 'cell-required',
    CELL_DISABLED: 'cell-disabled',
    CELL_SELECTED: 'cell-selected',
    CELL_INVALID: 'cell-invalid',
    CELL_ELLIPSIS: 'cell-ellipsis',
    CELL_CURRENT_ROW: 'cell-current-row',
    CELL_MAIN_BUTTON: 'cell-main-button',

    // cell content
    CELL_CONTENT: 'cell-content',
    CELL_CONTENT_BEFORE: 'content-before',
    CELL_CONTENT_AFTER: 'content-after',
    CELL_CONTENT_INPUT: 'content-input',
    CELL_CONTENT_TEXT: 'content-text',

    // buttons
    BTN_TEXT: 'btn-text',
    BTN_SORT: 'btn-sorting',
    BTN_SORT_UP: 'btn-sorting-up',
    BTN_SORT_DOWN: 'btn-sorting-down',
    BTN_EXCEL: 'btn-excel-download',
    BTN_EXCEL_ICON: 'btn-excel-icon',
    BTN_EXCEL_PAGE: 'btn-excel-page',
    BTN_EXCEL_ALL: 'btn-excel-all',

    // height resize handle
    HEIGHT_RESIZE_BAR: 'height-resize-bar',
    HEIGHT_RESIZE_HANDLE: 'height-resize-handle',

    // etc
    CALENDAR: 'calendar',
    CALENDAR_BTN_PREV_YEAR: 'calendar-btn-prev-year',
    CALENDAR_BTN_NEXT_YEAR: 'calendar-btn-next-year',
    CALENDAR_BTN_PREV_MONTH: 'calendar-btn-prev-month',
    CALENDAR_BTN_NEXT_MONTH: 'calendar-btn-next-month',
    CALENDAR_SELECTABLE: 'calendar-selectable',
    CALENDAR_SELECTED: 'calendar-selected'
};

var exports = _.mapObject(classNames, function(className) {
    return PREFIX + className;
});
exports.PREFIX = PREFIX;

module.exports = exports;
