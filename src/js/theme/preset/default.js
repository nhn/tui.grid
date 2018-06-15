/**
* @fileoverview default theme preset
* @author NHN Ent. FE Development Team
*/

'use strict';

module.exports = {
    selection: {
        background: '#00A9ff',
        border: '#00a9ff'
    },
    heightResizeHandle: {
        border: '#fff',
        background: '#fff'
    },
    pagination: {
        border: 'transparent',
        background: 'transparent'
    },
    scrollbar: {
        border: '#eee',
        background: '#fff',
        emptySpace: '#f9f9f9',
        thumb: '#ddd',
        active: '#ddd'
    },
    outline: {
        border: '#aaa',
        showVerticalBorder: false
    },
    frozenBorder: {
        border: '#aaa'
    },
    area: {
        header: {
            border: '#ccc',
            background: '#fff'
        },
        body: {
            background: '#fff'
        },
        summary: {
            border: '#eee',
            background: '#fff'
        }
    },
    cell: {
        normal: {
            background: '#f4f4f4',
            border: '#eee',
            text: '#333',
            showVerticalBorder: false,
            showHorizontalBorder: true
        },
        head: {
            background: '#fff',
            border: '#eee',
            text: '#222',
            showVerticalBorder: true,
            showHorizontalBorder: true
        },
        rowHead: {
            background: '#fff',
            border: '#eee',
            text: '#333',
            showVerticalBorder: false,
            showHorizontalBorder: true
        },
        summary: {
            background: '#fff',
            border: '#eee',
            text: '#333',
            showVerticalBorder: false
        },
        selectedHead: {
            background: '#e5f6ff'
        },
        selectedRowHead: {
            background: '#e5f6ff'
        },
        focused: {
            border: '#00a9ff'
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
            background: '#f9f9f9',
            text: '#c1c1c1'
        },
        dummy: {
            background: '#fff'
        },
        invalid: {
            background: '#ffe5e5'
        },
        evenRow: {},
        oddRow: {},
        currentRow: {}
    }
};
