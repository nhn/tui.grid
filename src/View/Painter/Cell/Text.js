/**
 * @fileoverview Text 편집 가능한 Cell Painter
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * text 타입의 cell renderer
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.Text
     */
    View.Painter.Cell.Text = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.Text.prototype */{
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

            this.setKeyDownSwitch({
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
        template: _.template('<input type="<%=type%>" value="<%=value%>" name="<%=name%>" <%=disabled%>/>'),
        /**
         * input type 을 반환한다.
         * @returns {string}
         * @private
         */
        _getInputType: function() {
            return 'text';
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td
         */
        /* istanbul ignore next: focus, select 를 검증할 수 없음 */
        focusIn: function($td) {
            var $input = $td.find('input');
            ne.util.setCursorToEnd($input.get(0));
            $input.focus().select();

        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} [$td]
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData
         * @return  {string} html string
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
        getContentHtml: function(cellData) {
            var value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName);
            return this.template({
                type: this._getInputType(),
                value: value,
                disabled: cellData.isDisabled ? 'disabled' : '',
                name: Util.getUniqueKey()
            });
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData
         * @param {jQuery} $td
         * @param {Boolean} hasFocusedElement
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var isValueChanged = $.inArray('value', cellData.changed) !== -1,
                $input = $td.find('input');

            isValueChanged && $input.val(cellData.value);
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
            var $target = $(blurEvent.target),
                rowKey = this.getRowKey($target),
                columnName = this.getColumnName($target);
            if (this._isEdited($target)) {
                this.grid.setValue(rowKey, columnName, $target.val());
            }
            this.grid.selection.enable();
        },
        /**
         * Focus Event Handler
         * @param {Event} focusEvent
         * @private
         */
        _onFocus: function(focusEvent) {
            var $input = $(focusEvent.target);
            this.originalText = $input.val();
            this.grid.selection.disable();
        }
    });
    /**
     * Password 타입의 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @constructor View.Painter.Cell.Text.Password
     */
    View.Painter.Cell.Text.Password = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Password.prototype */{
        initialize: function(attributes, options) {
            View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
        },
        /**
         * input type 을 반환한다.
         * @returns {string}
         * @private
         */
        _getInputType: function() {
            return 'password';
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text-password';
        }
    });

    /**
     * text-textbox 변환 가능한 cell renderer
     * @extends {View.Base.Painter.Cell.Text}
     * @implements {View.Base.Painter.Cell.Interface}
     * @constructor View.Painter.Cell.Text.Convertible
     */
    View.Painter.Cell.Text.Convertible = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Convertible.prototype */{
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
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'text-convertible';
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td
         */
        focusIn: function($td) {
            this._startEdit($td);
        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td
         */
        focusOut: function($td) {
            this._endEdit($td);
            this.grid.focusClipboard();
        },
        /**
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData
         * @return  {string} html string
         * @example
         * var html = this.getContentHtml();
         * <select>
         *     <option value='1'>option1</option>
         *     <option value='2'>option1</option>
         *     <option value='3'>option1</option>
         * </select>
         */
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
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData
         * @param {jQuery} $td
         * @param {Boolean} hasFocusedElement
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {},
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
                rowKey = this.getRowKey($td),
                columnName = this.getColumnName($td),
                cellState = this.grid.dataModel.get(rowKey).getCellState(columnName);
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

