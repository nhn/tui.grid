/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * Cell Painter Base
     * @extends {View.Base.Painter}
     * @constructor View.Base.Painter.Cell
     */
    View.Base.Painter.Cell = View.Base.Painter.extend(/**@lends View.Base.Painter.Cell.prototype*/{
        /**
         * model 의 변화가 발생했을 때, td 를 다시 rendering 해야하는 대상 프로퍼티 목록. 필요에 따라 확장 시 재정의 한다.
         */
        redrawAttributes: ['isEditable', 'optionList', 'value'],

        /**
         * keyDownEvent 발생시 기본 동작 switch
         */
        _defaultKeyDownSwitch: {
            'ESC': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'ENTER': function(keyDownEvent, param) {
                this.focusOut(param.$target);
            },
            'TAB': function(keyDownEvent, param) {
//                this.grid.focusClipboard();
                if (keyDownEvent.shiftKey) {
                    //이전 cell 로 focus 이동 후 편집모드로 전환
                    this.grid.focusIn(param.rowKey, param.focusModel.prevColumnName(), true);
                } else {
                    //이후 cell 로 focus 이동 후 편집모드로 전환
                    this.grid.focusIn(param.rowKey, param.focusModel.nextColumnName(), true);
                }
            },
            'defaultAction': function(keyDownEvent, param) {
            }
        },
        /**
         * event handler
         */
        eventHandler: {},
        /**
         * 초기화 함수
         * @param  {Object} attributes
         * @param {Object} options
         */
        initialize: function(attributes, options) {
            View.Base.Painter.prototype.initialize.apply(this, arguments);
            this.initializeEventHandler();
            this.setOwnProperties({
                _keyDownSwitch: $.extend({}, this._defaultKeyDownSwitch)
            });
        },
        /**
         * td 마크업 생성시 필요한 base template
         */
        baseTemplate: _.template('<td' +
            ' columnName="<%=columnName%>"' +
            ' <%=rowSpan%>' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            ' data-edit-type="<%=editType%>"' +
            '>' +
            '<%=content%>' +
            '</td>'),

        /**
         * RowPainter 에서 Render model 변경 감지 시 RowPainter 에서 호출하는 onChange 핸들러
         * @param {object} cellData
         * @param {jQuery} $tr
         */
        onModelChange: function(cellData, $tr) {
            var $td = $tr.find('td[columnname="' + cellData.columnName + '"]'),
                isRedraw = false,
                hasFocusedElement;

            ne.util.forEachArray(this.redrawAttributes, function(attribute) {
                if ($.inArray(attribute, cellData.changed) !== -1) {
                    isRedraw = true;
                    return false;
                }
            }, this);

            $td.attr('class', this._getClassNameList(cellData).join(' '));
            hasFocusedElement = !!($td.find(':focus').length);

            if (isRedraw === true) {
                this.redraw(cellData, $td, hasFocusedElement);
                if (hasFocusedElement) {
                    this.focusIn($td);
                }
            } else {
                this.setElementAttribute(cellData, $td, hasFocusedElement);
            }
        },
        /**
         * 이미 rendering 되어있는 TD 엘리먼트 전체를 다시 랜더링 한다.
         * @param {object} cellData
         * @param {jQuery} $td
         * @param {Boolean} [hasFocusedElement]
         */
        redraw: function(cellData, $td, hasFocusedElement) {
            this.detachHandler($td);
            var attributes = {
                'class': this._getClassNameList(cellData).join(' ')
            };
            if (cellData.rowSpan) {
                attributes['rowSpan'] = cellData.rowSpan;
            }
            attributes = $.extend(attributes, this.getAttributes(cellData));
            $td.attr(attributes);
            $td.data('edit-type', this.getEditType()).html(this.getContentHtml(cellData));
            this.attachHandler($td);
        },
        /**
         * keyDown 이 발생했을 때, switch object 에서 필요한 공통 파라미터를 생성한다.
         * @param {Event} keyDownEvent
         * @return {{keyDownEvent: *, $target: (*|jQuery|HTMLElement), focusModel: (grid.focusModel|*), rowKey: *, columnName: *, keyName: *}}
         * @private
         */
        _getParamForKeyDownSwitch: function(keyDownEvent) {
            var grid = this.grid,
                keyCode = keyDownEvent.keyCode || keyDownEvent.which,
                focused = grid.focusModel.which(),
                rowKey = focused.rowKey,
                columnName = focused.columnName;
            return {
                keyDownEvent: keyDownEvent,
                $target: $(keyDownEvent.target),
                focusModel: grid.focusModel,
                rowKey: rowKey,
                columnName: columnName,
                keyName: grid.keyName[keyCode]
            };
        },
        /**
         * keyDownSwitch 를 수행한다.
         * @param {Event} keyDownEvent
         * @return {boolean} 정의된 keyDownSwitch 가 존재하는지 여부. Default 액션을 수행한 경우 false 를 반환한다.
         * @private
         */
        _executeKeyDownSwitch: function(keyDownEvent) {
            var keyCode = keyDownEvent.keyCode || keyDownEvent.which,
                keyName = this.grid.keyName[keyCode],
                param = this._getParamForKeyDownSwitch(keyDownEvent);
            (this._keyDownSwitch[keyName] || this._keyDownSwitch['defaultAction']).call(this, keyDownEvent, param);
            return !!this._keyDownSwitch[keyName];
        },
        /**
         * keyDownSwitch 에 정의된 액션을 override 한다.
         *
         * @param {(String|Object)} keyName  정의된 key 이름. Object 형태일 경우 기존 keyDownSwitch 를 확장한다.
         * @param {function} [fn] keyDown 이 발생하였을 경우 수행할 액션
         */
        setKeyDownSwitch: function(keyName, fn) {
            if (typeof keyName === 'object') {
                this._keyDownSwitch = $.extend(this._keyDownSwitch, keyName);
            } else {
                this._keyDownSwitch[keyName] = fn;
            }
        },

        /**
         * keyDown 이벤트 핸들러
         * @param {event} keyDownEvent
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            //todo: cell 종류에 따라 해당 input 에 keydown event handler 를 추가하여 구현한다.
            if (this._executeKeyDownSwitch(keyDownEvent)) {
                keyDownEvent.preventDefault();
            }
        },
        /**
         * cellData 정보에서 className 을 추출한다.
         * @param {Object} cellData
         * @return {Array}
         * @private
         */
        _getClassNameList: function(cellData) {
            var focused = this.grid.focusModel.which(),
                columnName = cellData.columnName,
                focusedRowKey = this.grid.dataModel.getMainRowKey(focused.rowKey, columnName),
                classNameList = [],
                classNameMap = {},
                privateColumnList = ['_button', '_number'],
                isPrivateColumnName = $.inArray(columnName, privateColumnList) !== -1;

            if (focusedRowKey === cellData.rowKey) {
                classNameList.push('selected');
                if (focused.columnName === columnName) {
                    classNameList.push('focused');
                }
            }

            cellData.className ? classNameList.push(cellData.className) : null;
            cellData.isEditable ? !isPrivateColumnName && classNameList.push('editable') : null;
            cellData.isDisabled ? classNameList.push('disabled') : null;

            //className 중복제거
            _.each(classNameList, function(className) {
                classNameMap[className] = true;
            });

            classNameList = [];

            _.each(classNameMap, function(val, className) {
                classNameList.push(className);
            });

            return classNameList;
        },
        /**
         * Row Painter 에서 한번에 table 을 랜더링 할 때 사용하기 위해
         * td 단위의 html 문자열을 반환한다.
         * @param {object} cellData
         * @return {string}
         */
        getHtml: function(cellData) {
            var attributeString = Util.getAttributesString(this.getAttributes(cellData));
            return this.baseTemplate({
                columnName: cellData.columnName,
                rowSpan: cellData.rowSpan ? 'rowSpan="' + cellData.rowSpan + '"' : '',
                className: this._getClassNameList(cellData).join(' '),
                attributes: attributeString,
                editType: this.getEditType(),
                content: this.getContentHtml(cellData)
            });
        },
        /**
         * 인자로 받은 element 의 cellData 를 반환한다.
         * @param {jQuery} $target
         * @return {Object}
         * @private
         */
        _getCellData: function($target) {
            return this.grid.renderModel.getCellData(this.getRowKey($target), this.getColumnName($target));
        },
        /**
         * 인자로 받은 element 로 부터 rowKey 와 columnName 을 반환한다.
         * @param {jQuery} $target
         * @return {{rowKey: String, columnName: String}}
         * @private
         */
        _getCellAddress: function($target) {
            return {
                rowKey: this.getRowKey($target),
                columnName: this.getColumnName($target)
            };
        },
        /**
         * 인자로 받은 element 로 부터 columnName 을 반환한다.
         * @param {jQuery} $target
         * @return {String}
         */
        getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        /**
         * 인자로 받은 element 로 부터 rowKey 를 반환한다.
         * @param {jQuery} $target
         * @return {String}
         */
        getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },

        /**
         * getHtml 으로 마크업 생성시 td에 포함될 attribute 문자열을 반환한다.
         * 필요에 따라 Override 한다.
         * @param {Object} cellData
         * @return {Object} Attribute Object
         */
        getAttributes: function(cellData) {
            return {};
        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * - 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-convertible'
         */
        getEditType: function() {
            return 'normal';
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td
         */
        focusIn: function($td) {},
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
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
            return '';
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData
         * @param {jquery} $td
         * @param {Boolean} hasFocusedElement
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {}

    });


    /**
     * Cell Painter 추가 시 반드시 필요한 Interface 정의
     * @interface
     */
    View.Base.Painter.Cell.Interface = function() {};
    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-convertible'
     */
    View.Base.Painter.Cell.Interface.prototype.getEditType = function() {};
    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td
     */
    View.Base.Painter.Cell.Interface.prototype.focusIn = function($td) {};
    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     * @param {jQuery} $td
     */
//    View.Base.Painter.Cell.Interface.prototype.focusOut = function($td) {};
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
    View.Base.Painter.Cell.Interface.prototype.getContentHtml = function(cellData) {};
    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData
     * @param {jQuery} $td
     * @param {Boolean} hasFocusedElement
     */
    View.Base.Painter.Cell.Interface.prototype.setElementAttribute = function(cellData, $td, hasFocusedElement) {};

