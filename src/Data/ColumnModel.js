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

            columnModelMap: {}
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);
            this.on('change', this._onChange, this);
        },
        _appendDefaultColumn: function(data) {
            var columnModelList = $.extend(true, [], data),
                prependList = [],
                selectType = this.grid.option('selectType'),
                hasNumber = false,
                hasChecked = false,
                preparedColumnModel = {
                    '_number' : {
                        columnName: '_number',
                        title: 'No.',
                        width: 60
                    },
                    '_button' : {
                        columnName: '_button',
                        editOption: {
                            type: selectType,
                            list: [{
                                value: 'selected'
                            }]
                        },
                        width: 50
                    }
                };

            if (selectType === 'checkbox') {
                preparedColumnModel['_button'].title = '<input type="checkbox"/>';
            }else if (selectType === 'radio') {
                preparedColumnModel['_button'].title = '선택';
            }else {
                preparedColumnModel['_button'].isHidden = true;
            }

            _.each(columnModelList, function(columnModel, idx) {
                var columnName = columnModel.columnName;
                if (columnName === '_number') {
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_number']);
                    hasNumber = true;
                }else if (columnName === '_button') {
                    columnModelList[idx] = $.extend(columnModel, preparedColumnModel['_button']);
                    hasChecked = true;
                }
            }, this);

            if (!hasNumber) {
                prependList.push(preparedColumnModel['_number']);
            }
            if (!hasChecked) {
                prependList.push(preparedColumnModel['_button']);
            }
            columnModelList = _.union(prependList, columnModelList);
            return columnModelList;
        },
        /**
         * columnName 에 해당하는 index를 반환한다.
         * @param {string} columnName
         * @return {number} index
         */
        indexOfColumnName: function(columnName) {
            var columnModelList = this.get('columnModelList'),
                i = 0, len = columnModelList.length;
            for (; i < len; i++) {
                if (columnModelList[i]['columnName'] === columnName) {
                    return i;
                }
            }
            return -1;
        },
        getColumnModelList: function(whichSide) {
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
            var columnModel = this.getColumnModel(columnName);
            return (columnName === '_button') ? 'main' : columnModel['editOption'] && columnModel['editOption']['type'];
        },
        _getVisibleList: function() {
            return _.filter(this.get('columnModelList'), function(item) {return !item['isHidden']});
        },
        _onChange: function(model) {
            if (model.changed['columnModelList']) {
                this.set({
                    columnModelList: this._appendDefaultColumn(model.changed['columnModelList'])
                },{
                    silent: true
                });
            }
            var visibleList = this._getVisibleList();
            this.set({
                visibleList: visibleList,
                lsideList: visibleList.slice(0, this.get('columnFixIndex')),
                rsideList: visibleList.slice(this.get('columnFixIndex')),
                columnModelMap: _.indexBy(this.get('columnModelList'), 'columnName')
            }, {
                silent: true
            });
        }

    });
