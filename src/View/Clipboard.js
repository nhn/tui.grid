    /**
     * clipboard view class
     * @class
     */
    View.Clipboard = View.Base.extend({
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown': '_onKeydown',
            'focus': '_onFocus',
            'blur': '_onBlur'
        },
        /**
         * clipboard focus event handler
         * @private
         */
        _onFocus: function() {
            console.log('clipboard focus');
        },
        /**
         * clipboard blur event handler
         * @private
         */
        _onBlur: function() {
            console.log('clipboard blur');
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForCopy: 0,
                timeoutIdForKeyIn: 0,
                isLocked: false
            });
        },
        render: function() {
//            this.$el.css({
//                'top': 0,
//                'left': 0,
//                'width': '100px',
//                'height': '20px'
//            });
            return this;
        },
        _lock: function() {
            clearTimeout(this.timeoutIdForKeyIn);
            this.isLocked = true;
            this.timeoutIdForKeyIn = setTimeout($.proxy(this._unlock, this), 10);
        },
        _unlock: function() {
            this.isLocked = false;},

        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeydown: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            if (this.isLocked) {
                keyDownEvent.preventDefault();
                return false;
            } else {
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
            }
        },
        /**
         * ctrl, shift 둘다 눌리지 않은 상태에서의 key down event 핸들러
         * @param {event} keyDownEvent
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
            }
            keyDownEvent.preventDefault();
            selection.endSelection();
            return isKeyIdentified;
        },
        /**
         * enter 또는 space 가 입력되었을 때, 처리하는 로직
         * @param {(number|string)} rowKey
         * @param {string} columnName
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
         * @param {event} keyDownEvent
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
            }
            keyDownEvent.preventDefault();
            return isKeyIdentified;
        },
        /**
         * ctrl 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
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
            }
            return isKeyIdentified;
        },
        /**
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
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
            }

            keyDownEvent.preventDefault();
            return isKeyIdentified;
        },
        /**
         * text type 의 editOption cell 의 data 를 빈 스트링으로 세팅한다.
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
         * @param {Number} rowIndex
         * @param {Number} columnIndex
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
         * clipboard 의 String 을 반환한다.
         * @return {String}
         * @private
         */
        _getClipboardString: function() {
            var text,
                selection = this.grid.selection,
//                focused = this.grid.dataModel.getFocused();
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
        _copyToClipboard: function() {
            var text = this._getClipboardString();
            if (window.clipboardData) {
                if (window.clipboardData.setData('Text', text)) {
                    this.$el.select();
                }else {
                    this.$el.val('').select();
                }
            } else {
                this.$el.val(text).select();
            }
            this.timeoutIdForCopy = setTimeout($.proxy(function() {
                this.$el.val('');
            }, this), 0);
        }
    });
