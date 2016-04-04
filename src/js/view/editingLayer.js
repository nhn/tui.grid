/**
 * @fileoverview Layer class that represents the state of rendering phase
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');

/**
 * Layer class that represents the state of rendering phase.
 * @module view/editingLayer
 * @extends module:base/view
 */
var EditingLayer = View.extend(/**@lends module:view/editingLayer.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    initialize: function(options) {
        this.focusModel = options.focusModel;
        this.renderModel = options.renderModel;
        this.domState = options.domState;
        this.inputPainters = options.inputPainters;


        this.listenTo(this.focusModel, 'change:editingAddress', this._resetState);
    },

    className: 'editing_layer',

    /**
     */
    _startEditing: function(rowKey, columnName) {
        var cellData = this.renderModel.getCellData(rowKey, columnName),
            convertible = tui.util.pick(cellData, 'columnModel', 'editOption', 'convertible'),
            editType, painter, layoutStyle;

        if (convertible === true) {
            editType = tui.util.pick(cellData, 'columnModel', 'editOption', 'type');
            painter = this.inputPainters[editType];
            layoutStyle = this._calculateLayoutStyle(rowKey, columnName);
            this.$el.css(layoutStyle).show();
            this.$el.html(painter.generateHtml(cellData));
            this.$el.attr({
                'data-row-key': rowKey,
                'data-column-name': columnName
            });
            painter.focus(this.$el);
        }
    },

    _endEditing: function() {
        this.$el.removeAttr('data-row-key');
        this.$el.removeAttr('data-column-name');
        this.$el.empty().hide();
    },

    _calculateLayoutStyle: function(rowKey, columnName) {
        var wrapperOffset = this.domState.getOffset(),
            $cell = this.domState.getElement(rowKey, columnName),
            cellOffset = $cell.offset(),
            cellHeight = $cell.outerHeight();

        return {
            top: cellOffset.top - wrapperOffset.top - 1,
            left: cellOffset.left - wrapperOffset.left - 1,
            height: cellHeight,
            lineHeight: cellHeight + 'px'
        };
    },

    _resetState: function() {
        var address = this.focusModel.get('editingAddress');

        if (address) {
            this._startEditing(address.rowKey, address.columnName);
        } else {
            this._endEditing();
        }
    },

    /**
     * Render
     * @returns {Object} this instance
     */
    render: function() {
        _.each(this.inputPainters, function(painter) {
            painter.attachEventHandlers(this.$el, '');
        }, this);

        return this;
    }
});

module.exports = EditingLayer;
