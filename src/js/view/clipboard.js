/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');
var util = require('../util');

/**
 * Clipboard view class
 * @module view/clipboard
 */
var Clipboard = View.extend(/**@lends module:view/clipboard.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function() {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            timeoutIdForKeyIn: 0,
            isLocked: false
        });
    },

    tagName: 'textarea',

    className: 'clipboard',

    events: {
        'keydown': '_onKeyDown',
        'focusin': '_onFocus'
    },

    /**
     * 클립보드 focus 이벤트 핸들러
     * @private
     * @todo rowKey, rowIndex, columnName, columnIndex - Test Case
     */
    _onFocus: function() {
        var grid = this.grid,
            focusModel = grid.focusModel,
            columnModel = grid.columnModel,
            dataModel = grid.dataModel,
            focused = focusModel.which(),
            columnName = focused.columnName,
            rowKey = focused.rowKey,
            columnIdx, rowIdx;

        if (util.isBlank(columnName)) {
            columnIdx = 0;
        } else {
            columnIdx = Math.max(0, columnModel.indexOfColumnName(columnName, true));
        }

        if (util.isBlank(rowKey)) {
            rowIdx = 0;
        } else {
            rowIdx = Math.max(0, dataModel.indexOfRowKey(rowKey));
        }
        grid.focusAt(rowIdx, columnIdx);
    },

    /**
     * 랜더링 한다.
     * @return {View.Clipboard} this object
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
        this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10);
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
     * @return {boolean} False if locked
     * @private
     */
    _onKeyDown: function(keyDownEvent) {
        if (this.isLocked) {
            keyDownEvent.preventDefault();
            return false;
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
        var grid = this.grid,
            keyMap = grid.keyMap,
            focusModel = grid.focusModel,
            selectionModel = grid.selectionModel,
            focused = focusModel.which(),
            rowKey = focused.rowKey,
            columnName = focused.columnName,
            displayRowCount = grid.dimensionModel.getDisplayRowCount(),
            isKeyIdentified = true,
            keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        if (util.isBlank(focused.rowKey)) {
            return;
        }

        switch (keyCode) {
            case keyMap['UP_ARROW']:
                grid.focus(focusModel.prevRowKey(), columnName, true);
                break;
            case keyMap['DOWN_ARROW']:
                grid.focus(focusModel.nextRowKey(), columnName, true);
                break;
            case keyMap['LEFT_ARROW']:
                grid.focus(rowKey, focusModel.prevColumnName(), true);
                break;
            case keyMap['RIGHT_ARROW']:
                grid.focus(rowKey, focusModel.nextColumnName(), true);
                break;
            case keyMap['PAGE_UP']:
                grid.focus(focusModel.prevRowKey(displayRowCount - 1), columnName, true);
                break;
            case keyMap['PAGE_DOWN']:
                grid.focus(focusModel.nextRowKey(displayRowCount - 1), columnName, true);
                break;
            case keyMap['HOME']:
                grid.focus(rowKey, focusModel.firstColumnName(), true);
                break;
            case keyMap['END']:
                grid.focus(rowKey, focusModel.lastColumnName(), true);
                break;
            //space 와 enter 는 동일동작
            case keyMap['SPACE']:
            case keyMap['ENTER']:
                this._onEnterSpace(rowKey, columnName);
                break;
            case keyMap['DEL']:
                this._del(rowKey, columnName);
                break;
            case keyMap['TAB']:
                grid.focusIn(rowKey, focusModel.nextColumnName(), true);
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
        var cellInstance,
            grid = this.grid,
            editType = this.grid.columnModel.getEditType(columnName);
        if (editType === '_button') {
            cellInstance = this.grid.cellFactory.getInstance(editType);
            cellInstance.toggle(grid.getElement(rowKey, columnName));
        } else {
            grid.focusIn(rowKey, columnName);
        }
    },

    /**
     * Return index for reference of selection before moving by key event.
     * @returns {{row: number, column:number}} index
     * @private
     */
    _getIndexBeforeMove: function() {
        var grid  = this.grid,
            focusedIndex = grid.focusModel.indexOf(),
            selectionRange = grid.selectionModel.get('range'),
            index = _.extend({}, focusedIndex),
            selectionRowRange, selectionColumnRange;

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
        var grid = this.grid,
            keyMap = grid.keyMap,
            focusModel = grid.focusModel,
            columnModelList = grid.columnModel.getVisibleColumnModelList(),
            focused = focusModel.which(),
            displayRowCount = grid.dimensionModel.getDisplayRowCount(),
            keyCode = keyDownEvent.keyCode || keyDownEvent.which,
            index = this._getIndexBeforeMove(),
            isKeyIdentified = true,
            isSelection = true,
            columnModel, scrollPosition, isValid, selectionState;

        switch (keyCode) {
            case keyMap['UP_ARROW']:
                index.row -= 1;
                break;
            case keyMap['DOWN_ARROW']:
                index.row += 1;
                break;
            case keyMap['LEFT_ARROW']:
                index.column -= 1;
                break;
            case keyMap['RIGHT_ARROW']:
                index.column += 1;
                break;
            case keyMap['PAGE_UP']:
                index.row = focusModel.prevRowIndex(displayRowCount - 1);
                break;
            case keyMap['PAGE_DOWN']:
                index.row = focusModel.nextRowIndex(displayRowCount - 1);
                break;
            case keyMap['HOME']:
                index.column = 0;
                break;
            case keyMap['END']:
                index.column = columnModelList.length - 1;
                break;
            case keyMap['ENTER']:
                isSelection = false;
                break;
            case keyMap['TAB']:
                isSelection = false;
                grid.focusIn(focused.rowKey, focusModel.prevColumnName(), true);
                break;
            default:
                isSelection = false;
                isKeyIdentified = false;
                break;
        }

        columnModel = columnModelList[index.column];
        isValid = !!(columnModel && grid.getRow(index.row));

        if (isSelection && isValid) {
            this._updateSelectionByKeyIn(index.row, index.column);
            scrollPosition = focusModel.getScrollPosition(index.row, columnModel.columnName);
            if (scrollPosition) {
                selectionState = grid.selectionModel.getState();
                if (selectionState === 'column') {
                    delete scrollPosition['scrollTop'];
                } else if (selectionState === 'row') {
                    delete scrollPosition['scrollLeft'];
                }
                grid.renderModel.set(scrollPosition);
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
    _keyInWithCtrl: function(keyDownEvent) {
        var grid = this.grid,
            keyMap = grid.keyMap,
            focusModel = grid.focusModel,
            keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyMap['CHAR_A']:
                this.grid.selectionModel.selectAll();
                break;
            case keyMap['CHAR_C']:
                this._copyToClipboard();
                break;
            case keyMap['HOME']:
                grid.focus(focusModel.firstRowKey(), focusModel.firstColumnName(), true);
                break;
            case keyMap['END']:
                grid.focus(focusModel.lastRowKey(), focusModel.lastColumnName(), true);
                break;
            case keyMap['CHAR_V']:
                this._paste();
                break;
            default:
                break;
        }
    },

    /**
     * paste date
     * @private
     */
    _paste: function() {
        // pressing v long time, clear clipboard to keep final paste date
        this._clearClipBoard();
        if (this.pasting) {
            return;
        }

        this.pasting = true;
        this._onKeyupCharV();
    },

    /**
     * keyup event attach
     * @private
     */
    _onKeyupCharV: function() {
        this.$el.on('keyup', $.proxy(this.onKeyupCharV, this));
    },

    onKeyupCharV: function() {
        this._pasteToGrid();
        this.pasting = false;
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
        var result = this._getProcessClipBoardData();
        this.$el.off('keyup');
        this.grid.paste(result);
    },

    /**
     * process data for paste to grid
     * @private
     * @return {Array.<Array.<string>>} result
     */
    _getProcessClipBoardData: function() {
        var text = this.$el.val(),
            result = text.split('\n'),
            i = 0,
            len = result.length;

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
        var grid = this.grid,
            keyMap = grid.keyMap,
            isKeyIdentified = true,
            columnModelList = grid.columnModel.getVisibleColumnModelList(),
            keyCode = keyDownEvent.keyCode || keyDownEvent.which;

        switch (keyCode) {
            case keyMap['HOME']:
                this._updateSelectionByKeyIn(0, 0);
                break;
            case keyMap['END']:
                this._updateSelectionByKeyIn(grid.dataModel.length - 1, columnModelList.length - 1);
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
        var grid = this.grid,
            selectionModel = grid.selectionModel,
            dataModel = grid.dataModel,
            focused = grid.focusModel.which(),
            columnModelList = grid.columnModel.getVisibleColumnModelList(),
            rowKey = focused.rowKey,
            columnName = focused.columnName,
            range, i, j;

        if (selectionModel.hasSelection()) {
            //다수의 cell 을 제거 할 때에는 silent 로 데이터를 변환한 후 한번에 랜더링을 refresh 한다.
            range = selectionModel.get('range');
            for (i = range.row[0]; i < range.row[1] + 1; i += 1) {
                rowKey = dataModel.at(i).get('rowKey');
                for (j = range.column[0]; j < range.column[1] + 1; j += 1) {
                    columnName = columnModelList[j]['columnName'];
                    grid.del(rowKey, columnName, true);
                }
            }
            grid.renderModel.refresh(true);
        } else {
            grid.del(rowKey, columnName);
        }
    },

    /**
     * keyIn 으로 selection 영역을 update 한다. focus 로직도 함께 수행한다.
     * @param {Number} rowIndex 행의 index 정보
     * @param {Number} columnIndex 열의 index 정보
     * @private
     */
    _updateSelectionByKeyIn: function(rowIndex, columnIndex) {
        var selectionModel = this.grid.selectionModel;

        selectionModel.update(rowIndex, columnIndex);
    },

    /**
     * clipboard 에 설정될 문자열 반환한다.
     * @return {String} 데이터를 text 형태로 변환한 문자열
     * @private
     */
    _getClipboardString: function() {
        var text,
            selectionModel = this.grid.selectionModel,
            focused = this.grid.focusModel.which();
        if (selectionModel.hasSelection()) {
            text = this.grid.selectionModel.getValuesToString();
        } else {
            text = this.grid.dataModel.get(focused.rowKey).getVisibleText(focused.columnName);
        }
        return text;
    },

    /**
     * 현재 그리드의 data 를 clipboard 에 copy 한다.
     * @private
     */
     /* istanbul ignore next */
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
