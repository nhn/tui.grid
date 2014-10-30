    /**
     *  editOption 에 list 를 가지고 있는 형태의 추상 클래스
     * @type {*|void}
     */
    View.Renderer.Cell.List = View.Base.Renderer.Cell.Abstract.extend({
        rerenderAttributes: ['isEditable', 'optionList'],
        eventHandler: {
        },
        initialize: function() {
            View.Base.Renderer.Cell.Abstract.prototype.initialize.apply(this, arguments);
        },
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
     * editType select
     * @type {*|void}
     */
    View.Renderer.Cell.List.Select = View.Renderer.Cell.List.extend({
        cellType: 'select',
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
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
        getContentHtml: function(cellData, $td, hasFocusedElement) {
            console.log('!!!!getContentHtml', cellData.optionList);
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
            console.log('!!!!setElementAttribute', cellData.optionList);
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
     * editType = radio || checkbox
     * @type {*|void}
     */
    View.Renderer.Cell.List.Button = View.Renderer.Cell.List.extend({
        cellType: 'button',
        initialize: function(attributes) {
            View.Renderer.Cell.List.prototype.initialize.apply(this, arguments);
        },
        eventHandler: {
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        template: {
            input: _.template('<input type="<%=type%>" name="<%=name%>" id="<%=id%>" value="<%=value%>" <%=checked%> <%=disabled%> />'),
            label: _.template('<label for="<%=id%>" style="margin-right:10px"><%=text%></label>')
        },
        focusIn: function($td) {
            //todo: cell 에서 키보드 enter 를 입력했을 때 cell 내 input 에 focus 를 수행하는 로직을 구현한다.
            $td.find('input').eq(0).focus();
        },
        _getNextInput: function($currentInput) {
            var $next = $currentInput;
            do{
                $next = $next.next();
            } while ($next.length && !$next.is('input'));
            return $next;
        },
        _getPrevInput: function($currentInput) {
            var $prev = $currentInput;
            do{
                $prev = $prev.prev();
            } while ($prev.length && !$prev.is('input'));
            return $prev;
        },
        /**
         *
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            //todo: cell 종류에 따라 해당 input 에 keydown event handler 를 추가하여 구현한다.
            var $target = $(keyDownEvent.target),
                $next, $prev,
                grid = this.grid,
                keyMap = grid.keyMap,
                isKeyIdentified = true,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which;

            switch (keyCode) {
                case keyMap['UP_ARROW']:

                    break;
                case keyMap['DOWN_ARROW']:

                    break;
                case keyMap['LEFT_ARROW']:
                    $prev = this._getPrevInput($target);
                    $prev.length ? $prev.focus() : null;
                    break;
                case keyMap['RIGHT_ARROW']:
                    $next = this._getNextInput($target);
                    $next.length ? $next.focus() : null;
                    break;
                case keyMap['ESC']:
                    this.focusOut($target);
                    break;
                case keyMap['ENTER']:
                    $target.trigger('click');
                    break;
                case keyMap['TAB']:
                    if (keyDownEvent.shiftKey) {
                        //이전 cell 로 focus 이동 후 편집모드로 전환
                    } else {
                        //이후 cell 로 focus 이동 후 편집모드로 전환
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
        _getEditType: function($target) {
            var columnName = this._getColumnName($target),
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                type = columnModel.editOption.type;

            return type;
        },
        _getCheckedList: function($target) {
            var $checkedList = $target.closest('td').find('input[type=' + this._getEditType($target) + ']:checked'),
                checkedList = [];

            for (var i = 0; i < $checkedList.length; i++) {
                checkedList.push($checkedList.eq(i).val());
            }

            return checkedList;
        },
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                cellAddr = this._getCellAddress($target);
            console.log('button _onChange', this._getCheckedList($target).join(','));
            this.grid.setValue(cellAddr.rowKey, cellAddr.columnName, this._getCheckedList($target).join(','));
        }

    });
