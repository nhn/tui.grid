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
var RowPainter = require('./row');

var PainterManager = tui.util.defineClass({
    /**
     * @constructs
     * @extends module:base/view
     */
    init: function(options) {
        this.modelManager = options.modelManager;

        this.cellPainters = this._createCellPainters();
        this.rowPainter = this._createRowPainter();
    },

    /**
     * 종류별 Cell Painter Instance 를 를 생성한다.
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
                new TextConvertibleCell(args)
            ];

        _.each(instanceList, function(instance) {
            cellPainters[instance.getEditType()] = instance;
        });
        return cellPainters;
    },

    /**
     * Creates row painter and returns it.
     * @return {module:painter/row} New row painter instance
     */
    _createRowPainter: function() {
        return new RowPainter({
            grid: this.modelManager,
            painterManager: this
        });
    },

    /**
     * 인자로 받은 editType 에 해당하는 Cell Painter Instance 를 반환한다.
     * @param {String} editType editType 정보
     * @return {Object} editType 에 해당하는 페인터 인스턴스
     */
    getCellPainter: function(editType) {
        var instance = this.cellPainters[editType];

        if (!instance) {
            //checkbox, radio 의 경우, instance 의 이름이 전달받는 editType 과 다르기 때문에 예외처리 한다.
            if (editType === 'radio' || editType === 'checkbox') {
                instance = this.cellPainters['button'];
            } else {
                //그 외의 경우 모두 normal 로 처리한다.
                instance = this.cellPainters['normal'];
            }
        }
        return instance;
    },

    /**
     * Returns all cell painters
     * @return {Object} Object that has edit-type as a key and cell painter as a value
     */
    getCellPainters: function() {
        return this.cellPainters;
    },

    /**
     * Returns a row painter
     * @return {module:painter/row} Row painter
     */
    getRowPainter: function() {
        return this.rowPainter;
    }
});

module.exports = PainterManager;
