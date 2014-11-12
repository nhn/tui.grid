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
            this.on('change', this._onChange, this);

        },

        /**
         * 인자로 넘어온 columnModelList 에 설정값에 맞게 number column 을 추가한다.
         * @param {array} columnModelList
         * @returns {array}
         * @private
         */
        _initializeNumberColumn: function(columnModelList) {
            var hasNumberColumn = this.get('hasNumberColumn'),
                numberColumn = {
                    columnName: '_number',
                    title: 'No.',
                    width: 60
                };
            if (hasNumberColumn) {
                columnModelList = this._appendColumn(numberColumn, columnModelList);
            }
            return columnModelList;
        },
        /**
         * 인자로 넘어온 columnModelList 에 설정값에 맞게 button column 을 추가한다.
         * @param {array} columnModelList
         * @returns {array}
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

            columnModelList = this._appendColumn(buttonColumn, columnModelList);

            return columnModelList;
        },
        /**
         * column 을 append 한다.
         * - columnName 에 해당하는 columnModel 이 이미 존재한다면 해당 columnModel 을 columnObj 로 확장한다.
         * - _number, _button 컬럼 초기화시 사용함.
         * @param {object} columnObj
         * @param {array} columnModelList
         * @returns {array}
         * @private
         */
        _appendColumn: function(columnObj, columnModelList) {
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
         * @param {Boolean} isVisible
         * @return {*}
         */
        at: function(index, isVisible) {
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList');
            return columnModelList[index];
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * @param {string} columnName
         * @param {Boolean} isVisible (default:true)
         * @return {number} index
         */
        indexOfColumnName: function(columnName, isVisible) {
            isVisible = (isVisible === undefined);
            var columnModelList = isVisible ? this.getVisibleColumnModelList() : this.get('columnModelList'),
                i = 0, len = columnModelList.length;
            for (; i < len; i++) {
                if (columnModelList[i]['columnName'] === columnName) {
                    return i;
                }
            }
            return -1;
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * - columnModel 이 내부에 세팅되기 전에 button, number column 을 추가할 때 사용됨.
         * @param {string} columnName
         * @param {array} columnModelList
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
         */
        isLside: function(columnName) {
            return this.get('columnFixIndex') > this.indexOfColumnName(columnName);
        },
        getVisibleColumnModelList: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var columnModelList = [],
                columnFixIndex = this.get('columnFixIndex');
            switch (whichSide) {
                case 'L':
                    columnModelList = this.get('visibleList').slice(0, columnFixIndex);
                    break;
                case 'R':
                    columnModelList = this.get('visibleList').slice(columnFixIndex);
                    break;
                default :
                    columnModelList = this.get('visibleList');
                    break;
            }
            return columnModelList;
        },
        getColumnModel: function(columnName) {
            return this.get('columnModelMap')[columnName];
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
        _getVisibleList: function(columnModelList) {
            return _.filter(columnModelList, function(item) {return !item['isHidden']});
        },
        /**
         * 각 columnModel 의 relationList 를 모아 relationListMap 를 생성하여 반환한다.
         * @return {*}
         * @private
         */
        _getRelationMart: function(columnModelList) {
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
        _onChange: function(model) {
            var columnModelList = this.get('columnModelList'),
                visibleList;
            if (model.changed['columnModelList']) {
                columnModelList = model.changed['columnModelList'];
                columnModelList = this._initializeButtonColumn(columnModelList);
                columnModelList = this._initializeNumberColumn(columnModelList);
                this.set({
                    columnModelList: columnModelList
                },{
                    silent: true
                });
            }

            visibleList = this._getVisibleList(columnModelList);

            this.set({
                visibleList: visibleList,
                lsideList: visibleList.slice(0, this.get('columnFixIndex')),
                rsideList: visibleList.slice(this.get('columnFixIndex')),
                columnModelMap: _.indexBy(this.get('columnModelList'), 'columnName'),
                relationListMap: this._getRelationMart(columnModelList)
            }, {
                silent: true
            });
        }

    });
