/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/

'use strict';

var $ = require('jquery');

var presetDefault = require('./default');

module.exports = $.extend(true, {}, presetDefault, {
    cell: {
        normal: {
            background: '#fff',
            border: '#e8e8e8',
            showVerticalBorder: false,
            showHorizontalBorder: false
        },
        oddRow: {
            background: '#f3f3f3'
        },
        evenRow: {
            background: '#fff'
        },
        head: {
            background: '#fff',
            showVerticalBorder: false,
            showHorizontalBorder: false
        }
    }
});
