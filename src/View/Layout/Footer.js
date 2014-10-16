    View.Layout.Footer = View.Base.extend({
        tagName: 'div',
        className: 'footer',
        render: function() {
            this.$el.html('footer');
            return this;
        }
    });
