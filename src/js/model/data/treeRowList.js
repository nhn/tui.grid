/**
 * @fileoverview TreeRowList grid data model implementation
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var util = require('tui-code-snippet');

var RowList = require('./rowList');
var TreeRow = require('./treeRow');

var TreeRowList;

/**
 * Create empty tree-row data
 * @returns {object} tree data
 * @ignore
 */
function createEmptyTreeRowData() {
    return {
        _treeData: {
            hasNextSibling: []
        }
    };
}

/**
 * TreeRowList class implementation
 * @module model/data/treeModel
 * @extends module:base/collection
 * @ignore
 */
TreeRowList = RowList.extend(/** @lends module:model/data/treeRowList.prototype */{
    initialize: function() {
        RowList.prototype.initialize.apply(this, arguments);

        /**
         * root row which actually does not exist.
         * it keeps depth 1 rows as it's children
         * @type {object}
         */
        this._rootRow = createEmptyTreeRowData();
    },

    model: TreeRow,

    /**
     * flattened tree row to grid row
     * process _extraData then set rowSpanData value
     * this function overrides RowList._formatData to deal with rowKey here
     *
     * @param {array|object} data - rowList
     * @param {object} options - append options
     * @returns {array} rowList with row
     * @override
     * @private
     */
    _formatData: function(data, options) {
        var rootRow = createEmptyTreeRowData();
        var flattenedRow = [];
        var rowList, parentRow, parentRowKey;

        rowList = _.filter(data, _.isObject);
        rowList = util.isArray(rowList) ? rowList : [rowList];

        if (options) {
            // probably an append operation
            // which requires specific parent row
            parentRowKey = options.parentRowKey;
            if (_.isNumber(parentRowKey) || _.isString(parentRowKey)) {
                parentRow = this.get(options.parentRowKey);
                rootRow._treeData.childrenRowKeys
                    = parentRow.getTreeChildrenRowKeys();
                rootRow._treeData.hasNextSibling
                    = parentRow.hasTreeNextSibling().slice(0);
                rootRow.rowKey = options.parentRowKey;
            } else {
                // no parent row key means root row
                rootRow = this._rootRow;
            }
        } else {
            // from setOriginal or setData
            // which requires to reset root row
            this._rootRow = rootRow;
        }

        this._flattenRow(rowList, flattenedRow, [rootRow]);

        if (parentRow) {
            parentRow.setTreeChildrenRowKeys(rootRow._treeData.childrenRowKeys);
        }

        _.each(flattenedRow, function(row, i) {
            if (this.isRowSpanEnable()) {
                this._setExtraRowSpanData(flattenedRow, i);
            }
        }, this);

        return flattenedRow;
    },

    /**
     * Flatten nested tree data to 1-depth grid data.
     * @param {array} treeRows - nested rows having children
     * @param {array} flattenedRows - flattend rows. you should give an empty array at the initial call of this function
     * @param {array} ancestors - ancester rows
     */
    _flattenRow: function(treeRows, flattenedRows, ancestors) {
        var parent;
        var lastSibling = treeRows[treeRows.length - 1];

        parent = ancestors[ancestors.length - 1];
        parent._treeData.childrenRowKeys = parent._treeData.childrenRowKeys || [];

        _.each(treeRows, function(row) {
            // sets rowKey property
            row = this._baseFormat(row);
            row._treeData = {
                parentRowKey: parent.rowKey,
                hasNextSibling: parent._treeData.hasNextSibling.concat([lastSibling !== row]),
                childrenRowKeys: row._children ? [] : null
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
     * calculate index of given parent row key and offset
     * @param {number|string} parentRowKey - parent row key
     * @param {number} offset - offset
     * @returns {number} - calculated index
     * @private
     */
    _indexOfParentRowKeyAndOffset: function(parentRowKey, offset) {
        var at, parentRow, childrenRowKeys;

        parentRow = this.get(parentRowKey);
        if (parentRow) {
            childrenRowKeys = parentRow.getTreeChildrenRowKeys();
            at = this.indexOf(parentRow);
        } else {
            childrenRowKeys = this._rootRow._treeData.childrenRowKeys;
            at = -1; // root row actually doesn't exist
        }

        offset = Math.max(0, offset);
        offset = Math.min(offset, childrenRowKeys.length);
        if (childrenRowKeys.length === 0 || offset === 0) {
            // first sibling
            // then the `at` is right after the parent row
            at = at + 1;
        } else if (childrenRowKeys.length > offset) {
            // not the last sibling
            // right before the next sibling
            at = this.indexOf(this.get(childrenRowKeys[offset]));
        } else {
            // last sibling
            at = this.indexOf(this.get(childrenRowKeys[childrenRowKeys.length - 1]));
            // and after all it's descendant rows and itself
            at += this.getTreeDescendantRowKeys(at).length + 1;
        }

        return at;
    },

    /**
     * update hasNextSibling value of previous sibling and of itself
     * @param {number|string} rowKey - row key
     * @private
     */
    _syncHasTreeNextSiblingData: function(rowKey) {
        var currentRow = this.get(rowKey);
        var currentDepth, prevSiblingRow, nextSiblingRow;

        if (!currentRow) {
            return;
        }

        currentDepth = currentRow.getTreeDepth();
        prevSiblingRow = this.get(this.getTreePrevSiblingRowKey(rowKey));
        nextSiblingRow = this.get(this.getTreeNextSiblingRowKey(rowKey));

        currentRow.hasTreeNextSibling()[currentDepth - 1] = !!nextSiblingRow;

        if (prevSiblingRow) {
            prevSiblingRow.hasTreeNextSibling()[currentDepth - 1] = true;
        }
    },

    /**
     * Insert the new row with specified data to the end of table.
     * @param {array|object} [rowData] - The data for the new row
     * @param {object} [options] - Options
     * @param {number|string} [options.parentRowKey] - row key of the parent which appends given rows
     * @param {number} [options.offset] - offset from first sibling
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @returns {Array.<module:model/data/treeTow>} Row model list
     * @override
     */
    appendRow: function(rowData, options) {
        var modelList;

        options = _.extend({
            at: this._indexOfParentRowKeyAndOffset(options.parentRowKey, options.offset)
        }, options);

        modelList = this._appendRow(rowData, options);

        this._syncHasTreeNextSiblingData(modelList[0].get('rowKey'));
        if (modelList.length > 1) {
            this._syncHasTreeNextSiblingData(modelList[modelList.length - 1].get('rowKey'));
        }

        this.trigger('add', modelList, options);

        return modelList;
    },

    /**
     * Insert the given data into the very first row of root
     * @param {array|object} [rowData] - The data for the new row
     * @param {object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     * @returns {Array.<module:model/data/treeTow>} Row model list
     */
    prependRow: function(rowData, options) {
        options = options || {};
        options.parentRowKey = null;
        options.offset = 0;

        return this.appendRow(rowData, options);
    },

    _removeChildFromParent: function(childRowKey) {
        var parentRowKey = this.get(childRowKey).getTreeParentRowKey();
        var parentRow = this.get(parentRowKey);
        var rootTreeData = this._rootRow._treeData;

        if (parentRow) {
            parentRow.removeTreeChildrenRowKey(childRowKey);
        } else {
            rootTreeData.childrenRowKeys = _.filter(rootTreeData.childrenRowKeys, function(rootChildRowKey) {
                return rootChildRowKey !== childRowKey;
            }, this);
        }
    },

    _removeRow: function(rowKey, options) {
        this._removeChildFromParent(rowKey);
        RowList.prototype._removeRow.call(this, rowKey, options);
    },

    /**
     * remove row of given row key. it will also remove it's descendant
     * @param {number|string} rowKey - 행 데이터의 고유 키
     * @param {object} options - 삭제 옵션
     * @param {boolean} options.removeOriginalData - 원본 데이터도 함께 삭제할 지 여부
     * @param {boolean} options.keepRowSpanData - rowSpan이 mainRow를 삭제하는 경우 데이터를 유지할지 여부
     * @override
     */
    removeRow: function(rowKey, options) {
        var row = this.get(rowKey);
        var parentRowKey = row.getTreeParentRowKey();
        var currentIndex = this.indexOf(row);
        var prevSiblingRowKey = this.getTreePrevSiblingRowKey(rowKey);
        var descendantRowKeys;

        if (!row) {
            return;
        }

        // remove descendant rows including itself
        descendantRowKeys = this.getTreeDescendantRowKeys(rowKey);
        descendantRowKeys.reverse().push(rowKey);
        _.each(descendantRowKeys, function(descendantRowKey) {
            this._removeRow(descendantRowKey, options);
        }, this);

        if (_.isNumber(prevSiblingRowKey) || _.isString(prevSiblingRowKey)) {
            this._syncHasTreeNextSiblingData(prevSiblingRowKey);
        }

        if (options && options.removeOriginalData) {
            this.setOriginalRowList();
        }
        this.trigger('remove', rowKey, currentIndex, descendantRowKeys, parentRowKey);
    },

    /**
     * get row keys of sibling and of itself
     * @param {number|string} rowKey - row key
     * @returns {Array.<number|string>} - sibling row keys
     */
    getTreeSiblingRowKeys: function(rowKey) {
        var parentRow = this.get(this.get(rowKey).getTreeParentRowKey());
        var childrenRowKeys;

        if (parentRow) {
            childrenRowKeys = parentRow.getTreeChildrenRowKeys();
        } else {
            childrenRowKeys = this._rootRow._treeData.childrenRowKeys.slice(0);
        }

        return childrenRowKeys;
    },
    /**
     * get row key of previous sibling
     * @param {number|string} rowKey - row key
     * @returns {number|string} - previous sibling row key
     */
    getTreePrevSiblingRowKey: function(rowKey) {
        var siblingRowKeys = this.getTreeSiblingRowKeys(rowKey);
        var currentIndex = siblingRowKeys.indexOf(rowKey);

        return currentIndex > 0 ? siblingRowKeys[currentIndex - 1] : null;
    },

    /**
     * get row key of next sibling
     * @param {number|string} rowKey - row key
     * @returns {number|string} - next sibling row key
     */
    getTreeNextSiblingRowKey: function(rowKey) {
        var siblingRowKeys = this.getTreeSiblingRowKeys(rowKey);
        var currentIndex = siblingRowKeys.indexOf(rowKey);

        return (currentIndex + 1 >= siblingRowKeys.length)
            ? null : siblingRowKeys[currentIndex + 1];
    },

    /**
     * get top most row keys
     * @returns {Array.<number|string>} - row keys
     */
    getTopMostRowKeys: function() {
        return this._rootRow._treeData.childrenRowKeys;
    },

    /**
     * get tree children of row of given rowKey
     * @param {number|string} rowKey - row key
     * @returns {Array.<number|string>} - children of found row
     */
    getTreeChildrenRowKeys: function(rowKey) {
        var row = this.get(rowKey);

        return row.getTreeChildrenRowKeys();
    },

    /**
     * get tree descendant of row of given rowKey
     * @param {number|string} rowKey - row key
     * @returns {Array.<number|string>} - descendant of found row
     */
    getTreeDescendantRowKeys: function(rowKey) {
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
     * @param {number|string} rowKey - row key
     * @param {boolean} recursive - true for recursively expand all descendant
     * @param {boolean} silent - true to mute event
     * @returns {Array.<number|string>} - children or descendant of given row
     */
    treeExpand: function(rowKey, recursive, silent) {
        var descendantRowKeys = this.getTreeDescendantRowKeys(rowKey);
        var row = this.get(rowKey);
        row.setTreeExpanded(true);

        if (recursive) {
            _.each(descendantRowKeys, function(descendantRowKey) {
                var descendantRow = this.get(descendantRowKey);
                if (descendantRow.hasTreeChildren()) {
                    descendantRow.setTreeExpanded(true);
                }
            }, this);
        } else {
            descendantRowKeys = _.filter(descendantRowKeys, function(descendantRowKey) {
                return this.isTreeVisible(descendantRowKey);
            }, this);
        }

        if (!silent) {
            /**
             * Occurs when the row having child rows is expanded
             * @event Grid#expanded
             * @type {module:event/gridEvent}
             * @property {number|string} rowKey - rowKey of the expanded row
             * @property {Array.<number|string>} descendantRowKeys - rowKey list of all descendant rows
             * @property {Grid} instance - Current grid instance
             */
            this.trigger('expanded', {
                rowKey: rowKey,
                descendantRowKeys: descendantRowKeys.slice(0)
            });
        }

        return descendantRowKeys;
    },

    /**
     * expand all rows
     */
    treeExpandAll: function() {
        var topMostRowKeys = this.getTopMostRowKeys();

        _.each(topMostRowKeys, function(topMostRowKey) {
            this.treeExpand(topMostRowKey, true, true);
        }, this);

        /**
         * Occurs when all rows having child rows are expanded
         * @event Grid#expandedAll
         */
        this.trigger('expandedAll');
    },

    /**
     * collapse tree row
     * @param {number|string} rowKey - row key
     * @param {boolean} recursive - true for recursively expand all descendant
     * @param {boolean} silent - true to mute event
     * @returns {Array.<number|string>} - children or descendant of given row
     */
    treeCollapse: function(rowKey, recursive, silent) {
        var row = this.get(rowKey);

        var descendantRowKeys = this.getTreeDescendantRowKeys(rowKey);

        if (recursive) {
            _.each(descendantRowKeys, function(descendantRowKey) {
                var descendantRow = this.get(descendantRowKey);
                if (descendantRow.hasTreeChildren()) {
                    descendantRow.setTreeExpanded(false);
                }
            }, this);
        } else {
            descendantRowKeys = _.filter(descendantRowKeys, function(descendantRowKey) {
                return this.isTreeVisible(descendantRowKey);
            }, this);
        }

        row.setTreeExpanded(false);

        if (!silent) {
            /**
             * Occurs when the row having child rows is collapsed
             * @event Grid#collapsed
             * @type {module:event/gridEvent}
             * @property {number|string} rowKey - rowKey of the collapsed row
             * @property {Array.<number|string>} descendantRowKeys - rowKey list of all descendant rows
             * @property {Grid} instance - Current grid instance
             */
            this.trigger('collapsed', {
                rowKey: rowKey,
                descendantRowKeys: descendantRowKeys.slice(0)
            });
        }

        return descendantRowKeys;
    },

    /**
     * collapse all rows
     */
    treeCollapseAll: function() {
        var topMostRowKeys = this.getTopMostRowKeys();

        _.each(topMostRowKeys, function(topMostRowKey) {
            this.treeCollapse(topMostRowKey, true, true);
        }, this);

        /**
         * Occurs when all rows having child rows are collapsed
         * @event Grid#collapsedAll
         */
        this.trigger('collapsedAll');
    },

    /**
     * get the parent of the row which has the given row key
     * @param {number|string} rowKey - row key
     * @returns {TreeRow} - the parent row
     */
    getTreeParent: function(rowKey) {
        var row = this.get(rowKey);

        if (!row) {
            return null;
        }

        return this.get(row.getTreeParentRowKey());
    },

    /**
     * get the ancestors of the row which has the given row key
     * @param {number|string} rowKey - row key
     * @returns {Array.<TreeRow>} - the ancestor rows
     */
    getTreeAncestors: function(rowKey) {
        var ancestors = [];
        var row = this.getTreeParent(rowKey);

        while (row) {
            ancestors.push(row);
            row = this.getTreeParent(row.get('rowKey'));
        }

        return ancestors.reverse();
    },

    /**
     * get the children of the row which has the given row key
     * @param {number|string} rowKey - row key
     * @returns {Array.<TreeRow>} - the children rows
     */
    getTreeChildren: function(rowKey) {
        var childrenRowKeys = this.getTreeChildrenRowKeys(rowKey);

        return _.map(childrenRowKeys, function(childRowKey) {
            return this.get(childRowKey);
        }, this);
    },

    /**
     * get the descendants of the row which has the given row key
     * @param {number|string} rowKey - row key
     * @returns {Array.<TreeRow>} - the descendant rows
     */
    getTreeDescendants: function(rowKey) {
        var descendantRowKeys = this.getTreeDescendantRowKeys(rowKey);

        return _.map(descendantRowKeys, function(descendantRowKey) {
            return this.get(descendantRowKey);
        }, this);
    },

    /**
     * get the depth of the row which has the given row key
     * @param {number|string} rowKey - row key
     * @returns {number} - the depth
     */
    getTreeDepth: function(rowKey) {
        var row = this.get(rowKey);
        var depth;

        if (row) {
            return row.getTreeDepth();
        }

        return depth;
    },

    /**
     * test if the row of given key should be visible
     * @param {string|number} rowKey - row key to test
     * @returns {boolean} - true if visible
     */
    isTreeVisible: function(rowKey) {
        var visible = true;

        _.each(this.getTreeAncestors(rowKey), function(ancestor) {
            visible = visible && ancestor.getTreeExpanded();
        }, this);

        return visible;
    },

    /**
     * Check whether the row is visible or not
     * @returns {boolean} state
     * @override
     * @todo Change the method name from isTreeVisible to isVisibleRow
     */
    isVisibleRow: function(rowKey) {
        return this.isTreeVisible(rowKey);
    },

    /**
     * Check the checkbox input in the row header
     * @param {number} rowKey - Current row key
     * @override
     */
    check: function(rowKey) {
        var selectType = this.columnModel.get('selectType');

        if (selectType === 'radio') {
            this.uncheckAll();
        }

        this._setCheckedState(rowKey, true);
    },

    /**
     * Uncheck the checkbox input in the row header
     * @param {number} rowKey - Current row key
     * @override
     */
    uncheck: function(rowKey) {
        this._setCheckedState(rowKey, false);
    },

    /**
     * Set checked state by using a cascading option
     * @param {number} rowKey - Current row key
     * @param {boolean} state - Whether checking the input button or not
     * @private
     */
    _setCheckedState: function(rowKey, state) {
        var useCascadingCheckbox = this.columnModel.useCascadingCheckbox();

        this.setValue(rowKey, '_button', state);

        if (useCascadingCheckbox) {
            this._updateDecendantsCheckedState(rowKey, state);
            this._updateAncestorsCheckedState(rowKey);
        }
    },

    /**
     * Update checked state of all descendant rows
     * @param {number} rowKey - Current row key
     * @param {boolean} state - Whether checking the input button or not
     * @private
     */
    _updateDecendantsCheckedState: function(rowKey, state) {
        var descendants = this.getTreeDescendants(rowKey);

        _.each(descendants, function(descendantRowKey) {
            this.setValue(descendantRowKey, '_button', state);
        }, this);
    },

    /**
     * Update checked state of all ancestor rows
     * @param {number} rowKey - Current row key
     * @param {boolean} state - Whether checking the input button or not
     * @private
     */
    _updateAncestorsCheckedState: function(rowKey) {
        var parentRowKey = this.get(rowKey).getTreeParentRowKey();

        while (parentRowKey > -1) {
            this._setCheckedStateToParent(parentRowKey);
            parentRowKey = this.get(parentRowKey).getTreeParentRowKey();
        }
    },

    /**
     * Set checked state of the parent row according to the checked children rows
     * @param {number} rowKey - Current row key
     * @private
     */
    _setCheckedStateToParent: function(rowKey) {
        var childernRowKeys = this.get(rowKey).getTreeChildrenRowKeys();
        var checkedChildrenCnt = 0;
        var checkedState;

        _.each(childernRowKeys, function(childRowKey) {
            if (this.get(childRowKey).get('_button')) {
                checkedChildrenCnt += 1;
            }
        }, this);

        checkedState = checkedChildrenCnt === childernRowKeys.length;

        this.setValue(rowKey, '_button', checkedState);
    }
});

module.exports = TreeRowList;
