

    var Grid = window.Grid = View.Base.extend({
        scrollBarSize: 17,
        minimumHeight: 150, //그리드의 최소 높이값
        lside: null,
        rside: null,
        toolbar: null,
        cellFactory: null,


        events: {
            'click' : '_onClick',
            'mousedown' : '_onMouseDown'
        },
        keyMap: {
            'TAB': 9,
            'ENTER': 13,
            'CTRL': 17,
            'ESC': 27,
            'LEFT_ARROW': 37,
            'UP_ARROW': 38,
            'RIGHT_ARROW': 39,
            'DOWN_ARROW': 40,
            'CHAR_A': 65,
            'CHAR_C': 67,
            'CHAR_F': 70,
            'CHAR_R': 82,
            'CHAR_V': 86,
            'LEFT_WINDOW_KEY': 91,
            'F5': 116,
            'BACKSPACE': 8,
            'SPACE': 32,
            'PAGE_UP': 33,
            'PAGE_DOWN': 34,
            'HOME': 36,
            'END': 35,
            'DEL': 46,
            'UNDEFINED': 229
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
                useDataCopy: true,

                toolbar: {
                    hasResizeHandler: true,
                    hasControlPannel: true
                }
            };




            options = $.extend(true, defaultOptions, options);

            this.setOwnProperties({
                'cellFactory': null,
                'selection': null,
                'columnModel': null,
                'dataModel': null,
                'renderModel': null,
                'layoutModel': null,
                'focusModel': null,

                'view': {
                    'lside': null,
                    'rside': null,
                    'toolbar': null,
                    'clipboard': null
                },

                'id' : id,
                'options' : options,
                'timeoutIdForResize': 0
            });

            this._initializeModel();
            this._initializeListener();
            this._initializeView();

            this._initializeScrollBar();

            this._attachExtraEvent();

            this.render();

            this.updateLayoutData();

        },
        /**
         * event 속성에 정의되지 않은 이벤트 attach 하는 메서드
         * @private
         */
        _attachExtraEvent: function() {
            $(window).on('resize', $.proxy(this._onWindowResize, this));
        },
        /**
         * window resize  이벤트 핸들러
         * @param {event} resizeEvent
         * @private
         */
        _onWindowResize: function(resizeEvent) {
            clearTimeout(this.timeoutIdForResize);
            this.timeoutIdForResize = setTimeout($.proxy(function() {
                var width = Math.max(this.option('minimumWidth'), this.$el.css('width', '100%').width());
                this.dimensionModel.set('width', width);
            }, this), 100);
        },
        _initializeListener: function() {
            this.listenTo(this.dimensionModel, 'change:width', this._onWidthChange);
            this.listenTo(this.dimensionModel, 'change:bodyHeight', this._setHeight);
        },
        /**
         * layout 에 필요한 크기 및 위치 데이터를 갱신한다.
         * @private
         */
        updateLayoutData: function() {
            var offset = this.$el.offset(),
                rsideTotalWidth = this.dimensionModel.getTotalWidth('R'),
                maxScrollLeft = rsideTotalWidth - this.dimensionModel.get('rsideWidth');

            this.renderModel.set({
                maxScrollLeft: maxScrollLeft
            });
            this.dimensionModel.set({
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                toolbarHeight: this.view.toolbar.$el.height()
            });
        },
        /**
         * width 변경시 layout data 를 update 한다.
         * @private
         */
        _onWidthChange: function() {
            this.updateLayoutData();
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
            var $target = $(clickEvent.target);
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select') || $target.is('label'))) {
                this.focusClipboard();
                this.selection.show();
            }
        },
        _onMouseDown: function(mouseDownEvent) {
            console.log('grid mousedown');
            var $target = $(mouseDownEvent.target);
            if (!($target.is('input') || $target.is('a') || $target.is('button') || $target.is('select'))) {
                mouseDownEvent.preventDefault();
                this.trigger('mousedown', mouseDownEvent);
            }
        },
        focusClipboard: function() {
            this.view.clipboard.$el.focus();
        },
        /**
         * _initializeModel
         *
         * Initialize data model instances
         * @param options
         * @private
         */
        _initializeModel: function() {
            var offset = this.$el.offset();

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
                offsetTop: offset.top,
                offsetLeft: offset.left,
                width: this.$el.width(),
                height: this.$el.height(),
                headerHeight: this.option('headerHeight'),
                rowHeight: this.option('rowHeight')
            });

            // define focus model
            this.focusModel = new Model.Focus({
                grid: this
            });

            //define rowList
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

            this.selection = this.createView(View.Selection, {
                grid: this
            });

            //define header & body area
            this.view.lside = this.createView(View.Layout.Frame.Lside, {
                grid: this
            });

            this.view.rside = this.createView(View.Layout.Frame.Rside, {
                grid: this
            });

            this.view.toolbar = this.createView(View.Layout.Toolbar, {
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
                .append(this.view.toolbar.render().el)
                .append(this.view.clipboard.render().el);

            this._setHeight();
            this.trigger('afterRender');
        },
        _setHeight: function() {
            var bodyHeight = this.dimensionModel.get('bodyHeight'),
                headerHeight = this.dimensionModel.get('headerHeight'),
                toolbarHeight = this.view.toolbar.$el.height(),
                height = toolbarHeight + headerHeight + bodyHeight;
            this.$el.css('height', height + 'px');
            this.dimensionModel.set({
                toolbarHeight: toolbarHeight
            });
        },
        /**
         * cell element (TD) 를 반환한다.
         * @param {Number|String}   rowKey
         * @param {String}  columnName
         * @return {Element}
         */
        getCellElement: function(rowKey, columnName) {
            var $frame = this.columnModel.isLside(columnName) ? this.view.lside.$el : this.view.rside.$el;
            return $frame.find('tr[key="' + rowKey + '"]').find('td[columnname="' + columnName + '"]');
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
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         */
        checkRow: function(rowKey) {
            this.setValue(rowKey, '_button', true);
        },
        /**
         * 전체 행을 선택한다
         */
        checkAllRow: function() {
            this.dataModel.setColumnValue('_button', true);
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택해제한다.
         */
        uncheckAllRow: function() {
            this.dataModel.setColumnValue('_button', false);
        },
        /**
         * rowKey, columnName에 해당하는 컬럼에 포커싱한다.
         * @param {Number|String} rowKey
         * @param {String} columnName
         * @param {Boolean} isScrollable
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.focusModel.focus(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {Number|String} rowIndex
         * @param {String} columnIndex
         * @param {Boolean} isScrollable
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            this.focus(this.dataModel.at(rowIndex).get('rowKey'), this.columnModel.at(columnIndex)['columnName'], isScrollable);
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.focusModel.blur();
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
