/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var InputPainter = require('./base');
var util = require('../../common/util');

/**
 * Cell Painter Base
 * @module painter/cell
 * @extends module:base/painter
 */
var SelectPainter = tui.util.defineClass(InputPainter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     */
    init: function() {
        InputPainter.apply(this, arguments);
    },

    selector: 'select',

    /**
     * Content markup template
     * @returns {string} html
     */
    template: _.template(
        '<select name="<%=name%>" <%=disabled%>><%=options%></select>'
    ),

    /**
     * Options markup template
     * It will be added to content
     * :: The value of option is a type of stirng, and use '==' operator for
     *    comparison regardless of some types of value in cellData
     * @returns {string} html
     */
    optionTemplate: _.template(
        '<option value="<%=value%>" <%=selected%>><%=text%></option>'
    ),

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
    getHtml: function(cellData) {
        var optionItems = cellData.columnModel.editOption.list,
            optionHtml;

        if (!_.isNull(cellData.convertedHTML)) {
            return cellData.convertedHTML;
        }

        optionHtml = _.reduce(optionItems, function(html, item) {
            return html + this.optionTemplate({
                value: item.value,
                text: item.text,
                selected: (String(cellData.value) === String(item.value)) ? 'selected' : ''
            });
        }, '', this);

        return this.template({
            name: util.getUniqueKey(),
            disabled: cellData.isDisabled ? 'disabled' : '',
            options: optionHtml
        });
    }
});

module.exports = SelectPainter;
