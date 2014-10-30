    /**
     * View 에서 Rendering 시 바라보는 객체
     * @type {*|void}
     */
    Model.Renderer = Model.Base.extend({
        defaults: {
            top: 0,
            scrollTop: 0,
            scrollLeft: 0,
            maxScrollLeft: 0,
            startIdx: 0,
            endIdx: 0,

            lside: null,
            rside: null
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);

            this.setOwnProperties({
                timeoutIdForRefresh: 0,
                isColumnModelChanged: false
            });

            //원본 rowList 의 상태 값 listening
            this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this);
            this.listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this);
            this.on('change', this.test, this);
            //lside 와 rside 별 Collection 생성
            var lside = new Model.RowList({
                grid: this.grid
            });
            var rside = new Model.RowList({
                grid: this.grid
            });
            this.set({
                lside: lside,
                rside: rside
            });
        },

        test: function(model) {
            console.log('change', model.changed);
        },
        getCollection: function(whichSide) {
            whichSide = (whichSide) ? whichSide.toUpperCase() : undefined;
            var collection;
            switch (whichSide) {
                case 'L':
                    collection = this.get('lside');
                    break;
                case 'R':
                    collection = this.get('rside');
                    break;
                default :
                    collection = this.get('rside');
                    break;
            }
            return collection;
        },
        _onColumnModelChange: function() {
            this.set({
                'scrollTop' : 0,
                'top' : 0,
                'startIdx' : 0,
                'endIdx' : 0
            });
            this.isColumnModelChanged = true;
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        _onRowListChange: function() {
            clearTimeout(this.timeoutIdForRefresh);
            this.timeoutIdForRefresh = setTimeout($.proxy(this.refresh, this), 0);
        },
        /**
         * rendering 할 index 범위를 결정한다.
         * Smart rendering 을 사용하지 않을 경우 전체 범위로 랜더링한다.
         * @private
         */
        _setRenderingRange: function() {
            this.set({
                'startIdx' : 0,
                'endIdx' : this.grid.dataModel.length - 1
            });
        },
        refresh: function() {
            this.trigger('beforeRefresh');

            this._setRenderingRange();
            //TODO : rendering 해야할 데이터만 가져온다.
            var len, i,
                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnList = this.grid.columnModel.get('visibleList'),
                columnNameList = _.pluck(columnList, 'columnName'),

                lsideColumnList = columnNameList.slice(0, columnFixIndex),
                rsideColumnList = columnNameList.slice(columnFixIndex),

                lsideRowList = [],
                rsideRowList = [],

                lsideRow = [],
                rsideRow = [],
                startIdx = this.get('startIdx'),
                endIdx = this.get('endIdx');



            var start = new Date();

//            console.log('render', startIdx, endIdx);
            for (i = startIdx; i < endIdx + 1; i++) {
                var rowModel = this.grid.dataModel.at(i);
                var rowKey = rowModel.get('rowKey');
                //데이터 초기화
                lsideRow = {
                    '_extraData' : rowModel.get('_extraData'),
                    'rowKey' : rowKey
                };
                rsideRow = {
                    '_extraData' : rowModel.get('_extraData'),
                    'rowKey' : rowKey
                };

                //lside 데이터 먼저 채운다.
                _.each(lsideColumnList, function(columnName) {
                    lsideRow[columnName] = rowModel.get(columnName);
                }, this);

                _.each(rsideColumnList, function(columnName) {
                    rsideRow[columnName] = rowModel.get(columnName);
                }, this);

                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
            this.get('lside').clear().reset(lsideRowList, {
                parse: true
            });
            this.get('rside').clear().reset(rsideRowList, {
                parse: true
            });

            i = startIdx;
            len = rsideRowList.length + startIdx;
            for (; i < len; i++) {
                this.executeRelation(i);
            }

            var end = new Date();
//            console.log('render done', end - start);
            if (this.isColumnModelChanged === true) {
                this.trigger('columnModelChanged');
                this.isColumnModelChanged = false;
            }else {
                this.trigger('rowListChanged');
            }

            this.trigger('afterRefresh');
        },
        /**
         * columnName 으로 lside 와 rside rendering collection 중 하나를 반환한다.
         * @param {String} columnName
         * @return {Collection}
         * @private
         */
        _getRowListDivision: function(columnName) {
            var lside = this.get('lside'),
                rside = this.get('rside');

            if (lside.at(0) && lside.at(0).get(columnName)) {
                return lside;
            } else {
                return rside;
            }
        },
        /**
         * CellData 를 가져온다.
         * @param rowKey
         * @param columnName
         * @returns {*}
         */
        getCellData: function(rowKey, columnName) {
            var collection = this._getRowListDivision(columnName),
                row = collection.get(rowKey);
            if (row) {
               return row.get(columnName);
            }
        },
        /**
         * rowIndex 에 해당하는 relation 을 수행한다.
         * @param {Number} rowIndex
         */
        executeRelation: function(rowIndex) {
            var relationResult = this.grid.dataModel.at(rowIndex).getRelationResult(),
                renderIdx = rowIndex - this.get('startIdx'),
                rowModel;

            _.each(relationResult, function(changes, columnName) {
                rowModel = this._getRowListDivision(columnName).at(renderIdx);
                if (rowModel) {
                    this._getRowListDivision(columnName).at(renderIdx).setCell(columnName, changes);
                }
            }, this);
        }

    });
