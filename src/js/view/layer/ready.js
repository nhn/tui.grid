/**
 * @fileoverview Ready layer class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * Class for the layer which shows a initializing-message
 * @module view/layer/ready
 */
var Ready = Layer.extend(/**@lends module:view/layer/ready.prototype */{
    /**
     * @constructs
     * @extends module:view/layer
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.text = '초기화 중 입니다.';
    },

    className: 'initializing_layer'
});

module.exports = Ready;
