'use strict';

var columns = (function() {
    var columnModels = [];

    _.times(10, function(idx) {
        columnModels.push({
            title: idx,
            name: 'c' + idx,
            formatter: function(value) {
                if (idx % 2 === 0) {
                    value = '<a href="#">' + value + '</a>'; // make link
                } else {
                    value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); // 1,000 formatting
                }

                return value;
            }
        });
    });

    return columnModels;
})();
