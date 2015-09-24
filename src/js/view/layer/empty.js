/**
 * @fileoverview Empty layer class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * Class for the layer which shows a 'no data' message
 * @module view/layer/empty
 */
var Empty = Layer.extend(/**@lends module:view/layer/empty.prototype */{
    /**
     * @constructs
     * @extends module:view/layer
     * @param {object} options - options
     * @param {string} options.text - text to be shown on the layer
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            text: this.grid.options.emptyMessage || '데이터가 존재하지 않습니다.'
        });
    },

    className: 'no_row_layer',

    template: _.template('<%=text%>')
});

module.exports = Empty;
