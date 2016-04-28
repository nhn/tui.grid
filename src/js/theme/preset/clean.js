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
            showHorizontalBorder: true
        },
        head: {
            background: '#fff',
            border: '#d5d5d5'
        },
        selectedHead: {
            background: '#e8e8e8'
        }
    }
});
