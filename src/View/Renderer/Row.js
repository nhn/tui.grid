    /**
     * Row Renderer
     * 성능 향상을 위해 Row Rendering 을 위한 클래스 생성
     */
    View.Renderer.Row = View.Base.Renderer.extend({
        eventHandler: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        /**
         * TR 마크업 생성시 사용할 템플릿
         */
        baseTemplate: _.template('' +
            '<tr ' +
            'key="<%=key%>" ' +
            'style="height: <%=height%>px;">' +
            '<%=contents%>' +
            '</tr>'),
        /**
         * 초기화 함수
         * @param {object} attributes
         */
        initialize: function(attributes) {
            View.Base.Renderer.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R';

            this.setOwnProperties({
                $parent: attributes.$parent,        //부모 element
                collection: attributes.collection,    //change 를 감지할 collection
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getColumnModelList(whichSide),
                cellHandlerList: []
            });

            //listener 등록
            this.collection.forEach(function(row) {
                this.listenTo(row, 'change', this._onModelChange, this);
            }, this);
        },
        /**
         * attachHandler
         * event handler 를 전체 tr에 한번에 붙인다.
         */
        attachHandler: function() {
            var $tr,
                $trList = this.$parent.find('tr');
            for (var i = 0; i < $trList.length; i++) {
                $tr = $trList.eq(i);
                this._attachHandler($tr);
            }
            this.grid.cellFactory.attachHandler(this.$parent);
        },
        /**
         * detach eventHandler
         * event handler 를 전체 tr에서 제거한다.
         */
        detachHandler: function() {
            var $target, $tr,
                $trList = this.$parent.find('tr');
            for (var i = 0; i < $trList.length; i++) {
                $tr = $trList.eq(i);
                this._detachHandler($tr);
            }
            this.grid.cellFactory.detachHandler(this.$parent);
        },
        _onClick: function(clickEvent) {
            console.log('click', clickEvent);
        },
        /**
         * mousedown 이벤트 핸들러
         * @param {event} mouseDownEvent
         * @private
         */
        _onMouseDown: function(mouseDownEvent) {
            var $td = $(mouseDownEvent.target).closest('td'),
                $tr = $(mouseDownEvent.target).closest('tr'),
                columnName = $td.attr('columnName'),
                rowKey = $tr.attr('key');
            this.grid.dataModel.focusCell(rowKey, columnName);
            if (this.grid.option('selectType') === 'radio') {
                this.grid.checkRow(rowKey);
            }
        },
        /**
         * model 변경 시
         * @param {object} model
         * @private
         */
        _onModelChange: function(model) {
            _.each(model.changed, function(cellData, columnName) {
                if (columnName !== '_extraData') {
                    var editType = this.getEditType(columnName),
                        cellInstance = this.grid.cellFactory.getInstance(editType);
                    cellInstance.onModelChange(cellData, this._getTrElement(cellData.rowKey));
                }
            }, this);
        },
        /**
         * tr 엘리먼트를 찾아서 반환한다.
         * @param {string|number} rowKey
         * @return {jquery}
         * @private
         */
        _getTrElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        /**
         * 컬럼 모델로부터 editType 을 반환한다.
         * @param {string} columnName
         * @return {string}
         */
        getEditType: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName);
            return (columnName === '_button') ? 'main' : columnModel['editOption'] && columnModel['editOption']['type'];
        },
        /**
         * html 마크업을 반환
         * @param {object} model
         * @return {string} html html 스트링
         */
        getHtml: function(model) {
            var columnModelList = this.columnModelList,
                columnName, cellData, editType, cellInstance,
                html = '';
            this.cellHandlerList = [];
            for (var i = 0, len = columnModelList.length; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
                cellData = model.get(columnName);
                if (cellData && cellData['isMainRow']) {
                    editType = this.getEditType(columnName);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                    this.cellHandlerList.push({
                        selector: 'td[columnName="' + columnName + '"]',
                        cellInstance: cellInstance
                    });
                }
            }
            return this.baseTemplate({
                key: model.get('rowKey'),
                height: this.grid.dimensionModel.get('rowHeight'),
                contents: html
            });
        }
    });