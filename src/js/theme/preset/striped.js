/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/
'use strict';

var presetDefault = require('./default');

module.exports = $.extend(true, {}, presetDefault, {
    cell: {
        normal: {
            background: '#fff',
            border: '#e8e8e8',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        evenRow: {
            background: '#f3f3f3'
        },
        head: {
            showVerticalBorder: true,
            showHorizontalBorder: true
        }
    }
});
