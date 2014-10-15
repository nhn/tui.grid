

    var Grid = window.Grid = View.Base.extend({
        scrollBarSize: 17,
        lside: null,
        rside: null,
        footer: null,
        cellFactory: null,


        events: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },

        initialize: function(options) {
            View.Base.prototype.initialize.apply(this, arguments);
            var id = Util.getUniqueKey();
            this.__instance[id] = this;


            var defaultOptions = {
                debug: false,
                columnFixIndex: 0,
                columnModelList: [],
                keyColumnName: null,
                selectType: '',

                autoNumbering: true,

                headerHeight: 35,
                rowHeight: 27,
                displayRowCount: 10,
                minimumColumnWidth: 50,
                notUseSmartRendering: false,
                columnMerge: [],
                minimumWidth: 300,      //grid의 최소 너비

                scrollX: true,
                scrollY: true,
                useDataCopy: true
            };




            options = $.extend(defaultOptions, options);

            this.setOwnProperties({
                'columnModel' : null,
                'dataModel' : null,
                'renderModel' : null,
                'layoutModel' : null,

                'view' : {
                    'lside' : null,
                    'rside' : null,
                    'footer' : null,
                    'clipboard' : null
                },

                'id' : id,
                'options' : options
            });

            this._initializeModel();
            this._initializeListener();
            this._initializeView();

            this._initializeScrollBar();

            this.render();

        },
        _initializeListener: function() {
//            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange);
        },
        _onWidthChange: function(width) {
            this.$el.css('width', width + 'px');
        },
        option: function(key, value) {
            if (value === undefined) {
                return this.options[key];
            }else {
                this.options[key] = value;
                return this;
            }
        },
        _onClick: function(clickEvent) {
//            var $target = $(clickEvent.target);
//            if(!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))){
//                this.view.clipboard.$el.focus();
//            }
        },
        _onMouseDown: function(mouseDownEvent) {
            var $target = $(mouseDownEvent.target);
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
                mouseDownEvent.preventDefault();
                this.trigger('mousedown', mouseDownEvent);
            }
        },
        /**
         * _initializeModel
         *
         * Initialize data model instances
         * @param options
         * @private
         */
        _initializeModel: function() {
            //define column model
            this.columnModel = new Data.ColumnModel({
                grid: this,
                keyColumnName: this.option('keyColumnName'),
                columnFixIndex: this.option('columnFixIndex')
            });
            this.setColumnModelList(this.option('columnModelList'));

            //define layout model
            this.dimensionModel = new Model.Dimension({
                grid: this,
                width: this.$el.width(),
                height: this.$el.height(),
                rowHeight: this.option('rowHeight')
            });
//            //define rowList
            this.dataModel = new Data.RowList({
                grid: this
            });

            if (this.option('notUseSmartRendering') === true) {
                this.renderModel = new Model.Renderer({
                    grid: this
                });
            }else {
                this.renderModel = new Model.Renderer.Smart({
                    grid: this
                });
            }

            this.cellFactory = this.createView(View.CellFactory, { grid: this });
        },
        /**
         * _initializeView
         *
         * Initialize view instances
         * @private
         */
        _initializeView: function() {
            this.cellFactory = this.createView(View.CellFactory, {
                grid: this
            });

            //define header & body area
            this.view.lside = this.createView(View.Layout.Frame.Lside, {
                grid: this
            });

            this.view.rside = this.createView(View.Layout.Frame.Rside, {
                grid: this
            });

            this.view.footer = this.createView(View.Layout.Footer, {
                grid: this
            });

            this.view.clipboard = this.createView(View.Clipboard, {
                grid: this
            });
        },

        _initializeScrollBar: function() {
//            if(!this.option('scrollX')) this.$el.css('overflowX', 'hidden');
//            if(!this.option('scrollY')) this.$el.css('overflowY', 'hidden');
        },

        /**
         * render
         *
         * Rendering grid view
         */
        render: function() {
            this.trigger('beforeRender');
            this.$el.attr('instanceId', this.id)
                .append(this.view.lside.render().el)
                .append(this.view.rside.render().el)
                .append(this.view.footer.render().el)
                .append(this.view.clipboard.render().el);

            this.trigger('afterRender');
        },

        /**
         * setRowList
         *
         * set row list data
         * @param rowList
         */
        setRowList: function(rowList) {
            this.dataModel.set(rowList, {
                parse: true
            });
        },
        /**
         * setValue
         *
         * change cell value
         * @param rowKey
         * @param columnName
         * @param columnValue
         */
        setValue: function(rowKey, columnName, columnValue, silent) {
            //@TODO : rowKey to String
            this.dataModel.setValue(rowKey, columnName, columnValue, silent);
        },
        setColumnValue: function(columnName, columnValue, silent) {
            this.dataModel.setColumnValue(columnName, columnValue, silent);
        },
        /**
         * appendRow
         *
         * append row inside grid
         * @param row
         */
        appendRow: function(row) {
            this.dataModel.append(row);
        },
        /**
         * prependRow
         *
         * prepend row inside grid
         * @param row
         */
        prependRow: function(row) {
            this.dataModel.prepend(row);
        },
        /**
         * setColumnIndex
         *
         * change columnfix index
         * @param index
         */
        setColumnIndex: function(columnFixIndex) {
            this.option({
                columnFixIndex: columnFixIndex
            });
            this.columnModel.set({columnFixIndex: columnFixIndex});
        },
        setColumnModelList: function(columnModelList) {
            this.columnModel.set('columnModelList', columnModelList);
        },
        /**
         * sort by columnName
         *
         * @param columnName
         */
        sort: function(columnName) {
            this.dataModel.sortByField(columnName);
        },
        getRowList: function() {
            return this.dataModel.toJSON();
        },
        getCheckedRowList: function() {
            return this.dataModel.where({
                '_button' : true
            });
        },
        getCheckedRowKeyList: function() {
            var rowKeyList = [];
            _.each(this.dataModel.where({
                '_button' : true
            }), function(row) {
                rowKeyList.push(row.get('rowKey'));
            }, this);
            return rowKeyList;
        },
        getModifiedRowList: function() {
            return this.dataModel.getModifiedRowList();
        },
        disableCell: function(rowKey, columnName) {

        },
        enableCell: function(rowKey, columnName) {

        },
        setEditOptionList: function(rowKey, columnName, optionList) {

        },
        checkRow: function(rowKey) {
            this.setValue(rowKey, '_button', true);
        },
        checkAllRow: function() {
            this.dataModel.setColumnValue('_button', true);
        },
        uncheckAllRow: function() {
            this.dataModel.setColumnValue('_button', false);
        },
        /**
         * @deprecated
         * @param whichSide
         * @return {*}
         * @private
         */
        _getDataCollection: function(whichSide) {
            return this.renderModel.get(whichSide);
        },

        destroy: function() {
            this.destroyChildren();
            this.$el.removeAttr('instanceId');
            this.stopListening();
            for (var property in this) {
                this[property] = null;
                delete this[property];
            }
        }

    });

    Grid.prototype.__instance = {};

    Grid.getInstanceById = function(id) {
        return this.prototype.__instance[id];
    };
