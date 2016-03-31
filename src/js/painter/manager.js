/**
 * @fileoverview Painter Manager
 * @author NHN Ent. FE Development Team
 */
'use strict';

// var MainButtonCell = require('./cell/mainButton');
// var NumberCell = require('./cell/number');
// var NormalCell = require('./cell/normal');
// var ButtonListCell = require('./cell/button');
// var SelectCell = require('./cell/select');
// var TextCell = require('./cell/text');
// var TextConvertibleCell = require('./cell/text-convertible');
// var TextPasswordCell = require('./cell/text-password');
// var DummyCell = require('./dummyCell');
var RowPainter = require('./row');
var CellPainter = require('./cell');
var TextPainter = require('./input/text');

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
                editType: 'text'
            }),

            password: new TextPainter({
                controller: controller,
                editType: 'password'
            })
        };
    },

    /**
     * Creates instances of cell painters and returns the map object that stores them
     * using 'editType' as a key.
     * @returns {Object} Key-value object
     * @private
     */
    _createCellPainters: function() {
        var cellPainters = {};
            // options = {
            //     controller: controller
            // };
            // instanceList = [
                // new MainButtonCell(_.assign({}, options, {
                //     gridId: this.gridId,
                //     selectType: this.selectType
                // })),
                // new CellPainter(_.assign({editType: 'normal', attributes: {align: 'center'}}, options)),
                // new CellPainter(_.assign({editType: 'normal'}, options))
                // new ButtonListCell(options),
                // new SelectCell(options),
                // new TextCell(options),
                // new TextPasswordCell(options),
                // new TextConvertibleCell(options),
                // new DummyCell(options)
            // ];

        cellPainters = {
            normal: new CellPainter(),

            text: new CellPainter({
                inputPainter: this.inputPainters.text
            }),

            password: new CellPainter({
                inputPainter: this.inputPainters.password
            })
        };
        //
        // _.each(instanceList, function(instance) {
        //     cellPainters[instance.editType] = instance;
        // });
        //
        return cellPainters;
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
        var instance = this.cellPainters[editType];

        if (!instance) {
            if (editType === 'radio' || editType === 'checkbox') {
                instance = this.cellPainters.button;
            } else {
                instance = this.cellPainters.normal;
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

    getInputPainters: function() {
        return this.inputPainters;
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
