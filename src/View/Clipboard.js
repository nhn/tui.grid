/**
 * @fileoverview 키 이벤트 핸들링 담당하는 Clipboard 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Clipboard view class
     * @constructor View.Clipboard
     */
    View.Clipboard = View.Base.extend(/**@lends View.Clipboard.prototype */{
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown': '_onKeyDown',
            'focus': '_onFocus',
            'blur': '_onBlur'
        },
        /**
         * 클립보드 focus 이벤트 핸들러
         * @private
         */
        _onFocus: function() {
            this.grid.focusModel.focus();
        },
        /**
         * 클립보드 blur 이벤트 핸들러
         * @private
         */
        _onBlur: function() {
            //Grid 내 input 에 focus 가 된 경우 blur 처리하지 않기위해 setTimeout 을 사용한다.
            setTimeout($.proxy(function() {
                var hasFocusedElement = !!(this.grid.$el.find(':focus').length);
                if (!hasFocusedElement) {
                    this.grid.focusModel.blur();
                }
            }, this), 10);
        },
        /**
         * 생성자
         */
        initialize: function() {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForKeyIn: 0,
                isLocked: false
            });
        },
        /**
         * 랜더링 한다.
         * @return {View.Clipboard}
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
         * @param {event} keyDownEvent 이벤트 객체
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
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyIn: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                selection = grid.selection,
                focused = focusModel.which(),
                rowKey = focused.rowKey,
                columnName = focused.columnName,
                displayRowCount = grid.dimensionModel.getDisplayRowCount(),
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

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
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            keyDownEvent.preventDefault();
            selection.endSelection();
            return isKeyIdentified;
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
         * shift 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyInWithShift: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                focusedIndex = grid.focusModel.indexOf(),
                focused = focusModel.which(),
                isKeyIdentified = true,
                displayRowCount = grid.dimensionModel.getDisplayRowCount(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(), focusedIndex.columnIdx);
                    break;
                case keyMap['DOWN_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(), focusedIndex.columnIdx);
                    break;
                case keyMap['LEFT_ARROW']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, focusModel.prevColumnIndex());
                    break;
                case keyMap['RIGHT_ARROW']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, focusModel.nextColumnIndex());
                    break;
                case keyMap['PAGE_UP']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(displayRowCount - 1), focusedIndex.columnIdx);
                    break;
                case keyMap['PAGE_DOWN']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(displayRowCount - 1), focusedIndex.columnIdx);
                    break;
                case keyMap['HOME']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, 0);
                    break;
                case keyMap['END']:
                    this._updateSelectionByKeyIn(focusedIndex.rowIdx, columnModelList.length - 1);
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    grid.focusIn(focused.rowKey, focusModel.prevColumnName(), true);
                    break;
                case keyMap['CHAR_V']:
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            keyDownEvent.preventDefault();
            return isKeyIdentified;
        },
        /**
         * ctrl 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent 이벤트 객체
         * @private
         */
        _keyInWithCtrl: function(keyDownEvent) {
            var grid = this.grid,
                keyMap = grid.keyMap,
                focusModel = grid.focusModel,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['CHAR_A']:
                    this.grid.selection.selectAll();
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
                    break;
                default:
                    isKeyIdentified = false;
                    break;
            }
            return isKeyIdentified;
        },
        /**
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent 이벤트 객체
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

            keyDownEvent.preventDefault();
            return isKeyIdentified;
        },
        /**
         * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
         * selection 영역이 지정되어 있다면 selection 영역에 해당하는 모든 셀.
         * selection 영역이 지정되어 있지 않다면 focus된 셀
         * @private
         */
        _del: function() {
            var grid = this.grid,
                selection = grid.selection,
                dataModel = grid.dataModel,
                focused = grid.focusModel.which(),
                columnModelList = grid.columnModel.getVisibleColumnModelList(),
                rowKey = focused.rowKey,
                columnName = focused.columnName,
                range, i, j;

            if (selection.hasSelection()) {
                //다수의 cell 을 제거 할 때에는 silent 로 데이터를 변환한 후 한번에 랜더링을 refresh 한다.
                range = selection.getRange();
                for (i = range.row[0]; i < range.row[1] + 1; i++) {
                    rowKey = dataModel.at(i).get('rowKey');
                    for (j = range.column[0]; j < range.column[1] + 1; j++) {
                        columnName = columnModelList[j]['columnName'];
                        grid.del(rowKey, columnName, true);
                    }
                }
                grid.renderModel.refresh();
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
            var selection = this.grid.selection,
                focused = this.grid.focusModel.indexOf();

            if (!selection.hasSelection()) {
                selection.startSelection(focused.rowIdx, focused.columnIdx);
            }
            selection.updateSelection(rowIndex, columnIndex);
            this.grid.focusAt(rowIndex, columnIndex, true);
        },

        /**
         * clipboard 에 설정될 문자열 반환한다.
         * @return {String} 데이터를 text 형태로 변환한 문자열
         * @private
         */
        _getClipboardString: function() {
            var text,
                selection = this.grid.selection,
                focused = this.grid.focusModel.which();
            if (selection.isShown()) {
                text = this.grid.selection.getSelectionToString();
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
                if (window.clipboardData.setData('Text', text)) {
                    this.$el.select();
                } else {
                    this.$el.val('').select();
                }
            } else {
                this.$el.val(text).select();
            }
        }
    });
