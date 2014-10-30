    /**
     * text-textbox 변환 가능한 cell renderer
     */
    View.Renderer.Cell.Text = View.Base.Renderer.Cell.Abstract.extend({
        cellType: 'text',
        rerenderAttributes: ['isEditable'],
        eventHandler: {
            'blur input' : '_onBlur',
            'keydown input': '_onKeyDown'
        },
        initialize: function(attributes, options) {
            View.Base.Renderer.Cell.Abstract.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                originalText: ''
            });
        },
        template: _.template('<input type="text" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),
        focusIn: function($td) {
            var $input = $td.find('input');
            this.originalText = $input.val();
            $input.focus();
            Util.setCursorToEnd($input.get(0));

        },
        focusOut: function() {
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName);
            return this.template({
                value: value,
                disabled: cellData.isDisabled ? 'disabled' : '',
                name: Util.getUniqueKey()
            });
        },
        setElementAttribute: function(cellData, $target) {
            $target.find('input').prop('disabled', cellData.isDisabled);
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
         * keyDown event handler
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            var $target = $(keyDownEvent.target),
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['ESC']:
                    this._restore($target);
                    this.focusOut($target);
                    break;
                case keyMap['ENTER']:
                    this.focusOut($target);
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동
                    } else {
                        //이후 cell 로 focus 이동
                    }
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
         * blur event handler
         * @param {event} blurEvent
         * @private
         */
        _onBlur: function(blurEvent) {

            var $target = $(blurEvent.target),
                rowKey = this._getRowKey($target),
                columnName = this._getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
        }
    });


    /**
     * text-textbox 변환 가능한 cell renderer
     * @class
     */
    View.Renderer.Cell.Text.Convertible = View.Renderer.Cell.Text.extend({
        cellType: 'text-convertible',
        rerenderAttributes: ['isEditable', 'optionList', 'value'],
        eventHandler: {
            'click': '_onClick',
            'blur input' : '_onBlurConvertible',
            'keydown input': '_onKeyDown'
        },
        initialize: function(attributes, options) {
            View.Renderer.Cell.Text.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                timeoutIdForClick: 0
            });
        },
        focusIn: function($td) {
            this._startEdit($td);
        },
        focusOut: function($td) {
            this._endEdit($td);
            this.grid.focusClipboard();
        },
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getTagFiltered(cellData.columnName),
                $td = this.grid.getCellElement(cellData.rowKey, cellData.columnName),
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
         * @param {Element} $td
         * @private
         */
        _startEdit: function($td) {
            var isEdit = $td.data('isEdit'),
                $input;
            if (!isEdit && this.grid.isEditable(this._getRowKey($td), this._getColumnName($td))) {
                $td.data('isEdit', true);
                this.render(this._getCellData($td), $td);
                $input = $td.find('input');
                this.originalText = $input.val();
                $input.focus();
                Util.setCursorToEnd($input.get(0));
            }
        },
        /**
         * textbox를  text로 교체한다.
         * @param {Element} $td
         * @private
         */
        _endEdit: function($td) {
            var isEdit = $td.data('isEdit');
            if (isEdit) {
                $td.data('isEdit', false);
                this.render(this._getCellData($td), $td);
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

