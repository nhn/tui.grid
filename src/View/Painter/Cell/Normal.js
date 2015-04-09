/**
 * @fileoverview 기본 Cell (일반, 숫자, 메인 Checkbox) 관련 Painter 정의
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * editOption 이 적용되지 않은 cell 의 Painter
     * @constructor View.Painter.Cell.Normal
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     */
    View.Painter.Cell.Normal = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.Normal.prototype */{
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|select|button|text|text-convertible'
         */
        getEditType: function() {
            return 'normal';
        },
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
        getContentHtml: function(cellData) {
            var columnName = cellData.columnName,
                columnModel = this.grid.columnModel.getColumnModel(columnName),
                value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(columnName),
                rowKey = cellData.rowKey;
            if (ne.util.isFunction(columnModel.formatter)) {
                value = columnModel.formatter(value, this.grid.dataModel.get(rowKey).attributes, columnModel);
            }
            return value;
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        focusIn: function($td) {
            this.grid.focusClipboard();
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        /* istanbul ignore next */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {}
    });
    /**
     * Number Cell 의 Painter
     * @constructor View.Painter.Cell.Normal.Number
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     */
    View.Painter.Cell.Normal.Number = View.Painter.Cell.Normal.extend(/**@lends View.Painter.Cell.Normal.Number.prototype */{
        redrawAttributes: [],
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Painter.Cell.Normal.prototype.initialize.apply(this, arguments);
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return '_number';
        },
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
        getContentHtml: function(cellData) {
            return cellData.value;
        }
    });
    /**
     * checkbox 혹은 radiobox 형태의 Main Button Painter
     * @constructor View.Painter.Cell.MainButton
     * @extends {View.Base.Painter.Cell}
     * @implements {View.Base.Painter.Cell.Interface}
     */
    View.Painter.Cell.MainButton = View.Base.Painter.Cell.extend(/**@lends View.Painter.Cell.MainButton.prototype */{
        /**
         * rendering 해야하는 cellData 의 변경 목록
         */
        redrawAttributes: ['isDisabled', 'isEditable', 'optionList'],
        eventHandler: {
            'mousedown' : '_onMouseDown',
            'change input' : '_onChange',
            'keydown input' : '_onKeyDown'
        },
        /**
         * 생성자 함수
         */
        initialize: function() {
            View.Base.Painter.Cell.prototype.initialize.apply(this, arguments);
            this.setKeyDownSwitch({
                'UP_ARROW': function() {},
                'DOWN_ARROW': function() {},
                'ENTER': function(keyDownEvent, param) {
                    this.focusOut(param.$target);
                },
                'LEFT_ARROW': function(keyDownEvent, param) {},
                'RIGHT_ARROW': function(keyDownEvent, param) {},
                'ESC': function(keyDownEvent, param) {}
            });
        },
        /**
         * 자기 자신의 인스턴스의 editType 을 반환한다.
         * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
         */
        getEditType: function() {
            return '_button';
        },
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
        getContentHtml: function(cellData) {
            var isDisabled = cellData.isDisabled,
                htmlArr = [];
            htmlArr.push('<input type="');
            htmlArr.push(this.grid.option('selectType'));
            htmlArr.push('" name="');
            htmlArr.push(this.grid.id);
            htmlArr.push('" ');
            htmlArr.push((!!cellData.value) ? 'checked' : '');
            htmlArr.push(isDisabled ? 'disabled' : '');
            htmlArr.push('/>');
            return htmlArr.join('');
        },
        /**
         * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        /* istanbul ignore next */
        focusIn: function($td) {
            //아무것도 안하도록 변경
        },
        /**
         * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
         * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
         * @param {object} cellData 모델의 셀 데이터
         * @param {jquery} $td 해당 cell 엘리먼트
         * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
         */
        setElementAttribute: function(cellData, $td, hasFocusedElement) {
            var $input = $td.find('input'),
                isChecked = $input.prop('checked');
            if (isChecked !== !!cellData.value) {
                $input.prop('checked', cellData.value);
            }
        },
        /**
         * checked 를 toggle 한다.
         * @param {jQuery} $td 해당 cell 엘리먼트
         */
        toggle: function($td) {
            var $input = $td.find('input');
            if (this.grid.option('selectType') === 'checkbox') {
                $input.trigger('click');
            }
        },
        /**
         * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
         * @param {Object} cellData Model 의 셀 데이터
         * @return {Object} td 에 지정할 attribute 데이터
         */
        getAttributes: function(cellData) {
            return {
                align: 'center'
            };
        },
        /**
         * onChange 이벤트 핸들러
         * @param {Event} changeEvent 이벤트 객체
         * @private
         */
        _onChange: function(changeEvent) {
            var $target = $(changeEvent.target),
                rowKey = this.getRowKey($target);
            this.grid.setValue(rowKey, '_button', $target.prop('checked'));
        },
        /**
         * TD 전체 mousedown 이벤트 발생시 checkbox 클릭 이벤트를 발생시킨다.
         * @param {Event} mouseDownEvent 이벤트 객체
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!$target.is('input')) {
                $target.find('input').trigger('click');
            }
        }
    });
