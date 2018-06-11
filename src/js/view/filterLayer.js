/**
 * @fileoverview Class for the fileter
 * @author Sohee Lee
 */

'use strict';

var $ = require('jquery');
var _ = require('underscore');

var classNameConst = require('../common/classNameConst');
var View = require('../base/view');

var FilterLayer = View.extend({
    initialize: function(options) {
        this.filterModel = options.filterModel;
        this.renderModel = options.renderModel;
        this.domEventBus = options.domEventBus;
        this.isShow = false;
        this.listenTo(options.domEventBus, 'click:headerFilter', this._filterHandler)
            .listenTo(options.domEventBus, 'mousedown:focus', this._closeFilter);
    },

    className: classNameConst.LAYER_FILTER,

    events: {
        'mousedown': '_onMouseDown',
        'keyup input#filter-search': '_onSearchKeyUp',
        'keyup input#filter-number': '_onNumberKeyUp',
        'keydown input#filter-number': '_onNumberKeyDown',
        'click li input.filter-item': '_onCheckAll'
    },

    textTemplate: _.template(
        '<input id="filter-search" onkeyup="" placeholder="Search">' +
        '<ul id="filter-fields">' +
            '<%_.each(list, function(item){%>' +
                '<li class="filter-field">' +
                    '<input type="checkbox" class="filter-item" name="<%=item.field%>"' +
                        '<%if(item.checked){%>' +
                        ' checked' +
                        '<%}%>' +
                    '>' +
                    '<%=item.field%>' +
                '</li>' +
            '<%});%>' +
        '</ul>'
    ),

    numberTemplate: _.template(
        '<input id="filter-number" placeholder="default value is 0" value=<%=value%>>' +
        '<ul>' +
            '<%_.each(conditions, function(condition){%>' +
                '<li class="filter-condition">' +
                    '<input type="radio" name="filter-condition" data-condition="<%=condition%>"' +
                        '<%if(condition===selected){%>' +
                        ' checked' +
                        '<%}%>' +
                    '>' +
                    '<%=condition%>' +
                '</li>' +
            '<%});%>' +
        '</ul>'
    ),

    render: function() {
        this.$el.hide();

        return this;
    },

    _onCheckAll: function(ev) {
        var $liList, $unchecked;
        if (!this.$all) {
            $liList = $('.filter-field input');
            this.$all = $liList[0];
            this.$other = $liList.slice(1, $liList.length);
        }
        if (ev.target.name === 'All') {
            _.each(this.$other, function($li) {
                $li.checked = ev.target.checked;
            });
        } else if (ev.target.checked) {
            $unchecked = _.find(this.$other, function($li) {
                return !$li.checked;
            });
            if ($unchecked) {
                this.$all.checked = false;
            } else {
                this.$all.checked = true;
            }
        } else {
            this.$all.checked = false;
        }
    },

    _filterHandler: function(gridEvent) {
        this.filter = this.filterModel.getFilter(gridEvent.columnName);
        if (this.filter.type === 'text') {
            this._showTextFilter(gridEvent.$target);
        } else if (this.filter.type === 'number') {
            this._showNumberFilter(gridEvent.$target);
        }
    },

    _showTextFilter: function($target) {
        var itemList = this.filter.getContent();
        this.$el.html(this.textTemplate({
            name: this.filter.name,
            list: itemList
        }));
        this.$el.css({
            top: $target.parent().outerHeight(),
            left: $target.offset().left
        });
        this.$el.show();
        this.isShow = true;
    },

    _showNumberFilter: function($target) {
        var content = this.filter.getContent();
        this.$el.html(this.numberTemplate({
            name: this.filter.name,
            conditions: this.filter.condition.Conditions,
            value: content.value,
            selected: content.condition
        }));
        this.$el.css({
            top: $target.parent().outerHeight(),
            left: $target.offset().left
        });
        this.$el.show();
        this.isShow = true;
    },

    _closeFilter: function() {
        var $checkboxes, length, items, i, selected, value;
        if (!this.isShow) {
            return;
        }
        if (this.filter.type === 'text') {
            $checkboxes = $('#filter-fields .filter-field input');
            length = $checkboxes.length;
            items = [];
            for (i = 0; i < length; i += 1) {
                items.push({
                    field: $checkboxes[i].name,
                    checked: $checkboxes[i].checked
                });
            }
            this.filter.setContent(items);
        } else if (this.filter.type === 'number') {
            value = $('#filter-number')[0].value;
            $checkboxes = $('input:radio[name=filter-condition]');
            length = $checkboxes.length;
            for (i = 0; i < length; i += 1) {
                if ($checkboxes[i].checked) {
                    selected = $checkboxes[i].dataset.condition;
                    break;
                }
            }
            this.filter.setContent({
                value: value ? value : 0,
                condition: selected
            });
        }
        this.$el.hide();
        this.isShow = false;
        this.$all = null;
        this.$other = null;
        this.renderModel.refresh({
            type: 'filter:' + this.columnName,
            dataListChanged: true
        });
    },

    _onMouseDown: function(ev) {
        ev.stopPropagation();
    },

    _onSearchKeyUp: function() {
        var value = $('#filter-search')[0].value;
        var $li = $('#filter-fields .filter-field');
        var length = $li.length;
        var i;
        for (i = 0; i < length; i += 1) {
            if ($li[i].innerText.indexOf(value) > -1) {
                $li[i].style.display = '';
            } else {
                $li[i].style.display = 'none';
            }
        }
    },

    _onNumberKeyUp: function(ev) {
        var keyID = (ev.which) ? ev.which : ev.keyCode;
        if (keyID !== 8 && keyID !== 46 && keyID !== 37 && keyID !== 39) {
            ev.target.value = event.target.value.replace(/[^0-9]/g, '');
        }
    },

    _onNumberKeyDown: function(ev) {
        var keyID = (ev.which) ? ev.which : ev.keyCode;
        var result = false;
        if ((keyID >= 48 && keyID <= 57) || (keyID >= 96 && keyID <= 105) ||
            keyID === 8 || keyID === 46 || keyID === 37 || keyID === 39) {
            result = true;
        }

        return result;
    },

    _update: function() {
        return this.filterModel.length;
    },

    _onFiltering: function(ev) {
        var rside = this.renderModel.get('partialRside');
        rside.each(ev.applyFilter, ev);
    }
});

module.exports = FilterLayer;
