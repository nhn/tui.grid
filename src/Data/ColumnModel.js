    /**
     * ColumnModel
     * @type {*|void}
     */
    Data.ColumnModel = Model.Base.extend({
        defaults: {
            keyColumnName: null,
            columnFixIndex: 0,  //columnFixIndex
            columnModelList: [],
            visibleList: [],
            hasNumberColumn: true,
            selectType: '',
            columnModelMap: {},
            relationListMap: {}
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this._setColumnModelList(this.get('columnModelList'), this.get('columnFixIndex'));
            this.on('change', this._onChange, this);
        },

        /**
         * 인자로 넘어온 columnModelList 에 설정값에 맞게 number column 을 추가한다.
         * @param {Array} columnModelList
         * @returns {Array}
         * @private
         */
        _initializeNumberColumn: function(columnModelList) {
            var hasNumberColumn = this.get('hasNumberColumn'),
                numberColumn = {
                    columnName: '_number',
                    title: 'No.',
                    width: 60
                };
            if (!hasNumberColumn) {
                numberColumn.isHidden = true;
            }

            columnModelList = this._extendColumn(numberColumn, columnModelList);
            return columnModelList;
        },
        /**
         * 인자로 넘어온 columnModelList 에 설정값에 맞게 button column 을 추가한다.
         * @param {Array} columnModelList
         * @returns {Array}
         * @private
         */
        _initializeButtonColumn: function(columnModelList) {
            var selectType = this.get('selectType'),
                buttonColumn = {
                    columnName: '_button',
                    editOption: {
                        type: selectType,
                        list: [{
                            value: 'selected'
                        }]
                    },
                    width: 50
                };
            if (selectType === 'checkbox' || selectType === 'radio') {
                if (selectType === 'checkbox') {
                    buttonColumn.title = '<input type="checkbox"/>';
                } else if (selectType === 'radio') {
                    buttonColumn.title = '선택';
                }
            } else {
                buttonColumn.isHidden = true;
            }

            columnModelList = this._extendColumn(buttonColumn, columnModelList);

            return columnModelList;
        },
        /**
         * column 을 append 한다.
         * - columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
         * - _number, _button 컬럼 초기화시 사용함.
         * @param {object} columnObj
         * @param {Array} columnModelList
         * @returns {Array}
         * @private
         */
        _extendColumn: function(columnObj, columnModelList) {
            var index;
            if (columnObj && columnObj['columnName']) {
                index = this._indexOfColumnName(columnObj['columnName'], columnModelList);
                if (index === -1) {
                    columnModelList = _.union([columnObj], columnModelList);
                } else {
                    columnModelList[index] = $.extend(columnModelList[index], columnObj);
                }
            }
            return columnModelList;
        },
        /**
         * index 에 해당하는 columnModel 을 반환한다.
         * @param {Number} index
         * @param {Boolean} isVisible [isVisible=false]
         * @return {*}
         */
        at: function(index, isVisible) {
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return columnModelList[index];
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * @param {string} columnName
         * @param {Boolean} isVisible [isVisible=false]
         * @return {number} index
         */
        indexOfColumnName: function(columnName, isVisible) {
            isVisible = (isVisible === undefined) ? true : isVisible;
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return this._indexOfColumnName(columnName, columnModelList);
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * - columnModel 이 내부에 세팅되기 전에 button, number column 을 추가할 때만 사용됨.
         * @param {string} columnName
         * @param {Array} columnModelList
         * @returns {number}
         * @private
         */
        _indexOfColumnName: function(columnName, columnModelList) {
            var i = 0, len = columnModelList.length;
            for (; i < len; i++) {
                if (columnModelList[i]['columnName'] === columnName) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * columnName 이 L Side 에 있는 column 인지 반환한다.
         * @param {String} columnName
         * @return {Boolean}
         */
        isLside: function(columnName) {
            var index = this.indexOfColumnName(columnName, true);
            if (index < 0) {
                return false;
            } else {
                return this.get('columnFixIndex') > index;
            }
        },
        /**
         * 화면에 노출되는 (!isHidden) 컬럼 모델 리스트를 반환한다.
         * @param {String} [whichSide] 왼쪽 영역인지, 오른쪽 영역인지 여부. 지정하지 않았을 경우 전체 visibleList 를 반환한다.
         * @returns {Array}
         */
        getVisibleColumnModelList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnModelList = [],
                columnFixIndex = this.get('columnFixIndex');

            if (whichSide === 'L') {
                columnModelList = this.get('visibleList').slice(0, columnFixIndex);
            } else if (whichSide === 'R') {
                columnModelList = this.get('visibleList').slice(columnFixIndex);
            } else {
                columnModelList = this.get('visibleList');
            }

            return columnModelList;
        },
        /**
         * 인자로 받은 columnName 에 해당하는 columnModel 을 반환한다.
         * @param {String} columnName
         * @return {Object}
         */
        getColumnModel: function(columnName) {
            return this.get('columnModelMap')[columnName];
        },
        /**
         * columnName 에 해당하는 컬럼의 타입이 textType 인지 확인한다.
         * @param {String} columnName
         * @return {boolean}
         */
        isTextType: function(columnName) {
            var textTypeList = ['normal', 'text', 'text-convertible'];
            return $.inArray(this.getEditType(columnName), textTypeList) !== -1;
        },
        /**
         * 컬럼 모델로부터 editType 을 반환한다.
         * @param {string} columnName
         * @return {string}
         */
        getEditType: function(columnName) {
            var columnModel = this.getColumnModel(columnName),
                editType = 'normal';
            if (columnName === '_button' || columnName === '_number') {
                editType = columnName;
            } else if (columnModel && columnModel['editOption'] && columnModel['editOption']['type']) {
                editType = columnModel['editOption']['type'];
            }
            return editType;
        },
        /**
         * 인자로 받은 컬럼 모델에서 !isHidden 를 만족하는 리스트를 추려서 반환한다.
         * @param {Array} columnModelList
         * @return {Array}
         * @private
         */
        _getVisibleList: function(columnModelList) {
            return _.filter(columnModelList, function(item) {return !item['isHidden']});
        },
        /**
         * 각 columnModel 의 relationList 를 모아 주체가 되는 columnName 기준으로 relationListMap 를 생성하여 반환한다.
         * @return {{columnName1: [Array], columnName1: [Array]}}
         * @private
         */
        _getRelationListMap: function(columnModelList) {
            var columnName, relationList,
                relationListMap = {},
                i, len = columnModelList.length;

            for (i = 0; i < len; i++) {
                columnName = columnModelList[i]['columnName'];

                if (columnModelList[i].relationList) {
                    relationList = columnModelList[i].relationList;
                    relationListMap[columnName] = relationList;
                }
            }
            return relationListMap;

        },
        /**
         * 인자로 받은 columnModel 을 _number, _button 에 대하여 기본 형태로 가공한 뒤,
         * partition 으로 나뉜 visible list 등 내부적으로 사용할 부가정보를 가공하여 저장한다.
         * @param {Array} columnModelList
         * @param {Number} columnFixIndex
         * @private
         */
        _setColumnModelList: function(columnModelList, columnFixIndex) {
            columnModelList = $.extend(true, [], columnModelList);
            columnModelList = this._initializeNumberColumn(this._initializeButtonColumn(columnModelList));

            var visibleList = this._getVisibleList(columnModelList);

            this.set({
                columnModelList: columnModelList,
                columnModelMap: _.indexBy(columnModelList, 'columnName'),
                relationListMap: this._getRelationListMap(columnModelList),
                columnFixIndex: columnFixIndex,
                visibleList: visibleList
            }, {silent: true});
        },
        /**
         * change 이벤트 발생시 핸들러
         * @param {Object} model
         * @private
         */
        _onChange: function(model) {
            var changed = model.changed,
                columnModelList = changed['columnModelList'] || this.get('columnModelList'),
                columnFixIndex = changed['columnFixIndex'] ? changed['columnFixIndex'] : this.get('columnFixIndex');

            this._setColumnModelList(columnModelList, columnFixIndex);
        }

    });
