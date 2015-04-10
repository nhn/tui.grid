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
         * 생성자 함수
         */
        initialize: function() {
            View.Base.Painter.prototype.initialize.apply(this, arguments);
            this.initializeEventHandler();
            this.setOwnProperties({
                _keyDownSwitch: $.extend({}, this._defaultKeyDownSwitch)
            });
        },

        /**
         * RowPainter 에서 Render model 변경 감지 시 RowPainter 에서 호출하는 onChange 핸들러
         * @param {object} cellData Model 의 셀 데이터
         * @param {jQuery} $tr  tr 에 해당하는 jquery 로 감싼 html 엘리먼트
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
            try {
                /*
                IE 7, 8 에서 $td.find(':focus') 호출시 unexpected error 발생하는 경우가 발생하여 try/catch 함.
                 */
                hasFocusedElement = !!($td.find(':focus').length);
            } catch (e) {
                hasFocusedElement = false;
            }

            if (isRedraw) {
                this.redraw(cellData, $td, hasFocusedElement);
                if (hasFocusedElement) {
                    this.focusIn($td);
                }
            } else {
                this.setElementAttribute(cellData, $td, hasFocusedElement);
            }
        },
        /**
         * keyDown 이 발생했을 때, switch object 에서 필요한 공통 파라미터를 생성한다.
         * @param {Event} keyDownEvent  이벤트 객체
         * @return {{keyDownEvent: *, $target: (*|jQuery|HTMLElement), focusModel: (grid.focusModel|*), rowKey: *, columnName: *, keyName: *}}
         * _keyDownSwitch 에서 사용될 공통 파라미터 객체
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
         * @param {Event} keyDownEvent 이벤트 객체
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
         * @param {event} keyDownEvent  이벤트 객체
         * @private
         */
        _onKeyDown: function(keyDownEvent) {
            if (this._executeKeyDownSwitch(keyDownEvent)) {
                keyDownEvent.preventDefault();
            }
        },
        /**
         * cellData에 설정된 데이터를 기반으로 classNameList 를 생성하여 반환한다.
         * @param {Object} cellData Model 의 셀 데이터
         * @return {Array} 생성된 css 디자인 클래스 배열
         * @private
         */
        _getClassNameList: function(cellData) {
            var focused = this.grid.focusModel.which(),
                columnName = cellData.columnName,
                focusedRowKey = this.grid.dataModel.getMainRowKey(focused.rowKey, columnName),
                classNameList = [],
                classNameMap = {},
                privateColumnMap = {
                    '_button': true,
                    '_number': true
                },
                isPrivateColumnName = !!privateColumnMap[columnName];

            if (focusedRowKey === cellData.rowKey) {
                classNameMap['selected'] = true;
                if (focused.columnName === columnName) {
                    classNameMap['focused'] = true;
                }
            }
            if (cellData.className) {
                classNameMap[cellData.className] = true;
            }

            if (cellData.isEditable && !isPrivateColumnName) {
                classNameMap['editable'] = true;
            }

            if (cellData.isDisabled) {
                classNameMap['disabled'] = true;
            }

            ne.util.forEach(classNameMap, function(val, className) {
                classNameList.push(className);
            });

            return classNameList;
        },
        /**
         * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
         * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
         * @param {object} cellData Model 의 셀 데이터
         * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
         * @private
         */
        _getContentHtml: function(cellData) {
            var columnName = cellData.columnName,
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                editOption = columnModel.editOption,
                content;

            //if (!ne.util.isNumber(cellData.value) && !cellData.value) {
            if (!ne.util.isExisty(cellData.value)) {
                cellData.value = columnModel.defaultValue;
            }

            content = this.getContentHtml(cellData);
            if (editOption) {
                if (editOption.beforeText) {
                    content = columnModel.editOption.beforeText + content;
                }
                if (editOption.afterText) {
                    content = content + columnModel.editOption.afterText;
                }
            }
            return content;
        },
        /**
         * Row Painter 에서 한번에 table 을 랜더링 할 때 사용하기 위해
         * td 단위의 html 문자열을 반환한다.
         * @param {object} cellData Model 의 셀 데이터
         * @return {string} td 마크업 문자열
         */
        getHtml: function(cellData) {
            var attributeString = Util.getAttributesString(this.getAttributes(cellData)),
                htmlArr = [];

            htmlArr.push('<td');
            htmlArr.push(' columnName="');
            htmlArr.push(cellData.columnName);
            htmlArr.push('" ');
            htmlArr.push(cellData.rowSpan ? 'rowSpan="' + cellData.rowSpan + '"' : '');
            htmlArr.push(' class="');
            htmlArr.push(this._getClassNameList(cellData).join(' '));
            htmlArr.push('" ');
            htmlArr.push(attributeString);
            htmlArr.push(' edit-type="');
            htmlArr.push(this.getEditType());
            htmlArr.push('">');
            htmlArr.push(this._getContentHtml(cellData));
            htmlArr.push('</td>');
            return htmlArr.join('');
        },
        /**
         * 이미 rendering 되어있는 TD 엘리먼트 전체를 다시 랜더링 한다.
         * @param {object} cellData Model 의 셀 데이터
         * @param {jQuery} $td  td 에 해당하는 jquery 로 감싼 html 엘리먼트
         */
        redraw: function(cellData, $td) {
            this.detachHandler($td);
            var attributes = {
                'class': this._getClassNameList(cellData).join(' ')
            };
            if (cellData.rowSpan) {
                attributes['rowSpan'] = cellData.rowSpan;
            }
            attributes['edit-type'] = this.getEditType();
            attributes = $.extend(attributes, this.getAttributes(cellData));
            $td.attr(attributes);
            $td.html(this._getContentHtml(cellData));
            this.attachHandler($td);
        },
        /**
         * 인자로 받은 element 의 cellData 를 반환한다.
         * @param {jQuery} $target  조회할 엘리먼트
         * @return {Object} 조회한 cellData 정보
         * @private
         */
        _getCellData: function($target) {
            var cellData = this._getCellAddress($target);
            return this.grid.renderModel.getCellData(cellData.rowKey, cellData.columnName);
        },
        /**
         * 인자로 받은 element 로 부터 rowKey 와 columnName 을 반환한다.
         * @param {jQuery} $target 조회할 엘리먼트
         * @return {{rowKey: String, columnName: String}} rowKey 와 columnName 정보
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
         * @param {jQuery} $target 조회할 엘리먼트
         * @return {String} 컬럼명
         */
        getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        /**
         * 인자로 받은 element 로 부터 rowKey 를 반환한다.
         * @param {jQuery} $target 조회할 엘리먼트
         * @return {String} 행의 키값
         */
        getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },
        /**
         * columnModel 을 반환한다.
         * @param {object} cellData Model 의 셀 데이터
         * @return {*|Object} 컬럼모델
         */
        getColumnModel: function(cellData) {
            return this.grid.columnModel.getColumnModel(cellData.columnName);
        },
        /**
         * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
         * @param {Object} cellData Model 의 셀 데이터
         * @return {Object} td 에 지정할 attribute 데이터
         */
        getAttributes: function(cellData) {
            var columnModel = this.getColumnModel(cellData);
            return {
                align: columnModel.align || 'left'
            };
        },
        /**
         * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
         * - 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusOut: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * - 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return 'normal';
        },
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {},
        /**
         * !상속받은 클래스는 이 메서드를 반드시 구현해야한다.
         * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
         * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @return  {string} html 마크업 문자열
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
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focuse 된 엘리먼트가 존재하는지 여부
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
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    View.Base.Painter.Cell.Interface.prototype.getEditType = function() {};
    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    View.Base.Painter.Cell.Interface.prototype.focusIn = function($td) {};
    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
//    View.Base.Painter.Cell.Interface.prototype.focusOut = function($td) {};
    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @return  {string} html 마크업 문자열
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
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    View.Base.Painter.Cell.Interface.prototype.setElementAttribute = function(cellData, $td, hasFocusedElement) {};

