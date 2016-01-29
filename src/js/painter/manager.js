/**
 * @fileoverview Painter Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var MainButtonCell = require('./cell/mainButton');
var NumberCell = require('./cell/number');
var NormalCell = require('./cell/normal');
var ButtonListCell = require('./cell/button');
var SelectCell = require('./cell/select');
var TextCell = require('./cell/text');
var TextConvertibleCell = require('./cell/text-convertible');
var TextPasswordCell = require('./cell/text-password');
var DummyCell = require('./dummyCell');
var RowPainter = require('./row');

/**
 * Painter manager
 * @module painter/manager
 */
var PainterManager = tui.util.defineClass(/**@lends module:painter/manager.prototype */{
    /**
     * @constructs
     * @param {Object} options - Options
     */
    init: function(options) {
        this.modelManager = options.modelManager;

        this.cellPainters = this._createCellPainters();
        this.rowPainter = this._createRowPainter();
    },

    /**
     * Creates instances of cell painters and returns the map object that stores them
     * using 'editType' as a key.
     * @returns {Object} Key-value object
     * @private
     */
    _createCellPainters: function() {
        var cellPainters = {},
            args = {
                grid: this.modelManager
            },
            instanceList = [
                new MainButtonCell(args),
                new NumberCell(args),
                new NormalCell(args),
                new ButtonListCell(args),
                new SelectCell(args),
                new TextCell(args),
                new TextPasswordCell(args),
                new TextConvertibleCell(args),
                new DummyCell(args)
            ];

        _.each(instanceList, function(instance) {
            cellPainters[instance.getEditType()] = instance;
        });
        return cellPainters;
    },

    /**
     * Creates row painter and returns it.
     * @returns {module:painter/row} New row painter instance
     */
    _createRowPainter: function() {
        return new RowPainter({
            grid: this.modelManager,
            painterManager: this
        });
    },

    /**
     * Returns an instance of cell painter which has given editType
     * @param {String} editType - Edit type
     * @returns {Object} - Cell painter instance
     */
    getCellPainter: function(editType) {
        var instance = this.cellPainters[editType];

        if (!instance) {
            if (editType === 'radio' || editType === 'checkbox') {
                instance = this.cellPainters['button'];
            } else {
                instance = this.cellPainters['normal'];
            }
        }
        return instance;
    },

    /**
     * Returns all cell painters
     * @returns {Object} Object that has edit-type as a key and cell painter as a value
     */
    getCellPainters: function() {
        return this.cellPainters;
    },

    /**
     * Returns a row painter
     * @returns {module:painter/row} Row painter
     */
    getRowPainter: function() {
        return this.rowPainter;
    }
});

module.exports = PainterManager;
