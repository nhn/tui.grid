    /**
     * text-textbox 변환 가능한 cell renderer
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     * @class
     */
    View.Painter.Cell.Text = View.Base.Painter.Cell.extend({
        redrawAttributes: ['isEditable'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        initialize: function(attributes, options) {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });

            this._setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'ESC': function(keyDownEvent, param) {
                    this._restore(param.$target);
                    this.focusOut(param.$target);
                }
            });
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),
        getEditType: function() {
            return 'text';
        },
        _onFocus: function(focusEvent) {
            var $input = $(focusEvent.target);
            this.originalText = $input.val();
            this.grid.selection.disable();
        },
        focusIn: function($td) {
            var $input = $td.find('input');
            ne.util.setCursorToEnd($input.get(0));
            $input.focus().select();

        },
        focusOut: function() {
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName);
            return this.template({
                value: value,
                disabled: cellData.isDisabled ? 'disabled' : '',
                name: Util.getUniqueKey()
            });
        },
        setElementAttribute: function(cellData, $target) {
            var isValueChanged = $.inArray('value', cellData.changed) !== -1,
                $input = $target.find('input');

            isValueChanged ? $input.val(cellData.value) : null;
            $input.prop('disabled', cellData.isDisabled);
        },
        /**
         * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
         * @param {jQuery} $input
         * @return {Boolean}
         * @private
         */
        _isEdited: function($input) {
            return $input.val() !== this.originalText;
        },
        /**
         * 원래 text로 값을 되돌린다.
         * @param {jQuery} $input
         * @private
         */
        _restore: function($input) {
            $input.val(this.originalText);
        },
        /**
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlur: function(blurEvent) {
//            console.log('!!!!!!!!!!!!!!!!!!!!!!!!!blur');
            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
            this.grid.selection.enable();
        }
    });


    /**
     * text-textbox 변환 가능한 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @implements {View.Base.Painter.Cell.Interface}
     * @class
     */
    View.Painter.Cell.Text.Convertible = View.Painter.Cell.Text.extend({
        redrawAttributes: ['isDisabled', 'isEditable', 'value'],
        eventHandler: {
            'click': '_onClick',
            'blur input' : '_onBlurConvertible',
            'keydown input': '_onKeyDown',
            'focus input': '_onFocus'
        },
        initialize: function(attributes, options) {
            View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForClick: 0
            });
        },
        getEditType: function() {
            return 'text-convertible';
        },
        focusIn: function($td) {
            this._startEdit($td);
        },
        focusOut: function($td) {
            this._endEdit($td);
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
                $td = this.grid.getElement(cellData.rowKey, cellData.columnName),
                isEdit = !!($td.length && $td.data('isEdit'));

            if (!isEdit) {
                return value;
            } else {
                return this.template({
                    value: value,
                    disabled: cellData.isDisabled ? 'disabled' : '',
                    name: Util.getUniqueKey()
                });
            }
        },
        setElementAttribute: function() {},
        /**
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlurConvertible: function(blurEvent) {
            var $target = $(blurEvent.target),
                $td = $target.closest('td');
            this._onBlur(blurEvent);
            this._endEdit($td);
        },
        /**
         * text를 textbox 로 교체한다.
         * @param {jQuery} $td
         * @private
         */
        _startEdit: function($td) {
            var isEdit = $td.data('isEdit'),
                $input,
                cellState = this.grid.getCellState(this._getRowKey($td), this._getColumnName($td));

            if (!isEdit && cellState.isEditable && !cellState.isDisabled) {
                $td.data('isEdit', true);
                this.redraw(this._getCellData($td), $td);
                $input = $td.find('input');
                this.originalText = $input.val();
                ne.util.setCursorToEnd($input.get(0));
                $input.focus().select();

            }
        },
        /**
         * textbox를  text로 교체한다.
         * @param {jQuery} $td
         * @private
         */
        _endEdit: function($td) {
            var isEdit = $td.data('isEdit');
            if (isEdit) {
                $td.data('isEdit', false);
                this.redraw(this._getCellData($td), $td);
            }
        },
        /**
         * click Event handler
         * @param {event} clickEvent
         * @private
         */
        _onClick: function(clickEvent) {
            var $target = $(clickEvent.target),
                $td = $target.closest('td'),
                isClicked = $td.data('clicked');

            if (isClicked) {
                this._startEdit($td);
            } else {
                $td.data('clicked', true);
                clearTimeout(this.timeoutIdForClick);
                this.timeoutIdForClick = setTimeout(function() {
                    $td.data('clicked', false);
                }, 400);
            }
        }
    });

