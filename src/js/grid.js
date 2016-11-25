/**
 * @fileoverview The tui.Grid class for the external API.
 * @author NHN Ent. FE Development Team
 */
'use strict';
/**
 * Grid public API
 *
 * @param {PropertiesHash} options
 *      @param {number} [options.columnFixCount=0] - Column index for fixed column. The columns indexed from 0 to this
 *          value will always be shown on the left side. {@link tui.Grid#setColumnFixCount|setColumnFixCount}
 *          can be used for setting this value dynamically.
 *      @param {string} [options.selectType=''] - Type of buttons shown next to the _number(rowKey) column.
 *          The string value 'checkbox' or 'radio' can be used.
 *          If not specified, the button column will not be shown.
 *      @param {boolean} [options.autoNumbering=true] - Specifies whether to assign a auto increasing number
 *          to each rows when rendering time.
 *      @param {number} [options.headerHeight=35] - The height of the header area.
 *          When rows in header are multiple (merged column), this value must be the total height of rows.
 *      @param {number} [options.rowHeight=27] - The height of each rows.
 *      @param {boolean} [options.isFixedRowHeight=false] - If set to true, the height of each rows does not
 *          expand with content.
 *      @param {number} [options.bodyHeight] - The height of body area. If this value is empty, the height of body
 *          area expands.
 *          to total height of rows.
 *      @param {number} [options.displayRowCount=10] - Deprecated.
 *          <del>The number of rows to be shown in the table area.
 *          Total height of grid will be set based on this value.</del>
 *      @param {number} [options.minimumColumnWidth=50] - Minimum width of each columns.
 *      @param {boolean} [options.useClientSort=true] - If set to true, sorting will be executed by client itself
 *          without server.
 *      @param {boolean} [options.singleClickEdit=false] - If set to true, editable cell in the view-mode will be
 *          changed to edit-mode by a single click.
 *      @param {boolean} [options.scrollX=true] - Specifies whether to show horizontal scrollbar.
 *      @param {boolean} [options.scrollY=true] - Specifies whether to show vertical scrollbar.
 *      @param {boolean} [options.fitToParentHeight=false] - If set to true, the height of the grid will expand to
 *          fit the height of parent element.
 *      @param {boolean} [options.showDummyRows=false] - If set to true, empty area will be filled with dummy rows.
 *      @param {string} [options.keyColumnName=null] - The name of the column to be used to identify each rows.
 *          If not specified, unique value for each rows will be created internally.
 *      @param {boolean} [options.toolbar=false] - If set to true, toolbar area will be shown.
 *      @param {boolean} [options.resizeHandle=false] - If set to true, a handle for resizing height will be shown.
 *      @param {Object} [options.pagination=null] - Options for tui.component.Pagination.
 *          If set to null or false, pagination will not be used.
 *      @param {array} options.columnModelList - The configuration of the grid columns.
 *          @param {string} options.columnModelList.columnName - The name of the column.
 *          @param {boolean} [options.columnModelList.isEllipsis=false] - If set to true, ellipsis will be used
 *              for overflowing content.
 *          @param {string} [options.columnModelList.align=left] - Horizontal alignment of the column content.
 *              Available values are 'left', 'center', 'right'.
 *          @param {string} [options.columnModelList.valign=middle] - Vertical alignment of the column content.
 *              Available values are 'top', 'middle', 'bottom'.
 *      @param {number} [options.valign=27] - The height of each rows.
 *          @param {string} [options.columnModelList.className] - The name of the class to be used for all cells of
 *              the column.
 *          @param {string} [options.columnModelList.title] - The title of the column to be shown on the header.
 *          @param {number} [options.columnModelList.width] - The width of the column. The unit is pixel.
 *          @param {boolean} [options.columnModelList.isHidden] - If set to true, the column will not be shown.
 *          @param {boolean} [options.columnModelList.isFixedWidth=false] - If set to true, the width of the column
 *              will not be changed.
 *          @param {boolean} [options.columnModelList.isRequired=false] - If set to true, the data of the column
 *              will be checked to be not empty whenever data is changed or calling {@link tui.Grid#validate}.
 *          @param {string} [options.columnModelList.defaultValue] - The default value to be shown when the column
 *              doesn't have a value.
 *          @param {function} [options.columnModelList.formatter] - The function that formats the value of the cell.
 *              The retrurn value of the function will be shown as the value of the cell.
 *          @param {boolean} [options.columnModelList.notUseHtmlEntity=false] - If set to true, the value of the cell
 *              will not be encoded as HTML entities.
 *          @param {boolean} [options.columnModelList.isIgnore=false] - If set to true, the value of the column will be
 *               ignored when setting up the list of modified rows.
 *          @param {boolean} [options.columnModelList.isSortable=false] - If set to true, sort button will be shown on
 *              the right side of the column header, which executes the sort action when clicked.
 *          @param {Array} [options.columnModelList.editOption] - The object for configuring editing UI.
 *              @param {string} [options.columnModelList.editOption.type='normal'] - The string value that specifies
 *                  the type of the editing UI.
 *                  Available values are 'text', 'password', 'select', 'radio', 'checkbox'.
 *              @param {boolean} [options.columnModelList.editOption.useViewMode=true] - If set to true, default mode
 *                  of the cell will be the 'view-mode'. The mode will be switched to 'edit-mode' only when user
 *                  double click or press 'ENTER' key on the cell. If set to false, the cell will always show the
 *                  input elements as a default.
 *              @param {Array} [options.columnModelList.editOption.list] - Specifies the option list for the
 *                  'select', 'radio', 'checkbox' type. The item of the array must contain properties named
 *                  'text' and 'value'. (e.g. [{text: 'option1', value: 1}, {...}])
 *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] - The function that will be
 *                  called before changing the value of the cell. If returns false, the changing will be canceled.
 *              @param {function} [options.columnModelList.editOption.changeAfterCallback] - The function that will be
 *                  called after changing the value of the cell.
 *              @param {(string|function)} [options.columnModelList.editOption.beforeContent] - The HTML string to be
 *                  shown left to the value. If it's a function, the return value will be used.
 *              @param {(string|function)} [options.columnModelList.editOption.afterContent] - The HTML string to be
 *                  shown right to the value. If it's a function, the return value will be used.
 *              @param {function} [options.columnModelList.editOption.converter] - The function whose
 *                  return value (HTML) represents the UI of the cell. If the return value is
 *                  falsy(null|undefined|false), default UI will be shown.
 *              @param {Object} [options.columnModelList.editOption.inputEvents] - The object that has an event name
 *                  as a key and event handler as a value for events on input element.
 *          @param {Array} [options.columnModelList.relationList] - Specifies relation between this and other column.
 *              @param {array} [options.columnModelList.relationList.columnList] - Array of the names of target columns.
 *              @param {function} [options.columnModelList.relationList.isDisabled] - If returns true, target columns
 *                  will be disabled.
 *              @param {function} [options.columnModelList.relationList.isEditable] - If returns true, target columns
 *                  will be editable.
 *              @param {function} [options.columnModelList.relationList.optionListChange] - The function whose return
 *                  value specifies the option list for the 'select', 'radio', 'checkbox' type.
 *                  The options list of target columns will be replaced with the return value of this function.
 *          @param {Object} [options.columnModelList.component] - Option for using tui-component
 *              @param {string} [options.columnModelList.component.name] - The name of the compnent to use
 *                  for this column
 *              @param {Object} [options.columnModelList.component.option] - The option object to be used for
 *                  creating the component
 *      @param {array} [options.columnMerge] - The array that specifies the merged column.
 *          This options does not merge the cells of multiple columns into a single cell.
 *          This options only effects to the headers of the multiple columns, creates a new parent header
 *          that includes the headers of spcified columns, and sets up the hierarchy.
 *      @param {Object} [options.footer] - The object for configuring footer area.
 *          @param {number} [options.footer.height] - The height of the footer area.
 *          @param {Object.<string, Object>} [options.footer.columnContent]
 *              The object for configuring each column in the footer.
 *              Sub options below are keyed by each column name.
 *              @param {boolean} [options.footer.columnContent.useAutoSummary=true]
 *                  If set to true, the summary value of each column is served as a paramater to the template
 *                  function whenever data is changed.
 *              @param {function} [options.footer.columnContent.template] - Template function which returns the
 *                  content(HTML) of the column of the footer. This function takes an K-V object as a parameter
 *                  which contains a summary values keyed by 'sum', 'avg', 'min', 'max' and 'cnt'.
 * @constructor tui.Grid
 * @example
     <div id='grid'></div>
     <script>
 var grid = new tui.Grid({
    el: $('#grid'),
    columnFixCount: 2,  //(default=0)
    selectType: 'checkbox', //(default='')
    autoNumbering: true, //(default=true)
    headerHeight: 100, //(default=35)
    rowHeight: 27, // (default=27)
    displayRowCount: 10, //(default=10)
    fitToParentHeight: true // (default=false)
    showDummyRows: false // (default=false)
    minimumColumnWidth: 50, //(default=50)
    scrollX: true, //(default:true)
    scrollY: true, //(default:true)
    keyColumnName: 'column1', //(default:null)
    toolbar: false,
    resizeHandle: true, //(default:false)
    pagination: true, //(default:null)
    columnModelList: [
        {
            title: 'normal title',
            columnName: 'column0',
            className: 'bg_red',
            width: 100,
            isEllipsis: false,
            notUseHtmlEntity: false,
            defaultValue: 'empty',
            isIgnore: false
        },
        {
            title: 'hidden column',
            columnName: 'column1',
            isHidden: true
        },
        {
            title: 'formatter example',
            columnName: 'column2',
            formatter: function(value, row) {
                return '<img src="' + value + '" />';
            }
        },
        {
            title: 'converter example',
            columnName: 'column3',
            editOption: {
                type: 'text',
                converter: function(value, row) {
                    if (row.rowKey % 2 === 0) {
                        return 'Plain text value : ' + value;
                    }
                }
            }
        },
        {
            title: 'normal text input column',
            columnName: 'column4',
            editOption: {
                type: 'text',
                beforeContent: 'price:',
                afterContent: '$'
            },
            // - param {Object}  changeEvent
            //      - param {(number|string)} changeEvent.rowKey - The rowKey of the target cell
            //      - param {(number|string)} changeEvent.columnName - The field(column) name of the target cell
            //      - param {*} changeEvent.value - The changed value of the target cell
            //      - param {Object} changeEvent.instance - The instance of the Grid
            // - returns {boolean}
            changeBeforeCallback: function(changeEvent) {
                if (!/[0-9]+/.test(changeEvent.value)) {
                    alert('Integer only.');
                    return false;
                }
            },
            // - param {Object}  changeEvent
            //      - param {(number|string)} changeEvent.rowKey - The rowKey of the target cell
            //      - param {(number|string)} changeEvent.columnName - The field(column) name of the target
            //      - param {*} changeEvent.value - The changed value of the target cell
            //      - param {Object} changeEvent.instance - - The instance of the Grid
            // - returns {boolean}
            //
            changeAfterCallback: function(changeEvent) {}
        },
        {
            title: 'password input column',
            columnName: 'column5',
            width: 100,
            isRequired: true,
            isFixedWidth: true,
            editOption: {
                type: 'password',
                beforeContent: 'password:'
            }
        },
        {
            title: 'text input when editing mode',
            columnName: 'column6',
            editOption: {
                type: 'text',
                useViewMode: fales
            },
            isIgnore: true
        },
        {
            title: 'select box',
            columnName: 'column7',
            editOption: {
                type: 'select',
                list: [
                    {text: '1', value: 1},
                    {text: '2', value: 2},
                    {text: '3', value: 3},
                    {text: '4', value: 4}
                ]
            },
            relationList: [
                {
                    columnList: ['column8', 'column9'],
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {boolean}
                    isDisabled: function(value, rowData) {
                        return value == 2;
                    },
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {boolean}
                    //
                    isEditable: function(value, rowData) {
                        return value != 3;
                    },
                    // - param {*} value - The changed value of the target cell
                    // - param {Object} rowData - The data of the row that contains the target cell
                    // - return {{text: string, value: number}[]}
                    optionListChange: function(value, rowData) {
                        if (value == 1) {
                            console.log('changev return');
                            return [
                                { text: 'option 1', value: 1},
                                { text: 'option 2', value: 2},
                                { text: 'option 3', value: 3},
                                { text: 'option 4', value: 4}
                            ];
                        }
                    }
                }
            ]
        },
        {
            title: 'checkbox',
            columnName: 'column8',
            editOption: {
                type: 'checkbox',
                list: [
                    {text: 'option 1', value: 1},
                    {text: 'option 2', value: 2},
                    {text: 'option 3', value: 3},
                    {text: 'option 4', value: 4}
                ]
            }
        },
        {
            title: 'radio button',
            columnName: 'column9',
            editOption: {
                type: 'radio',
                list: [
                    {text: 'option 1', value: 1},
                    {text: 'option 2', value: 2},
                    {text: 'option 3', value: 3},
                    {text: 'option 4', value: 4}
                ]
            }
        },
    ],
    columnMerge: [
        {
            'columnName' : 'mergeColumn1',
            'title' : '1 + 2',
            'columnNameList' : ['column1', 'column2']
        },
        {
            'columnName' : 'mergeColumn2',
            'title' : '1 + 2 + 3',
            'columnNameList' : ['mergeColumn1', 'column3']
        },
        {
            'columnName' : 'mergeColumn3',
            'title' : '1 + 2 + 3 + 4 + 5',
            'columnNameList' : ['mergeColumn2', 'column4', 'column5']
        }
    ],
    footer: {
        height: 100,
        columnContent: {
            c1: {
              template: function(summary) {
                return 'Total: ' + summary.sum + '<br> Average: ' + summary.avg;
              }
            },
            c2: {
              useAutoSummary: false,
              template: function() {
                return 'c2-footer';
              }
            }
        }
    }
});
     </script>
 *
 */
