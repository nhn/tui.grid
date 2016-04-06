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

    /**
     * key-value object contains event names as keys and handler names as values
     * @type {Object}
     */
    events: {
        dblclick: '_onDblClick'
    },

    /**
     * Markup template
     * @returns {string} template
     */
    template: _.template(
        '<td <%=attributeString%>><%=contentHtml%></td>'
    ),

    /**
     * Event handler for 'dblclick' DOM event.
     * @param {MouseEvent} event - mouse event object
     */
    _onDblClick: function(event) {
        var address = this._getCellAddress($(event.target));
        this.controller.startEditing(address);
    },

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

            if (this._shouldContentBeWrapped() && !this._isConvertible(cellData)) {
                beforeContent = this._getSpanWrapContent(beforeContent, 'before');
                afterContent = this._getSpanWrapContent(afterContent, 'after');
                content = this._getSpanWrapContent(content, 'input');

                return beforeContent + afterContent + content;
            }
        }

        return beforeContent + content + afterContent;
    },

    /**
     * Returns whether the cell is convertible.
     * @param {Object} cellData - cell data
     * @returns {Boolean}
     * @private
     */
    _isConvertible: function(cellData) {
        return tui.util.pick(cellData, 'columnModel', 'editOption', 'convertible');
    },

    /**
     * Returns whether the contents should be wrapped with span tags to display them correctly.
     * @returns {Boolean}
     * @private
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
            'class': cellData.className + ' cell_content',
            'edit-type': this.editType,
            'data-row-key': cellData.rowKey,
            'data-column-name': cellData.columnName,
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
        Painter.prototype.attachEventHandlers.call(this, $target, parentSelector);

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
        var contentProps = ['value', 'isEditing', 'isDisabled'];
        var isEditingChanged = _.contains(cellData.changed, 'isEditing');
        var shouldUpdateContent = _.intersection(contentProps, cellData.changed).length > 0;

        $td.attr(this._getAttributes(cellData));

        if (isEditingChanged && cellData.isEditing && !this._isConvertible(cellData)) {
            this.inputPainter.focus($td);
        } else if (shouldUpdateContent) {
            $td.html(this._getContentHtml(cellData));
            $td.scrollLeft(0);
        }
    }
});

module.exports = Cell;
