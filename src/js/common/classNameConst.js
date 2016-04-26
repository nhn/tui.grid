/**
* @fileoverview class name constants.
* @author NHN Ent. FE Development Team
*/
'use strict';

var PREFIX = 'tui-grid-';

var classNames = {
    CONTAINER: 'container',
    CLIPBOARD: 'clipboard',

    // layer
    LAYER_STATE: 'state-layer',
    LAYER_STATE_CONTENT: 'layer-content',
    LAYER_STATE_LOADING: 'loading-img',
    LAYER_EDITING: 'editing-layer',
    LAYER_FOCUS: 'focus-layer',
    LAYER_SELECTION: 'selection-layer',

    // border line
    BORDER_LEFT: 'left-border',
    BORDER_RIGHT: 'right-border',
    BORDER_BOTTOM: 'bottom-border',

    // layout
    LSIDE_AREA: 'lside-area',
    RSIDE_AREA: 'rside-area',
    HEADER: 'header',
    BODY: 'body',

    // header
    HEADER_SPACE: 'header-space',
    HEADER_NO_SCROLL: 'no-scroll',
    HEADER_RESIZE_CONTAINER: 'resize-handle-container',
    HEADER_RESIZE_HANDLE: 'resize-handle',
    HEADER_RESIZE_HANDLE_LAST: 'resize-handle-last',

    // body
    BODY_CONTAINER: 'body-container',
    BODY_TABLE_CONTAINER: 'table-container',

    // scrollbar
    SCROLLBAR_BORDER: 'scrollbar-border',
    SCROLLBAR_CORNER: 'scrollbar-corner',
    SCROLLBAR_OVERLAY: 'scrollbar-overlay',

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

    // cell style
    CELL_EDITABLE: 'editable',
    CELL_META_COLUMN: 'meta-column',
    CELL_DUMMY: 'dummy',
    CELL_REQUIRED: 'required',
    CELL_DISABLED: 'disabled',
    CELL_SELECTED: 'selected',
    CELL_INVALID: 'invalid',
    CELL_ELLIPSIS: 'ellipsis',
    CELL_CURRENT_ROW: 'current-row',
    CELL_MAIN_BUTTON: 'main-button',

    // cell content
    CELL_CONTENT: 'cell-content',
    CELL_CONTENT_BEFORE: 'before',
    CELL_CONTENT_AFTER: 'after',
    CELL_CONTENT_INPUT: 'input',

    // buttons
    BTN_TEXT: 'btn-text',
    BTN_SORT: 'btn-sorting',
    BTN_SORT_UP: 'btn-sorting-up',
    BTN_SORT_DOWN: 'btn-sorting-down',
    BTN_EXCEL: 'btn-excel-download',
    BTN_EXCEL_ICON: 'btn-excel-icon',
    BTN_EXCEL_PAGE: 'btn-excel-page',
    BTN_EXCEL_ALL: 'btn-excel-all',

    // toolbar
    TOOLBAR: 'toolbar',
    TOOLBAR_BTN_HOLDER: 'btn-holder',
    TOOLBAR_HEIGHT_RESIZE_BAR: 'height-resize-bar',
    TOOLBAR_HEIGHT_RESIZE_HANDLE: 'height-resize-handle'
};

var exports = _.mapObject(classNames, function(className) {
    return PREFIX + className;
});
exports.PREFIX = PREFIX;

module.exports = exports;