var _ = require('underscore');

var View = require('./base/view');
var ModelManager = require('./model/manager');
var ViewFactory = require('./view/factory');
var DomState = require('./domState');
var PublicEventEmitter = require('./publicEventEmitter');
var PainterManager = require('./painter/manager');
var PainterController = require('./painter/controller');
var NetAddOn = require('./addon/net');
var ComponentHolder = require('./componentHolder');
var util = require('./common/util');
var themeManager = require('./theme/manager');
var themeNameConst = require('./common/constMap').themeName;

var instanceMap = {};

require('../css/index.styl');

 /**
  * Toast UI Namespace
  * @namespace
  */
tui = window.tui = tui || {};

tui.Grid = View.extend(/**@lends tui.Grid.prototype */{
    /**
     * Initializes the instance.
     * @param {Object} options - Options set by user
     * @ignore
     */
    initialize: function(options) {
        var domState = new DomState(this.$el);

        options = util.enableDeprecatedOptions(options);
        this.id = util.getUniqueKey();
        this.modelManager = this._createModelManager(options, domState);
        this.painterManager = this._createPainterManager();
        this.componentHolder = this._createComponentHolder(options.pagination);
        this.viewFactory = this._createViewFactory(domState, options);
        this.container = this.viewFactory.createContainer();
        this.publicEventEmitter = this._createPublicEventEmitter();
        this.domState = domState;

        this.container.render();
        this.refreshLayout();

        if (!themeManager.isApplied()) {
            themeManager.apply(themeNameConst.DEFAULT);
        }

        this.addOn = {};
        instanceMap[this.id] = this;
    },

    /**
     * Creates core model and returns it.
     * @param {Object} options - Options set by user
     * @param {module:domState} domState - domState
     * @returns {module:model/manager} - New model manager object
     * @private
     */
    _createModelManager: function(options, domState) {
        var modelOptions = _.assign({}, options, {
            gridId: this.id
        });

        _.omit(modelOptions, 'el', 'singleClickEdit');

        return new ModelManager(modelOptions, domState);
    },

    /**
     * Creates painter manager and returns it
     * @returns {module:painter/manager}
     * @private
     */
    _createPainterManager: function() {
        var controller = new PainterController({
            focusModel: this.modelManager.focusModel,
            dataModel: this.modelManager.dataModel,
            columnModel: this.modelManager.columnModel,
            selectionModel: this.modelManager.selectionModel
        });

        return new PainterManager({
            gridId: this.id,
            selectType: this.modelManager.columnModel.get('selectType'),
            isFixedRowHeight: this.modelManager.dimensionModel.get('isFixedRowHeight'),
            controller: controller
        });
    },

    /**
     * Creates a view factory.
     * @param {module:domState} domState - dom state
     * @param {options} options - options
     * @returns {module:view/factory}
     * @private
     */
    _createViewFactory: function(domState, options) {
        var viewOptions = _.pick(options, [
            'singleClickEdit', 'resizeHandle', 'toolbar', 'copyOption', 'footer'
        ]);
        var dependencies = {
            modelManager: this.modelManager,
            painterManager: this.painterManager,
            componentHolder: this.componentHolder,
            domState: domState
        };

        return new ViewFactory(_.assign(dependencies, viewOptions));
    },

    /**
     * Creates a pagination component.
     * @param {Object} pgOptions - pagination options
     * @returns {module:component/pagination}
     * @private
     */
    _createComponentHolder: function(pgOptions) {
        return new ComponentHolder({
            pagination: pgOptions
        });
    },

    /**
     * Creates public event emitter and returns it.
     * @returns {module:publicEventEmitter} - New public event emitter
     * @private
     */
    _createPublicEventEmitter: function() {
        var emitter = new PublicEventEmitter(this);

        emitter.listenToFocusModel(this.modelManager.focusModel);
        emitter.listenToContainerView(this.container);

        return emitter;
    },

    /**
     * Disables all rows.
     * @api
     */
    disable: function() {
        this.modelManager.dataModel.setDisabled(true);
    },

    /**
     * Enables all rows.
     * @api
     */
    enable: function() {
        this.modelManager.dataModel.setDisabled(false);
    },

    /**
     * Disables the row identified by the rowkey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    disableRow: function(rowKey) {
        this.modelManager.dataModel.disableRow(rowKey);
    },

    /**
     * Enables the row identified by the rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row
     */
    enableRow: function(rowKey) {
        this.modelManager.dataModel.enableRow(rowKey);
    },

    /**
     * Returns the value of the cell identified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row.
     * @param {string} columnName - The name of the column
     * @param {boolean} [isOriginal] - It set to true, the original value will be return.
     * @returns {(number|string)} - The value of the cell
     */
    getValue: function(rowKey, columnName, isOriginal) {
        return this.modelManager.dataModel.getValue(rowKey, columnName, isOriginal);
    },

    /**
     * Returns a list of all values in the specified column.
     * @api
     * @param {string} columnName - The name of the column
     * @param {boolean} [isJsonString=false] - It set to true, return value will be converted to JSON string.
     * @returns {(Array|string)} - A List of all values in the specified column. (or JSON string of the list)
     */
    getColumnValues: function(columnName, isJsonString) {
        return this.modelManager.dataModel.getColumnValues(columnName, isJsonString);
    },

    /**
     * Returns the object that contains all values in the specified row.
     * @api
     * @param {(number|string)} rowKey - The unique key of the target row
     * @param {boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {(Object|string)} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRow: function(rowKey, isJsonString) {
        return this.modelManager.dataModel.getRowData(rowKey, isJsonString);
    },

    /**
     * Returns the object that contains all values in the row at specified index.
     * @api
     * @param {number} index - The index of the row
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Object|string} - The object that contains all values in the row. (or JSON string of the object)
     */
    getRowAt: function(index, isJsonString) {
        return this.modelManager.dataModel.getRowDataAt(index, isJsonString);
    },

    /**
     * Returns the total number of the rows.
     * @api
     * @returns {number} - The total number of the rows
     */
    getRowCount: function() {
        return this.modelManager.dataModel.length;
    },

    /**
     * Returns the rowKey of the currently selected row.
     * @api
     * @returns {(number|string)} - The rowKey of the row
     */
    getSelectedRowKey: function() {
        return this.modelManager.focusModel.which().rowKey;
    },

    /**
     * Returns the jquery object of the cell identified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {jQuery} - The jquery object of the cell element
     */
    getElement: function(rowKey, columnName) {
        return this.modelManager.dataModel.getElement(rowKey, columnName);
    },

    /**
     * Sets the value of the cell identified by the specified rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     */
    setValue: function(rowKey, columnName, columnValue) {
        this.modelManager.dataModel.setValue(rowKey, columnName, columnValue);
    },

    /**
     * Sets the all values in the specified column.
     * @api
     * @param {string} columnName - The name of the column
     * @param {(number|string)} columnValue - The value to be set
     * @param {Boolean} [isCheckCellState=true] - If set to true, only editable and not disabled cells will be affected.
     */
    setColumnValues: function(columnName, columnValue, isCheckCellState) {
        this.modelManager.dataModel.setColumnValues(columnName, columnValue, isCheckCellState);
    },

    /**
     * Replace all rows with the specified list. This will not change the original data.
     * @api
     * @param {Array} rowList - A list of new rows
     */
    replaceRowList: function(rowList) {
        this.modelManager.dataModel.replaceRowList(rowList);
    },

    /**
     * Replace all rows with the specified list. This will change the original data.
     * @api
     * @param {Array} rowList - A list of new rows
     * @param {function} callback - The function that will be called when done.
     */
    setRowList: function(rowList, callback) {
        this.modelManager.dataModel.setRowList(rowList, true, callback);
    },

    /**
     * Sets focus on the cell identified by the specified rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focus: function(rowKey, columnName, isScrollable) {
        this.modelManager.focusModel.focusClipboard();
        this.modelManager.focusModel.focus(rowKey, columnName, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column.
     * @api
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusAt: function(rowIndex, columnIndex, isScrollable) {
        this.modelManager.focusModel.focusAt(rowIndex, columnIndex, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.
     */
    focusIn: function(rowKey, columnName, isScrollable) {
        this.modelManager.focusModel.focusIn(rowKey, columnName, isScrollable);
    },

    /**
     * Sets focus on the cell at the specified index of row and column and starts to edit.
     * @api
     * @param {(number|string)} rowIndex - The index of the row
     * @param {string} columnIndex - The index of the column
     * @param {boolean} [isScrollable=false] - If set to true, the view will scroll to the cell element.     */
    focusInAt: function(rowIndex, columnIndex, isScrollable) {
        this.modelManager.focusModel.focusInAt(rowIndex, columnIndex, isScrollable);
    },

    /**
     * Makes view ready to get keyboard input.
     * @api
     */
    readyForKeyControl: function() {
        this.modelManager.focusModel.focusClipboard();
    },

    /**
     * Removes focus from the focused cell.
     * @api
     */
    blur: function() {
        this.modelManager.focusModel.blur();
    },

    /**
     * Checks all rows.
     * @api
     */
    checkAll: function() {
        this.modelManager.dataModel.checkAll();
    },

    /**
     * Checks the row identified by the specified rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    check: function(rowKey) {
        this.modelManager.dataModel.check(rowKey);
    },

    /**
     * Unchecks all rows.
     * @api
     */
    uncheckAll: function() {
        this.modelManager.dataModel.uncheckAll();
    },

    /**
     * Unchecks the row identified by the specified rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    uncheck: function(rowKey) {
        this.modelManager.dataModel.uncheck(rowKey);
    },

    /**
     * Removes all rows.
     * @api
     */
    clear: function() {
        this.modelManager.dataModel.setRowList([]);
    },

    /**
     * Removes the row identified by the specified rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {(boolean|object)} [options] - Options. If the type is boolean, this value is equivalent to
     *     options.removeOriginalData.
     * @param {boolean} [options.removeOriginalData] - If set to true, the original data will be removed.
     * @param {boolean} [options.keepRowSpanData] - If set to true, the value of the merged cells will not be
     *     removed although the target is first cell of them.
     */
    removeRow: function(rowKey, options) {
        if (tui.util.isBoolean(options) && options) {
            options = {
                removeOriginalData: true
            };
        }
        this.modelManager.dataModel.removeRow(rowKey, options);
    },

    /**
     * Removes all checked rows.
     * @api
     * @param {boolean} isConfirm - If set to true, confirm message will be shown before remove.
     * @returns {boolean} - True if there's at least one row removed.
     */
    removeCheckedRows: function(isConfirm) {
        var rowKeyList = this.getCheckedRowKeyList(),
            message = rowKeyList.length + '건의 데이터를 삭제하시겠습니까?';

        if (rowKeyList.length > 0 && (!isConfirm || confirm(message))) {
            _.each(rowKeyList, function(rowKey) {
                this.modelManager.dataModel.removeRow(rowKey);
            }, this);
            return true;
        }
        return false;
    },

    /**
     * Enables the row identified by the rowKey to be able to check.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    enableCheck: function(rowKey) {
        this.modelManager.dataModel.enableCheck(rowKey);
    },

    /**
     * Disables the row identified by the spcified rowKey to not be abled to check.
     * @api
     * @param {(number|string)} rowKey - The unique keyof the row.
     */
    disableCheck: function(rowKey) {
        this.modelManager.dataModel.disableCheck(rowKey);
    },

    /**
     * Returns a list of the rowKey of checked rows.
     * @api
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Array|string} - A list of the rowKey. (or JSON string of the list)
     */
    getCheckedRowKeyList: function(isJsonString) {
        var checkedRowList = this.modelManager.dataModel.getRowList(true);
        var checkedRowKeyList = _.pluck(checkedRowList, 'rowKey');

        return isJsonString ? JSON.stringify(checkedRowKeyList) : checkedRowKeyList;
    },

    /**
     * Returns a list of the checked rows.
     * @api
     * @param {Boolean} [isJsonString=false] - If set to true, return value will be converted to JSON string.
     * @returns {Array|string} - A list of the checked rows. (or JSON string of the list)
     */
    getCheckedRowList: function(isJsonString) {
        var checkedRowList = this.modelManager.dataModel.getRowList(true);

        return isJsonString ? JSON.stringify(checkedRowList) : checkedRowList;
    },

    /**
     * Returns a list of the column model.
     * @api
     * @returns {Array} - A list of the column model.
     */
    getColumnModelList: function() {
        return this.modelManager.columnModel.get('dataColumnModelList');
    },

    /**
     * Returns the object that contains the lists of changed data compared to the original data.
     * The object has properties 'createList', 'updateList', 'deleteList'.
     * @api
     * @param {Object} [options] Options
     *      @param {boolean} [options.isOnlyChecked=false] - If set to true, only checked rows will be considered.
     *      @param {boolean} [options.isRaw=false] - If set to true, the data will contains
     *          the row data for internal use.
     *      @param {boolean} [options.isOnlyRowKeyList=false] - If set to true, only keys of the changed
     *          rows will be returned.
     *      @param {Array} [options.filteringColumnList] - A list of column name to be excluded.
     * @returns {{createList: Array, updateList: Array, deleteList: Array}} - Object that contains the result list.
     */
    getModifiedRowList: function(options) {
        return this.modelManager.dataModel.getModifiedRowList(options);
    },

    /**
     * Insert the new row with specified data to the end of table.
     * @api
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {number} [options.at] - The index at which new row will be inserted
     * @param {boolean} [options.extendPrevRowSpan] - If set to true and the previous row at target index
     *        has a rowspan data, the new row will extend the existing rowspan data.
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    appendRow: function(row, options) {
        this.modelManager.dataModel.append(row, options);
    },

    /**
     * Insert the new row with specified data to the beginning of table.
     * @api
     * @param {object} [row] - The data for the new row
     * @param {object} [options] - Options
     * @param {boolean} [options.focus] - If set to true, move focus to the new row after appending
     */
    prependRow: function(row, options) {
        this.modelManager.dataModel.prepend(row, options);
    },

    /**
     * Returns true if there are at least one row changed.
     * @api
     * @returns {boolean} - True if there are at least one row changed.
     */
    isChanged: function() {
        return this.modelManager.dataModel.isChanged();
    },

    /**
     * Returns the instance of specified AddOn.
     * @api
     * @param {string} name - The name of the AddOn
     * @returns {instance} addOn - The instance of the AddOn
     */
    getAddOn: function(name) {
        return name ? this.addOn[name] : this.addOn;
    },

    /**
     * Restores the data to the original data.
     * (Original data is set by {@link tui.Grid#setRowList|setRowList}
     * @api
     */
    restore: function() {
        this.modelManager.dataModel.restore();
    },

    /**
     * Selects the row identified by the rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     */
    select: function(rowKey) {
        var firstColumn = this.modelManager.columnModel.at(0, true);

        this.modelManager.focusModel.focus(rowKey, firstColumn.columnName);
    },

    /**
     * Unselects selected rows.
     * @api
     */
    unselect: function() {
        this.modelManager.focusModel.unselect(true);
    },

    /**
     * Sets the count of fixed column.
     * @api
     * @param {number} count - The count of column to be fixed
     */
    setColumnFixCount: function(count) {
        this.modelManager.columnModel.set('columnFixCount', count);
    },

    /**
     * Sets the list of column model.
     * @api
     * @param {Array} columnModelList - A new list of column model
     */
    setColumnModelList: function(columnModelList) {
        this.modelManager.columnModel.set('columnModelList', columnModelList);
    },

    /**
     * Create an specified AddOn and use it on this instance.
     * @api
     * @param {string} name - The name of the AddOn to use.
     * @param {object} options - The option objects for configuring the AddON.
     * @returns {tui.Grid} - This instance.
     */
    use: function(name, options) {
        if (name === 'Net') {
            options = $.extend({
                toolbarModel: this.modelManager.toolbarModel,
                renderModel: this.modelManager.renderModel,
                dataModel: this.modelManager.dataModel,
                pagination: this.componentHolder.getInstance('pagination')
            }, options);
            this.addOn.Net = new NetAddOn(options);
            this.publicEventEmitter.listenToNetAddon(this.addOn.Net);
        }
        return this;
    },

    /**
     * Returns a list of all rows.
     * @api
     * @returns {Array} - A list of all rows
     */
    getRowList: function() {
        return this.modelManager.dataModel.getRowList();
    },

    /**
     * Sorts all rows by the specified column.
     * @api
     * @param {string} columnName - The name of the column to be used to compare the rows
     * @param {boolean} [isAscending] - Whether the sort order is ascending.
     *        If not specified, use the negative value of the current order.
     */
    sort: function(columnName, isAscending) {
        this.modelManager.dataModel.sortByField(columnName, isAscending);
    },

    /**
     * Unsorts all rows. (Sorts by rowKey).
     * @api
     */
    unSort: function() {
        this.sort('rowKey');
    },

    /**
     * Adds the specified css class to cell element identified by the rowKey and className
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to add
     */
    addCellClassName: function(rowKey, columnName, className) {
        this.modelManager.dataModel.get(rowKey).addCellClassName(columnName, className);
    },

    /**
     * Adds the specified css class to all cell elements in the row identified by the rowKey
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to add
     */
    addRowClassName: function(rowKey, className) {
        this.modelManager.dataModel.get(rowKey).addClassName(className);
    },

    /**
     * Removes the specified css class from the cell element indentified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @param {string} className - The css class name to be removed
     */
    removeCellClassName: function(rowKey, columnName, className) {
        this.modelManager.dataModel.get(rowKey).removeCellClassName(columnName, className);
    },

    /**
     * Removes the specified css class from all cell elements in the row identified by the rowKey.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} className - The css class name to be removed
     */
    removeRowClassName: function(rowKey, className) {
        this.modelManager.dataModel.get(rowKey).removeClassName(className);
    },

    /**
     * Returns the rowspan data of the cell identified by the rowKey and columnName.
     * @api
     * @param {(number|string)} rowKey - The unique key of the row
     * @param {string} columnName - The name of the column
     * @returns {Object} - Row span data
     */
    getRowSpanData: function(rowKey, columnName) {
        return this.modelManager.dataModel.getRowSpanData(rowKey, columnName);
    },

    /**
     * Returns the index of the row indentified by the rowKey.
     * @api
     * @param {number|string} rowKey - The unique key of the row
     * @returns {number} - The index of the row
     */
    getIndexOfRow: function(rowKey) {
        return this.modelManager.dataModel.indexOfRowKey(rowKey);
    },

    /**
     * Returns an instance of tui.component.Pagination.
     * @returns {tui.component.Pagination}
     */
    getPagination: function() {
        return this.componentHolder.getInstance('pagination');
    },

    /**
     * Sets the number of rows to be shown in the table area.
     * @api
     * @deprecated
     * @param {number} count - The number of rows
     */
    setDisplayRowCount: function(count) {
        this.modelManager.dimensionModel.setBodyHeightWithRowCount(count);
    },

    /**
     * Sets the width and height of the dimension.
     * @api
     * @param  {(number|null)} width - The width of the dimension
     * @param  {(number|null)} height - The height of the dimension
     */
    setSize: function(width, height) {
        this.modelManager.dimensionModel.setSize(width, height);
    },

    /**
     * Refresh the layout view. Use this method when the view was rendered while hidden.
     * @api
     */
    refreshLayout: function() {
        this.modelManager.dimensionModel.refreshLayout();
    },

    /**
     * Reset the width of each column by using initial setting of column models.
     * @api
     */
    resetColumnWidths: function() {
        this.modelManager.dimensionModel.resetColumnWidths();
    },

    /**
     * Show columns
     * @api
     * @param {...string} arguments - Column names to show
     */
    showColumn: function() {
        var args = tui.util.toArray(arguments);
        this.modelManager.columnModel.setHidden(args, false);
    },

    /**
     * Hide columns
     * @api
     * @param {...string} arguments - Column names to hide
     */
    hideColumn: function() {
        var args = tui.util.toArray(arguments);
        this.modelManager.columnModel.setHidden(args, true);
    },

    /**
     * Sets the HTML string of given column footer.
     * @param {string} columnName - column name
     * @param {string} contents - HTML string
     * @api
     */
    setFooterColumnContent: function(columnName, contents) {
        this.modelManager.columnModel.setFooterContent(columnName, contents);
    },

    /**
     * Validates all data and returns the result.
     * Return value is an array which contains only rows which have invalid cell data.
     * @returns {Array.<Object>} An array of error object
     * @api
     * @example
     // return value example
    [
        {
            rowKey: 1,
            errors: [
                {
                    columnName: 'c1',
                    errorCode: 'REQUIRED'
                },
                {
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }
            ]
        },
        {
            rowKey: 3,
            errors: [
                {
                    columnName: 'c2',
                    errorCode: 'REQUIRED'
                }
            ]
        }
    ]
     */
    validate: function() {
        return this.modelManager.dataModel.validate();
    },

    /**
     * Destroys the instance.
     * @api
     */
    destroy: function() {
        this.modelManager.destroy();
        this.container.destroy();
        this.modelManager = this.container = null;
    }
});

