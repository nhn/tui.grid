/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/

'use strict';

module.exports = {
    grid: {
        background: '#fff',
        border: '#ccc',
        text: '#444'
    },
    selection: {
        background: '#4daaf9',
        border: '#004082'
    },
    heightResizeHandle: {
        border: '#ccc',
        background: '#fff'
    },
    pagination: {
        border: 'transparent',
        background: 'transparent'
    },
    scrollbar: {
        background: '#f5f5f5',
        thumb: '#d9d9d9',
        active: '#c1c1c1'
    },
    cell: {
        normal: {
            background: '#fbfbfb',
            border: '#e0e0e0',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        head: {
            background: '#eee',
            border: '#ccc',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        selectedHead: {
            background: '#d8d8d8'
        },
        focused: {
            border: '#418ed4'
        },
        focusedInactive: {
            border: '#aaa'
        },
        required: {
            background: '#fffdeb'
        },
        editable: {
            background: '#fff'
        },
        disabled: {
            text: '#b0b0b0'
        },
        dummy: {
            background: '#fff'
        },
        invalid: {
            background: '#ff8080'
        },
        evenRow: {},
        oddRow: {},
        currentRow: {}
    }
};
