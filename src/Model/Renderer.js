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
            var columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
                columnList = this.grid.columnModel.get('visibleList'),
                columnNameList = _.pluck(columnList, 'columnName');

            var lsideColumnList = columnNameList.slice(0, columnFixIndex),
                rsideColumnList = columnNameList.slice(columnFixIndex);



            var lsideRowList = [],
                rsideRowList = [];

            var lsideRow = [];
            var rsideRow = [];

            var startIdx = this.get('startIdx');
            var endIdx = this.get('endIdx');
            var start = new Date();
//            console.log('render', startIdx, endIdx);
            for (var i = startIdx; i < endIdx + 1; i++) {
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
            this.get('lside').set(lsideRowList, {
                parse: true
            });
            this.get('rside').set(rsideRowList, {
                parse: true
            });
            var end = new Date();
//            console.log('render done', end - start);
            if (this.isColumnModelChanged === true) {
                this.trigger('columnModelChanged');
                this.isColumnModelChanged = false;
            }else {
                this.trigger('rowListChanged');
            }

            this.trigger('afterRefresh');
        }
    });
