/**
 * @fileoverview Grid 의 Data Source 에 해당하는 Model 정의
 * @author NHN Ent. FE Development Team
 */
'use strict';

var Model = require('../base/model');
var util = require('../util');

/**
 * Data 중 각 행의 데이터 모델 (DataSource)
 * @module data/row
 */
var Row = Model.extend(/**@lends module:data/row.prototype */{
    /**
     * @constructs
     * @extends module:base/model
     */
    initialize: function() {
        Model.prototype.initialize.apply(this, arguments);
    },

    idAttribute: 'rowKey',
    defaults: {
        _extraData: {
            'rowState': null
        }
    },

    /**
     * extraData 로 부터 rowState 를 object 형태로 반환한다.
     * @return {{isDisabled: boolean, isDisabledCheck: boolean}} rowState 정보
     */
    getRowState: function() {
        var extraData = this.get('_extraData'),
            rowState = extraData && extraData['rowState'],
            isDisabledCheck = false,
            isDisabled = false,
            isChecked = false;

        if (rowState === 'DISABLED') {
            isDisabled = true;
        } else if (rowState === 'DISABLED_CHECK') {
            isDisabledCheck = true;
        } else if (rowState === 'CHECKED') {
            isChecked = true;
        }

        isDisabledCheck = isDisabled ? isDisabled : isDisabledCheck;

        return {
            isDisabled: isDisabled,
            isDisabledCheck: isDisabledCheck,
            isChecked: isChecked
        };
    },
    /**
     * row의 extraData에 설정된 classNameList 를 반환한다.
     * @param {String} [columnName] columnName 이 없을 경우 row 에 정의된 className 만 반환한다.
     * @return {Array} css 클래스 이름의 배열
     */
    getClassNameList: function(columnName) {
        var classNameList = [],
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            extraData = this.get('_extraData'),
            classNameObj = extraData.className,
            rowClassNameList = (classNameObj && classNameObj['row']) ? classNameObj['row'] : [], //_extraData 의 row 에 할당된 className 을 담는다.
            columnClassNameList = (classNameObj && classNameObj['column'] && classNameObj['column'][columnName]) ? classNameObj['column'][columnName] : [], //_extraData 의 column 에 할당된 className 을 담는다.
            tmpList,
            classNameMap = {},
            columnModelClassNameList = []; //columnModel 에 할당된 className 리스트

        if (columnModel.className) {
            columnModelClassNameList.push(columnModel.className);
        }
        if (columnModel.isEllipsis) {
            columnModelClassNameList.push('ellipsis');
        }

        tmpList = [classNameList, rowClassNameList, columnClassNameList, columnModelClassNameList];

        ne.util.forEachArray(tmpList, function(list) {
            ne.util.forEachArray(list, function(item) {
                var sliced = item.slice(' ');
                if (ne.util.isArray(sliced)) {
                    ne.util.forEachArray(sliced, function(className) {
                        classNameMap[className] = true;
                    });
                } else {
                    classNameMap[item] = true;
                }
            });
        });

        ne.util.forEach(classNameMap, function(value, className) {
            classNameList.push(className);
        });

        return classNameList;
    },
    /**
     * columnName 에 해당하는 셀의 편집 가능여부와 disabled 상태 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {{isEditable: boolean, isDisabled: boolean}} 편집 가능여부와 disabled 상태 정보
     */
    getCellState: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            columnModel = this.grid.columnModel,
            isDisabled = false,
            isEditable = true,
            editType = columnModel.getEditType(columnName),
            rowState, relationResult;


        relationResult = this.getRelationResult(['isDisabled', 'isEditable'])[columnName];
        rowState = this.getRowState();

        if (columnName === '_button') {
            isDisabled = rowState.isDisabledCheck;
        } else {
            isDisabled = rowState.isDisabled;
        }
        isDisabled = isDisabled || !!(relationResult && relationResult['isDisabled']);

        if ($.inArray(editType, notEditableTypeList) !== -1) {
            isEditable = false;
        } else {
            isEditable = !(relationResult && relationResult['isEditable'] === false);
        }

        return {
            isEditable: isEditable,
            isDisabled: isDisabled
        };
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 편집 가능한지 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean}    편집 가능한지 여부
     */
    isEditable: function(columnName) {
        var notEditableTypeList = ['_number', 'normal'],
            editType = this.grid.columnModel.getEditType(columnName),
            result = false;

        if ($.inArray(editType, notEditableTypeList) === -1) {
            result = this.getCellState(columnName).isEditable;
        }
        return result;
    },

    /**
     * rowKey 와 columnName 에 해당하는 셀이 disable 상태인지 여부를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {Boolean}    disabled 처리를 할지 여부
     */
    isDisabled: function(columnName) {
        var cellState;
        cellState = this.getCellState(columnName);
        return cellState.isDisabled;
    },

    /**
     * getRowSpanData
     * rowSpan 설정값을 반환한다.
     * @param {String} [columnName] 인자가 존재하지 않을 경우, 행 전체의 rowSpanData 를 맵 형태로 반환한다.
     * @return {*|{count: number, isMainRow: boolean, mainRowKey: *}}   rowSpan 설정값
     */
    getRowSpanData: function(columnName) {
        var extraData = this.get('_extraData'),
            rowSpanData = null;

        if (this.collection.isRowSpanEnable()) {
            if (!columnName) {
                rowSpanData = extraData['rowSpanData'];
            } else if (extraData && extraData['rowSpanData'] && extraData['rowSpanData'][columnName]) {
                rowSpanData = extraData['rowSpanData'][columnName];
            }
        }

        if (!rowSpanData && columnName) {
            rowSpanData = {
                count: 0,
                isMainRow: true,
                mainRowKey: this.get('rowKey')
            };
        }
        return rowSpanData;
    },

    /**
     * row 의 extraData 를 변경한다.
     * -Backbone 내부적으로 참조형 데이터의 프로퍼티 변경시 변화를 감지하지 못하므로, 데이터를 복제하여 변경 후 set 한다.
     * @param {Object} value    extraData 에 설정될 값
     * @param {Boolean} [silent=false] Backbone 의 'change' 이벤트 발생 여부
     */
    setExtraData: function(value, silent) {
        var extraData = $.extend(true, {}, this.get('_extraData'), value);

        this.set('_extraData', extraData, {
            silent: silent
        });
    },

    /**
     * rowSpanData를 설정한다.
     * @param {string} columnName - 컬럼명
     * @param {object} data - rowSpan 정보를 가진 객체
     */
    setRowSpanData: function(columnName, data) {
        var extraData, rowSpanData;

        if (!columnName) {
            return;
        }
        if (ne.util.isFalsy(data)) {
            extraData = this._getExtraDataClone();
            if (!extraData) {
                return;
            }
            rowSpanData = extraData.rowSpanData;

            if (rowSpanData && rowSpanData[columnName]) {
                delete rowSpanData[columnName];

                if (_.isEmpty(rowSpanData)) {
                    extraData.rowSpanData = null;
                }
                this.set('_extraData', extraData);
            }
        } else {
            rowSpanData = {};
            rowSpanData[columnName] = data;
            this.setExtraData({
                rowSpanData: rowSpanData
            }, true);
        }
    },

    /**
     * rowState 를 설정한다.
     * @param {string} rowState 해당 행의 상태값. 'DISABLED|DISABLED_CHECK|CHECKED' 중 하나를 설정한다.
     * @param {boolean} silent 내부 change 이벤트 발생 여부
     */
    setRowState: function(rowState, silent) {
        this.setExtraData({rowState: rowState}, silent);
    },

    /**
     * rowKey 에 해당하는 _extraData 를 복제하여 반환한다.
     * @param {(Number|String)} rowKey  데이터의 키값
     * @return {object} 조회한 rowKey 에 해당하는 extraData 사본
     * @private
     */
    _getExtraDataClone: function() {
        return $.extend(true, {}, this.get('_extraData'));
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    addCellClassName: function(columnName, className) {
        var extraData = this._getExtraDataClone(),
            classNameData,
            classNameList;

        if (!ne.util.isUndefined(extraData)) {
            classNameData = extraData.className || {};
            classNameData.column = classNameData.column || {};
            classNameList = classNameData.column[columnName] || [];

            if (ne.util.inArray(className, classNameList) === -1) {
                classNameList.push(className);
                classNameData.column[columnName] = classNameList;
                this.setExtraData({className: classNameData});
            }
        }
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    addClassName: function(className) {
        var extraData = this._getExtraDataClone(),
            classNameData,
            classNameList;

        if (!ne.util.isUndefined(extraData)) {
            classNameData = extraData.className || {};
            classNameList = classNameData.row || [];

            if (ne.util.inArray(className, classNameList) === -1) {
                classNameList.push(className);
                classNameData.row = classNameList;
                this.setExtraData({className: classNameData});
            }
        }
    },

    /**
     * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
     * @param {String} columnName 컬럼 이름
     * @param {String} className 지정할 디자인 클래스명
     */
    removeCellClassName: function(columnName, className) {
        var extraData = this._getExtraDataClone(),
            classNameData;

        if (ne.util.isExisty(ne.util.pick(extraData, 'className', 'column', columnName))) {
            classNameData = extraData.className;
            classNameData.column[columnName] = this._removeClassNameFromArray(classNameData.column[columnName], className);
            this.set('_extraData', extraData);
        }
    },

    /**
     * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
     * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
     * @param {String} className 지정할 디자인 클래스명
     */
    removeClassName: function(className) {
        var extraData = this._getExtraDataClone(),
            classNameData;

        if (extraData && extraData.className && extraData.className.row) {
            classNameData = extraData.className;
            classNameData.row = this._removeClassNameFromArray(classNameData.row, className);
            //배열 제거이기 때문에 deep extend 를 하는 setExtraData 를 호출하면 삭제가 반영되지 않는다.
            this.set('_extraData', extraData);
        }
    },

    /**
     * className 이 담긴 배열로부터 특정 className 을 제거하여 반환한다.
     * @param {Array} classNameList 디자인 클래스명 리스트
     * @param {String} className    제거할 클래스명
     * @return {Array}  제거된 디자인 클래스명 리스트
     * @private
     */
    _removeClassNameFromArray: function(classNameList, className) {
        //배열 요소가 'class1 class2' 와 같이 두개 이상의 className을 포함할 수 있어, join & split 함.
        var classNameString = classNameList.join(' ');
        classNameList = classNameString.split(' ');
        return _.without(classNameList, className);
    },

    /**
     * html string 을 encoding 한다.
     * columnModel 에 notUseHtmlEntity 가 설정된 경우는 동작하지 않는다.
     *
     * @param {String} columnName   컬럼명
     * @return {String} 인코딩된 결과값
     */
    getHTMLEncodedString: function(columnName) {
        var columnModel = this.grid.columnModel.getColumnModel(columnName),
            isTextType = this.grid.columnModel.isTextType(columnName),
            value = this.get(columnName),
            notUseHtmlEntity = columnModel.notUseHtmlEntity;
        if (!notUseHtmlEntity && isTextType && ne.util.hasEncodableString(value)) {
            value = ne.util.encodeHTMLEntity(value);
        }
        return value;
    },

    /**
     * ctrl + c 로 복사 기능을 사용할 때 list 형태(select, button, checkbox)의 cell 의 경우, 해당 value 에 부합하는 text로 가공한다.
     * List type 의 경우 데이터 값과 editOption.list 의 text 값이 다르기 때문에
     * text 로 전환해서 반환할 때 처리를 하여 변환한다.
     *
     * @param {String} columnName   컬럼명
     * @return {String} text 형태로 가공된 문자열
     * @private
     */
    _getListTypeVisibleText: function(columnName) {
        var value = this.get(columnName),
            columnModel = this.grid.columnModel.getColumnModel(columnName),
            resultOptionList, editOptionList, typeExpected, valueList;

        if (ne.util.isExisty(ne.util.pick(columnModel, 'editOption', 'list'))) {
            resultOptionList = this.getRelationResult(['optionListChange'])[columnName];
            editOptionList = resultOptionList && resultOptionList['optionList'] ?
                    resultOptionList['optionList'] : columnModel.editOption.list;

            typeExpected = typeof editOptionList[0].value;
            valueList = value.toString().split(',');
            if (typeExpected !== typeof valueList[0]) {
                valueList = _.map(valueList, function(val) {
                    return util.convertValueType(val, typeExpected);
                });
            }
            _.each(valueList, function(val, index) {
                var item = _.findWhere(editOptionList, {value: val});
                valueList[index] = item && item.text || '';
            }, this);

            return valueList.join(',');
        }
    },

    /**
     * change 이벤트 발생시 동일한 changed 객체의 public 프라퍼티가 동일한 경우 중복 처리를 막기 위해 사용한다.
     * 10ms 내에 같은 객체로 함수 호출이 일어나면 true를 반환한다.
     * @param {object} publicChanged 비교할 객체
     * @return {boolean} 중복이면 true, 아니면 false
     */
    isDuplicatedPublicChanged: function(publicChanged) {
        if (this._timeoutIdForChanged && _.isEqual(this._lastPublicChanged, publicChanged)) {
            return true;
        }
        clearTimeout(this._timeoutIdForChanged);
        this._timeoutIdForChanged = setTimeout(_.bind(function() {
            this._timeoutIdForChanged = null;
        }, this), 10);
        this._lastPublicChanged = publicChanged;

        return false;
    },

    /**
     * 복사 기능을 사용할 때 화면에 보여지는 데이터를 반환한다.
     * @param {String} columnName   컬럼명
     * @return {String} 화면에 보여지는 데이터로 가공된 문자열
     */
    getVisibleText: function(columnName) {
        var columnModel = this.grid.columnModel,
            value = this.get(columnName),
            editType, model,
            listTypeMap = {
                'select': true,
                'radio': true,
                'checkbox': true
            };

        if (columnModel) {
            editType = columnModel.getEditType(columnName);
            model = columnModel.getColumnModel(columnName);
            //list type 의 editType 이 존재하는 경우
            if (listTypeMap[editType]) {
                if (ne.util.isExisty(ne.util.pick(model, 'editOption', 'list', 0, 'value'))) {
                    value = this._getListTypeVisibleText(columnName);
                } else {
                    throw this.error('Check "' + columnName + '"\'s editOption.list property out in your ColumnModel.');
                }
            } else if (_.isFunction(model.formatter)) {
                //editType 이 없는 경우, formatter 가 있다면 formatter를 적용한다.
                value = util.stripTags(model.formatter(this.getHTMLEncodedString(columnName), this.toJSON(), model));
            }
        }
        value = !ne.util.isUndefined(value) ? value.toString() : value;
        return value;
    },

    /**
     * 컬럼모델에 정의된 relation 들을 수행한 결과를 반환한다. (기존 affectOption)
     *
     * @param {Array}   callbackNameList 반환값의 결과를 확인할 대상 callbackList. (default : ['optionListChange', 'isDisabled', 'isEditable'])
     * @return {{}|{columnName: {attribute: *}}} row 의 columnName 에 적용될 속성값.
     */
    getRelationResult: function(callbackNameList) {
        var rowData = this.attributes,
            relationListMap = this.grid.columnModel.get('relationListMap'),
            relationResult = {},
            rowState = this.getRowState(),
            callback, attribute, targetColumnList, value;

        callbackNameList = (callbackNameList && callbackNameList.length) ?
            callbackNameList : ['optionListChange', 'isDisabled', 'isEditable'];

        //columnModel 에 저장된 relationListMap 을 순회하며 데이터를 가져온다.
        // relationListMap 구조 {columnName : relationList}
        _.each(relationListMap, function(relationList, columnName) {
            value = rowData[columnName];
            //relationList 를 순회하며 수행한다.
            _.each(relationList, function(relation) {
                targetColumnList = relation.columnList;

                //각 relation 에 걸려있는 콜백들을 수행한다.
                _.each(callbackNameList, function(callbackName) {
                    //isDisabled relation 의 경우 rowState 설정 값을 우선적으로 선택한다.
                    if (!(rowState.isDisabled && callbackName === 'isDisabled')) {
                        callback = relation[callbackName];
                        if (typeof callback === 'function') {
                            attribute = '';
                            if (callbackName === 'optionListChange') {
                                attribute = 'optionList';
                            } else if (callbackName === 'isDisabled') {
                                attribute = 'isDisabled';
                            } else if (callbackName === 'isEditable') {
                                attribute = 'isEditable';
                            }
                            if (attribute) {
                                //relation 에 걸려있는 컬럼들의 값을 변경한다.
                                _.each(targetColumnList, function(targetColumnName) {
                                    relationResult[targetColumnName] = relationResult[targetColumnName] || {};
                                    relationResult[targetColumnName][attribute] = callback(value, rowData);
                                }, this);
                            }
                        }
                    }
                }, this);
            }, this);
        }, this);
        return relationResult;
    }
});

module.exports = Row;
