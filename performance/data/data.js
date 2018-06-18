'use strict';

var data = (function() {
    var rowList = [];

    _.times(100000, function() {
        var row = {};

        _.times(30, function(idx) {
            row['c' + idx] = parseInt(Math.random() * 10000000000, 10);
        });
        rowList.push(row);
    });

    return rowList;
})();
