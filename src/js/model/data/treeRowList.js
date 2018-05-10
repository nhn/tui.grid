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

    _flattenRow: function(rowList, flattenedRow, parent) {
        var firstSibling = rowList[0];
        var lastSibling = rowList[rowList.length - 1];

        parent = parent || {
            _treeData: {
                depth: -1
            }
        };
        parent._treeData.childrenRowKeys = [];

        _.each(rowList, function(row) {
            // sets rowKey property
            row = this._baseFormat(row);

            row._treeData = {
                parentRowKey: parent.rowKey,
                depth: parent._treeData.depth + 1,
                firstSibling: firstSibling === row,
                lastSibling: lastSibling === row
            };
            parent._treeData.childrenRowKeys.push(row.rowKey);

            flattenedRow.push(row);

            if (util.isArray(row._children)) {
                this._flattenRow(row._children, flattenedRow, row);
                delete row._children;
            }
        }, this);
    }
});

module.exports = TreeRowList;
