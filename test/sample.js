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
            /**
             * 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경되기 전에 호출될 콜백함수를 지정한다. false 반환시 변경을 취소한다.
             * change beforeCallback 에서 정수가 입력되지 않았을 경우 이전값으로 되돌린다.
             * @param {object}  changeEvent
             *      @param {(number|string)}  changeEvent.rowKey    이벤트가 발생한 셀의 rowKey
             *      @param {(number|string)}  changeEvent.columnName 이벤트가 발생한 셀의 columnName
             *      @param {*}  changeEvent.value 이벤트가 발생한 셀의 변경된 값
             *      @param {object}  changeEvent.instance grid 인스턴스
             * @returns {boolean}
             */
            changeBeforeCallback: function(changeEvent) {
                if (!/[0-9]+/.test(changeEvent.value)) {
                    alert('정수만 입력할 수 있습니다.');
                    return false;
                }
            },
            /**
             * 인풋 엘리먼트가 그리드에 표시된 경우 해당 엘리먼트의 값이 변경된 후 호출될 콜백함수를 지정한다.
             * @param {object}  changeEvent
             *      @param {(number|string)}  changeEvent.rowKey    이벤트가 발생한 셀의 rowKey
             *      @param {(number|string)}  changeEvent.columnName 이벤트가 발생한 셀의 columnName
             *      @param {*}  changeEvent.value 이벤트가 발생한 셀의 변경된 값
             *      @param {object}  changeEvent.instance grid 인스턴스
             * @returns {boolean}
             */
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
                    /**
                     * 타켓 컬럼을 disabled 로 변경할지 여부를 반환한다.
                     * @param {*} value 이벤트가 발생한 cell의 변경된 값
                     * @param {object} rowData 이벤트가 발생한 cell 의 rowData
                     * @return {boolean} columnList 에 해당하는 column 이 disabled 될지 여부.
                     */
                    isDisabled: function(value, rowData) {
                        return value == 2;
                    },
                    /**
                     * 타켓 컬럼을 편집 가능한 컬럼으로 지정할지 여부를 반환한다.
                     * @param {*} value 이벤트가 발생한 cell의 변경된 값
                     * @param {object} rowData 이벤트가 발생한 cell 의 rowData
                     * @return {boolean} columnList 에 해당하는 column 이 편집 가능한 상태일지 여부.
                     */
                    isEditable: function(value, rowData) {
                        return value != 3;
                    },
                    /**
                     * 타겟 컬럼이 select, checkbox, radio 와 같이 list 형태일 경우 설정된 list 를 변경한다.
                     * @param {*} value 이벤트가 발생한 cell의 변경된 값
                     * @param {object} rowData 이벤트가 발생한 cell 의 rowData
                     * @return {{text: string, value: number}[]} columnList 에 해당하는 column 의 editOption.list 를 대신할 콜렉션.
                     */
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