'use strict';

var data = (function() {
    var rowList = [];

    function addColumnData(row) {
        _.times(30, function(idx) {
            row['c' + idx] = parseInt(Math.random() * 10000000000, 10);
        });
    }

    function addRowData() {
        var parent;

        _.times(100000, function(idx) {
            var row = { // depth 1
                _children: [ // depth 2
                    {
                        _children: [ // depth 3
                            {
                                _children: [ // depth 4
                                    {
                                        _children: [ // depth 5
                                            {
                                                _children: [ // depth 6
                                                    {
                                                        _children: [ // depth 7
                                                            {
                                                                _children: [ // depth 8
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            };

            if (idx % 7 === 0) {
                addColumnData(row);
                parent = row;
                rowList.push(row);
            } else {
                addChildrenData(parent);
            }
        });
    }

    function addChildrenData(row) {
        var currentRow;

        if (row._children && row._children.length) {
            currentRow = row._children[0];
            addColumnData(currentRow);
            addChildrenData(currentRow);
        }
    }

    addRowData();

    return rowList;
})();
