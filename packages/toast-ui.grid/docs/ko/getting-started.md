# 시작하기 🚀

## 설치하기

TOAST UI 제품들은 패키지 매니저를 이용하거나, 직접 소스코드를 다운받아 사용할 수 있다. 하지만 패키지 매니저 사용을 권장한다.

### Package Manager 이용

각 패키지 매니저가 제공하는 CLI 도구를 사용하면 쉽게 패키지를 설치할 수 있다. `npm` 사용을 위해선 [Node.js](https://nodejs.org/en/%29)를 미리 설치해야 한다.

### npm

```sh
$ npm install --save tui-grid # Latest version
```

### Contents Delivery Network(CDN)

TOAST UI 제품들은 [NHN Cloud](https://www.toast.com/kr)를 통해 CDN을 제공하고 있다. 아래의 코드로 CDN을 이용할 수 있다.

```html
<link rel="stylesheet" href="https://uicdn.toast.com/grid/latest/tui-grid.css" />
...
<script src="https://uicdn.toast.com/grid/latest/tui-grid.js"></script>
```

특정 버전을 사용할 때는 `latest` 대신 버전에 해당하는 태그 네임을 URL에 사용한다.

CDN은 아래의 디렉토리 구조로 구성되어 있다.

```
grid/
├─ latest/
│  ├─ tui-grid.css
│  ├─ tui-grid.min.css
│  ├─ tui-grid.js
│  └─ tui-grid.min.js
├─ v4.21.0/
│  ├─ ...
```

## Grid 생성하기

### HTML

TOAST UI Grid가 생성될 컨테이너 엘리먼트를 만든다.

```html
<div id="grid"></div>
```

### JavaScript

생성자 함수를 이용해 Grid 인스턴스를 생성한다. Grid의 생성자 함수를 사용하기 전에 각 환경에 맞게 Grid 모듈을 불러올 수 있다.

#### 브라우저 환경에서 네임스페이스 이용

```js
var Grid = tui.Grid;
```

#### Node 환경의 모듈 포맷 이용

```js
var Grid = require('tui-grid'); /* CommonJS */
```

```js
import Grid from 'tui-grid'; /* ES6 */
```
    
여러 가지 옵션으로 인스턴스를 만들 수 있고 만든 후에는 다양한 API를 사용할 수 있다.
    
```js
import Grid from 'tui-grid';

const grid = new Grid({
  el: document.getElementById('wrapper'), // 컨테이너 엘리먼트
  columns: [ 
    // ...,
  ],
  // ...,
});
```

Grid 생성자는 옵션 객체를 인자로 받는데 `el` 과 `columns` 옵션은 필수로 입력되어야 한다. `el` 은 그리드가 생성될 컨테이너 HTML 엘리먼트이며, `columns`는 데이터의 이름, 헤더, 에디터 등의 컬럼 정보 배열이다. 컨테이너 엘리먼트는 Grid 내부에서 자동으로 생성해주지 않기 때문에 인스턴스를 생성하기 전에 미리 만들어 줘야 한다.

그외 다른 옵션들은 선택 사항이다. 사용할 수 있는 옵션들에 대한 자세한 정보는 [API 문서](https://nhn.github.io/tui.grid/latest/)를 확인한다.


## 컬럼 모델 정의하기

Grid에 데이터를 추가하기 전에 데이터의 스키마에 해당하는 컬럼 모델을 정의해야 한다. 컬럼 모델은 `setColumns()` 메서드를 이용해 정의한다.

```js
grid.setColumns([
  {
    header: 'ID',
    name: 'id'
  },
  {
    header: 'CITY',
    name: 'city',
    editor: 'text'
  },
  {
    header: 'COUNTRY',
    name: 'country'
  }
]);
```

`setColumns()` 는 컬럼들을 정의한 배열을 인자로 받는다. `name` 은 필수 속성으로 로우 데이터의 키로 사용된다. `header` 속성으로 전달된 문자열은 컬럼 헤더에서 사용된다. `header` 속성은 선택 사항이지만, 생략한 경우 컬럼 헤더가 비어있기 때문에 적절한 값을 사용하는 것을 권장한다.

`editor` 속성은 컬럼의 인풋 타입을 결정한다. 예를 들어 `text` 타입은 `input[type=text]` 엘리먼트를 사용해 셀의 값을 설정한다. 이 밖에도 `select`, `checkbox` 을 `editor.type` 으로 사용할 수 있다. `editor.options`에 사용할 수 있는 여러 옵션들은 [커스텀 에디터 인터페이스 문서](./custom-editor.md)에서 확인할 수 있다.

`setColumns()` 메서드를 이용하지 않고 Grid 인스턴스를 만들면서 `columns` 옵션을 전달할 수 있다.

```js
const grid = new Grid({
  el: document.getElementById('wrapper'),
  columns: [
    {
      header: 'ID',
      name: 'id'
    },
    // ...,
  ],
  // ...,
});
```

## 데이터 입력하기

컬럼 모델을 정의했다면 비로소 Grid에 데이터를 입력할 수 있다. 두 가지 방법이 있는데 인스턴스 생성 시 `data` 옵션을 사용하는 방법과 `resetData()` 메서드를 이용하는 방법이다.

```js
const data = [
  {
    id: '10012',
    city: 'Seoul',
    country: 'South Korea'
  },
  {
    id: '10013',
    city: 'Tokyo',
    country: 'Japan'    
  },
  {
    id: '10014',
    city: 'London',
    country: 'England'
  },
  {
    id: '10015',
    city: 'Ljubljana',
    country: 'Slovenia'
  },
  {
    id: '10016',
    city: 'Reykjavik',
    country: 'Iceland'
  }
];

// case 1 : 인스턴스 생성시 data 옵션으로 데이터 입력
const grid = new Grid({
  el: document.getElementById('wrapper'),
  data,
  ...
});

// case 2 : resetData() 메서드로 입력
grid.resetData(data);
```

로우 데이터의 배열을 `data` 옵션이나 `resetData()` 의 인자로 전달한다. 데이터는 일반 객체다. 이전 컬럼 모델 예제에서 `name` 으로 정의했던 속성들을 데이터 객체에서 확인할 수 있다.

데이터가 입력된 후 화면에서 입력된 데이터들의 테이블을 확인할 수 있다.

![그리드](https://user-images.githubusercontent.com/35371660/59482121-72993480-8ea2-11e9-8dba-46c04c727b31.png)


## 예제

Grid의 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example01-basic)서 확인할 수 있다.
