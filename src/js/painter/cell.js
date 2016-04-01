/**
 * @fileoverview CellPainter 의 기초 클래스
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');

/**
 * Cell Painter Base
 * @module painter/cell
 * @extends module:base/painter
 */
var Cell = tui.util.defineClass(Painter, /**@lends module:painter/cell.prototype */{
    /**
     * @constructs
     * @param {Object} options - options
     */
    init: function(options) {
        Painter.apply(this, arguments);

        this.editType = options.editType;
        this.inputPainter = options.inputPainter;
        this.selector = 'td[edit-type=' + this.editType + ']';
    },

    /*
     * Markup template
     * @returns {string} template
     */
    template: _.template(
        '<td <%=attributeString%>><%=contentHtml%></td>'
    ),

    /**
     * 각 셀 페인터 인스턴스마다 정의된 getContentHtml 을 이용하여
     * 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링 을 반환한다.
     * @param {object} cellData Model 의 셀 데이터
     * @returns {string} 컬럼모델의 defaultValue, beforeText, afterText 를 적용한 content html 마크업 스트링
     * @private
     */
    _getContentHtml: function(cellData) {
        var content = cellData.formattedValue,
            beforeContent = cellData.beforeContent,
            afterContent = cellData.afterContent;

        if (this.inputPainter) {
            content = this.inputPainter.getHtml(cellData);

            if (this._shouldWrapContent()) {
                beforeContent = this._getSpanWrapContent(beforeContent, 'before');
                afterContent = this._getSpanWrapContent(afterContent, 'after');
                content = this._getSpanWrapContent(content, 'input');

                return beforeContent + afterContent + content;
            }
        }

        return beforeContent + content + afterContent;
    },

    _shouldWrapContent: function() {
        return _.contains(['text', 'password', 'select'], this.editType);
    },

    /**
     * 주어진 문자열을 span 태그로 감싼 HTML 코드를 반환한다.
     * @param {string} content - 감싸질 문자열
     * @param {string} className - span 태그의 클래스명
     * @returns {string} span 태그로 감싼 HTML 코드
     * @private
     */
    _getSpanWrapContent: function(content, className) {
        if (tui.util.isFalsy(content)) {
            content = '';
        }

        return '<span class="' + className + '">' + content + '</span>';
    },

    /**
     * getHtml 으로 마크업 생성시 td에 포함될 attribute object 를 반환한다.
     * @param {Object} cellData Model 의 셀 데이터
     * @returns {Object} td 에 지정할 attribute 데이터
     */
    _getAttributes: function(cellData) {
        return {
            'class': cellData.className,
            'edit-type': this.editType,
            columnname: cellData.columnName,
            rowSpan: cellData.rowSpan || '',
            align: cellData.columnModel.align || 'left'
        };
    },

    attachEventHandlers: function($target, selector) {
        selector += ' ' + this.selector;

        if (this.inputPainter) {
            this.inputPainter.attachEventHandlers($target, selector);
        }
    },

    /**
     * Row Painter 에서 한번에 table 을 랜더링 할 때 사용하기 위해
     * td 단위의 html 문자열을 반환한다.
     * @param {object} cellData Model 의 셀 데이터
     * @returns {string} td 마크업 문자열
     */
    getHtml: function(cellData) {
        var attributeString = util.getAttributesString(this._getAttributes(cellData)),
            contentHtml = this._getContentHtml(cellData);

        return this.template({
            attributeString: attributeString,
            contentHtml: contentHtml || '&nbsp' // '&nbsp' for height issue with empty cell in IE7
        });
    },

    /**
     * Refresh the cell(td) element.
     * @param {object} cellData - cell data
     * @param {jQuery} $td - cell element
     */
    refresh: function(cellData, $td) {
        var contentProps = ['value', 'isEditing', 'isDisabled'],
            shouldUpdateContent = _.intersection(contentProps, cellData.changed).length > 0;

        $td.attr(this._getAttributes(cellData));

        if (cellData.isEditing) {
            this.inputPainter.focus($td);
        } else if (shouldUpdateContent) {
            $td.html(this._getContentHtml(cellData));
        }
    }
});

module.exports = Cell;
