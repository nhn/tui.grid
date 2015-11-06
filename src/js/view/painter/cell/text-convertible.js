/**
 * @fileoverview Painter class for the text-convertible cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');
var Text = require('./text');
var util = require('../../../util');

/**
 * input 이 존재하지 않는 text 셀에서 편집시 input 이 존재하는 셀로 변환이 가능한 cell renderer
 * @module view/painter/cell/text-convertible
 */
var Convertible = tui.util.defineClass(Text,/**@lends module:view/painter/cell/text-convertible.prototype */{
    /**
     * @constructs
     * @extends module:view/painter/cell/text
     */
    init: function() {
        Text.apply(this, arguments);
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
    },

    redrawAttributes: ['isDisabled', 'isEditable', 'value'],

    eventHandler: {
        'dblclick': '_onDblClick',
        'mousedown': '_onMouseDown',
        'blur input': '_onBlurConvertible',
        'keydown input': '_onKeyDown',
        'focus input': '_onFocus',
        'selectstart input': '_onSelectStart'
    },

    /**
     * Content markup template
     * @return {string} html
     */
    contentTemplate: _.template(
        '<span class="input">' +
        '<input' +
        ' type="<%=type%>"' +
        ' value="<%=value%>"' +
        ' name="<%=name%>"' +
        ' align="center"' +
        ' maxLength="<%=maxLength%>"' +
        ' <% if (isDisabled) print("disabled") %>' +
        '/>' +
        '</span>'
    ),

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
        // FIXME: defaultValue 옵션값 처리 (cellData.value 를 참조하도록)
        var columnModel = this.getColumnModel(cellData),
            value = this.grid.dataModel.get(cellData.rowKey).getHTMLEncodedString(cellData.columnName);

        if (tui.util.isUndefined(value)) {
            value = '';
        }

        if (!this._isEditingCell(cellData)) {
            if (tui.util.isFunction(columnModel.formatter)) {
                value = columnModel.formatter(value, this.grid.dataModel.get(cellData.rowKey).attributes, columnModel);
            }
            return value;
        }

        return this.contentTemplate({
            type: this._getInputType(),
            value: value,
            name: util.getUniqueKey(),
            isDisabled: cellData.isDisabled,
            maxLength: columnModel.editOption.maxLength
        });
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
            targetProto = Text.prototype;
        } else {
            targetProto = Cell.prototype;
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
    setElementAttribute: function(cellData, $td, hasFocusedElement) {}, // eslint-disable-line no-unused-vars

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
        var $input, rowKey, columnName, cellState;

        this._blurEditingCell();

        rowKey = this.getRowKey($td);
        columnName = this.getColumnName($td);
        cellState = this.grid.dataModel.get(rowKey).getCellState(columnName);

        if (cellState.isEditable && !cellState.isDisabled) {
            this.editingCell = {
                rowKey: rowKey,
                columnName: columnName
            };

            this.redraw(this._getCellData($td), $td);
            $input = $td.find('input');
            this.originalText = $input.val();
            util.form.setCursorToEnd($input.get(0));
            $input.select();
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
            columnName: null
        };
        this.clicked = {
            rowKey: null,
            columnName: null
        };
        if (cellData) {
            this.redraw(cellData, $td);
        }
    },

    /**
     * Trigger blur event on editing cell if exist
     * @private
     */
    _blurEditingCell: function() {
        var rowKey = this.editingCell.rowKey,
            columnName = this.editingCell.columnName,
            $td;

        if (!tui.util.isNull(rowKey) && !tui.util.isNull(columnName)) {
            $td = this.grid.getElement(rowKey, columnName);
            $td.find('input')[0].blur();
        }
    },

    /**
     * Event Handler for double click event.
     * @param  {MouseEvent} mouseEvent - MouseEvent object
     */
    _onDblClick: function(mouseEvent) {
        var $target = $(mouseEvent.target),
            $td = $target.closest('td'),
            address = this._getCellAddress($td);

        if (!this._isEditingCell(address)) {
            this._startEdit($td);
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
    }
});

module.exports = Convertible;
