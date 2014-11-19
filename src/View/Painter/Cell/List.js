    /**
     * editOption 에 list 를 가지고 있는 형태의 추상 클래스
     * @implements {View.Base.Painter.Cell.Interface}
     * @class
     */
    View.Painter.Cell.List = View.Base.Painter.Cell.extend({
        redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],
        eventHandler: {
        },
        initialize: function() {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
        },
        focusIn: function($td) {},
        getEditType: function() {},
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute: function(cellData, $target) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        },
        _getOptionList: function(cellData) {
            var columnModel = this.grid.columnModel.getColumnModel(cellData.columnName);
            return cellData.optionList && cellData.optionList.length ? cellData.optionList : columnModel.editOption.list;
        },
        _onBlur: function(blurEvent) {
            var $target = $(blurEvent.target);
            $target.closest('td').data('isFocused', false);
        },
        _onFocus: function(focusEvent) {
            var $target = $(focusEvent.target);
            $target.closest('td').data('isFocused', true);
        }
    });

    /**
     * select type 의 Cell renderer
     *
     * @extends {View.Painter.Cell.List}
     * @class
     */
    View.Painter.Cell.List.Select = View.Painter.Cell.List.extend({
        initialize: function(attributes) {
            View.Painter.Cell.List.prototype.initialize.apply(this, arguments);

            this._setKeyDownSwitch({
                'ESC': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                }
            });
        },
        eventHandler: {
            'change select' : '_onChange',
            'keydown select' : '_onKeyDown',
            'blur select' : '_onBlur',
            'focus select' : '_onFocus'
        },

        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('select').focus();
        },
        getEditType: function() {
            return 'select';
        },
        getContentHtml: function(cellData) {
            var list = this._getOptionList(cellData),
                html = '',
                isDisabled = cellData.isDisabled,
                len = list.length;

            html += '<select name="' + Util.getUniqueKey() + '"';
            html += isDisabled ? ' disabled ' : '';
            html += '>';

            for (var i = 0; i < len; i++) {
                html += '<option ';
                html += 'value="' + list[i].value + '"';

                if (cellData.value == list[i].value) {
                    html += ' selected';
                }
                html += ' >';
                html += list[i].text;
                html += '</option>';
            }
            html += '</select>';
            return html;

        },
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
//            console.log('!!!!setElementAttribute', cellData.optionList);
            var $select = $td.find('select');
            hasFocusedElement ? $select.blur() : null;
            $select.val(cellData.value);
            hasFocusedElement ? $select.focus() : null;

        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target),
                grid = this.grid;
            grid.setValue(cellAddr.rowKey, cellAddr.columnName, $target.val());
        }
    });


    /**
     * checkbox, radio button type 의 Cell renderer
     *
     * @extends {View.Painter.Cell.List}
     * @class
     */
    View.Painter.Cell.List.Button = View.Painter.Cell.List.extend({
        initialize: function(attributes) {
            View.Painter.Cell.List.prototype.initialize.apply(this, arguments);
            this._setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'PAGE_UP': function() {},
                'PAGE_DOWN': function() {},
                'ENTER': function(keyDownEvent, param) {
                    param.$target.trigger('click');
                },
                'LEFT_ARROW': function(keyDownEvent, param) {
                    this._focusPrevInput(param.$target);
                },
                'RIGHT_ARROW': function(keyDownEvent, param) {
                    this._focusNextInput(param.$target);
                },
                'ESC': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'TAB': function(keyDownEvent, param) {
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동
                        if (!this._focusPrevInput(param.$target)) {
                            this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
                        }
                    } else {
                        //이후 cell 로 focus 이동
                        if (!this._focusNextInput(param.$target)) {
                            this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                        }
                    }
                }
            });
        },
        eventHandler: {
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        template: {
            input: _.template('<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>" <%=checked%> <%=disabled%> />'),
            label: _.template('<label for="<%=id%>" style="margin-right:10px"><%=text%></label>')
        },
        getEditType: function() {
            return 'button';
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('input').eq(0).focus();
        },
        _focusNextInput: function($currentInput) {
            var $next = $currentInput;
            do {
                $next = $next.next();
            } while ($next.length && !$next.is('input'));
            if ($next.length) {
                $next.focus();
                return true;
            } else {
                return false;
            }
        },
        _focusPrevInput: function($currentInput) {
            var $prev = $currentInput;
            do {
                $prev = $prev.prev();
            } while ($prev.length && !$prev.is('input'));
            if ($prev.length) {
                $prev.focus();
                return true;
            } else {
                return false;
            }
        },

        getContentHtml: function(cellData) {
            var list = this._getOptionList(cellData),
                len = list.length,
                columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
                value = cellData.value,
                checkedList = ('' + value).split(','),
                html = '',
                name = Util.getUniqueKey(),
                isDisabled = cellData.isDisabled,
                id;

            for (var i = 0; i < len; i++) {
                id = name + '_' + list[i].value;
                html += this.template.input({
                    type: columnModel.editOption.type,
                    name: name,
                    id: id,
                    value: list[i].value,
                    checked: $.inArray('' + list[i].value, checkedList) === -1 ? '' : 'checked',
                    disabled: isDisabled ? 'disabled' : ''
                });
                if (list[i].text) {
                    html += this.template.label({
                        id: id,
                        text: list[i].text
                    });
                }
            }

            return html;
        },

        setElementAttribute: function(cellData, $td) {
            //TODO
            var value = cellData.value,
                checkedList = ('' + value).split(','),
                len = checkedList.length,
                i;
            $td.find('input:checked').prop('checked', false);
            for (i = 0; i < len; i++) {
                $td.find('input[value="' + checkedList[i] + '"]').prop('checked', true);
            }
        },
        _getCheckedList: function($target) {
            var $checkedList = $target.closest('td').find('input:checked'),
                checkedList = [];

            for (var i = 0; i < $checkedList.length; i++) {
                checkedList.push($checkedList.eq(i).val());
            }

            return checkedList;
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target);
            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, this._getCheckedList($target).join(','));
        }

    });
