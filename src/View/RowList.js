/**
 *
 */
    View.RowFactory = View.Base.extend({
        tagName: 'tr',
        eventHandler: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        baseTemplate: _.template('<tr ' +
            'key="<%=key%>" ' +
            'style="height: <%=height%>px;">' +
            '<%=contents%>' +
            '</tr>'),

        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R';
            this._initializeEventHandler();

            this.setOwnProperties({
                $parent: attributes.$parent,
                modelList: attributes.modelList,
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getColumnModelList(whichSide),
                cellHandlerList: []
            });
            _.each(this.modelList, function(model) {
                this.listenTo(model, 'change', this._onModelChange, this);
            }, this);
        },
        _initializeEventHandler: function() {
            var eventHandler = {};
            _.each(this.eventHandler, function(methodName, eventName) {
                var tmp = eventName.split(' '),
                    event = tmp[0],
                    selector = tmp[1] || '';

                eventHandler[event] = {
                    selector: selector,
                    handler: $.proxy(this[methodName], this)
                };
            }, this);
            this.setOwnProperties({
                _eventHandler: eventHandler
            });
        },
        attachHandler: function() {
            var $tr,
                $trList = this.$parent.find('tr');
            for (var i = 0; i < $trList.length; i++) {
                $tr = $trList.eq(i);
                _.each(this._eventHandler, function(obj, eventName) {
                    var handler = obj.handler,
                        selector = obj.selector,
                        $target = $tr;
                    if (selector) {
                        $target = $tr.find(selector);
                    }
                    $target.on(eventName, handler);
                }, this);
            }
        },

        detachHandler: function() {
            var $target, $tr,
                $trList = this.$parent.find('tr');
            for (var i = 0; i < $trList.length; i++) {
                $tr = $trList.eq(i);
                _.each(this._eventHandler, function(obj, eventName) {
                    var handler = obj.handler,
                        selector = obj.selector,
                        $target = $tr;
                    if (selector) {
                        $target = $tr.find(selector);
                    }
                    $target.off(eventName, handler);
                }, this);
            }
        },
        _onClick: function(clickEvent) {
        },
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
         * model 변경시
         * @param model
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
            //
        },
        _getTrElement: function(rowKey) {
            return this.$parent.find('tr[key="' + rowKey + '"]');
        },
        getEditType: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName);
            return (columnName === '_button') ? 'main' : columnModel['editOption'] && columnModel['editOption']['type'];
        },
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
    View.RowList = View.Base.extend({
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (attributes && attributes.whichSide) || 'R',
                timeoutIdForCollection: 0,
                rowFactory: null
            });
            this._createRowFactory();
            this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
        },

        _createRowFactory: function() {
            var modelList = [];
            this.collection.forEach(function(row) {
                modelList.push(row);
            }, this);
            this.rowFactory = this.createView(View.RowFactory, {
                grid: this.grid,
                $parent: this.$el,
                modelList: modelList,
                whichSide: this.whichSide
            });
        },
        attachHandler: function() {
            this.rowFactory.attachHandler();
            this.grid.cellFactory.attachHandler();
        },
        detachHandler: function() {
            this.rowFactory.detachHandler();
            this.grid.cellFactory.detachHandler();
        },
        render: function() {
            var start = new Date(),
                html = '';
            console.log('View.RowList.render start');
            this.detachHandler();
            this.destroyChildren();

            this._createRowFactory();

            //get html string
            this.collection.forEach(function(row) {
                html += this.rowFactory.getHtml(row);
            }, this);
            this.$el.html('').prepend(html);


            var end = new Date();
            console.log('View.RowList.addAll end', end - start);

            this.attachHandler();
            return this;
        }
    });