/**
 * Returns an instance of the grid associated to the id.
 * @api
 * @static
 * @param  {number} id - ID of the target grid
 * @returns {tui.Grid} - Grid instance
 */
tui.Grid.getInstanceById = function(id) {
    return instanceMap[id];
};

/**
 * Apply theme to all grid instances with the preset options of a given name.
 * @api
 * @static
 * @param {String} presetName - preset theme name. Available values are 'default', 'striped' and 'clean'.
 * @param {Object} [extOptions] - if exist, extend preset options with this object.
 *   @param {Object} [extOptions.grid] - Styles for the grid (container)
 *     @param {String} [extOptions.grid.background] - Background color of the grid.
 *     @param {number} [extOptions.grid.border] - Border color of the grid
 *     @param {number} [extOptions.grid.text] - Text color of the grid.
 *   @param {Object} [extOptions.selection] - Styles for a selection layer.
 *     @param {String} [extOptions.selection.background] - Background color of a selection layer.
 *     @param {String} [extOptions.selection.border] - Border color of a selection layer.
 *   @param {Object} [extOptions.toolbar] - Styles for a toolbar area.
 *     @param {String} [extOptions.toolbar.background] - Background color of a toolbar area.
 *     @param {String} [extOptions.toolbar.border] - Border color of a toolbar area.
 *   @param {Object} [extOptions.scrollbar] - Styles for scrollbars.
 *     @param {String} [extOptions.scrollbar.background] - Background color of scrollbars.
 *     @param {String} [extOptions.scrollbar.thumb] - Color of thumbs in scrollbars.
 *     @param {String} [extOptions.scrollbar.active] - Color of arrows(for IE) or
 *          thumb:hover(for other browsers) in scrollbars.
 *   @param {Object} [extOptions.cell] - Styles for the table cells.
 *     @param {Object} [extOptions.cell.normal] - Styles for normal cells.
 *       @param {String} [extOptions.cell.normal.background] - Background color of normal cells.
 *       @param {String} [extOptions.cell.normal.border] - Border color of normal cells.
 *       @param {String} [extOptions.cell.normal.text] - Text color of normal cells.
 *       @param {Boolean} [extOptions.cell.normal.showVerticalBorder] - Whether vertical borders of
 *           normal cells are visible.
 *       @param {Boolean} [extOptions.cell.normal.showHorizontalBorder] - Whether horizontal borders of
 *           normal cells are visible.
 *     @param {Object} [extOptions.cell.head] - Styles for the head cells.
 *       @param {String} [extOptions.cell.head.background] - Background color of head cells.
 *       @param {String} [extOptions.cell.head.border] - border color of head cells.
 *       @param {String} [extOptions.cell.head.text] - text color of head cells.
 *       @param {Boolean} [extOptions.cell.head.showVerticalBorder] - Whether vertical borders of
 *           head cells are visible.
 *       @param {Boolean} [extOptions.cell.head.showHorizontalBorder] - Whether horizontal borders of
 *           head cells are visible.
 *     @param {Object} [extOptions.cell.selectedHead] - Styles for selected head cells.
 *       @param {String} [extOptions.cell.selectedHead.background] - background color of selected haed cells.
 *       @param {String} [extOptions.cell.selectedHead.text] - text color of selected head cells.
 *     @param {Object} [extOptions.cell.focused] - Styles for a focused cell.
 *       @param {String} [extOptions.cell.focused.background] - background color of a focused cell.
 *       @param {String} [extOptions.cell.focused.border] - border color of a focused cell.
 *     @param {Object} [extOptions.cell.required] - Styles for required cells.
 *       @param {String} [extOptions.cell.required.background] - background color of required cells.
 *       @param {String} [extOptions.cell.required.text] - text color of required cells.
 *     @param {Object} [extOptions.cell.editable] - Styles for editable cells.
 *       @param {String} [extOptions.cell.editable.background] - background color of the editable cells.
 *       @param {String} [extOptions.cell.editable.text] - text color of the selected editable cells.
 *     @param {Object} [extOptions.cell.disabled] - Styles for disabled cells.
 *       @param {String} [extOptions.cell.disabled.background] - background color of disabled cells.
 *       @param {String} [extOptions.cell.disabled.text] - text color of disabled cells.
 *     @param {Object} [extOptions.cell.invalid] - Styles for invalid cells.
 *       @param {String} [extOptions.cell.invalid.background] - background color of invalid cells.
 *       @param {String} [extOptions.cell.invalid.text] - text color of invalid cells.
 *     @param {Object} [extOptions.cell.currentRow] - Styles for cells in a current row.
 *       @param {String} [extOptions.cell.currentRow.background] - background color of cells in a current row.
 *       @param {String} [extOptions.cell.currentRow.text] - text color of cells in a current row.
 *     @param {Object} [extOptions.cell.evenRow] - Styles for cells in even rows.
 *       @param {String} [extOptions.cell.evenRow.background] - background color of cells in even rows.
 *       @param {String} [extOptions.cell.evenRow.text] - text color of cells in even rows.
 *     @param {Object} [extOptions.cell.dummy] - Styles for dummy cells.
 *       @param {String} [extOptions.cell.dummy.background] - background color of dummy cells.
 * @example
tui.Grid.applyTheme('striped', {
    grid: {
        border: '#aaa',
        text: '#333'
    },
    cell: {
        disabled: {
            text: '#999'
        }
    }
});
 */
tui.Grid.applyTheme = function(presetName, extOptions) {
    themeManager.apply(presetName, extOptions);
};
