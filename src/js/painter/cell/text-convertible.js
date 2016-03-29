/**
 * @fileoverview Painter class for the text-convertible cell
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Cell = require('../cell');
var TextCell = require('./text');
var util = require('../../common/util');
var formUtil = require('../../common/formUtil');

/**
 * input 이 존재하지 않는 text 셀에서 편집시 input 이 존재하는 셀로 변환이 가능한 cell renderer
 * @module painter/cell/text-convertible
 * @extends module:painter/cell/text
 */
var ConvertibleCell = tui.util.defineClass(TextCell, /**@lends module:painter/cell/text-convertible.prototype */{
    /**
     * @constructs
     */
    init: function() {
        TextCell.apply(this, arguments);
    },

    redrawAttributes: ['isDisabled', 'isEditable', 'value', 'isEditing'],

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
     * @returns {string} html
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
     * @returns {String} editType 'normal|button|select|button|text|text-password|text-convertible'
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
        this.controller.focusClipboard();
    },

    /**
     * Cell data 를 인자로 받아 <td> 안에 들아갈 html string 을 반환한다.
     * redrawAttributes 에 해당하는 프로퍼티가 변경되었을 때 수행될 로직을 구현한다.
     * @param {object} cellData 모델의 셀 데이터
     * @returns {string} html 마크업 문자열
     * @example
     * var html = this.getContentHtml();
     * <select>
     *     <option value='1'>option1</option>
     *     <option value='2'>option1</option>
     *     <option value='3'>option1</option>
     * </select>
     */
    getContentHtml: function(cellData) {
        var columnModel = cellData.columnModel;

        if (!cellData.isEditing) {
            return cellData.formattedValue;
        }

        return this.contentTemplate({
            type: this._getInputType(),
            isEditing: cellData.isEditing,
            value: cellData.value,
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
     * @returns {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     * @override
     */
    _getContentHtml: function(cellData) {
        var targetProto;

        if (cellData.isEditing) {
            targetProto = TextCell.prototype;
        } else {
            targetProto = Cell.prototype;
        }

        return targetProto._getContentHtml.call(this, cellData);
    },

    _afterRedraw: function(cellData, $td) {
        var $input = $td.find('input');

        if ($input.length) {
            this.originalText = $input.val();
            formUtil.setCursorToEnd($input.get(0));
            $input.select();
        }
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
            $td = $target.closest('td'),
            controller = this.controller;

        this._onBlur(blurEvent);
        this._endEdit($td);
        this.controller.validateCell(this.getRowKey($td), this.getColumnName($td));

        setTimeout(function() {
            controller.refreshFocusState();
        }, 0);
    },

    /**
     * text를 textbox 로 교체한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @private
     */
    _startEdit: function() {
        this.controller.startEdit();
    },

    /**
     * textbox를  text로 교체한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     * @private
     */
    _endEdit: function() {
        this.controller.endEdit();
    },

    /**
     * Trigger blur event on editing cell if exist
     * @private
     */
    _blurEditingCell: function() {
        // var rowKey = this.editingCell.rowKey,
        //     columnName = this.editingCell.columnName,
        //     $td;
        //
        // if (!tui.util.isNull(rowKey) && !tui.util.isNull(columnName)) {
        //     $td = this.grid.dataModel.getElement(rowKey, columnName);
        //     $td.find('input')[0].blur();
        // }
    },

    /**
     * Event Handler for double click event.
     * @param  {MouseEvent} mouseEvent - MouseEvent object
     */
    _onDblClick: function(mouseEvent) {
        // var $target = $(mouseEvent.target),
        //     $td = $target.closest('td');
            // targetAddr = this._getCellAddress($td);

        // if (!this._isEditingCell(targetAddr)) {
        // this._startEdit($td);
        // }
        this._startEdit();
    },

    /**
     * mousedown 이벤트 핸들러.
     * containerView의 onMouseDown에서 focusClipboard를 호출하여 input에서 의도하지 않은 blur 이벤트가 발생하는 것을
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

module.exports = ConvertibleCell;
