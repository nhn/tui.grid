    Model.Cell = Model.Base.extend({
        defaults : {
            rowKey : "",
            columnName  : "",
            value : "",

            //Rendering properties
            rowSpan : 0,
            isMainRow : true,
            mainRowKey : "",
            isEditable : false,
            optionList : [],

            //Change attribute properties
            isDisabled : false,
            className : "",
            selected : false,
            focused : false
        },
        initialize : function(attributes){
            Model.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                _model : attributes._model || null,
                attrProperties : [
                    'isDisabled',
                    'className',
                    'selected',
                    'focused'
                ]

            });

            var columnName = attributes.columnName;

            //model 의 변경사항을 listen 한다.
            this.listenTo(this._model, 'change:'+columnName, this._onModelChange, this);
            this.on('change', this._onChange, this);

        },
        _onModelChange : function(row, value){
            var columnModel = this.grid.columnModel.getColumnModel(this.get('columnName'));
            //@TODO : execute affect option

            if(columnModel.affectOption){
                //@TODO:do AffectOption
            }

            this.set("value", value)
        },
        _onChange : function(cell){
            var shouldRender = false;
            _.each(cell.changed, function(value, key){
                if($.inArray(key, this.attrProperties) === -1){
                    shouldRender = true;
                }
            }, this);
            if(shouldRender === true){
                this.trigger('render', cell);
            }else{
                this.trigger('changeAttr', cell);
            }
        },
        setValue : function(value){
            this._model.set(this.get('columnName'), value);
        }
    });