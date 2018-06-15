/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/

'use strict';

var $ = require('jquery');

var presetDefault = require('./default');

module.exports = $.extend(true, {}, presetDefault, {
    outline: {
        border: '#eee',
        showVerticalBorder: false
    },
    frozenBorder: {
        border: '#ddd'
    },
    area: {
        header: {
            border: '#eee',
            background: '#f9f9f9'
        },
        body: {
            background: '#fff'
        },
        summary: {
            border: '#fff',
            background: '#fff'
        }
    },
    cell: {
        normal: {
            background: '#fff',
            border: '#eee',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        head: {
            background: '#f9f9f9',
            border: '#eee',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        rowHead: {
            border: '#eee',
            showVerticalBorder: false,
            showHorizontalBorder: false
        }
    }
});
