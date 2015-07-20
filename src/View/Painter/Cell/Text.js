/**
 * @fileoverview Text 편집 가능한 Cell Painter
 * @author NHN Ent. FE Development Team
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
        'blur input': '_onBlur',
        'keydown input': '_onKeyDown',
        'focus input': '_onFocus',
        'selectstart input': '_onSelectStart'
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
                this.focusOut(param.$target.closest('td'));
            },
            'ESC': function(keyDownEvent, param) {
                this._restore(param.$target);
                this.focusOut(param.$target.closest('td'));
            }
        });
    },
    template: _.template('<input type="<%=type%>" value="<%=value%>" name="<%=name%>" align="center" <%=disabled%> maxLength="<%=maxLength%>"/>'),
    /**
     * input type 을 반환한다.
     * @return {string} input 타입
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
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    /* istanbul ignore next: focus, select 를 검증할 수 없음 */
    focusIn: function($td) {
        var $input = $td.find('input');
        if ($input.prop('disabled')) {
            this.grid.focusClipboard();
        } else {
            Util.form.setCursorToEnd($input.get(0));
            $input.focus().select();
        }
    },
    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusOut: function() {
        this.grid.focusClipboard();
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
        //@fixme: defaultValue 옵션값 처리 (cellData.value 를 참조하도록)
        var columnModel = this.getColumnModel(cellData),
            editOption = columnModel.editOption,
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
            html;

        if (ne.util.isFunction(editOption.converter)) {
            html = editOption.converter(value, this.grid.dataModel.get(cellData.rowKey).attributes);
        }
        if (ne.util.isFalsy(html)) {
            html = '<input type="' + this._getInputType() +
                '" value="' + value +
                '" name="' + Util.getUniqueKey() +
                '" align="center"' +
                ' maxLength="' + editOption.maxLength +
                (cellData.isDisabled ? ' disabled' : '') +
                '"/>';
        }
        return html;
    },
    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     */
    setElementAttribute: function(cellData, $td) {
        var isValueChanged = $.inArray('value', cellData.changed) !== -1,
            $input = $td.find('input');

        if (isValueChanged) {
            $input.val(cellData.value);
        }
        $input.prop('disabled', cellData.isDisabled);
    },
    /**
     * 원래 text 와 비교하여 값이 변경 되었는지 여부를 판단한다.
     * @param {jQuery} $input   인풋 jquery 엘리먼트
     * @return {Boolean}    값의 변경여부
     * @private
     */
    _isEdited: function($input) {
        return $input.val() !== this.originalText;
    },
    /**
     * 원래 text로 값을 되돌린다.
     * @param {jQuery} $input 인풋 jquery 엘리먼트
     * @private
     */
    _restore: function($input) {
        $input.val(this.originalText);
    },
    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (Input의 width를 beforeText와 afterText의 유무에 관계없이 100%로 유지하기 위해 마크업이 달라져야 하기 때문에
     * View.Base.Painter.Cell로부터 override 해서 구현함)
     * @param {object} cellData Model 의 셀 데이터
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var columnName = cellData.columnName,
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            editOption = columnModel.editOption || {},
            content = '',
            beforeContent, afterContent;

        if (!ne.util.isExisty(cellData.value)) {
            cellData.value = columnModel.defaultValue;
        }
        beforeContent = this._getExtraContent(editOption.beforeContent || editOption.beforeText, cellData);
        afterContent = this._getExtraContent(editOption.afterContent || editOption.afterText, cellData);

        if (beforeContent) {
            content += this._getSpanWrapContent(beforeContent, 'before', cellData);
        }
        if (afterContent) {
            content += this._getSpanWrapContent(afterContent, 'after', cellData);
        }
        content += this._getSpanWrapContent(this.getContentHtml(cellData), 'input');

        return content;
    },
    /**
     * 주어진 문자열을 span 태그로 감싼 HTML 코드를 반환한다.
     * @param {string} content - 감싸질 문자열
     * @param {string} className - span 태그의 클래스명
     * @return {string} span 태그로 감싼 HTML 코드
     */
    _getSpanWrapContent: function(content, className) {
        if (ne.util.isFalsy(content)) {
            content = '';
        }
        return '<span class="' + className + '">' + content + '</span>';
    },

    _getExtraContent: function(content, cellData) {
        var contentValue = content;

        if (ne.util.isFunction(content)) {
            contentValue = this._getExtraContentByFunction(content, cellData);
        }
        return contentValue;
    },

    /**
     *
     */
    _getExtraContentByFunction: function(fnContent, cellData) {
        var dataModel = this.grid.dataModel,
            row = dataModel.get(cellData.rowKey),
            cellValue = row.getHTMLEncodedString(cellData.columnName);

        return fnContent(cellValue, row.attributes);
    },

    /**
     * blur 이벤트 핸들러
     * @param {event} blurEvent 이벤트 객체
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
     * focus 이벤트 핸들러
     * @param {Event} focusEvent 이벤트 객체
     * @private
     */
    _onFocus: function(focusEvent) {
        var $input = $(focusEvent.target);
        this.originalText = $input.val();
        this.grid.selection.disable();
    },
    /**
     * selectstart 이벤트 핸들러
     * IE에서 selectstart 이벤트가 Input 요소에 까지 적용되어 값에 셀렉션 지정이 안되는 문제를 해결
     * @param {Event} event 이벤트 객체
     */
    _onSelectStart: function(event) {
        event.stopPropagation();
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
     * @return {string} input 타입
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
 * input 이 존재하지 않는 text 셀에서 편집시 input 이 존재하는 셀로 변환이 가능한 cell renderer
 * @extends {View.Base.Painter.Cell.Text}
 * @implements {View.Base.Painter.Cell.Interface}
 * @constructor View.Painter.Cell.Text.Convertible
 */
View.Painter.Cell.Text.Convertible = View.Painter.Cell.Text.extend(/**@lends View.Painter.Cell.Text.Convertible.prototype */{
    /**
     * 더블클릭으로 간주할 time millisecond 설정
     * @type {number}
     */
    doubleClickDuration: 800,
    redrawAttributes: ['isDisabled', 'isEditable', 'value'],
    eventHandler: {
        'click': '_onClick',
        'mousedown': '_onMouseDown',
        'blur input': '_onBlurConvertible',
        'keydown input': '_onKeyDown',
        'focus input': '_onFocus',
        'selectstart input': '_onSelectStart'
    },
    /**
     * 생성자 함수
     */
    initialize: function() {
        View.Painter.Cell.Text.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            timeoutIdForClick: 0,
            editingCell: {
                rowKey: null,
                columnName: ''
            },
            clicked: {
                rowKey: null,
                columnName: null
            }
        });
        this.off('resize');
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
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        this._startEdit($td);
    },
    /**
     * focus in 상태에서 키보드 esc 를 입력했을 때 편집모드를 벗어난다. cell 내 input 을 blur 시키고, 편집모드를 벗어나는 로직.
     * - 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusOut: function($td) {
        //$td.find('input').blur();
        this.grid.focusClipboard();
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
        //@fixme: defaultValue 옵션값 처리 (cellData.value 를 참조하도록)
        var columnModel = this.getColumnModel(cellData),
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName),
            htmlArr = [];

        if (!this._isEditingCell(cellData)) {
            if (ne.util.isFunction(columnModel.formatter)) {
                value = columnModel.formatter(value, this.grid.dataModel.get(cellData.rowKey).attributes, columnModel);
            }
            return value;
        } else {
            htmlArr.push('<span class="input">');
            htmlArr.push('<input type="');
            htmlArr.push(this._getInputType());
            htmlArr.push('" value="');
            htmlArr.push(value);
            htmlArr.push('" name="');
            htmlArr.push(Util.getUniqueKey());
            htmlArr.push('" align="center" ');
            htmlArr.push(cellData.isDisabled ? 'disabled' : '');
            htmlArr.push(' maxLength="');
            htmlArr.push(columnModel.editOption.maxLength);
            htmlArr.push('"/>');
            htmlArr.push('</span>');

            return htmlArr.join('');
        }
    },

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * (상태에 따라 Text나 Base의 함수를 선택해서 사용해야 하기 때문에, 추가로 override 해서 prototype을 이용해 실행)
     * @param {object} cellData Model의 셀 데이터
     * @return {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var targetProto;

        if (this._isEditingCell(cellData)) {
            targetProto = View.Painter.Cell.Text.prototype;
        } else {
            targetProto = View.Base.Painter.Cell.prototype;
        }

        return targetProto._getContentHtml.call(this, cellData);
    },
    /**
     * 현재 편집중인 셀인지 여부를 반환한다.
     * @param {object} cellData Model의 셀 데이터
     * @return {boolean} - 편집중이면 true, 아니면 false
     * @private
     */
    _isEditingCell: function(cellData) {
        var editingCell = this.editingCell;
        return !!(editingCell.rowKey === cellData.rowKey.toString() && editingCell.columnName === cellData.columnName.toString());
    },
    /**
     * model의 redrawAttributes 에 해당하지 않는 프로퍼티의 변화가 발생했을 때 수행할 메서드
     * redrawAttributes 에 해당하지 않는 프로퍼티가 변경되었을 때 수행할 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @param {jquery} $td 해당 cell 엘리먼트
     * @param {Boolean} hasFocusedElement 해당 셀에 실제 focus 된 엘리먼트가 존재하는지 여부
     */
    setElementAttribute: function(cellData, $td, hasFocusedElement) {},
    /**
     * blur 이벤트 핸들러
     * @param {event} blurEvent 이벤트 객체
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
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @private
     */
    _startEdit: function($td) {
        var $input,
            rowKey = this.getRowKey($td),
            columnName = this.getColumnName($td),
            cellState = this.grid.dataModel.get(rowKey).getCellState(columnName);

        this.editingCell = {
            rowKey: rowKey,
            columnName: columnName
        };

        if (cellState.isEditable && !cellState.isDisabled) {
            this.redraw(this._getCellData($td), $td);
            $input = $td.find('input');
            this.originalText = $input.val();
            Util.form.setCursorToEnd($input.get(0));
            $input.focus().select();
        }
    },
    /**
     * textbox를  text로 교체한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @private
     */
    _endEdit: function($td) {
        var cellData = this._getCellData($td);
        this.editingCell = {
            rowKey: null,
            columnName: ''
        };
        this.clicked = {
            rowKey: null,
            columnName: null
        };
        if (cellData) {
            this.redraw(this._getCellData($td), $td);
        }
    },
    /**
     * click 이벤트 핸들러
     * @param {event} clickEvent 이벤트 객체
     * @private
     */
    _onClick: function(clickEvent) {
        var that = this,
            $target = $(clickEvent.target),
            $td = $target.closest('td'),
            address = this._getCellAddress($td);

        if (this._isEditingCell(address)) {
            return;
        }
        if (this._isClickedCell($td)) {
            this._startEdit($td);
        } else {
            clearTimeout(this.timeoutIdForClick);
            this.clicked = address;
            this.timeoutIdForClick = setTimeout(function() {
                that.clicked = {
                    rowKey: null,
                    columnName: null
                };
            }, this.doubleClickDuration);
        }
    },
    /**
     * mousedown 이벤트 핸들러.
     * Core의 onMouseDown에서 focusClipboard를 호출하여 input에서 의도하지 않은 blur 이벤트가 발생하는 것을
     * 방지하기 위해 이벤트 버블링을 멈춘다.
     * @param {MouseEvent} event 마우스 이벤트 객체
     * @private
     */
    _onMouseDown: function(event) {
        if ($(event.target).is('input')) {
            event.stopPropagation();
        }
    },
    _isClickedCell: function($td) {
        var address = this._getCellAddress($td);
        return !!(this.clicked.rowKey === address.rowKey && this.clicked.columnName === address.columnName);
    }
});
