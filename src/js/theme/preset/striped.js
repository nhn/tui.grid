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
        border: '#ccc'
    },
    area: {
        header: {
            border: '#fff',
            background: '#eee'
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
            border: '#fff',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        head: {
            background: '#eee',
            border: '#fff',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        rowHead: {
            border: '#fff',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        oddRow: {
            background: '#fff'
        },
        evenRow: {
            background: '#f4f4f4'
        }
    }
});
