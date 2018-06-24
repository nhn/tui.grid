/**
 * @fileoverview Class for the content area
 * @author NHN Ent. FE Development Team
 */

'use strict';

var $ = require('jquery');
var View = require('../../base/view');
var classNameConst = require('../../common/classNameConst');
var constMap = require('../../common/constMap');
var frameConst = constMap.frame;
var ContentArea;

/**
 * Create DIV element to draw border
 * @param {String} className - border class name
 * @returns {jQuery}
 * @ignore
 */
function borderDIV(className) {
    return $('<div>')
        .addClass(classNameConst.BORDER_LINE)
        .addClass(className);
}

/**
 * Content area
 * @module view/layout/content-area
 * @extends module:base/view
 * @param {Object} options - Options
 * @ignore
 */
ContentArea = View.extend(/** @lends module:view/layout/content-area.prototype */{
    initialize: function(options) {
        View.prototype.initialize.call(this);

        this.viewFactory = options.viewFactory;
        this.dimensionModel = options.dimensionModel;
        this._addFrameViews();
    },

    className: classNameConst.CONTENT_AREA,

    /**
     * Creates Frame views and add them as children.
     * @private
     */
    _addFrameViews: function() {
        var factory = this.viewFactory;

        this._addChildren([
            factory.createFrame(frameConst.L),
            factory.createFrame(frameConst.R)
        ]);
    },

    /**
     * Renders
     * @returns {Object} this object
     */
    render: function() {
        var dimensionModel = this.dimensionModel;
        var scrollXHeight = dimensionModel.getScrollXHeight();
        var childElements = this._renderChildren().concat([
            borderDIV(classNameConst.BORDER_TOP),
            borderDIV(classNameConst.BORDER_LEFT),
            borderDIV(classNameConst.BORDER_RIGHT),
            borderDIV(classNameConst.BORDER_BOTTOM).css('bottom', scrollXHeight)
        ]);
        var classNames = [];

        if (!dimensionModel.get('scrollX')) {
            classNames.push(classNameConst.NO_SCROLL_X);
        }

        if (!dimensionModel.get('scrollY')) {
            classNames.push(classNameConst.NO_SCROLL_Y);
        }

        if (dimensionModel.get('summaryHeight')) {
            if (dimensionModel.get('summaryPosition') === constMap.summaryPosition.TOP) {
                classNames.push(classNameConst.HAS_SUMMARY_TOP);
            } else {
                classNames.push(classNameConst.HAS_SUMMARY_BOTTOM);
            }
        }

        if (dimensionModel.get('rsideWidth')) {
            classNames.push(classNameConst.SHOW_LSIDE_AREA);
        }

        this.$el.addClass(classNames.join(' '));
        this.$el.append(childElements);

        return this;
    }
});

module.exports = ContentArea;
