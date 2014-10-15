    View.Row = View.Base.extend({
        tagName: 'tr',
        events: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        destroy: function() {
            this.destroyChildren();
            this._detachHandler();
            this.remove();
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);

            var whichSide = (attributes && attributes.whichSide) || 'R';

            this.setOwnProperties({
                whichSide: whichSide,
                columnModelList: this.grid.columnModel.getColumnModelList(whichSide),
                renderer: [],
                eventHandlerList: []
            });
            this.listenTo(this.model, 'change', this._onModelChange, this);
        },
        _onClick: function(clickEvent) {

        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target).closest('td');
            this.grid.dataModel.focusCell(this.model.get('rowKey'), $target.attr('columnName'));
            if (this.grid.option('selectType') === 'radio') {
                this.grid.checkRow(this.model.get('rowKey'));
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
                        cellInstance.onModelChange(cellData, this.$el);
                }
            }, this);
            //
        },
        _attachHandler: function() {
            var selector, cellInstance, $target;
//            console.log('this.eventHandlerList', this.eventHandlerList);
            for (var i = 0; i < this.eventHandlerList.length; i++) {
                selector = this.eventHandlerList[i].selector;
                cellInstance = this.eventHandlerList[i].cellInstance;
                $target = this.$el.find(selector);
//                console.log('@@@$target', $target.length);
                cellInstance._attachHandler($target);
            }
        },
        _detachHandler: function() {
            var selector, cellInstance;

            for (var i = 0; i < this.eventHandlerList.length; i++) {
                selector = this.eventHandlerList[i].selector;
                cellInstance = this.eventHandlerList[i].cellInstance;
                cellInstance._detachHandler(this.$el.find(selector));
            }
        },
        getEditType: function(columnName) {
            var columnModel = this.grid.columnModel.getColumnModel(columnName);
            return (columnName === '_button') ? 'mainButton' : columnModel['editOption'] && columnModel['editOption']['type'];
        },
        render: function() {
            this.destroyChildren();
            //todo : detach event handler
            this._detachHandler();

            this.$el.css({
                height: this.grid.dimensionModel.get('rowHeight')
            }).attr({
                key: this.model.get('rowKey')
            });
            this.$el.html('');


            var columnModelList = this.columnModelList;

            var columnName, cellData,
                model, columnModel, editType, cellInstance,
                html = '';
            this.eventHandlerList = [];

            for (var i = 0, len = columnModelList.length; i < len; i++) {
                columnName = columnModelList[i]['columnName'];
                cellData = this.model.get(columnName);
                if (cellData && cellData['isMainRow']) {
                    editType = this.getEditType(columnName);
                    cellInstance = this.grid.cellFactory.getInstance(editType);
                    html += cellInstance.getHtml(cellData);
                    this.eventHandlerList.push({
                        selector: 'td[columnName="' + columnName + '"]',
                        cellInstance: cellInstance
                    });
                }
            }


            this.$el.prepend(html);
            this._attachHandler();
            //todo : attach event handler
            return this;

        }
    });


    View.RowList = View.Base.extend({
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                whichSide: (attributes && attributes.whichSide) || 'R',
                timeoutIdForCollection: 0
            });

            this.listenTo(this.grid.renderModel, 'rowListChanged', this.render, this);
        },
        render: function() {
            this.destroyChildren();
            this.$el.html('');
            this.addAll();
            return this;
        },

        addOne: function(row) {
            var rowView = this.createView(View.Row, {
                grid: this.grid,
                model: row,
                whichSide: this.whichSide
            });
            this.$el.append(rowView.render().el);
        },
        addAll: function() {
            var start = new Date();
            console.log('View.RowList.addAll start');
            var $documentFragment = $(document.createDocumentFragment());
            this.collection.forEach(function(row) {
                var rowView = this.createView(View.Row, {
                    grid: this.grid,
                    model: row,
                    whichSide: this.whichSide
                });
                $documentFragment.append(rowView.render().el);
            }, this);
            this.$el.html('');
            this.$el.prepend($documentFragment);
            var end = new Date();
            console.log('View.RowList.addAll end', end - start);
        }
    });
