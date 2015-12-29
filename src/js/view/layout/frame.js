/**
 * @fileoverview Frame Base
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');

/**
 * frame Base 클래스
 * @module view/layout/frame
 */
var Frame = View.extend(/**@lends module:view/layout/frame.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options Options
     *      @param {String} [options.whichSide='R']  어느 영역의 frame 인지 여부.
     */
    initialize: function(options) {
        this.setOwnProperties({
            viewFactory: options.viewFactory,
            renderModel: options.renderModel,
            dimensionModel: options.dimensionModel,
            whichSide: options.whichSide || 'R'
        });

        this.listenTo(this.renderModel, 'columnModelChanged', this.render, this)
            .listenTo(this.dimensionModel, 'columnWidthChanged', this._onColumnWidthChanged, this);
    },

    tagName: 'div',

    className: 'lside_area',

    /**
     * 랜더링 메서드
     * @return {View.Layout.Frame} This object
     */
    render: function() {
        var header, body;

        this.destroyChildren();
        this.beforeRender();

        header = this.viewFactory.createHeader(this.whichSide);
        body = this.viewFactory.createBody(this.whichSide);

        this.$el
            .append(header.render().el)
            .append(body.render().el);

        this.afterRender();
        return this;
    },
    /**
     * columnModel change 시 수행되는 핸들러 스켈레톤
     * @private
     */
    _onColumnWidthChanged: function() {},
    /**
     * 랜더링 하기전에 수행하는 함수 스켈레톤
     */
    beforeRender: function() {},
    /**
     * 랜더링 이후 수행하는 함수 스켈레톤
     */
    afterRender: function() {}
});

module.exports = Frame;
