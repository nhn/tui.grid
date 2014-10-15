    View.Cell.Base = View.Base.extend({
        cellType: 'normal',
        eventHandler: {},
        shouldRenderList: ['isEditable', 'optionList', 'value'],
        initialize: function(attributes, options) {
            View.Base.prototype.initialize.apply(this, arguments);
            this._initializeEventHandler();
        },
        _initializeEventHandler: function() {
            var eventHandler = {},
                count = 0;

            _.each(this.eventHandler, function(methodName, eventName) {
                var tmp = eventName.split(' '),
                    event = tmp[0],
                    selector = tmp[1] || '';

                eventHandler[event] = {
                    selector: selector,
                    handler: $.proxy(this[methodName], this)
                };
                count++;
            }, this);
            this.setOwnProperties({
                _eventHandler: eventHandler,
                hasEvent: !!count
            });
        },
        baseTemplate: _.template('<td ' +
            ' columnName="<%=columnName%>"' +
            ' rowSpan="<%=rowSpan%>"' +
            ' class="<%=className%>"' +
            ' <%=attributes%>' +
            ' cellType="<%=cellType%>"' +
            '>' +
            '<%=content%>' +
            '</td>'),


        onModelChange: function(cellData, $tr) {

            var $target = this._getCellElement(cellData.columnName, $tr),
                shouldRender = false;

            this._setFocusedClass(cellData, $target);

            for (var i = 0; i < this.shouldRenderList.length; i++) {
                if ($.inArray(this.shouldRenderList[i], cellData.changed) !== -1) {
                    shouldRender = true;
                    break;
                }
            }
            if (shouldRender === true) {
                this.render(cellData, $target);
            }else {
                this.setElementAttribute(cellData, $target);
            }
        },
        attachHandler: function($target) {
            _.each(this._eventHandler, function(obj, eventName) {
                var handler = obj.handler,
                    selector = obj.selector,
                    $el = $target;
                if (selector) {
                    $el = $target.find(selector);
                }
                $el.bind(eventName, handler);
            }, this);
        },
        detachHandler: function($target) {
            _.each(this._eventHandler, function(obj, eventName) {
                var selector = obj.selector,
                    $el = $target;
                if (selector) {
                    $el = $target.find(selector);
                }
                $el.unbind(eventName);
            }, this);
        },
        _setFocusedClass: function(cellData, $target) {
            (cellData.selected === true) ? $target.addClass('selected') : $target.removeClass('selected');
            (cellData.focused === true) ? $target.addClass('focused') : $target.removeClass('focused');
        },
        setElementAttribute: function(cellData, $target) {

        },
        render: function(cellData, $target) {
            this.detachHandler($target);
            $target.html(this.getContentHtml(cellData));
            this.attachHandler($target);
        },

        getHtml: function(cellData) {
            var classNameList = [];

            if (cellData.className) {
                classNameList.push(cellData.className);
            }
            if (cellData.selected === true) {
                classNameList.push('selected');
            }
            if (cellData.focused === true) {
                classNameList.push('focused');
            }

            return this.baseTemplate({
                columnName: cellData.columnName,
                rowSpan: cellData.rowSpan,
                className: classNameList.join(' '),
                attributes: this.getAttributes(cellData),
                cellType: this.cellType,
                content: this.getContentHtml(cellData)
            });
        },
        getAttributesString: function(attributes) {
            var str = '';
            _.each(attributes, function(value, key) {
                str += ' ' + key + '="' + value + '"';
            }, this);
            return str;
        },
        getEventHandler: function() {
            return this._eventHandler;
        },

        /**
         * implement this.
         * @private
         */
        getContentHtml: function(cellData) {
            return cellData.value;
        },
        /**
         * implement this.
         * @private
         */
        getAttributes: function(cellData) {
            return '';
        },
        _getColumnName: function($target) {
            return $target.closest('td').attr('columnName');
        },
        _getRowKey: function($target) {
            return $target.closest('tr').attr('key');
        },
        _getCellElement: function(columnName, $tr) {
            return $tr.find('td[columnName="' + columnName + '"]');
        },
        _getCellAddress: function($target) {
            return {
                rowKey: this._getRowKey($target),
                columnName: this._getColumnName($target)
            };
        }
    });


    View.Cell.Interface = View.Cell.Base.extend({
        cellType: 'normal',
        shouldRenderList: ['isEditable', 'optionList', 'value'],
        eventHandler: {
        },
        initialize: function() {
            View.Cell.Base.prototype.initialize.apply(this, arguments);
        },
        getContentHtml: function(cellData) {
            throw this.error('Implement getContentHtml(cellData, $target) method. On re-rendering');
        },
        setElementAttribute: function(cellData, $target) {
            throw this.error('Implement setElementAttribute(cellData, $target) method. ');
        }
    });


