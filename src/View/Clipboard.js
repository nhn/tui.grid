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
                timeoutIdForClipboard: 0
            });
        },
        render: function() {
            this.$el.css({
                'top': 0,
                'left': 0,
                'width': '100px',
                'height': '100px'
            })
            return this;
        },
        /**
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeydown: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            if (keyDownEvent.shiftKey && (keyDownEvent.ctrlKey || keyDownEvent.metaKey)) {
                this._keyInWithShiftAndCtrl(keyDownEvent);
            } else if (keyDownEvent.shiftKey) {
                this._keyInWithShift(keyDownEvent);
            } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                this._keyInWithCtrl(keyDownEvent);
            } else {
                this._keyIn(keyDownEvent);
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
                focused = focusModel.which(),
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;
            switch (keyCode) {
                case keyMap['UP_ARROW']:
                    grid.focus(focusModel.prevRowKey(), focused.columnName, true);
                    break;
                case keyMap['DOWN_ARROW']:
                    grid.focus(focusModel.nextRowKey(), focused.columnName, true);
                    break;
                case keyMap['LEFT_ARROW']:
                    grid.focus(focused.rowKey, focusModel.prevColumnName(), true);
                    break;
                case keyMap['RIGHT_ARROW']:
                    grid.focus(focused.rowKey, focusModel.nextColumnName(), true);
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
         * shift 가 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _keyInWithShift: function(keyDownEvent) {
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
            this.timeoutIdForClipboard = setTimeout($.proxy(function() {
                this.$el.val('');
            }, this), 0);
        }
    });
