    /**
     * body layout 뷰
     *
     * @type {*|void}
     */
	View.Layout.Body = View.Base.extend({
		tagName : "div",
		className : "data",
		template : _.template('' +
				'<div class="table_container" style="top: 0px">' +
				'	<table width="100%" border="0" cellspacing="1" cellpadding="0" bgcolor="#EFEFEF">' +
				'		<colgroup><%=colGroup%></colgroup>' +
				'		<tbody></tbody>' +
				'	</table>' +
				'</div>'),
		events : {
			'scroll' : '_onScroll'
		},
        initialize : function(attributes){
			View.Base.prototype.initialize.apply(this, arguments);
			this.setOwnProperties({
				whichSide : attributes && attributes.whichSide || 'R'
			});
			this.listenTo(this.grid.renderModel, "change:scrollTop", this._onScrollTopChange, this);
			this.listenTo(this.grid.renderModel, "beforeRefresh", this._onBeforeRefresh, this);
            this.listenTo(this.grid.renderModel, "change:top", this._onTopChange, this);
            this.listenTo(this.grid.dimensionModel, "columnWidthChanged", this._onColumnWidthChanged, this);
		},
        _onColumnWidthChanged : function(){
            var columnWidthList = this.grid.dimensionModel.getColumnWidthList(this.whichSide),
                $colList = this.$el.find('col');
            for(var i  = 0; i < $colList.length; i++){
                $colList.eq(i).css('width', columnWidthList[i] + 'px');
            }
        },
		_onScroll : function(scrollEvent){
            var obj = {};
            obj['scrollTop'] = scrollEvent.target.scrollTop;
            if(this.whichSide === 'R'){
                obj['scrollLeft'] = scrollEvent.target.scrollLeft;
            }
			this.grid.renderModel.set(obj);
		},
		_onScrollTopChange : function(model, value){
			this.el.scrollTop = value;
		},
        _onTopChange : function(model, value){
            this.$el.children().css('top', value+'px');
        },
		_onBeforeRefresh : function(){
			this.el.scrollTop = this.grid.renderModel.get('scrollTop');
		},
		_getViewCollection : function(){
			return this.grid.renderModel.getCollection(this.whichSide);
		},
		render : function(){
			this.destroyChildren();

			this.$el.css({
				height : this.grid.dimensionModel.get('bodyHeight')
			});
			this.$el.html(this.template({
				colGroup : this._getColGroupMarkup()
			}));

			var rowList = this.createView(View.RowList, {
                grid : this.grid,
				collection : this._getViewCollection(),
				el : this.$el.find("tbody"),
				whichSide : this.whichSide
			});

			rowList.render();
			return this;
		},
		_getColGroupMarkup : function(){
			var columnModel = this.grid.columnModel,
				dimensionModel = this.grid.dimensionModel,
				columnWidthList = dimensionModel.getColumnWidthList(this.whichSide),
				columnModelList = columnModel.getColumnModelList(this.whichSide);

			var html = '';
			for(var i = 0, len=columnWidthList.length; i < len; i++){
				html += '<col columnname="'+columnModelList[i]["columnName"]+'" style="width:'+columnWidthList[i]+'px">';
			}
			return html;
		}
	});