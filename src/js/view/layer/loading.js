/**
 * @fileoverview Loading layer class
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Layer = require('../layer');

/**
 * Class for the layer which shows a loading indicator
 * @module view/layer/loading
 */
var Loading = Layer.extend(/**@lends module:view/layer/loading.prototype */{
    /**
     * @constructs
     * @extends module:view/layer
     */
    initialize: function() {
        Layer.prototype.initialize.apply(this, arguments);
        this.text = '요청을 처리 중입니다.';
    },

    className: 'loading_layer',

    template: _.template('' +
        '<div>' +
        '    <%=text%>' +
        '    <div class="loading_img"></div>' +
        '</div>')
});

module.exports = Loading;
