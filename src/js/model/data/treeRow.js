/**
 * @fileoverview TreeRow data model implementation
 * @author NHN Ent. FE Development Team
 */

'use strict';

var Row = require('./row');

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
    }
}, {
    privateProperties: PRIVATE_PROPERTIES
});

module.exports = TreeRow;
