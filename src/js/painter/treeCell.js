/**
 * @fileoverview Dummy cell painter
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var snippet = require('tui-code-snippet');

var Painter = require('../base/painter');
var util = require('../common/util');
var attrNameConst = require('../common/constMap').attrName;
var dimensionConst = require('../common/constMap').dimension;
var classNameConst = require('../common/classNameConst');

/**
 * Painter class for tree-cell(TD) views
 * @module painter/treeCell
 * @extends module:base/painter
 * @param {object} options - options
 * @ignore
 */
var TreeCell = snippet.defineClass(Painter, /** @lends module:painter/treeCell.prototype */{
    init: function(options) {
        Painter.apply(this, arguments);

        /**
         * Input painter for editing cell data
         * @type {module:painter/input/text}
         */
        this._inputPainter = options.inputPainter;
    },

    /**
     * Selector for TD to bind events
     * @type {string}
     */
    selector: '.' + classNameConst.CELL_TREE,

    events: {
        mousedown: '_onMouseDown'
    },

    /**
     * Template for TD element
     * @returns {string} html string
     */
    template: _.template(
        '<td <%=attributeString%>">' +
            '<div class="' + classNameConst.TREE_WARPPER_RELATIVE + '">' +
                '<div class="' + classNameConst.TREE_WARPPER_VALIGN_CENTER + '">' +
                    '<%=extraContentHtml%>' +
                    '<%=contentHtml%>' +
                '</div>' +
            '</div>' +
        '</td>'
    ),

    /**
     * Template for each DIV element (inner content of TD)
     * @returns {string} html string
     */
    contentTemplate: _.template(
        '<div class="<%=className%>" style="<%=style%>">' +
            '<%=content%>' +
        '</div>'
    ),

    /**
     * Template for each line element in extra content
     * @returns {string} html string
     */
    lineTemplate: _.template(
        '<span class="<%=className%>" style="<%=style%>">' +
            '<% if (lastDepth) { %>' +
                '<span class="' + classNameConst.TREE_LINE_BRANCH + '"></span>' +
            '<% } %>' +
            '<% if (hasButton) { %>' +
                '<button class="' + classNameConst.BTN_TREE + '"><i></i></button>' +
            '<% } %>' +
        '</span>'
    ),

    /**
     * Event handler for tree-cell's expand/collapse button
     * @param {Event} ev - dom event object
     * @private
     */
    _onMouseDown: function(ev) {
        var $target = $(ev.target);
        var address = this._getCellAddress($target);

        this.controller.setExpandState(address);
    },

    /**
     * Get className of each line element
     * @param {boolean} lastDepth - whether the current row is last depth or not
     * @param {boolean} leafRow - whether the current row is leaf row or not
     * @returns {string} connected class names
     * @private
     */
    _getClassNameOfLine: function(lastDepth, leafRow) {
        var className = [
            classNameConst.TREE_LINE
        ];

        if (lastDepth && leafRow) {
            className.push(classNameConst.TREE_LINE_HALF);
        }

        return className.join(' ');
    },

    /**
     * Get html of line element in extra content
     * @param {number} depth - depth of current row
     * @param {boolean} lastDepth - whether the current row is last depth or not
     * @param {boolean} leafRow - whether the current row is leaf row or not
     * @param {boolean} hasChildren - whether thr current row has children or not
     * @returns {string} html string
     * @private
     */
    _getLineHtml: function(depth, lastDepth, leafRow, hasChildren) {
        var className = this._getClassNameOfLine(lastDepth, leafRow);
        var hasButton = lastDepth && hasChildren;
        var style = ['left:' + (depth * dimensionConst.INDENT_WIDTH) + 'px;'];

        if (!lastDepth && leafRow) {
            style.push('display:none;');
        }

        return this.lineTemplate({
            className: className,
            style: style.join(''),
            lastDepth: lastDepth,
            hasButton: hasButton
        });
    },

    /**
     * Get html of extra content that contains line and expand/collapse button elements
     * @param {object} cellData - cell data
     * @returns {string} html string
     * @private
     */
    _getExtraContentHtml: function(cellData) {
        var depth = cellData.depth;
        var hasChildren = cellData.hasChildren;
        var hasNextSibling = cellData.hasNextSibling || [];
        var index = 0;
        var lineHtml = '';
        var lastDepth, leafRow;

        for (; index < depth; index += 1) {
            lastDepth = index === depth - 1;
            leafRow = !hasNextSibling[index];
            lineHtml += this._getLineHtml(index, lastDepth, leafRow, hasChildren);
        }

        return this.contentTemplate({
            className: classNameConst.TREE_EXTRA_CONTENT,
            style: '',
            content: lineHtml
        });
    },

    /**
     * Get attributes string of TD
     * @param {object} cellData - cell data
     * @returns {string} connected attribute string
     * @private
     */
    _getAttributes: function(cellData) {
        var classNames = [
            cellData.className,
            classNameConst.CELL,
            classNameConst.CELL_TREE
        ];
        var attrs = {};

        if (cellData.hasChildren) {
            if (cellData.isExpand) {
                classNames.push(classNameConst.TREE_BUTTON_EXPAND);
            } else {
                classNames.push(classNameConst.TREE_BUTTON_COLLAPSE);
            }
        }

        attrs['class'] = classNames.join(' ');

        attrs[attrNameConst.ROW_KEY] = cellData.rowKey;
        attrs[attrNameConst.COLUMN_NAME] = cellData.columnName;

        return attrs;
    },

    /**
     * Get html of data content in tree-cell's right area
     * @param {object} cellData - cell data
     * @returns {string} conneted string of styles
     * @private
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

        styles.push('margin-left:' + (cellData.depth * dimensionConst.INDENT_WIDTH) + 'px');

        return styles.join(';');
    },

    /**
     * Whether the current cell is using 'view-mode' or not
     * @param {object} cellData - cell data
     * @returns {boolean} using state
     * @private
     */
    _isUsingViewMode: function(cellData) {
        return snippet.pick(cellData, 'columnModel', 'editOptions', 'useViewMode') !== false;
    },

    /**
     * Get html of wrapping content by span tag
     * @param {string} content - content to wrap
     * @param {string} className - class names of span tag
     * @returns {string} html string
     * @private
     */
    _getSpanWrapContent: function(content, className) {
        if (snippet.isFalsy(content)) {
            content = '';
        }

        return '<span class="' + className + '">' + content + '</span>';
    },

    /**
     * Get html of data content
     * @param {object} cellData - cell data
     * @returns {string} html string
     * @private
     */
    _getContentHtml: function(cellData) {
        var content = cellData.formattedValue;
        var prefix = cellData.prefix;
        var postfix = cellData.postfix;
        var fullContent;

        if (this._inputPainter) {
            content = this._inputPainter.generateHtml(cellData);

            if (!this._isUsingViewMode(cellData)) {
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

        return this.contentTemplate({
            className: classNameConst.CELL_CONTENT,
            style: this._getContentStyle(cellData),
            content: fullContent
        });
    },

    /**
     * Generate content html of TD
     * @param {object} cellData - cell data
     * @returns {string} html string
     */
    generateHtml: function(cellData) {
        var attributeString = util.getAttributesString(this._getAttributes(cellData));
        var extraContentHtml = this._getExtraContentHtml(cellData);
        var contentHtml = this._getContentHtml(cellData);

        return this.template({
            attributeString: attributeString,
            extraContentHtml: extraContentHtml,
            contentHtml: contentHtml
        });
    },

    /**
     * Rerender content html of TD
     * @param {object} cellData - cell data
     * @param {jQuery} $td - cell element
     */
    refresh: function(cellData, $td) {
        var editingChangedToTrue = _.contains(cellData.changed, 'editing') && cellData.editing;
        var shouldUpdateContent = cellData.changed.length > 0;
        var attrs = this._getAttributes(cellData);

        $td.attr(attrs);

        if (editingChangedToTrue && !this._isUsingViewMode(cellData)) {
            this._inputPainter.focus($td);
        } else if (shouldUpdateContent) {
            $td.find(classNameConst.CELL).html(this._getContentHtml(cellData));
            $td.scrollLeft(0);
        }
    }
});

module.exports = TreeCell;
