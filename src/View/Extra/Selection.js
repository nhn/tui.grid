    View.Extra.Selection = View.Base.extend({
        events : {
        },
        initialize : function(attributes, option){
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
				whichSide : attributes && attributes.whichSide || 'R',
                lside : null,
                rside : null,
                range : {
                    column : [0, 1],
                    row : [2, 3]
                }
			});
        },
        activate : function(){
            this.listenTo(this.grid.view.rside, "afterRender", this.appendToRside, "a");
            this.listenTo(this.grid.view.lside, "afterRender", this.appendToLside, "b");
        },
        appendToRside : function(){
            this.rside = this.appendTo(this.grid.view.rside.body, View.Extra.Selection.Layer.Rside);
            this.show();
        },
        appendToLside : function(){
            this.lside = this.appendTo(this.grid.view.lside.body, View.Extra.Selection.Layer.Lside);

        },
        appendTo : function(view, clazz){
//            var layer = new clazz({
//                grid : this.grid,
//                columnWidthList : this.grid.dimensionModel.getColumnWidthList(view.whichSide)
//            });
//            this.addView(layer);
//            view.$el.append(layer.render().el);
//            return layer;
        },


        startSelection : function(rowIndex, columnIndex){
            this.range.row[0] = this.range.row[1] = rowIndex;
            this.range.column[0] = this.range.column[1] = columnIndex;
        },
        updateSelectionRange : function(rowIndex, columnIndex){
            this.range.row[1] = rowIndex;
            this.range.column[1] = columnIndex;
        },
        endSelection : function(){
            this.range.row[0] = this.range.row[1] = this.range.column[0] = this.range.column[1] = -1;
        },

        show : function(){
            var rowHeight = this.grid.dimensionModel.get('rowHeight'),
                startRow = Math.min.apply(Math, this.range.row),
                endRow = Math.max.apply(Math, this.range.row),
                startColumn = Math.min.apply(Math, this.range.column),
                endColumn = Math.max.apply(Math, this.range.column),
                top = Util.getTBodyHeight(startRow, rowHeight),
                height = Util.getTBodyHeight(endRow-startRow, rowHeight) - 3;

            console.log('this.lside.$el', this.lside);
            this.lside.show(startRow, endRow, startColumn, endColumn);
            this.rside.show(startRow, endRow, startColumn, endColumn);

            this.lside.$el.css({
                top : top+'px',
                width : 100 + 'px',
                height : height + 'px',
                display: 'block'
            });

//                columnFixIndex = this.grid.columnModel.get('columnFixIndex'),
//                columnWidthList = this.grid.dimensionModel.get('columnWidthList'),
//
//                top = Util.getTBodyHeight(startRow, rowHeight),
//                height = Util.getTBodyHeight(endRow-startRow, rowHeight) - 3;
//
//
//
//            //좌측 영역 랜더링
//
//
//            //우측 영역도 랜더링
//            if(endColumn >= columnFixIndex){
//
//            }
//
//            this.$el.css({
//                top : top+'px',
//                width : 100 + 'px',
//                height : height + 'px',
//                display: 'block'
//            });
        }



    });


    View.Extra.Selection.Layer = View.Base.extend({
        tagName : 'div',
        className : 'selection_layer',
        initialize : function(attributes, option){
            View.Base.prototype.initialize.apply(this, arguments);
            this.listenTo(this.grid.renderModel, "change:scrollTop", this._onScrollTopChange, this);
			this.listenTo(this.grid.renderModel, "beforeRefresh", this._onBeforeRefresh, this);
            this.listenTo(this.grid.renderModel, "change:top", this._onTopChange, this);
            this.setOwnProperties({
                columnWidthList : attributes.columnWidthList
            });
        },
        _onScrollTopChange : function(){

        },
        _onBeforeRefresh : function(){

        },
        _onTopChange : function(){

        },
        render : function(){
            console.log('@@Selection layer render');
            return this;
        }
    });

    View.Extra.Selection.Layer.Lside = View.Extra.Selection.Layer.extend({
        initialize : function(attributes, option){
            View.Extra.Selection.Layer.prototype.initialize.apply(this, arguments);
            console.log('LSIDE : ', this.columnWidthList);
        },
        _onScrollTopChange : function(){

        },
        _onBeforeRefresh : function(){

        },
        _onTopChange : function(){
            console.log(this.$el.length);
        },
        show : function(startRow, endRow, startColumn, endColumn){

        }
    });

    View.Extra.Selection.Layer.Rside = View.Extra.Selection.Layer.extend({
        initialize : function(attributes, option){
            View.Extra.Selection.Layer.prototype.initialize.apply(this, arguments);
            console.log('RSIDE : ', this.columnWidthList);
        },
        _onScrollTopChange : function(){

        },
        _onBeforeRefresh : function(){

        },
        _onTopChange : function(){

        },
        show : function(startRow, endRow, startColumn, endColumn){

        }
    });