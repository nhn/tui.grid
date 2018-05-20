/**
 * @fileoverview TreeRowList grid data model implementation
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var util = require('tui-code-snippet');

var RowList = require('./rowList');
var TreeRow = require('./treeRow');

/**
 * TreeRowList class implementation
 * @module model/data/treeModel
 * @extends module:base/collection
 * @ignore
 */
var TreeRowList = RowList.extend(/** @lends module:model/data/treeRowList.prototype */{
    initialize: function() {
        RowList.prototype.initialize.apply(this, arguments);

        /**
         * root row which actually does not exist.
         * it keeps depth 1 rows as it's children
         * @type {Object}
         */
        this._rootRow = {};
    },

    model: TreeRow,

    /**
     * flattened tree row to grid row
     * process _extraData then set rowSpanData value
     * this function overrides RowList._formatData to deal with rowKey here
     *
     * @param {Array} data - rowList
     * @returns {Array} rowList with row
     * @override
     * @private
     */
    _formatData: function(data) {
        var rowList = _.filter(data, _.isObject);
        var flattenedRow = [];

        this._rootRow = {
            _treeData: {}
        };

        this._flattenRow(rowList, flattenedRow, [this._rootRow]);

        _.each(flattenedRow, function(row, i) {
            if (this.isRowSpanEnable()) {
                this._setExtraRowSpanData(flattenedRow, i);
            }
        }, this);

        return flattenedRow;
    },

    /**
     * Flatten nested tree data to 1-depth grid data.
     * @param {Array} treeRows - nested rows having children
     * @param {Array} flattenedRows - flattend rows. you should give an empty array at the initial call of this function
     * @param {Array} ancestors - ancester rows
     */
    _flattenRow: function(treeRows, flattenedRows, ancestors) {
        var parent, hasNextSibling;
        var lastSibling = treeRows[treeRows.length - 1];

        parent = ancestors[ancestors.length - 1];
        parent._treeData.childrenRowKeys = [];

        _.each(treeRows, function(row) {
            // sets rowKey property
            row = this._baseFormat(row);

            hasNextSibling = _.map(ancestors.slice(1), function(node) {
                var nodeHasNextSibling = node._treeData.hasNextSibling;

                return nodeHasNextSibling.slice(nodeHasNextSibling.length - 1)[0];
            }).concat([lastSibling !== row]);

            row._treeData = {
                parentRowKey: parent.rowKey,
                hasNextSibling: hasNextSibling
            };
            parent._treeData.childrenRowKeys.push(row.rowKey);

            flattenedRows.push(row);

            if (util.isArray(row._children)) {
                this._flattenRow(row._children, flattenedRows, ancestors.concat([row]));
                delete row._children;
            }
        }, this);
    },

    /**
     * get top most row keys
     * @returns {(Number|String)[]} - row keys
     */
    getTopMostRowKeys: function() {
        return this._rootRow._treeData.childrenRowKeys;
    },

    /**
     * get tree children of row of given rowKey
     * @param {(Number|String)} rowKey - row key
     * @returns {(Number|String)[]} - children of found row
     */
    getTreeChildrenRowKeys: function(rowKey) {
        var row = this.get(rowKey);

        return row.getTreeChildrenRowKeys();
    },

    /**
     * get tree descendent of row of given rowKey
     * @param {(Number|String)} rowKey - row key
     * @returns {(Number|String)[]} - descendent of found row
     */
    getTreeDescendentRowKeys: function(rowKey) {
        var index = 0;
        var rowKeys = [rowKey];

        while (index < rowKeys.length) {
            rowKeys = rowKeys.concat(this.getTreeChildrenRowKeys(rowKeys[index]));
            index += 1;
        }
        rowKeys.shift();

        return rowKeys;
    },

    /**
     * expand tree row
     * @param {(Number|String)} rowKey - row key
     * @param {Boolean} recursive - true for recursively expand all descendent
     * @param {Boolean} silent - true to mute event
     * @returns {(Number|String)[]} - children or descendent of given row
     */
    treeExpand: function(rowKey, recursive, silent) {
        var descendentRowKeys;
        var row = this.get(rowKey);
        row.setTreeExpanded(true);

        if (recursive) {
            descendentRowKeys = this.getTreeDescendentRowKeys(rowKey);
            util.forEachArray(descendentRowKeys, function(descendentRowKey) {
                var descendentRow = this.get(descendentRowKey);
                if (descendentRow.hasTreeChildren()) {
                    descendentRow.setTreeExpanded(true);
                }
            }, this);
        } else {
            descendentRowKeys = this.getTreeChildrenRowKeys(rowKey);
        }

        if (!silent) {
            this.trigger('expanded', descendentRowKeys.slice(0));
        }

        return descendentRowKeys;
    },

    /**
     * expand all rows
     */
    treeExpandAll: function() {
        var topMostRowKeys = this.getTopMostRowKeys();

        _.each(topMostRowKeys, function(topMostRowKey) {
            this.treeExpand(topMostRowKey, true, true);
        }, this);

        this.trigger('expanded');
    },

    /**
     * collapse tree row
     * @param {(Number|String)} rowKey - row key
     * @param {Boolean} recursive - true for recursively expand all descendent
     * @param {Boolean} silent - true to mute event
     * @returns {(Number|String)[]} - children or descendent of given row
     */
    treeCollapse: function(rowKey, recursive, silent) {
        var descendentRowKeys;
        var row = this.get(rowKey);
        row.setTreeExpanded(false);

        if (recursive) {
            descendentRowKeys = this.getTreeDescendentRowKeys(rowKey);
            _.each(descendentRowKeys, function(descendentRowKey) {
                var descendentRow = this.get(descendentRowKey);
                if (descendentRow.hasTreeChildren()) {
                    descendentRow.setTreeExpanded(false);
                }
            }, this);
        } else {
            descendentRowKeys = this.getTreeChildrenRowKeys(rowKey);
        }

        if (!silent) {
            this.trigger('collapsed', descendentRowKeys.slice(0));
        }

        return descendentRowKeys;
    },

    /**
     * collapse all rows
     */
    treeCollapseAll: function() {
        var topMostRowKeys = this.getTopMostRowKeys();

        _.each(topMostRowKeys, function(topMostRowKey) {
            this.treeCollapse(topMostRowKey, true, true);
        }, this);

        this.trigger('collapsed');
    }
});

module.exports = TreeRowList;
