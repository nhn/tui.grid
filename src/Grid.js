/**
 * @fileoverview 기본 클래스 파일
 * @author soonyoung.park@nhnent@nhnent.com (Soonyoung Park)
 */
    /**
     * ne
     * @namespace
     */
    ne = window.ne = ne || {};
    /**
     * Grid public API
     *
     * @param {Object} options
     *      @param {number} [options.columnFixIndex=0] 열고정 기능을 사용하기 위한 인덱스 값으로 고정시킬 컬럼들의 다음 컬럼 인덱스 번호를 설정한다.
     *      setColumnFixIndex()메서드를 사용해서 동적으로 열고정 위치를 변경할 수도 있다.
     *      @param {string} [options.selectType=''] 그리드의 각 행 앞에 선택을 위한 체크박스 및 라디오박스를 추가한다.
     *      값을 지정하지 않은 경우 UI적인 변화는 없으며 라디오박스인 경우처럼 단일 선택만 가능하다.
     *      @param {boolean} [options.autoNumbering=true] 데이터를 출력 시에 행마다 순번을 자동으로 부여하여 표시한다.
     *      @param {number} [options.headerHeight=35] 그리드 헤더 영역의 기본 높이. 헤더 영역에서 컬럼 병합 기능을 사용하여 여러 개의 행을 출력하는 경우, 전체 행의 높이를 지정해야 한다.
     *      @param {number} [options.rowHeight=27] 그리드에 표시되는 행들의 기본 높이를 지정하는 값.
     *      각 컬럼에 보여줘야 할 내용이 많을 경우 rowHeight값을 크게 지정하여야 모든 내용을 표시할 수 있다.
     *      @param {number} [options.displayRowCount=10] 그리드에 표시될 행의 개수를 지정하며, 이 값에 따라 그리드의 높이가 자동으로 계산된다
     *      @param {number} [options.minimumColumnWidth=50] 컬럼들의 최소 넓이 값. 컬럼들이 렌더링되거나 리사이징 시에 최소값으로 적용된다.
     *      @param {boolean} [options.useClientSort] 정렬시 서버데이터를 사용하지 않고 클라이언트가 직접 정렬할지 여부
     *      @param {boolean} [options.scrollX=true] 수평 스크롤바 사용 여부.
     *      @param {boolean} [options.scrollY=true] 수직 스크롤바 사용 여부.
     *      @param {string} [options.keyColumnName=null] 각각의 데이터를 구분지을 수 있는 키 값의 필드명(=privateKey).
     *      존재하지 않을 시 내부적으로 키를 생성하여 할당한다.
     *      @param {object} [options.toolbar]       툴바영역의 UI 컴포넌트 사용 여부 설정
     *          @param {boolean} [options.toolbar.hasResizeHandler=true]    수직 resizeHandler 를 사용한다.
     *          @param {boolean} [options.toolbar.hasControlPanel=true]     컨트롤 패널을 사용한다.
     *          @param {boolean} [options.toolbar.hasPagination=true]       pagination 을 사용한다.
     *      @param {array} options.columnModelList
     *          @param {string} options.columnModelList.columnName 컬럼의 데이터 필드명
     *          @param {boolean} [options.columnModelList.isEllipsis=false] 컬럼의 말줄임 여부를 설정
     *          @param {string} [options.columnModelList.align=left] 컬럼에 설정할 정렬값
     *          @param {string} [options.columnModelList.className] 컬럼 전체에 적용할 디자인 클래스 이름
     *          @param {string} [options.columnModelList.title] 그리드 헤더 영역에 보여질 컬럼 이름
     *          @param {number} [options.columnModelList.width] 컬럼 너비 값. pixel 로 지정한다.
     *          @param {boolean} [options.columnModelList.isHidden ] 설정된 데이터 중에 화면 상에 표시하지 않을 컬럼에 대해서 true로 설정을 한다.
     *          @param {String} [options.columnModelList.defaultValue] 컬럼에 값이 없는 경우 화면에 보여질 기본 텍스트.
     *          @param {function} [options.columnModelList.formatter] 데이터를 화면에 표시할 때 값의 포맷팅 처리를 하기 위한 함수로, 값을 출력하기 전에 formatter 함수에 해당 컬럼의 값을 전달하고 해당 함수가 리턴한 값을 화면 상에 표시한다.
     *          @param {boolean} [options.columnModelList.notUseHtmlEntity=false] 그리드 랜더링 시 원본 데이터를 HTML Entity 로 변환하지 않도록 하려면 옵션을 true 로 준다.
     *          @param {boolean} [options.columnModelList.isIgnore=false] 그리드에서 값 변경으로 간주하지 않을 column 인지 여부를 결정한다.
     *          @param {boolean} [options.columnModelLIst.isSortable=false] true이면 컬럼헤더에 정렬버튼을 표시하고, 클릭시 해당 컬럼을 기준으로 정렬되도록 한다.
     *          @param {Array} [options.columnModelList.editOption] 수정 UI 및 기능에 대한 좀 더 세분화된 설정을 할 수 있도록 지원한다.
     *              @param {string} [options.columnModelList.editOption.type='normal'] 컬럼의 데이터를 사용자가 직접 수정할 수 있는 UI를 제공하며, "text", "text-convertible", "select", "radio", "checkbox" 등을 지정할 수 있다.
     *              @param {Array} [options.columnModelList.editOption.list] select, checkbox, radio 와 같이 list 형태일 경우 [{text: '노출 text', value: '1'}] 과 같은 형태로 설정한다.
     *              @param {function} [options.columnModelList.editOption.changeBeforeCallback] 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경되기 전에 호출될 콜백함수를 지정한다. false 반환시 변경을 취소한다.
     *              @param {function} [options.columnModelList.editOption.changeAfterCallback] 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경된 후 호출될 콜백함수를 지정한다.
     *              @param {string} [options.columnModelList.editOption.beforeText] 인풋 엘리먼트가 표시될 때 인풋 엘리먼트 앞에 추가하여 보여줄 텍스트를 지정한다.
     *              @param {string} [options.columnModelList.editOption.afterText] 인풋 엘리먼트가 표시될 때 인풋 엘리먼트 뒤에 추가하여 보여줄 텍스트를 지정한다.
     *          @param {Array} [options.columnModelList.relationList] 현재 컬럼의 값 변화에 따라 다른 컬럼의 상태를 변경할 수 있다.
     *              @param {array} [options.columnModelList.relationList.columnList]    상태값을 변경할 타켓 컬럼 리스트.
     *              @param {function} [options.columnModelList.relationList.isDisabled] 타켓 컬럼을 disabled 로 변경할지 여부를 반환한다.
     *              @param {function} [options.columnModelList.relationList.isEditable] 타켓 컬럼을 편집 가능한 컬럼으로 지정할지 여부를 반환한다.
     *              @param {function} [options.columnModelList.relationList.optionListChange] 타겟 컬럼이 select, checkbox, radio 와 같이 list 형태일 경우 list 를 변경한다.
     *      @param {array} options.columnMerge
     * @constructor ne.Grid
     * @example
         <div id='grid'></div>
         <script>
     var grid = new ne.Grid({
        el: $('#grid'),
        columnFixIndex: 2,  //(default=0) 열고정 기능을 사용하기 위한 인덱스 값으로 고정시킬 컬럼들의 다음 컬럼 인덱스 번호를 설정한다.
        selectType: 'checkbox', //(default='') 그리드의 각 행 앞에 선택을 위한 체크박스 및 라디오박스를 추가한다. 'checkbox' 또는 'radio' 로 설정한다. 값을 지정하지 않은 경우 UI적인 변화는 없으며 라디오박스인 경우처럼 단일 선택만 가능하다.
        autoNumbering: true, //(default=true) 데이터를 출력 시에 행마다 순번을 자동으로 부여하여 표시한다. 값을 지정하지 않은 경우 UI적인 변화는 없다.
        headerHeight: 100, //(default=35) 그리드 헤더 영역의 기본 높이. 헤더 영역에서 컬럼 병합 기능을 사용하여 여러 개의 행을 출력하는 경우, 전체 행의 높이를 지정해야 한다.
        rowHeight: 27, // (default=27) 그리드에 표시되는 행들의 기본 높이를 지정하는 값. 각 컬럼에 보여줘야 할 내용이 많을 경우 rowHeight 값을 크게 지정하여야 모든 내용을 표시할 수 있다.
        displayRowCount: 10, //(default=10) 그리드에 표시될 행의 개수를 지정하며, 이 값에 따라 그리드의 높이가 자동으로 계산된다.
        minimumColumnWidth: 50, //(default=50) 컬럼들의 최소 넓이 값. 컬럼들이 렌더링되거나 리사이징 시에 최소값으로 적용된다.
        minimumWidth: 50, //(default=50) 컬럼들의 최소 넓이 값. 컬럼들이 렌더링되거나 리사이징 시에 최소값으로 적용된다.
        scrollX: true, //(default:true) 수평 스크롤바 사용 여부.
        scrollY: true, //(default:true) 수직 스크롤바 사용 여부.
        keyColumnName: 'column1', //(default:null) 각 행의 primaryKey 가 될 컬럼 필드명. 지정하지 않을 시 내부적으로 키를 생성하여 할당한다.
        toolbar: {  //툴바영역의 UI 컴포넌트 사용 여부 설정
            hasResizeHandler: true, //(default:true) 수직 resizeHandler 를 사용한다.
            hasControlPanel: true,  //(default:true) 컨트롤 패널을 사용한다.
            hasPagination: true     //(default:true) pagination 을 사용한다.
        },
        columnModelList: [
            {
                title: '일반 타이틀',         //그리드 헤더 영역에 보여질 컬럼 이름
                columnName: 'column0',      //컬럼의 데이터 필드명
                className: 'bg_red',        //컬럼 전체에 적용할 디자인 클래스 이름
                width: 100,                 //컬럼 너비 값. pixel 로 지정한다.
                isEllipsis: false,          //(default:false) 컬럼의 말줄임 여부를 설정
                notUseHtmlEntity: false,    //(default:false) 그리드 랜더링 시 원본 데이터를 HTML Entity 로 변환하지 않도록 하려면 옵션을 true 로 준다.
                defaultValue: '빈값',        //컬럼에 값이 없는 경우 화면에 보여질 기본 텍스트.
                isIgnore: false             //(default:false) 그리드에서 값 변경으로 간주하지 않을 column 인지 여부

            },
            {
                title: '노출되지 않음',
                columnName: 'column1',
                isHidden: true              //설정된 데이터 중에 화면 상에 표시하지 않을 컬럼에 대해서 true로 설정을 한다.
            },
            {
                title: 'formatter 설정',
                columnName: 'column2',
                formatter: function(value, row) {       //데이터를 화면에 표시할 때 값의 포맷팅 처리를 하기 위한 함수로, 값을 출력하기 전에 formatter 함수에 해당 컬럼의 값을 전달하고 해당 함수가 리턴한 값을 화면 상에 표시한다.
                    return '<img src="' + value + '" />';
                }
            },
            {
                title: '일반 text input 컬럼',
                columnName: 'column3',
                editOption: {
                    type: 'text',
                    beforeText: '가격:',  //인풋 엘리먼트가 표시될 때 인풋 엘리먼트 앞에 추가하여 보여줄 텍스트를 지정한다.
                    afterText: '원'  //인풋 엘리먼트가 표시될 때 인풋 엘리먼트 뒤에 추가하여 보여줄 텍스트를 지정한다.
                },
                //
                // 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경되기 전에 호출될 콜백함수를 지정한다. false 반환시 변경을 취소한다.
                // change beforeCallback 에서 정수가 입력되지 않았을 경우 이전값으로 되돌린다.
                // - param {object}  changeEvent
                //      - param {(number|string)}  changeEvent.rowKey    이벤트가 발생한 셀의 rowKey
                //      - param {(number|string)}  changeEvent.columnName 이벤트가 발생한 셀의 columnName
                //      - param {*}  changeEvent.value 이벤트가 발생한 셀의 변경된 값
                //      - param {object}  changeEvent.instance grid 인스턴스
                // - returns {boolean}
                //
                changeBeforeCallback: function(changeEvent) {
                    if (!/[0-9]+/.test(changeEvent.value)) {
                        alert('정수만 입력할 수 있습니다.');
                        return false;
                    }
                },
                //
                // 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경된 후 호출될 콜백함수를 지정한다.
                // - param {object}  changeEvent
                //      - param {(number|string)}  changeEvent.rowKey    이벤트가 발생한 셀의 rowKey
                //      - param {(number|string)}  changeEvent.columnName 이벤트가 발생한 셀의 columnName
                //      - param {*}  changeEvent.value 이벤트가 발생한 셀의 변경된 값
                //      - param {object}  changeEvent.instance grid 인스턴스
                // - returns {boolean}
                //
                changeAfterCallback: function(changeEvent) {}
            },
            {
                title: 'password text input 컬럼',
                columnName: 'column4',
                editOption: {
                    type: 'text-password',
                    beforeText: '비밀번호:'  //인풋 엘리먼트가 표시될 때 인풋 엘리먼트 앞에 추가하여 보여줄 텍스트를 지정한다.
                }
            },
            {
                title: 'text 에서 편집시 text input 으로 변경되는 컬럼',
                columnName: 'column5',
                editOption: {
                    type: 'text-convertible'
                },
                isIgnore: true
            },
            {
                title: '셀렉트박스',
                columnName: 'column6',
                editOption: {
                    type: 'select',
                    list: [                     //select, checkbox, radio 와 같이 list 형태일 경우 [{text: '노출 text', value: '1'}] 과 같은 형태로 설정한다.
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                },
                relationList: [
                    {
                        columnList: ['column7', 'column8'],     //상태값을 변경할 타켓 컬럼 리스트.
                        //
                        // 타켓 컬럼을 disabled 로 변경할지 여부를 반환한다.
                        // - param {*} value 이벤트가 발생한 cell의 변경된 값
                        // - param {object} rowData 이벤트가 발생한 cell 의 rowData
                        // - return {boolean} columnList 에 해당하는 column 이 disabled 될지 여부.
                        //
                        isDisabled: function(value, rowData) {
                            return value == 2;
                        },
                        //
                        // 타켓 컬럼을 편집 가능한 컬럼으로 지정할지 여부를 반환한다.
                        // - param {*} value 이벤트가 발생한 cell의 변경된 값
                        // - param {object} rowData 이벤트가 발생한 cell 의 rowData
                        // - return {boolean} columnList 에 해당하는 column 이 편집 가능한 상태일지 여부.
                        //
                        isEditable: function(value, rowData) {
                            return value != 3;
                        },
                        //
                        // 타겟 컬럼이 select, checkbox, radio 와 같이 list 형태일 경우 설정된 list 를 변경한다.
                        // - param {*} value 이벤트가 발생한 cell의 변경된 값
                        // - param {object} rowData 이벤트가 발생한 cell 의 rowData
                        // - return {{text: string, value: number}[]} columnList 에 해당하는 column 의 editOption.list 를 대신할 콜렉션.
                        //
                        optionListChange: function(value, rowData) {
                            if (value == 1) {
                                console.log('changev return');
                                return [
                                    { text: '하나', value: 1},
                                    { text: '둘', value: 2},
                                    { text: '셋', value: 3},
                                    { text: '넷', value: 4}
                                ];
                            }
                        }
                    }
                ]
            },
            {
                title: '체크박스',
                columnName: 'column7',
                editOption: {
                    type: 'checkbox',
                    list: [
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                }
            },
            {
                title: '라디오 버튼',
                columnName: 'column8',
                editOption: {
                    type: 'radio',
                    list: [
                        {text: '1', value: 1},
                        {text: '2', value: 2},
                        {text: '3', value: 3},
                        {text: '4', value: 4}
                    ]
                }
            }
        ],
        //table header 의 열 병합 정보
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
        ]
    });

         </script>
     *
     */
    ne.Grid = View.Base.extend(/**@lends ne.Grid.prototype */{
        /**
         * 초기화 함수
         * @param {Object} options 생성자의 옵션 정보와 동일.
         */
        initialize: function(options) {
            //grid 에서 public instance 를 참조할 수 있도록 자신의 참조 추가
            options.publicInstance = this;
            this.core = new Core(options);
            this.listenTo(this.core, 'all', this._relayEvent, this);
        },
        /**
         * Grid 에서 발생하는 event 를 외부로 relay 한다.
         * @private
         */
        _relayEvent: function() {
            this.trigger.apply(this, arguments);
        },
        /**
         * rowKey에 해당하는 행을 비활성화 시킨다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        disableRow: function(rowKey) {
            this.core.disableRow(rowKey);
        },
        /**
         * rowKey에 해당하는 행을 활성화시킨다.
         * @param {(Number|String)} rowKey  행 데이터의 고유 키
         */
        enableRow: function(rowKey) {
            this.core.enableRow(rowKey);
        },
        /**
         * rowKey 와 columnName 에 해당하는 값을 반환한다.
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isOriginal]  원본 데이터 리턴 여부
         * @return {(Number|String)}    조회한 셀의 값.
         */
        getValue: function(rowKey, columnName, isOriginal) {
            return this.core.getValue(rowKey, columnName, isOriginal);
        },
        /**
         * columnName에 해당하는 column data list를 리턴한다.
         *
         * @param {String} columnName   컬럼명
         * @param {boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Array} 컬럼명에 해당하는 셀들의 데이터 리스트
         */
        getColumnValues: function(columnName, isJsonString) {
            return this.core.getColumnValues(columnName, isJsonString);
        },
        /**
         * rowKey에 해당하는 행의 데이터를 리턴한다. isJsonString을 true로 설정하면 결과를 json객체로 변환하여 리턴한다.
         * @param {(Number|String)} rowKey  행 데이터의 고유 키
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object} 행 데이터
         */
        getRow: function(rowKey, isJsonString) {
            return this.core.getRow(rowKey, isJsonString);
        },
        /**
         * 그리드 전체 데이터 중에서 index에 해당하는 순서의 데이터 객체를 리턴한다.
         * @param {Number} index 행의 인덱스
         * @param {Boolean} [isJsonString=false]  true 일 경우 JSON String 으로 반환한다.
         * @return {Object} 행 데이터
         */
        getRowAt: function(index, isJsonString) {
            return this.core.getRowAt(index, isJsonString);
        },
        /**
         * 현재 그리드에 설정된 전체 데이터의 개수를 리턴한다.
         * @return {Number} 데이터 개수
         */
        getRowCount: function() {
            return this.core.getRowCount();
        },
        /**
         * 그리드 내에서 현재 선택된 row의 키값을 리턴한다.
         * @return {(Number|String)} 행 데이터의 고유 키
         */
        getSelectedRowKey: function() {
            return this.core.focusModel.which().rowKey;
        },
        /**
         * rowKey 와 columnName 에 해당하는 element 를 반환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @return {jQuery} 해당 jQuery Element
         */
        getElement: function(rowKey, columnName) {
            return this.core.getElement(rowKey, columnName);
        },
        /**
         *
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {(Number|String)} columnValue 할당될 값
         */
        setValue: function(rowKey, columnName, columnValue) {
            this.core.setValue(rowKey, columnName, columnValue);
        },
        /**
         * columnName 에 해당하는 값을 전부 변경한다.
         * @param {String} columnName 컬럼명
         * @param {(Number|String)} columnValue 변경할 컬럼 값
         * @param {Boolean} [isCheckCellState=true] 셀의 편집 가능 여부 와 disabled 상태를 체크할지 여부
         */
        setColumnValues: function(columnName, columnValue, isCheckCellState) {
            this.core.setColumnValues(columnName, columnValue, isCheckCellState);
        },
        /**
         * rowList 를 설정한다. setRowList 와 다르게 setOriginalRowList 를 호출하여 원본데이터를 갱신하지 않는다.
         * @param {Array} rowList 설정할 데이터 배열 값
         */
        replaceRowList: function(rowList) {
            this.core.replaceRowList(rowList);
        },
        /**
         * rowList 를 설정하고, setOriginalRowList 를 호출하여 원본데이터를 갱신한다.
         * @param {Array} rowList 설정할 데이터 배열 값
         */
        setRowList: function(rowList) {
            this.core.setRowList(rowList);
        },
        /**
         * rowKey, columnName에 해당하는 셀에 포커싱한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focus: function(rowKey, columnName, isScrollable) {
            this.core.focus(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱한다.
         * @param {(Number|String)} rowIndex 행 index
         * @param {String} columnIndex 열 index
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusAt: function(rowIndex, columnIndex, isScrollable) {
            this.core.focusAt(rowIndex, columnIndex, isScrollable);
        },
        /**
         * 셀을 편집모드로 전환한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {String} columnName   컬럼 이름
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusIn: function(rowKey, columnName, isScrollable) {
            this.core.focusIn(rowKey, columnName, isScrollable);
        },
        /**
         * rowIndex, columnIndex 에 해당하는 컬럼에 포커싱 후 편진모드로 전환 한다.
         * @param {(Number|String)} rowIndex 행 index
         * @param {String} columnIndex 열 index
         * @param {boolean} [isScrollable=false] 그리드에서 해당 영역으로 scroll 할지 여부
         */
        focusInAt: function(rowIndex, columnIndex, isScrollable) {
            this.core.focusInAt(rowIndex, columnIndex, isScrollable);
        },
        /**
         * 현재 포커스 된 컬럼이 있을 경우 포커스 상태를 해제한다
         */
        blur: function() {
            this.core.blur();
        },
        /**
         * 전체 행을 선택한다.
         */
        checkAll: function() {
            this.core.checkAll();
        },
        /**
         * rowKey에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        check: function(rowKey) {
            this.core.check(rowKey);
        },
        /**
         * 모든 행을 선택 해제 한다.
         */
        uncheckAll: function() {
            this.core.uncheckAll();
        },
        /**
         * rowKey 에 해당하는 행의 체크박스 및 라디오박스를 선택한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         */
        uncheck: function(rowKey) {
            this.core.uncheck(rowKey);
        },
        /**
         * 그리드의 모든 데이터를 삭제하고 norowlayer 클래스명을 가지는 엘리먼트를 보여준다.
         */
        clear: function() {
            this.core.clear();
        },
        /**
         * rowKey에 해당하는 그리드 데이터를 삭제한다.
         * @param {(Number|String)} rowKey    행 데이터의 고유 키
         * @param {Boolean} [isRemoveOriginalDta=false] 원본 데이터도 함께 삭제 할지 여부
         */
        removeRow: function(rowKey, isRemoveOriginalDta) {
            this.core.removeRow(rowKey, isRemoveOriginalDta);
        },
        /**
         * checked된 행을 삭제한다.
         * @param {Boolean} isConfirm 삭제하기 전에 confirm 메시지를 표시할지 여부
         * @return {Boolean} 삭제된 행이 있으면 true, 없으면 false
         */
        removeCheckedRows: function(isConfirm) {
            return this.core.removeCheckedRows(isConfirm);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크할 수 있도록 활성화 시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        enableCheck: function(rowKey) {
            this.core.enableCheck(rowKey);
        },
        /**
         * rowKey에 해당하는 행의 메인 체크박스를 체크하지 못하도록 비활성화 시킨다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        disableCheck: function(rowKey) {
            this.core.disableCheck(rowKey);
        },
        /**
         * 현재 선택된 행들의 키값만을 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String} 선택된 행들의 키값 리스트.
         */
        getCheckedRowKeyList: function(isJsonString) {
            var checkedRowKeyList = this.core.getCheckedRowKeyList();
            return isJsonString ? $.toJSON(checkedRowKeyList) : checkedRowKeyList;
        },
        /**
         * 현재 선택된 행들의 모든 데이터를 배열로 리턴한다.
         * @param {Boolean} [isJsonString=false]  true 일 경우 json 문자열을 리턴한다.
         * @return {Array|String} 선택된 행들의 데이터값 리스트.
         */
        getCheckedRowList: function(isJsonString) {
            var checkedRowList = this.core.getCheckedRowList();
            return isJsonString ? $.toJSON(checkedRowList) : checkedRowList;
        },
        /**
         * 그리드에 설정된 컬럼모델 정보를 배열 형태로 리턴한다.
         * @return {Array}  컬럼모델 리스트
         */
        getColumnModelList: function() {
            return this.core.getColumnModelList();
        },
        /**
         * 그리드 내에서 변경된 데이터들의 목록을 구성하여 리턴한다.
         * 리턴되는 객체에는 createList, updateList, deleteList 라는 필드가 있고,
         * 각 필드에는 변경된 데이터들이 배열로 구성되어 있다.
         * @param {Object} [options]
         *      @param {boolean} [options.isOnlyChecked=false] true 로 설정된 경우 checked 된 데이터 대상으로 비교 후 반환한다.
         *      @param {boolean} [options.isRaw=false] true 로 설정된 경우 내부 연산용 데이터 제거 필터링을 거치지 않는다.
         *      @param {boolean} [options.isOnlyRowKeyList=false] true 로 설정된 경우 키값만 저장하여 리턴한다.
         *      @param {Array} [options.filteringColumnList]   행 데이터 중에서 데이터 변경으로 간주하지 않을 컬럼 이름을 배열로 설정한다.
         * @return {{createList: Array, updateList: Array, deleteList: Array}} 옵션에 따라 반환된 수정된 데이터 목록
         */
        getModifiedRowList: function(options) {
            return this.core.getModifiedRowList(options);
        },
        /**
         * 현재 그리드의 제일 끝에 행을 추가한다.
         * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
         */
        appendRow: function(row) {
            this.core.appendRow(row);
        },
        /**
         * 현재 그리드의 제일 앞에 행을 추가한다.
         * @param {object} [row]  row 데이터 오브젝트 없을경우 임의로 빈 데이터를 추가한다.
         */
        prependRow: function(row) {
            this.core.prependRow(row);
        },
        /**
         * 현재 그리드에 설정된 데이터의 변경 여부를 Boolean으로 리턴한다.
         * - getModifiedRowList() 함수의 결과값을 이용하여 입력/수정/삭제가 되었으면 true를 리턴하고 그렇지 않은 경우에는 false를 리턴한다.
         * @return {Boolean}    데이터가 변경되었는지 여부
         */
        isChanged: function() {
            return this.core.isChanged();
        },
        /**
         * AddOn 인스턴스를 반환한다.
         * @param {String} name AddOn의 이름
         * @return {instance} addOn 인스턴스
         */
        getAddOn: function(name) {
            return name ? this.core.addOn[name] : this.core.addOn;
        },

        /**
         * setRowList()를 통해 그리드에 설정된 초기 데이터 상태로 복원한다.
         * 그리드에서 수정되었던 내용을 초기화하는 용도로 사용한다.
         */
        restore: function() {
            this.core.restore();
        },
        /**
         * rowKey에 해당하는 행에 대해 선택한다.
         * - checkRow()는 행에 포함된 체크박스나 라디오박스를 선택하며, selectRow()는 클릭된 행이 선택되어졌음을 시각적으로 나타내기 위해 해당 행의 배경색을 변경한다.
         *
         * @param {(Number|String)} rowKey 행 데이터의 고유 키
         */
        select: function(rowKey) {
            this.core.select(rowKey);
        },
        /**
         * 선택되었던 행에 대한 선택을 해제한다.
         */
        unselect: function() {
            this.core.unselect();
        },
        /**
         * 열 고정 위치를 변경한다.
         * @param {Number} index 고정시킬 열의 인덱스
         */
        setColumnFixIndex: function(index) {
            this.core.setColumnFixIndex(index);
        },
        /**
         * columnModelList 를 재설정한다..
         * @param {Array} columnModelList 컬럼모델 리스트
         */
        setColumnModelList: function(columnModelList) {
            this.core.setColumnModelList(columnModelList);
        },
        /**
         * addon 을 활성화한다.
         * @param {string} name addon 이름
         * @param {object} options addon 에 넘길 파라미터
         * @return {ne.Grid}
         */
        use: function(name, options) {
            this.core.use(name, options);
            return this;
        },
        /**
         * 현재 그리드의 rowList 를 반환한다.
         * @return {Array} 그리드의 데이터 리스트
         */
        getRowList: function() {
            return this.core.getRowList();
        },
        /**
         * 인자로 들어온 columnName 기준으로 정렬 한다.
         * @param {String} columnName 정렬할 컬럼이름
         */
        sort: function(columnName) {
            this.core.sort(columnName);
        },
        /**
         * sort 를 해제한다.
         */
        unSort: function() {
            this.core.sort('rowKey');
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        addCellClassName: function(rowKey, columnName, className) {
            this.core.addCellClassName(rowKey, columnName, className);
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 설정한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        addRowClassName: function(rowKey, className) {
            this.core.addRowClassName(rowKey, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         * @param {String} className 지정할 디자인 클래스명
         */
        removeCellClassName: function(rowKey, columnName, className) {
            this.core.removeCellClassName(rowKey, className);
        },
        /**
         * rowKey 에 해당하는 행 전체에 CSS className 을 제거한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} className 지정할 디자인 클래스명
         */
        removeRowClassName: function(rowKey, className) {
            this.core.removeRowClassName(rowKey, className);
        },
        /**
         * rowKey 와 columnName 에 해당하는 Cell 의 rowSpanData 를 반환한다.
         * @param {(Number|String)} rowKey 행 데이터의 고유 rowKey
         * @param {String} columnName 컬럼 이름
         */
        getRowSpanData: function(rowKey, columnName) {
            this.core.getRowSpanData(rowKey, columnName);
        },
        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @param {String} columnName
         * @param {(String|Number)} columnValue
         */
        filterData: function(columnName, columnValue) {
            //@todo:
        },
        /**
         * 데이터 필터링 기능 함수. 전체 그리드 데이터의 columnName에 해당하는 데이터와 columnValue를 비교하여 필터링 한 결과를 그리드에 출력한다
         * @todo 기능 구현
         * @param {String} columnName 컬럼 이름
         * @param {(String|Number)} columnValue 컬럼 이름
         */
        filterData: function(columnName, columnValue) {
        },
        /**
         * 그리드를 편집할 수 있도록 막았던 포커스를 풀고 딤드를 제거한다.
         * @todo 기능 구현
         */
        enable: function() {
        },
        /**
         * 그리드를 편집할 수 없도록 입력 엘리먼트들의 포커스를 막고, 옵션에 따라 딤드 처리한다.
         * @todo 기능 구현
         * @param {Boolean} [hasDimmedLayer=true]
         */
        disable: function(hasDimmedLayer) {
        },
        /**
         * 그리드의 layout 데이터를 갱신한다.
         * 그리드가 숨겨진 상태에서 초기화 되었을 경우 사옹한다.
         * @todo 기능 구현
         * @param {Boolean} [hasDimmedLayer=true]
         */
        refreshLayout: function() {
        },
        /**
         * 그리드의 크기 정보를 변경한다.
         * @todo 기능 구현
         * @param {object} size
         */
        setGridSize: function(size) {
            // this.core.setGridSize(size);
        },
        /**
         * 스크롤 핸들러의 위치를 변경한다.
         * @todo 기능 구현
         * @param {object} size
         */
        setScrollHandlerPosition: function() {},

        /**
         * 소멸자.
         */
        destroy: function() {
            this.core.destroy();
            this.core = null;
        }
    });

    ne.Grid.getInstanceById = function(id) {
        return Core.prototype.__instance[id];
    };
