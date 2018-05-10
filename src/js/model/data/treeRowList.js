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

    _flattenRow: function(rowList, flattenedRow, ancester) {
        var parent, hasNextSibling;
        var lastSibling = rowList[rowList.length - 1];

        // it's a root node which is actually not exist.
        ancester = ancester || [{
            _treeData: {}
        }];
        parent = ancester[ancester.length - 1];
        parent._treeData.childrenRowKeys = [];

        _.each(rowList, function(row) {
            // sets rowKey property
            row = this._baseFormat(row);

            hasNextSibling = _.map(ancester.slice(1), function(node) {
                var nodeHasNextSibling = node._treeData.hasNextSibling;

                return nodeHasNextSibling.slice(nodeHasNextSibling.length - 1)[0];
            }).concat([lastSibling !== row]);

            row._treeData = {
                parentRowKey: parent.rowKey,
                depth: ancester.length - 1,
                hasNextSibling: hasNextSibling
            };
            parent._treeData.childrenRowKeys.push(row.rowKey);

            flattenedRow.push(row);

            if (util.isArray(row._children)) {
                this._flattenRow(row._children, flattenedRow, ancester.concat([row]));
                delete row._children;
            }
        }, this);
    }
});

module.exports = TreeRowList;
