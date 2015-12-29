/**
 * @fileoverview Cell Painter Factory
 * @author NHN Ent. FE Development Team
 */
'use strict';

var View = require('../base/view');

var MainButtonCell = require('./painter/cell/mainButton');
var NumberCell = require('./painter/cell/number');
var NormalCell = require('./painter/cell/normal');
var ButtonListCell = require('./painter/cell/button');
var SelectCell = require('./painter/cell/select');
var TextCell = require('./painter/cell/text');
var TextConvertibleCell = require('./painter/cell/text-convertible');
var TextPasswordCell = require('./painter/cell/text-password');

/**
 * Cell Factory
 * @module view/cellFactory
 */
var CellFactory = View.extend(/**@lends module:view/cellFactory.prototype */{
    /**
     * @constructs
     * @extends module:base/view
     */
    initialize: function(options) {
        this.grid = options.grid;
        this._initializeInstances();
    },

    /**
     * 종류별 Cell Painter Instance 를 를 생성한다.
     * @private
     */
    _initializeInstances: function() {
        var instances = {},
            args = {
                grid: this.grid
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
            instances[instance.getEditType()] = instance;
        }, this);

        this.setOwnProperties({
            instances: instances
        });
    },

    /**
     * 인자로 받은 editType 에 해당하는 Cell Painter Instance 를 반환한다.
     * @param {String} editType editType 정보
     * @return {Object} editType 에 해당하는 페인터 인스턴스
     */
    getInstance: function(editType) {
        var instance = this.instances[editType];

        if (!instance) {
            //checkbox, radio 의 경우, instance 의 이름이 전달받는 editType 과 다르기 때문에 예외처리 한다.
            if (editType === 'radio' || editType === 'checkbox') {
                instance = this.instances['button'];
            } else {
                //그 외의 경우 모두 normal 로 처리한다.
                instance = this.instances['normal'];
            }
        }
        return instance;
    }
});

module.exports = CellFactory;
