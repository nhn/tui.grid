/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/

'use strict';

var $ = require('jquery');

var presetDefault = require('./default');

module.exports = $.extend(true, {}, presetDefault, {
    grid: {
        border: '#c0c0c0'
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
            border: '#e0e0e0',
            showVerticalBorder: false,
            showHorizontalBorder: true
        },
        selectedHead: {
            background: '#e0e0e0'
        }
    }
});
