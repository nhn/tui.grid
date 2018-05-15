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

        this._flattenRow(rowList, flattenedRow);

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

        // it's a root node which is actually not exist.
        ancestors = ancestors || [{
            _treeData: {}
        }];
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
    }
});

module.exports = TreeRowList;
