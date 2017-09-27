'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
var rowData = [];

(function() {
    var i = 0;
    for (; i < 50; i += 1) {
        rowData.push({
            c1: i + 101,
            c2: parseInt(Math.random() * 100, 10),
            c3: parseInt(Math.random() * 100, 10)
        });
    }
})();

function getSampleData(query) {
    var page = Number(query.page),
        perPage = Number(query.perPage),
        startIdx = (page - 1) * perPage,
        endIdx = startIdx + perPage,
        contents;

    if (query.sortColumn) {
        sortRowData(query.sortColumn, query.sortAscending === 'true');
    }
    contents = rowData.slice(startIdx, endIdx);

    return createResponseData(contents, page);
}

function createResponseData(contents, page) {
    return {
        result: true,
        message: 'error',
        data: {
            contents: contents,
            pagination: {
                page: page,
                totalCount: rowData.length
            }
        }
    };
}

function sortRowData(columnName, ascending) {
    rowData.sort(function(a, b) {
        var result = a[columnName] - b[columnName];
        if (!ascending) {
            result = -result;
        }

        return result;
    });
}

/* eslint-disable dot-notation */
app.use(express.static(path.join(__dirname, '..')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.route('/sample')
    .get(function(req, res) {
        res.send(getSampleData(req.query));
    })
    .post(function(req, res) {
        res.send(getSampleData(req.body));
    });

app.route('/download/excel')
    .get(function(req, res) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.send('this!!???');
    });

app.route('/download/excelAll')
    .get(function(req, res) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.send('this!!???AAAA');
    });

app.route('/update')
    .post(function(req, res) {
        res.send({
            result: false,
            message: 'Error!!'
        });
    });

app.listen(8000);
