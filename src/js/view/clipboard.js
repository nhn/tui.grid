/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var util = require('../common/util');
var keyCodeMap = require('../common/constMap').keyCode;
var classNameConst = require('../common/classNameConst');

/**
 * Clipboard view class
 * @module view/clipboard
 * @extends module:base/view
 */
var Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.setOwnProperties({
            focusModel: options.focusModel,
            selectionModel: options.selectionModel,
            painterManager: options.painterManager,
            dimensionModel: options.dimensionModel,
            dataModel: options.dataModel,
            columnModel: options.columnModel,
            renderModel: options.renderModel,
            timeoutIdForKeyIn: 0,
            isLocked: false
        });
        this.listenTo(this.focusModel, 'focusClipboard', this._onFocus);
    },

    tagName: 'textarea',

    className: classNameConst.CLIPBOARD,

    events: {
        'keydown': '_onKeyDown',
        'blur': '_onBlur'
    },

    /**
     * Event handler for blur event.
     * @private
     */
    _onBlur: function() {
        var focusModel = this.focusModel;

        setTimeout(function() {
            focusModel.refreshState();
        }, 0);
    },

    /**
     * Event handler for 'focusClipboard' event on focusModel
     * @private
     */
    _onFocus: function() {
        try {
            if (!this.$el.is(':focus')) {
                this.$el.focus();
                this.focusModel.refreshState();
            }
        } catch (e) {
            // Do nothing.
            // This try/catch block is just for preventing 'Unspecified error'
            // in IE9(and under) when running test using karma.
        }
    },

    /**
     * 랜더링 한다.
     * @returns {View.Clipboard} this object
     */
    render: function() {
        return this;
    },

    /**
     * keyEvent 의 중복 호출을 방지하는 lock 을 설정한다.
     * @private
     */
    _lock: function() {
        clearTimeout(this.timeoutIdForKeyIn);
        this.isLocked = true;
        this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10); // eslint-disable-line no-magic-numbers
    },

    /**
     * keyEvent 의 중복 호출을 방지하는 lock 을 해제한다.
     * @private
     */
    _unlock: function() {
        this.isLocked = false;
    },

    /**
     * keyDown 이벤트 핸들러
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _onKeyDown: function(keyDownEvent) { // eslint-disable-line complexity
        if (this.isLocked) {
            keyDownEvent.preventDefault();
            return;
        }

        if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
            this._keyInWithShiftAndCtrl(keyDownEvent);
        } else if (keyDownEvent.shiftKey) {
            this._keyInWithShift(keyDownEvent);
        } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
            this._keyInWithCtrl(keyDownEvent);
        } else {
            this._keyIn(keyDownEvent);
        }
        this._lock();
    },

    /**
     * ctrl, shift 둘다 눌리지 않은 상태에서의 key down 이벤트 핸들러
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyIn: function(keyDownEvent) { // eslint-disable-line complexity
        var focusModel = this.focusModel;
        var selectionModel = this.selectionModel;
        var focused = focusModel.which();
        var rowKey = focused.rowKey;
        var columnName = focused.columnName;
        var displayRowCount = this.dimensionModel.get('displayRowCount');
        var isKeyIdentified = true;
        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        if (util.isBlank(focused.rowKey)) {
            return;
        }

        switch (keyCode) {
            case keyCodeMap.UP_ARROW:
                focusModel.focus(focusModel.prevRowKey(), columnName, true);
                break;
            case keyCodeMap.DOWN_ARROW:
                focusModel.focus(focusModel.nextRowKey(), columnName, true);
                break;
            case keyCodeMap.LEFT_ARROW:
                focusModel.focus(rowKey, focusModel.prevColumnName(), true);
                break;
            case keyCodeMap.RIGHT_ARROW:
                focusModel.focus(rowKey, focusModel.nextColumnName(), true);
                break;
            case keyCodeMap.PAGE_UP:
                focusModel.focus(focusModel.prevRowKey(displayRowCount - 1), columnName, true);
                break;
            case keyCodeMap.PAGE_DOWN:
                focusModel.focus(focusModel.nextRowKey(displayRowCount - 1), columnName, true);
                break;
            case keyCodeMap.HOME:
                focusModel.focus(rowKey, focusModel.firstColumnName(), true);
                break;
            case keyCodeMap.END:
                focusModel.focus(rowKey, focusModel.lastColumnName(), true);
                break;
            //space 와 enter 는 동일동작
            case keyCodeMap.SPACE:
            case keyCodeMap.ENTER:
                this._onEnterSpace(rowKey, columnName);
                break;
            case keyCodeMap.DEL:
                this._del(rowKey, columnName);
                break;
            case keyCodeMap.TAB:
                focusModel.focusIn(rowKey, focusModel.nextColumnName(), true);
                break;
            default:
                isKeyIdentified = false;
                break;
        }
        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
        selectionModel.end();
    },

    /**
     * enter 또는 space 가 입력되었을 때, 처리하는 로직
     * @param {(number|string)} rowKey 키 입력이 발생한 엘리먼트의 rowKey
     * @param {string} columnName 키 입력이 발생한 엘리먼트의 컬럼명
     * @private
     */
    _onEnterSpace: function(rowKey, columnName) {
        this.focusModel.focusIn(rowKey, columnName);
    },

    /**
     * Return index for reference of selection before moving by key event.
     * @returns {{row: number, column:number}} index
     * @private
     */
    _getIndexBeforeMove: function() {
        var focusedIndex = this.focusModel.indexOf();
        var selectionRange = this.selectionModel.get('range');
        var index = _.extend({}, focusedIndex);
        var selectionRowRange, selectionColumnRange;

        if (selectionRange) {
            selectionRowRange = selectionRange.row;
            selectionColumnRange = selectionRange.column;

            index.row = selectionRowRange[0];
            index.column = selectionColumnRange[0];

            if (selectionRowRange[1] > focusedIndex.row) {
                index.row = selectionRowRange[1];
            }
            if (selectionColumnRange[1] > focusedIndex.column) {
                index.column = selectionColumnRange[1];
            }
        }
        return index;
    },

    /**
     * shift 가 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithShift: function(keyDownEvent) { // eslint-disable-line complexity
        var focusModel = this.focusModel;
        var dimensionModel = this.dimensionModel;
        var columnModelList = this.columnModel.getVisibleColumnModelList();
        var focused = focusModel.which();
        var displayRowCount = dimensionModel.get('displayRowCount');
        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
        var index = this._getIndexBeforeMove();
        var isKeyIdentified = true;
        var isSelection = true;
        var columnModel, scrollPosition, isValid, selectionState;

        switch (keyCode) {
            case keyCodeMap.UP_ARROW:
                index.row -= 1;
                break;
            case keyCodeMap.DOWN_ARROW:
                index.row += 1;
                break;
            case keyCodeMap.LEFT_ARROW:
                index.column -= 1;
                break;
            case keyCodeMap.RIGHT_ARROW:
                index.column += 1;
                break;
            case keyCodeMap.PAGE_UP:
                index.row = focusModel.prevRowIndex(displayRowCount - 1);
                break;
            case keyCodeMap.PAGE_DOWN:
                index.row = focusModel.nextRowIndex(displayRowCount - 1);
                break;
            case keyCodeMap.HOME:
                index.column = 0;
                break;
            case keyCodeMap.END:
                index.column = columnModelList.length - 1;
                break;
            case keyCodeMap.ENTER:
                isSelection = false;
                break;
            case keyCodeMap.TAB:
                isSelection = false;
                focusModel.focusIn(focused.rowKey, focusModel.prevColumnName(), true);
                break;
            default:
                isSelection = false;
                isKeyIdentified = false;
                break;
        }

        columnModel = columnModelList[index.column];
        isValid = !!(columnModel && this.dataModel.getRowData(index.row));

        if (isSelection && isValid) {
            this._updateSelectionByKeyIn(index.row, index.column);
            scrollPosition = dimensionModel.getScrollPosition(index.row, columnModel.columnName);
            if (scrollPosition) {
                selectionState = this.selectionModel.getState();
                if (selectionState === 'column') {
                    delete scrollPosition.scrollTop;
                } else if (selectionState === 'row') {
                    delete scrollPosition.scrollLeft;
                }
                this.renderModel.set(scrollPosition);
            }
        }

        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
    },

    /**
     * ctrl 가 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithCtrl: function(keyDownEvent) {  // eslint-disable-line complexity
        var focusModel = this.focusModel;
        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyCodeMap.CHAR_A:
                this.selectionModel.selectAll();
                break;
            case keyCodeMap.CHAR_C:
                this._copyToClipboard();
                break;
            case keyCodeMap.HOME:
                focusModel.focus(focusModel.firstRowKey(), focusModel.firstColumnName(), true);
                break;
            case keyCodeMap.END:
                focusModel.focus(focusModel.lastRowKey(), focusModel.lastColumnName(), true);
                break;
            case keyCodeMap.CHAR_V:
                this._pasteWhenKeyupCharV();
                break;
            default:
                break;
        }
    },

    /**
     * paste date
     * @private
     */
    _pasteWhenKeyupCharV: function() {
        var self = this;

        // pressing v long time, clear clipboard to keep final paste date
        this._clearClipBoard();
        if (this.pasting) {
            return;
        }

        this.pasting = true;
        this.$el.on('keyup', function() {
            self._pasteToGrid();
            self.pasting = false;
        });
    },

   /**
     * clipboard textarea clear
     * @private
     */
    _clearClipBoard: function() {
        this.$el.val('');
    },

    /**
     * paste text data
     * @private
     */
    _pasteToGrid: function() {
        var selectionModel = this.selectionModel;
        var focusModel = this.focusModel;
        var dataModel = this.dataModel;
        var startIdx, data;

        if (selectionModel.hasSelection()) {
            startIdx = selectionModel.getStartIndex();
        } else {
            startIdx = focusModel.indexOf();
        }
        data = this._getProcessClipBoardData();

        this.$el.off('keyup');
        dataModel.paste(data, startIdx);
    },

    /**
     * process data for paste to grid
     * @private
     * @returns {Array.<Array.<string>>} result
     */
    _getProcessClipBoardData: function() {
        var text = this.$el.val();
        var result = text.split('\n');
        var i = 0;
        var len = result.length;

        for (; i < len; i += 1) {
            result[i] = result[i].split('\t');
        }

        return result;
    },

    /**
     * ctrl, shift 둘다 눌린 상태에서의 key down event handler
     * @param {Event} keyDownEvent 이벤트 객체
     * @private
     */
    _keyInWithShiftAndCtrl: function(keyDownEvent) {
        var isKeyIdentified = true;
        var columnModelList = this.columnModel.getVisibleColumnModelList();
        var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyCodeMap.HOME:
                this._updateSelectionByKeyIn(0, 0);
                break;
            case keyCodeMap.END:
                this._updateSelectionByKeyIn(this.dataModel.length - 1, columnModelList.length - 1);
                break;
            default:
                isKeyIdentified = false;
                break;
        }
        if (isKeyIdentified) {
            keyDownEvent.preventDefault();
        }
    },

    /**
     * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
     * selection 영역이 지정되어 있다면 selection 영역에 해당하는 모든 셀.
     * selection 영역이 지정되어 있지 않다면 focus된 셀
     * @private
     */
    _del: function() {
        var selectionModel = this.selectionModel;
        var dataModel = this.dataModel;
        var focused = this.focusModel.which();
        var columnModelList = this.columnModel.getVisibleColumnModelList();
        var rowKey = focused.rowKey;
        var columnName = focused.columnName;
        var range, i, j;

        if (selectionModel.hasSelection()) {
            //다수의 cell 을 제거 할 때에는 silent 로 데이터를 변환한 후 한번에 랜더링을 refresh 한다.
            range = selectionModel.get('range');
            for (i = range.row[0]; i < range.row[1] + 1; i += 1) {
                rowKey = dataModel.at(i).get('rowKey');
                for (j = range.column[0]; j < range.column[1] + 1; j += 1) {
                    columnName = columnModelList[j].columnName;
                    dataModel.del(rowKey, columnName, true);
                    dataModel.get(rowKey).validateCell(columnName);
                }
            }
            this.renderModel.refresh({
                dataModelChanged: true
            });
        } else {
            dataModel.del(rowKey, columnName);
        }
    },

    /**
     * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
     * @param {Number} rowIndex 행의 index 정보
     * @param {Number} columnIndex 열의 index 정보
     * @private
     */
    _updateSelectionByKeyIn: function(rowIndex, columnIndex) {
        var selectionModel = this.selectionModel;

        selectionModel.update(rowIndex, columnIndex);
    },

    /**
     * clipboard 에 설정될 문자열 반환한다.
     * @returns {String} 데이터를 text 형태로 변환한 문자열
     * @private
     */
    _getClipboardString: function() {
        var selectionModel = this.selectionModel;
        var focused = this.focusModel.which();
        var text;

        if (selectionModel.hasSelection()) {
            text = this.selectionModel.getValuesToString();
        } else {
            text = this.dataModel.get(focused.rowKey).getValueString(focused.columnName);
        }

        return text;
    },

    /**
     * 현재 그리드의 data 를 clipboard 에 copy 한다.
     * @private
     */
    _copyToClipboard: function() {
        var text = this._getClipboardString();

        if (window.clipboardData) {
            window.clipboardData.setData('Text', text);
        } else {
            this.$el.val(text).select();
        }
    }
});

module.exports = Clipboard;
