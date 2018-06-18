/**
 * @fileoverview TreeRow data model implementation
 * @author NHN Ent. FE Development Team
 */

'use strict';

var _ = require('underscore');
var Row = require('./row');
var treeState = require('../../common/constMap').treeState;

var PRIVATE_PROPERTIES = [
    '_button',
    '_number',
    '_extraData',
    '_treeData',
    '_children'
];

/**
 * TreeRow class implementation
 * @module model/data/columnModel
 * @extends module:base/model
 * @ignore
 */
var TreeRow = Row.extend(/** @lends module:model/data/treeRow.prototype */{
    /**
     * Returns the Array of private property names
     * @returns {array} An array of private property names
     */
    getPrivateProperties: function() {
        return PRIVATE_PROPERTIES;
    },

    /**
     * set tree state
     * @param {boolean} state - true if expanded
     */
    setTreeExpanded: function(state) {
        var prevState = this.getTreeExpanded();

        this.extraDataManager.setTreeState(state ? treeState.EXPAND : treeState.COLLAPSE);

        if (state !== prevState) {
            this._triggerExtraDataChangeEvent();
        }
    },

    /**
     * get tree state
     * @returns {boolean} - true if expanded
     */
    getTreeExpanded: function() {
        return this.extraDataManager.getTreeState() === treeState.EXPAND;
    },

    /**
     * get tree data
     * @returns {Object} - tree data
     * @private
     */
    _getTreeData: function() {
        return this.get('_treeData');
    },

    /**
     * get tree depth of this row
     * @returns {number} - depth of this row
     */
    getTreeDepth: function() {
        return this.hasTreeNextSibling().length;
    },

    /**
     * check whether this row has one or more children
     * @returns {boolean} - true if it has children
     */
    hasTreeChildren: function() {
        var childrenRowKeys = this._getTreeData().childrenRowKeys;
        var hasChildren = _.isArray(childrenRowKeys) && !!childrenRowKeys.length;

        if (this.get('_children')) {
            hasChildren = true;
        }

        return hasChildren;
    },

    /**
     * gets children row keys
     * @returns {Array.<number|string>} - array of children row keys
     */
    getTreeChildrenRowKeys: function() {
        return this._getTreeData().childrenRowKeys || [];
    },

    /**
     * sets children row keys
     * @param {Array.<number|string>} rowKeys - array of children row keys
     */
    setTreeChildrenRowKeys: function(rowKeys) {
        this._getTreeData().childrenRowKeys = rowKeys;
    },

    /**
     * remove a child key from children row keys
     * @param {Array.<number|string>} rowKey - the key of the row to be removed
     */
    removeTreeChildrenRowKey: function(rowKey) {
        var treeData = this._getTreeData();

        treeData.childrenRowKeys = _.filter(treeData.childrenRowKeys, function(childRowKey) {
            return childRowKey !== rowKey;
        }, this);
    },

    /**
     * check whether this row has one or more next sibling
     * @returns {boolean} - true if this row has siblings
     */
    hasTreeNextSibling: function() {
        return this._getTreeData().hasNextSibling;
    },

    /**
     * gets parent row key
     * @returns {number|string} - parent row key
     */
    getTreeParentRowKey: function() {
        return this._getTreeData().parentRowKey;
    }
}, {
    privateProperties: PRIVATE_PROPERTIES,
    treeState: treeState
});

module.exports = TreeRow;
