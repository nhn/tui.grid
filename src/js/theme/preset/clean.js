/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/
'use strict';

var presetDefault = require('./default');

module.exports = $.extend(true, {}, presetDefault, {
    grid: {
        border: '#e0e0e0'
    },
    toolbar: {
        border: '#e0e0e0'
    },
    cell: {
        normal: {
            background: '#fff',
            border: '#e0e0e0',
            showVerticalBorder: false,
            showHorizontalBorder: true
        },
        head: {
            background: '#fff',
            border: '#e0e0e0'
        },
        selectedHead: {
            background: '#e0e0e0'
        }
    }
});
