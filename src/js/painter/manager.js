/**
 * @fileoverview Painter Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

var RowPainter = require('./row');
var CellPainter = require('./cell');
var DummyCellPainter = require('./dummyCell');
var TextPainter = require('./input/text');
var SelectPainter = require('./input/select');
var ButtonPainter = require('./input/button');

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
        this.gridId = options.gridId;
        this.selectType = options.selectType;

        this.inputPainters = this._createInputPainters(options.controller);
        this.cellPainters = this._createCellPainters(options.controller);
        this.rowPainter = this._createRowPainter();
    },

    _createInputPainters: function(controller) {
        return {
            text: new TextPainter({
                controller: controller,
                inputType: 'text'
            }),
            password: new TextPainter({
                controller: controller,
                inputType: 'password'
            }),
            checkbox: new ButtonPainter({
                controller: controller,
                inputType: 'checkbox'
            }),
            radio: new ButtonPainter({
                controller: controller,
                inputType: 'radio'
            }),
            select: new SelectPainter({
                controller: controller
            })
        };
    },

    /**
     * Creates instances of cell painters and returns the map object that stores them
     * using 'editType' as a key.
     * @returns {Object} Key-value object
     * @private
     */
    _createCellPainters: function(controller) {
        return {
            dummy: new DummyCellPainter({
                controller: controller
            }),
            normal: new CellPainter({
                editType: 'normal'
            }),
            text: new CellPainter({
                editType: 'text',
                inputPainter: this.inputPainters.text
            }),
            password: new CellPainter({
                editType: 'password',
                inputPainter: this.inputPainters.password
            }),
            select: new CellPainter({
                editType: 'select',
                inputPainter: this.inputPainters.select
            }),
            checkbox: new CellPainter({
                editType: 'checkbox',
                inputPainter: this.inputPainters.checkbox
            }),
            radio: new CellPainter({
                editType: 'radio',
                inputPainter: this.inputPainters.radio
            })
        };
    },

    /**
     * Creates row painter and returns it.
     * @returns {module:painter/row} New row painter instance
     */
    _createRowPainter: function() {
        return new RowPainter({
            painterManager: this
        });
    },

    /**
     * Returns an instance of cell painter which has given editType
     * @param {String} editType - Edit type
     * @returns {Object} - Cell painter instance
     */
    getCellPainter: function(editType) {
        return this.cellPainters[editType];
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
