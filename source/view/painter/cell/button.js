'use strict';

var List = require('./list');
var util = require('../../../util');

/**
 * checkbox, radio button type 의 Cell renderer
 *
 * @extends {View.Painter.Cell.List}
 * @constructor View.Painter.Cell.List.Button
 */
var Button = List.extend(/**@lends ButtonCell.prototype */{
    eventHandler: {
        'change input': '_onChange',
        'keydown input': '_onKeyDown'
    },

    /**
     * 생성자 함수
     */
    initialize: function() {
        List.prototype.initialize.apply(this, arguments);
        this.setKeyDownSwitch({
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

    /**
     * 자기 자신의 인스턴스의 editType 을 반환한다.
     * @return {String} editType 'normal|button|select|button|text|text-password|text-convertible'
     */
    getEditType: function() {
        return 'button';
    },

    /**
     * cell 에서 키보드 enter 를 입력했을 때 편집모드로 전환. cell 내 input 에 focus 를 수행하는 로직. 필요에 따라 override 한다.
     * @param {jQuery} $td 해당 cell 엘리먼트
     */
    focusIn: function($td) {
        /* istanbul ignore next: focus 확인 불가 */
        if ($td.find('input').eq(0).prop('disabled')) {
            this.grid.focusClipboard();
        } else {
            $td.find('input').eq(0).focus();
        }
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
        var list = this.getOptionList(cellData),
            columnModel = this.grid.columnModel.getColumnModel(cellData.columnName),
            value = cellData.value,
            checkedList = ('' + value).split(','),
            checkedMap = {},
            html = this._getConvertedHtml(value, cellData),
            htmlArr = [],
            name = util.getUniqueKey(),
            isDisabled = cellData.isDisabled,
            id;

        if (ne.util.isNull(html)) {
            ne.util.forEachArray(checkedList, function(item) {
                checkedMap[item] = true;
            });

            ne.util.forEachArray(list, function(item) {
                id = name + '_' + item.value;

                htmlArr.push('<input type="');
                htmlArr.push(columnModel.editOption.type);
                htmlArr.push('" name="');
                htmlArr.push(name);
                htmlArr.push('" id="');
                htmlArr.push(id);
                htmlArr.push('" value="');
                htmlArr.push(item.value);
                htmlArr.push('" ');
                htmlArr.push(checkedMap[item.value] ? 'checked' : '');
                htmlArr.push(isDisabled ? 'disabled' : '');
                htmlArr.push('/>');

                if (item.text) {
                    htmlArr.push('<label for="');
                    htmlArr.push(id);
                    htmlArr.push('" style="margin-right:10px">');
                    htmlArr.push(item.text);
                    htmlArr.push('</label>');
                }
            }, this);
            html = htmlArr.join('');
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
        var value = cellData.value,
            checkedList = ('' + value).split(',');

        $td.find('input:checked').prop('checked', false);

        ne.util.forEachArray(checkedList, function(item) {
            $td.find('input[value="' + item + '"]').prop('checked', true);
        });
    },

    /**
     * 다음 input 에 focus 한다
     * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
     * @return {boolean} 다음 엘리먼트에 focus 되었는지 여부
     * @private
     */
    _focusNextInput: function($currentInput) {
        return this._focusTargetInput($currentInput, 'next');
    },

    /**
     * 이전 input 에 focus 한다.
     * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
     * @return {boolean} 다음 엘리먼트에 focus 되었는지 여부
     * @private
     */
    _focusPrevInput: function($currentInput) {
        return this._focusTargetInput($currentInput, 'prev');
    },

    /**
     * 이전 혹은 다음 input 에 focus 한다.
     * @param {jQuery} $currentInput 현재 input jQuery 엘리먼트
     * @param {string} direction 방향 'next|prev'
     * @return {boolean} 해당 엘리먼트에 focus 되었는지 여부
     * @private
     */
    _focusTargetInput: function($currentInput, direction) {
        var $target = $currentInput,
            find;

        if (direction === 'next') {
            find = function($target) {
                return $target.next();
            };
        } else if (direction === 'prev') {
            find = function($target) {
                return $target.prev();
            };
        }

        do {
            $target = find($target);
        } while ($target.length && !$target.is('input'));

        if ($target.length) {
            $target.focus();
            return true;
        } else {
            return false;
        }
    },

    /**
     * check 된 button 의 값들을 가져온다. onChange 이벤트 핸들러에서 호출한다.
     * @param {jQuery} $target 이벤트가 발생한 targetElement
     * @return {Array}  check 된 값들의 결과 배열
     * @private
     */
    _getCheckedValueList: function($target) {
        var $checkedList = $target.closest('td').find('input:checked'),
            checkedList = [];

        ne.util.forEachArray($checkedList, function($checked, index) {
            checkedList.push($checkedList.eq(index).val());
        });

        return checkedList;
    },

    /**
     * onChange 이벤트 핸들러
     * @param {Event} changeEvent 이벤트 객체
     * @private
     */
    _onChange: function(changeEvent) {
        var $target = $(changeEvent.target),
            cellAddress = this._getCellAddress($target);
        this.grid.setValue(cellAddress.rowKey, cellAddress.columnName, this._getCheckedValueList($target).join(','));
    }
});

module.exports = Button;
