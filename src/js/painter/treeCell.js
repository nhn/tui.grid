/**
 * @fileoverview Tree cell painter
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
     * Selector of tree-button to bind events
     * @type {string}
     */
    selector: '.' + classNameConst.BTN_TREE,

    events: {
        click: '_onClick'
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
        '<span class="' + classNameConst.TREE_DEPTH + '" style="<%=style%>">' +
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
    _onClick: function(ev) {
        var $target = $(ev.target);
        var $td = $target.parents('td');
        var rowKey = this._getCellAddress($target).rowKey;
        var isExpanded = $td.hasClass(classNameConst.TREE_BUTTON_EXPAND);

        this.controller.changeTreeExpanded(rowKey, isExpanded);
    },

    /**
     * Get html of line element in extra content
     * @param {number} depth - depth of current row
     * @param {boolean} lastDepth - whether the current row is last depth or not
     * @param {boolean} hasChildren - whether the current row has children or not
     * @returns {string} html string
     * @private
     */
    _getLineHtml: function(depth, lastDepth, hasChildren) {
        var hasButton = lastDepth && hasChildren;
        var style = ['left:' + (depth * dimensionConst.INDENT_WIDTH) + 'px;'];

        return this.lineTemplate({
            style: style.join(''),
            hasButton: hasButton
        });
    },

    /**
     * Get html of icon element in extra content
     * @param {number} depth - depth of current row
     * @returns {string} html string
     * @private
     */
    _getIconHtml: function(depth) {
        var style = 'left:' + (depth * dimensionConst.INDENT_WIDTH) + 'px;';

        return '<span class="' + classNameConst.TREE_ICON + '" style="' + style + '"><i></i></span>';
    },

    /**
     * Get html of extra content that contains line and expand/collapse button elements
     * @param {object} cellData - tree cell data
     * @returns {string} html string
     * @private
     */
    _getExtraContentHtml: function(cellData) {
        var depth = cellData.depth;
        var hasChildren = cellData.hasChildren;
        var useIcon = cellData.useIcon;
        var index = 0;
        var htmls = [];
        var lastDepth;

        for (; index < depth; index += 1) {
            lastDepth = index === depth - 1;

            htmls.push(this._getLineHtml(index, lastDepth, hasChildren));
        }

        if (useIcon) {
            htmls.push(this._getIconHtml(depth));
        }

        return this.contentTemplate({
            className: classNameConst.TREE_EXTRA_CONTENT,
            style: '',
            content: htmls.join('')
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
            classNameConst.CELL_HAS_TREE
        ];
        var attrs = {};

        if (cellData.hasChildren) {
            if (cellData.isExpanded) {
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
     * @returns {string} concat string of styles
     * @private
     */
    _getContentStyle: function(cellData) {
        var whiteSpace = cellData.columnModel.whiteSpace || 'nowrap';
        var marginLeft = cellData.depth * dimensionConst.INDENT_WIDTH;
        var styles = [];

        if (whiteSpace) {
            styles.push('white-space:' + whiteSpace);
        }
        if (this.fixedRowHeight) {
            styles.push('max-height:' + cellData.height + 'px');
        }

        if (cellData.useIcon) {
            marginLeft += dimensionConst.INDENT_WIDTH;
        }

        styles.push('margin-left:' + marginLeft + 'px');

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
        var contentHtml;

        $td.attr(attrs);

        if (editingChangedToTrue && !this._isUsingViewMode(cellData)) {
            this._inputPainter.focus($td);
        } else if (shouldUpdateContent) {
            contentHtml = this._getContentHtml(cellData);

            $td.find('.' + classNameConst.CELL_CONTENT).remove();
            $td.find('.' + classNameConst.TREE_EXTRA_CONTENT).after(contentHtml);

            $td.scrollLeft(0);
        }
    }
});

module.exports = TreeCell;
