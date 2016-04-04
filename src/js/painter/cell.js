/**
 * @fileoverview Painter class for cell(TD) views
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Painter = require('../base/painter');
var util = require('../common/util');

/**
 * Painter class for cell(TD) views
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
     * Returns the HTML string of the contents containg the value of the 'beforeContent' and 'afterContent'.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @private
     */
    _getContentHtml: function(cellData) {
        var content = cellData.formattedValue,
            beforeContent = cellData.beforeContent,
            afterContent = cellData.afterContent;

        if (this.inputPainter) {
            content = this.inputPainter.generateHtml(cellData);

            if (this._shouldContentBeWrapped()) {
                beforeContent = this._getSpanWrapContent(beforeContent, 'before');
                afterContent = this._getSpanWrapContent(afterContent, 'after');
                content = this._getSpanWrapContent(content, 'input');

                return beforeContent + afterContent + content;
            }
        }

        return beforeContent + content + afterContent;
    },

    /**
     * Returns whether the contents should be wrapped with span tags to display them correctly.
     * @returns {Boolean}
     */
    _shouldContentBeWrapped: function() {
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
     * Returns the object contains attributes of a TD element.
     * @param {Object} cellData - cell data
     * @returns {Object}
     * @private
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

    /**
     * Attaches all event handlers to the $target element.
     * @param {jquery} $target - target element
     * @param {String} parentSelector - selector of a parent element
     * @override
     */
    attachEventHandlers: function($target, parentSelector) {
        if (this.inputPainter) {
            this.inputPainter.attachEventHandlers($target, parentSelector + ' ' + this.selector);
        }
    },

    /**
     * Generates a HTML string from given data, and returns it.
     * @param {object} cellData - cell data
     * @returns {string} HTML string of the cell (TD)
     * @implements {module:base/painter}
     */
    generateHtml: function(cellData) {
        var attributeString = util.getAttributesString(this._getAttributes(cellData)),
            contentHtml = this._getContentHtml(cellData);

        return this.template({
            attributeString: attributeString,
            contentHtml: contentHtml || '&#8203;' // '&#8203;' for height issue with empty cell in IE7
        });
    },

    /**
     * Refreshes the cell(td) element.
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
