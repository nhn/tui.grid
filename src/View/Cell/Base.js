    View.Cell.Base = View.Base.extend({
        eventHandler : {},
        shouldRenderList : ['isEditable', 'optionList', 'value'],
        initialize : function(attributes, options){
            var eventHandler = {};
            View.Base.prototype.initialize.apply(this, arguments);
            _.each(this.eventHandler, function(methodName, eventName){
                eventHandler[eventName] = $.proxy(this[methodName], this);
            }, this);
            this.setOwnProperties({
                _eventHandler : eventHandler
            });
        },

        baseTemplate : _.template('<td ' +
            ' columnName="<%=columnName%>"' +
            ' rowSpan="<%=rowSpan%>"' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            '>' +
            '<%=content%>' +
            '</td>'),


        onModelChange : function(cellData, $tr){

            var $target = this._getCellElement(cellData.columnName, $tr),
                shouldRender = false;

            this._setFocusedClass(cellData, $target);

            for(var i = 0; i < this.shouldRenderList.length; i++){
                if($.inArray(this.shouldRenderList[i], cellData.changed) !== -1){
                    shouldRender = true;
                    break;
                }
            }
            if(shouldRender === true){
                this.render(cellData, $target);
            }else{
                this.setElementAttribute(cellData, $target);
            }
        },
        _attachHandler : function($target){
            _.each(this._eventHandler, function(handler, name){
                var tmp = name.split(' '),
                    eventName = tmp[0],
                    selector = tmp[1] || '';

                if(selector){
                    $target = $target.find(selector);
                }

                $target.off(eventName).on(eventName, handler);
//                console.log('$target', $target.length, $target.html(), handler);
            }, this);
        },
        _detachHandler : function($target){
            _.each(this._eventHandler, function(handler, name){
                var tmp = name.split(' '),
                    eventName = tmp[0],
                    selector = tmp[1] || '';

                if(selector){
                    $target = $target.find(selector);
                }

                $target.off(eventName);
            }, this);
        },
        _setFocusedClass : function(cellData, $target){
            (cellData.selected === true) ? $target.addClass('selected') : $target.removeClass('selected');
            (cellData.focused === true) ? $target.addClass('focused') : $target.removeClass('focused');
        },
        setElementAttribute : function(cellData, $target){

        },
        render : function(cellData, $target){
            this._detachHandler($target);
            $target.html(this.getContentHtml(cellData));
            this._attachHandler($target);
        },

        getHtml : function(cellData){
            var classNameList = [];

            if(cellData.className){
                classNameList.push(cellData.className);
            }
            if(cellData.selected === true) {
                classNameList.push('selected');
            }
            if(cellData.focused === true){
                classNameList.push('focused');
            }

            return this.baseTemplate({
                columnName : cellData.columnName,
                rowSpan : cellData.rowSpan,
                className : classNameList.join(' '),
                attributes : this.getAttributes(cellData),
                content : this.getContentHtml(cellData)
            });
        },
        getAttributesString : function(attributes){
            var str = '';
            _.each(attributes, function(value, key){
                str += ' ' + key + '="'+value+'"';
            }, this);
            return str;
        },
        getEventHandler : function(){
            return this._eventHandler;
        },

        /**
         * implement this.
         * @private
         */
        getContentHtml : function(cellData){
            return cellData.value;
        },
        /**
         * implement this.
         * @private
         */
        getAttributes : function(cellData){
            return '';
        },
        _getColumnName : function($target){
            return $target.closest('td').attr('columnName');
        },
        _getRowKey : function($target){
            return $target.closest('tr').attr('key');
        },
        _getCellElement : function(columnName, $tr){
            return $tr.find('td[columnName="' + columnName + '"]');
        },
        _getCellAddr : function($target){
            return {
                rowKey : this._getRowKey($target),
                columnName : this._getColumnName($target)
            };
        }
    });


    View.Cell.Interface = View.Cell.Base.extend({
        shouldRenderList : ['isEditable', 'optionList', 'value'],
        eventHandler : {
        },
        initialize : function(){
            View.Cell.Base.prototype.initialize.apply(this, arguments);
        },
        getContentHtml : function(cellData){
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute : function(cellData, $target){
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });


