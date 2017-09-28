/**
 * @fileoverview Painter class for cell(TD) views
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Painter = require('../base/painter');
var util = require('../common/util');
var attrNameConst = require('../common/constMap').attrName;
var classNameConst = require('../common/classNameConst');

/**
 * Painter class for cell(TD) views
 * @module painter/cell
 * @extends module:base/painter
 * @param {Object} options - options
 * @ignore
 */
var Cell = snippet.defineClass(Painter, /** @lends module:painter/cell.prototype */{
    init: function(options) {
        Painter.apply(this, arguments);

        this.editType = options.editType;
        this.fixedRowHeight = options.fixedRowHeight;
        this.inputPainter = options.inputPainter;
        this.selector = 'td[' + attrNameConst.EDIT_TYPE + '="' + this.editType + '"]';
    },

    /**
     * template for TD
     * @returns {string} template
     */
    template: _.template(
        '<td <%=attributeString%> style="<%=style%>"><%=contentHtml%></td>'
    ),

    /**
     * template for DIV (inner content of TD)
     */
    contentTemplate: _.template(
        '<div class="<%=className%>" style="<%=style%>"><%=content%></div>'
    ),

    /**
     * Returns whether the instance is editable type.
     * @returns {Boolean}
     */
    _isEditableType: function() {
        return !_.contains(['normal', 'mainButton'], this.editType);
    },

    /**
     * Returns css style string for given cellData
     * @param {Object} cellData - cell data
     * @returns {string}
     */
    _getContentStyle: function(cellData) {
        var whiteSpace = cellData.columnModel.whiteSpace || 'nowrap';
        var styles = [];

        if (whiteSpace) {
            styles.push('white-space:' + whiteSpace);
        }
        if (this.fixedRowHeight) {
            styles.push('max-height:' + cellData.height + 'px');
        }

        return styles.join(';');
    },

    /**
     * Returns the HTML string of the contents containg the value of the 'prefix' and 'postfix'.
     * @param {Object} cellData - cell data
     * @returns {String}
     * @private
     */
    _getContentHtml: function(cellData) {
        var customTemplate = cellData.columnModel.template;
        var content = cellData.formattedValue;
        var prefix = cellData.prefix;
        var postfix = cellData.postfix;
        var fullContent, template;

        if (this.inputPainter) {
            content = this.inputPainter.generateHtml(cellData);

            if (this._shouldContentBeWrapped() && !this._isUsingViewMode(cellData)) {
                prefix = this._getSpanWrapContent(prefix, classNameConst.CELL_CONTENT_BEFORE);
                postfix = this._getSpanWrapContent(postfix, classNameConst.CELL_CONTENT_AFTER);
                content = this._getSpanWrapContent(content, classNameConst.CELL_CONTENT_INPUT);
                // notice the order of concatenation
                fullContent = prefix + postfix + content;
            }
        }

        if (!fullContent) {
            fullContent = prefix + content + postfix;
        }

        if (cellData.columnName === '_number' && _.isFunction(customTemplate)) {
            template = customTemplate({
                content: fullContent
            });
        } else {
            template = this.contentTemplate({
                content: fullContent,
                className: classNameConst.CELL_CONTENT,
                style: this._getContentStyle(cellData)
            });
        }

        return template;
    },

    /**
     * Returns whether the cell has view mode.
     * @param {Object} cellData - cell data
     * @returns {Boolean}
     * @private
     */
    _isUsingViewMode: function(cellData) {
        return snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
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
        if (snippet.isFalsy(content)) {
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
        var classNames = [
            cellData.className,
            classNameConst.CELL
        ];
        var attrs = {
            'align': cellData.columnModel.align || 'left'
        };
        attrs['class'] = classNames.join(' ');

        attrs[attrNameConst.EDIT_TYPE] = this.editType;
        attrs[attrNameConst.ROW_KEY] = cellData.rowKey;
        attrs[attrNameConst.COLUMN_NAME] = cellData.columnName;
        if (cellData.rowSpan) {
            attrs.rowspan = cellData.rowSpan;
        }

        return attrs;
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
        var attributeString = util.getAttributesString(this._getAttributes(cellData));
        var contentHtml = this._getContentHtml(cellData);
        var valign = cellData.columnModel.valign;
        var styles = [];

        if (valign) {
            styles.push('vertical-align:' + valign);
        }

        return this.template({
            attributeString: attributeString,
            style: styles.join(';'),
            contentHtml: contentHtml
        });
    },

    /**
     * Refreshes the cell(td) element.
     * @param {object} cellData - cell data
     * @param {jQuery} $td - cell element
     */
    refresh: function(cellData, $td) {
        var contentProps = ['value', 'editing', 'disabled', 'listItems'];
        var editingChangedToTrue = _.contains(cellData.changed, 'editing') && cellData.editing;
        var shouldUpdateContent = _.intersection(contentProps, cellData.changed).length > 0;
        var attrs = this._getAttributes(cellData);
        var mainButton = this.editType === 'mainButton';

        $td.attr(attrs);

        if (editingChangedToTrue && !this._isUsingViewMode(cellData)) {
            this.inputPainter.focus($td);
        } else if (mainButton) {
            $td.find(this.inputPainter.selector).prop({
                checked: cellData.value,
                disabled: cellData.disabled
            });
        } else if (shouldUpdateContent) {
            $td.html(this._getContentHtml(cellData));
            $td.scrollLeft(0);
        }
    }
});

module.exports = Cell;
