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
            this.$el.css({
                'top': 0,
                'left': 0,
                'width': '100px',
                'height': '100px'
            });
            return this;
        },
        _lock: function() {

        },
        _unlock: function() {

        },
        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeydown: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            if (this.isLocked) {
                keyDownEvent.prevetnDefault();
                return false;
            } else {
                clearTimeout(this.timeoutIdForKeyIn);
                this.isLocked = true;
                this.timeoutIdForKeyIn = setTimeout($.proxy(function(){
                    this.isLocked = false;
                }, this), 10);
                if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
                    this._keyInWithShiftAndCtrl(keyDownEvent);
                } else if (keyDownEvent.shiftKey) {
                    this._keyInWithShift(keyDownEvent);
                } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                    this._keyInWithCtrl(keyDownEvent);
                } else {
                    this._keyIn(keyDownEvent);
                }
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
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            selection.endSelection();

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
                case keyMap['ENTER']:
                    this._focusIn(rowKey, columnName);
                    break;
                case keyMap['TAB']:
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
            keyDownEvent.preventDefault();
        },
        /**
         * Cell 을 편집모드로 전환한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @private
         */
        _focusIn: function(rowKey, columnName){
            var grid = this.grid,
                cellInstance, cellData;
            if (grid.isEditable()) {
                cellInstance = grid.cellFactory.getInstance(grid.columnModel.getEditType(columnName));
                if (!grid.isSorted()) {
                    cellData = grid.renderModel.getCellData(rowKey, columnName);
                    rowKey = cellData.mainRowKey;
                }
                cellInstance.focusIn(grid.getCellElement(rowKey, columnName));
            }
        },
        /**
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShiftAndCtrl: function(keyDownEvent) {
            var keyMap = this.grid.keyMap,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    break;
                case keyMap['DOWN_ARROW']:
                    break;
                case keyMap['LEFT_ARROW']:
                    break;
                case keyMap['RIGHT_ARROW']:
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
            keyDownEvent.preventDefault();
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
         * shift 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShift: function(keyDownEvent) {
            var keyMap = this.grid.keyMap,
                selection = this.grid.selection,
                focusModel = this.grid.focusModel,
                focused = this.grid.focusModel.indexOf(),
                displayRowCount = this.grid.dimensionModel.getDisplayRowCount(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(), focused.columnIdx);
                    break;
                case keyMap['DOWN_ARROW']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(), focused.columnIdx);
                    break;
                case keyMap['LEFT_ARROW']:
                    this._updateSelectionByKeyIn(focused.rowIdx, focusModel.prevColumnIndex());
                    break;
                case keyMap['RIGHT_ARROW']:
                    this._updateSelectionByKeyIn(focused.rowIdx, focusModel.nextColumnIndex());
                    break;
                case keyMap['PAGE_UP']:
                    this._updateSelectionByKeyIn(focusModel.prevRowIndex(displayRowCount - 1), focused.columnIdx);
                    break;
                case keyMap['PAGE_DOWN']:
                    this._updateSelectionByKeyIn(focusModel.nextRowIndex(displayRowCount - 1), focused.columnIdx);
                    break;
                case keyMap['ENTER']:
                    break;
                case keyMap['TAB']:
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
            keyDownEvent.preventDefault();
        },
        /**
         * ctrl 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithCtrl: function(keyDownEvent) {
            var keyMap = this.grid.keyMap,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['CHAR_A']:
                    this.grid.selection.selectAll();
                    break;
                case keyMap['CHAR_C']:
                    this._copyToClipboard();
                    break;
                case keyMap['CHAR_V']:
                    break;
            }
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
            console.log(text);
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
