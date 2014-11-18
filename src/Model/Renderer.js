    /**
     * View 에서 Rendering 시 사용할 객체
     * @type {*|void}
     */
    Model.Renderer = Model.Base.extend({
        defaults: {
            top: 0,
            scrollTop: 0,
            $scrollTarget: null,
            scrollLeft: 0,
            maxScrollLeft: 0,
            startIdx: 0,
            endIdx: 0,
            startNumber: 1,
            lside: null,
            rside: null
        },
        initialize: function(attributes) {
            Model.Base.prototype.initialize.apply(this, arguments);

            this.setOwnProperties({
                timeoutIdForRowListChange: 0,
                timeoutIdForRefresh: 0,
                isColumnModelChanged: false
            });

            //lside 와 rside 별 Collection 생성
            var lside = new Model.RowList([], {
                grid: this.grid
            });
            var rside = new Model.RowList([], {
                grid: this.grid
            });
            this.set({
                lside: lside,
                rside: rside
            });

            //원본 rowList 의 상태 값 listening
            this.listenTo(this.grid.columnModel, 'all', this._onColumnModelChange, this)
                .listenTo(this.grid.dataModel, 'add remove sort reset', this._onRowListChange, this)
                .listenTo(lside, 'valueChange', this._onValueChange, this)
                .listenTo(rside, 'valueChange', this._onValueChange, this);
        },
        /**
         * lside 와 rside collection 에서 value 값이 변경되었을 시 executeRelation 을 수행하기 위한 이벤트 핸들러
         * @param {number} rowIndex
         * @private
         */
        _onValueChange: function(rowIndex) {
            this.executeRelation(rowIndex);
        },
        /**
         * 내부 변수를 초기화 한다.
         */
        initializeVariables: function() {
            this.set({
                top: 0,
                scrollTop: 0,
                $scrollTarget: null,
                scrollLeft: 0,
                startIdx: 0,
                endIdx: 0,
                startNumber: 1
            });
        },
        /**
         * 열고정 영역 또는 열고정이 아닌 영역에 대한 Render Collection 을 반환한다.
         * @param {String} whichSide
         * @returns {Object} collection
         */
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
        /**
         * Data.ColumnModel 이 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
         * @private
         */
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
        /**
         * Data.RowList 가 변경되었을 때 열고정 영역 frame, 열고정 영역이 아닌 frame 의 list 를 재생성 하기 위한 이벤트 핸들러
         * @private
         */
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
                endIdx = this.get('endIdx'),
                num = this.get('startNumber') + startIdx;



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
                    if (columnName == '_number') {
                        lsideRow[columnName] = num++;
                    } else {
                        lsideRow[columnName] = rowModel.get(columnName);
                    }
                }, this);

                _.each(rsideColumnList, function(columnName) {
                    if (columnName == '_number') {
                        rsideRow[columnName] = num++;
                    } else {
                        rsideRow[columnName] = rowModel.get(columnName);
                    }
                }, this);

                lsideRowList.push(lsideRow);
                rsideRowList.push(rsideRow);
            }
            //lside 와 rside 를 초기화한다.
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

            this.trigger('beforeRefresh');
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
        _getCollectionByColumnName: function(columnName) {
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
         * @param {number} rowKey
         * @param {String} columnName
         * @return {*}
         */
        getCellData: function(rowKey, columnName) {
            var collection = this._getCollectionByColumnName(columnName),
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
            var row = this.grid.dataModel.at(rowIndex),
                renderIdx = rowIndex - this.get('startIdx'),
                rowModel, relationResult;
            relationResult = row.getRelationResult();

            _.each(relationResult, function(changes, columnName) {
                rowModel = this._getCollectionByColumnName(columnName).at(renderIdx);
                if (rowModel) {
                    this._getCollectionByColumnName(columnName).at(renderIdx).setCell(columnName, changes);
                }
            }, this);
        }

    });
