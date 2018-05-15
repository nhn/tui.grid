/**
 * @fileoverview TreeRow data model implementation
 * @author NHN Ent. FE Development Team
 */

'use strict';

var util = require('tui-code-snippet');

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
        this.extraDataManager.setTreeState(state ? treeState.EXPAND : treeState.COLLAPSE);
        this._triggerExtraDataChangeEvent();
    },

    /**
     * get tree state
     * @returns {boolean} - true if expanded
     */
    getTreeExpanded: function() {
        return this.extraDataManager.getTreeState() === treeState.EXPAND;
    },

    _getTreeData: function() {
        return this.get('_treeData');
    },

    getDepth: function() {
        return this.hasNextSibling().length;
    },

    hasChildren: function() {
        var childrenRowKeys = this._getTreeData().childrenRowKeys;

        return util.isArray(childrenRowKeys) && childrenRowKeys.length > 0;
    },

    hasNextSibling: function() {
        return this._getTreeData().hasNextSibling;
    }
}, {
    privateProperties: PRIVATE_PROPERTIES,
    treeState: treeState
});

module.exports = TreeRow;
