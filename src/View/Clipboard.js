    View.Clipboard = View.Base.extend({
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown': '_onKeydown',
            'focus': '_onFocus',
            'blur': '_onBlur'
        },
        _onFocus: function(){
            console.log('clipboard focus');
        },
        _onBlur: function(){
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
                this._typeWithShiftAndCtrl(keyDownEvent);
            } else if (keyDownEvent.shiftKey) {
                this._typeWithShift(keyDownEvent);
            } else if (keyDownEvent.ctrlKey || keyDownEvent.metaKey) {
                this._typeWithCtrl(keyDownEvent);
            } else {
                this._typeWith(keyDownEvent);
            }

        },
        /**
         * ctrl, shift 둘다 눌리지 않은 상태에서의 key down event 핸들러
         * @param {event} keyDownEvent
         * @private
         */
        _typeWith: function(keyDownEvent) {
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
         * ctrl, shift 둘다 눌린 상태에서의 key down event handler
         * @param {event} keyDownEvent
         * @private
         */
        _typeWithShiftAndCtrl: function(keyDownEvent) {
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
        _typeWithShift: function(keyDownEvent) {
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
        _typeWithCtrl: function(keyDownEvent) {
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
