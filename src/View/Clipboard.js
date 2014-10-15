    View.Clipboard = View.Base.extend({
        staticData: null,
        tagName: 'textarea',
        className: 'clipboard',
        events: {
            'keydown' : '_onKeydown'
        },
        initialize: function(attributes, option) {
            View.Base.prototype.initialize.apply(this, arguments);
        },
        activate: function() {
            this.listenTo(this.grid, 'afterRender', this.appendTo, this);
            this.listenTo(this.grid, 'mousedown', this._onGridMouseDown, this);
        },
        appendTo: function() {
            this.grid.$el.append(this.render().el);
        },
        render: function() {
            return this;
        },
        _onGridMouseDown: function() {
            this.$el.focus();
        },
        _onKeydown: function(keydownEvent) {
            console.log('onkeydown rowList', this.grid);
            console.log('clipboard', keydownEvent);
        }
    });
