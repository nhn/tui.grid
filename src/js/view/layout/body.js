/**
 * @fileoverview Class for the body layout
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../../base/view');
var SelectionLayer = require('../../view/selectionLayer');
var BodyTableView = require('./bodyTable');

var HTML_CONTAINER = '<div class="body_container"></div>';

/**
 * Class for the body layout
 * @module view/layout/body
 */
var Body = View.extend(/**@lends module:view/layout/body.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     * @param {Object} options - Options
     *      @param {String} [options.whichSide='R'] L or R (which side)
     */
    initialize: function(options) {
        View.prototype.initialize.apply(this, arguments);
        this.setOwnProperties({
            // DIV for setting rendering position of entire child-nodes of $el.
            $container: null,
            whichSide: options && options.whichSide || 'R'
        });

        this.listenTo(this.grid.dimensionModel, 'change:bodyHeight', this._onBodyHeightChange)
            .listenTo(this.grid.dataModel, 'add remove reset', this._resetContainerHeight)
            .listenTo(this.grid.renderModel, 'change:scrollTop', this._onScrollTopChange)
            .listenTo(this.grid.renderModel, 'change:scrollLeft', this._onScrollLeftChange);
    },

    tagName: 'div',

    className: 'data',

    events: {
        'scroll': '_onScroll'
    },

    /**
     * DimensionModel 의 body Height 가 변경된 경우 element 의 height 를 조정한다.
     * @param {Object} model 변경이 일어난 model 인스턴스
     * @param {Number} value bodyHeight 값
     * @private
     */
    _onBodyHeightChange: function(model, value) {
        this.$el.css('height', value + 'px');
    },

    /**
     * Resets the height of a container div.
     */
    _resetContainerHeight: function() {
        this.$container.css({
            height: this.grid.dimensionModel.get('totalRowHeight')
        });
    },

    /**
     * 스크롤 이벤트 핸들러
     * @param {event} scrollEvent   스크롤 이벤트
     * @private
     */
    _onScroll: function(scrollEvent) {
        var attrs = {
            scrollTop: scrollEvent.target.scrollTop
        };

        if (this.whichSide === 'R') {
            attrs.scrollLeft = scrollEvent.target.scrollLeft;
        }
        this.grid.renderModel.set(attrs);
    },

    /**
     * Render model 의 Scroll left 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollLeft 값
     * @private
     */
    _onScrollLeftChange: function(model, value) {
        if (this.whichSide === 'R') {
            this.el.scrollLeft = value;
        }
    },

    /**
     * Render model 의 Scroll top 변경 이벤트 핸들러
     * @param {object} model 변경이 일어난 모델 인스턴스
     * @param {Number} value scrollTop값
     * @private
     */
    _onScrollTopChange: function(model, value) {
        this.el.scrollTop = value;
    },

    /**
     * rendering 한다.
     * @return {View.Layout.Body}   자기 자신
     */
    render: function() {
        var grid = this.grid,
            whichSide = this.whichSide,
            selectionLayer, bodyTableView;

        this.destroyChildren();

        if (!this.grid.option('scrollX')) {
            this.$el.css('overflow-x', 'hidden');
        }
        if (!this.grid.option('scrollY') && whichSide === 'R') {
            this.$el.css('overflow-y', 'hidden');
        }
        this.$el.css('height', grid.dimensionModel.get('bodyHeight'));

        this.$container = $(HTML_CONTAINER);
        this.$el.append(this.$container);

        bodyTableView = this.createView(BodyTableView, {
            grid: grid,
            whichSide: whichSide
        });
        selectionLayer = this.createView(SelectionLayer, {
            grid: grid,
            whichSide: whichSide
        });

        this.$container.append(
            bodyTableView.render().el,
            selectionLayer.render().el
        );
        return this;
    }
});

module.exports = Body;
