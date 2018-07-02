'use strict';

var columns = (function() {
    var columnModels = [];

    _.times(10, function(idx) {
        var options = {
            title: idx,
            name: 'c' + idx
        }

        if (idx === 0) {
            options.width = 300;
            options.editOptions = {
                type: 'text',
                useViewMode: true
            }
        }

        columnModels.push(options);
    });

    return columnModels;
})();
