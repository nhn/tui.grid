    View.Extra.Log = View.Base.extend({
        events: {
            'click input' : 'clear'
        },
        initialize: function(attributes) {
            View.Base.prototype.initialize.apply(this, arguments);
            this.setOwnProperties({
                maxCount: 20,
                logs: [],
                buffer: '',
                lastTime: -1,
                timeoutIdForLogs: 0,
                width: 500,
                height: 200,
                opacity: 0.8
            });
        },
        activate: function() {
            if (this.grid.option('debug') === true) {
                this.listenTo(this.grid, 'afterRender', this.appendTo, this);
            }
        },
        appendTo: function() {
            this.grid.$el.append(this.render().el);
        },
        render: function() {
            this.$el.css({
                'position' : 'absolute',
                'right' : '25px',
                'top' : '25px',
                'opacity' : this.opacity,
                'background' : 'yellow',
                'width' : this.width + 'px',
                'height' : this.height + 'px',
                'overflow' : 'auto'
            });
            return this;
        },
        clear: function() {
//            this.buffer = '';
//            this.$el.html('');
        },
        write: function(text) {

            if (!this.buffer) {
                this.buffer = '';
            }
            clearTimeout(this.timeoutIdForLogs);
            var str = this.buffer;

            var d = new Date();
            var timeStamp = '['+ d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + '] ';
            var elapsed = 0;

            if (this.lastTime > 0) {
                elapsed = d - this.lastTime;
            }

            this.lastTime = d;


            var lineList = str.split('<br>');
            if (lineList.length > this.maxCount) {
                lineList.pop();
            }

            lineList.unshift('<b>' + timeStamp + text + ' :elapsed [' + elapsed + ']</b>');
            this.buffer = lineList.join('<br>');
            this.timeoutIdForLogs = setTimeout($.proxy(function() {
                this.$el.html(this.buffer);
            }, this), 100);
        }
    });
