# 넓이, 높이 설정 📐

TOAST UI Grid에서는 다양한 옵션을 사용해 넓이와 높이를 설정할 수 있다. 각 옵션 사용에 따라 Grid가 어떻게 변화하는지 살펴보자.

## 넓이 설정

넓이 설정 시 사용되는 옵션은 다음과 같다.

* 개별 컬럼 설정

| 옵션명 | 타입 | 기본값 |
| --- | --- | --- |
| `columns[].width` | `number` |
| `columns[].minWidth` | `number` | `50` |

* 전체 컬럼 설정

| 옵션명 | 타입 | 기본값 |
| --- | --- | --- |
| `columnsOptions.minWidth` | `number` | `50` |

Grid 각 컬럼의 넓이는 최초 브라우저의 뷰포트 또는 부모 엘리먼트의 크기에 의해 결정된다. 전체 넓이에서 Y축 스크롤 넓이값(`18px`)을 제외하고 컬럼 수만큼 넓이가 균등 분배된다. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name'
    },
    {
      name: 'artist'
    },
    {
      name: 'type'
    }
  ]
});
```

![01-width-default](https://user-images.githubusercontent.com/18183560/61211930-cc0fb000-a73b-11e9-9676-8acc2c6a2273.png)

예를 들어 Grid가 생성되는 컨테이너 엘리먼트의 넓이가 `300px`로 설정된 경우, 다음과 같이 각 컬럼 넓이가 `100px`보다 작은 값으로 설정된다.

```html
<div id="grid" style="width: 300px;"></div>
```

![02-width-fixed](https://user-images.githubusercontent.com/18183560/61211931-cc0fb000-a73b-11e9-89a7-970eaf15c713.png)

### 개별 컬럼 설정

`columns[].width` 옵션을 사용하면 컬럼별로 다르게 넓이를 설정할 수 있다. 넓이가 지정되지 않은 컬럼은 Grid의 전체 넓이에서 넓이가 설정된 컬럼의 총 넓이를 뺀 나머지 값으로 균등 분배된다.

```html
<div id="grid" style="width: 500px;"></div>
```
```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      width: 50
    },
    {
      name: 'artist',
      width: 50
    },
    {
      name: 'type'
    },
    {
      name: 'release'
    }
  ]
});
```
![03-width-columns-width](https://user-images.githubusercontent.com/18183560/61211932-cca84680-a73b-11e9-80a6-a8a821acdca4.png)

이 때 `columns[].width` 옵션의 최소값은 `50px`이나 더 작은 값을 설정하려는 경우에는 `columns[].minWidth` 옵션을 사용한다.

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      width: 30
      minWidth: 30
    },
    {
      name: 'artist',
      width: 50
    },
    {
      name: 'type'
    },
    {
      name: 'release'
    }
  ]
});
```

![04-width-columns-minWidth](https://user-images.githubusercontent.com/18183560/61211933-cca84680-a73b-11e9-944f-d82b9c8232ff.png)

### 컬럼 너비 자동 조정

컬럼의 너비를 셀들의 콘텐츠 길이에 따라 자동으로 확장 또는 축소하고 싶은 경우. `columns[].width` 옵션에 `auto` 값을 지정한다. 셀 값을 수정하거나 로우를 추가, 삭제하는 경우 자동으로 너비가 조정된다.

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      width: 'auto'
    },
    {
      name: 'artist',
      width: 50
    },
    {
      name: 'type'
    },
    {
      name: 'release'
    }
  ]
});
```

![images](https://user-images.githubusercontent.com/37766175/90466840-ad08fc00-e14d-11ea-8231-615c441deb6d.gif)
만약 축소되는 최소 너비를 지정하고 싶다면 `columns[].width` 옵션을 함께 사용하면 된다.

```js
const grid = new Grid({
  // ...,
  columns: [
    {
      name: 'name',
      width: 'auto',
      minWidth: 200,
    },
    {
      name: 'artist',
      width: 50
    },
    {
      name: 'type'
    },
    {
      name: 'release'
    }
  ]
});
```

> **참조**
> 컬럼 너비 자동 조정 기능은 `v4.15.0` 이상부터 사용할 수 있는 기능이다. 또한 데이터가 많은 경우 성능에 영향이 있을 수 있으니, 대량 데이터에 대해 이 옵션을 활성화하는 것은 권장하지 않는다.

### 전체 컬럼 설정

`columnOptions.minWidth` 옵션을 사용하여 전체 컬럼의 넓이를 공통으로 조정할 수 있다. `columnOptions.minWidth` 옵션의 기본값은 `50px`이며 이보다 큰 값을 설정하면 전체 컬럼의 넓이가 해당 값으로 고정된다.

```html
<div id="grid" style="width: 500px;"></div>
```
```js
const grid = new Grid({
  // ...,
  columnOptions: {
    minWidth: 180
  },
  columns: [
    {
      name: 'name'
    },
    {
      name: 'artist'
    },
    {
      name: 'type'
    }
  ]
});
```
![05-width-columnOptions-minWidth](https://user-images.githubusercontent.com/18183560/61211934-cca84680-a73b-11e9-99a7-c61a1b813f6c.png)


## 높이 설정

높이 설정 시 사용되는 옵션은 다음과 같다.

* 행 높이 설정

| 옵션명 | 타입 | 기본값 |
| --- | --- | --- | 
| `rowHeight` | `number \| 'auto'` | `40` |
| `minRowHeight` | `number` | `40` |

* 뷰포트 영역 높이 설정

| 옵션명 | 타입 | 기본값 |
| --- | --- | --- | 
| `bodyHeight` |  `number \| 'auto' \| 'fitToParent'` | `'auto'` |
| `minBodyHeight` | `number` | `130` |

* 헤더 영역 높이 설정

| 옵션명 | 타입 | 기본값 |
| --- | --- | --- |
| `header.height` |  `number` | `40` |

* 써머리 영역 높이 설정

| 옵션명 | 타입 |
| --- | --- | 
| `summary.height` |  `number` |


### 행 높이 설정

Grid 뷰포트 영역에 그려지는 각 행 높이는 `rowHeight` 옵션으로 설정한다. `rowHeight` 옵션을 설정하지 않으면 Grid 내부에서는 `'auto'`로 기본값이 설정된다. 기본값으로 설정되거나 명시적으로 `'auto'` 값을 설정해주면 셀 컨텐츠의 상태에 따라 다음과 같이 변경된다.

```js
const grid = new Grid({
  // ...,
  rowHeight: 'auto'
});
```

실제 행이 그려질 때 DOM 높이는 Grid 내부에 설정된 기본 행 높이값과 비교되며, DOM 높이가 더 큰 경우에는 DOM 높이에 맞게 각 행 높이가 설정된다. 그렇지 않은 경우에는 기본 행 높이값(`40px`)으로 설정된다. 아래 이미지에서 첫 번째 행이 기본 행 높이값으로 설정되었고 나머지는 DOM에 맞게 높이가 재설정된 상태를 보여준다.

![06-height-rowHeight-default](https://user-images.githubusercontent.com/18183560/61211935-cca84680-a73b-11e9-8ee7-5fcc548c0695.png)

`rowHeight` 값을 `'auto'`가 아닌 숫자값으로 설정하면 픽셀(`px`) 단위로 행 높이가 고정된다.

```js
const grid = new Grid({
  // ...,
  rowHeight: 40
});
```

![07-height-rowHeight-fixed](https://user-images.githubusercontent.com/18183560/61211936-cd40dd00-a73b-11e9-82e8-7b599acaf7c1.png)


앞서 설명한 Grid 내부에 설정된 기본 행 높이는 `minRowHeight` 옵션값에 영향을 받는다. `minRowHeight` 옵션의 기본값은 `40`으로, `rowHeight: 'auto'`로 옵션이 설정되었을 때 행 높이는 `40px`이 된다. `minRowHeight` 값을 이용해  `rowHeight`의 높이를 조절할 수 있다. `minRowHeight` 값이 `40px`보다 큰 경우에는 다음과 같이 행 높이가 적용된다. 

```js
const grid = new Grid({
  // ...,
  minRowHeight: 70
});
```

![08-height-rowHeight-number](https://user-images.githubusercontent.com/18183560/61211937-cd40dd00-a73b-11e9-8a6d-87ac170bc270.png)

`rowHeight`의 높이를 고정하면서 기본 행 높이보다 작은 값으로 설정하려는 경우에는 다음과 같이 `minRowHeight` 옵션을 사용하면 된다. 단, `rowHeight`의 최소값은 `9`이다.

```js
const grid = new Grid({
  // ...,
  rowHeight: 20,
  minRowHeight: 10
});
```

![09-height-minRowHeight](https://user-images.githubusercontent.com/18183560/61211938-cdd97380-a73b-11e9-93c2-f1df4c1dc197.png)

### 뷰포트 영역 높이 설정

Grid는 테이블 형태로 구성되어 있는데, 행이 그려지는 바디(body) 영역을 뷰포트라고 부른다. 이 뷰포트 영역의 높이는 `bodyHeight` 옵션을 사용해 설정한다. 기본값은 `'auto'`로, 전체 행 높이만큼 뷰포트 영역이 그려지고 높이가 설정된다. `bodyHeight` 옵션이 설정되지 않을 경우, `'auto'`로 동작한다.

```js
const grid = new Grid({
  // ...,
  bodyHeight: 'auto'
});
```

![10-height-bodyHeight-default](https://user-images.githubusercontent.com/18183560/61211939-cdd97380-a73b-11e9-97aa-26448628e774.png)


`bodyHeight` 옵션을 숫자값으로 설정하면 Grid 뷰포트 영역 높이가 고정된다. 이 때 고정 높이에 X축 스크롤 높이값(`17px`)이 포함되며, 고정 높이보다 전체 행 높이가 더 큰 경우 뷰포트에 Y축 스크롤이 생성된다.

```js
const grid = new Grid({
  // ...,
  bodyHeight: 300
});
```

![11-height-bodyHeight-fixed](https://user-images.githubusercontent.com/18183560/61211941-cdd97380-a73b-11e9-9016-c379c209df88.png)
![12-height-bodyHeight-fixed-element](https://user-images.githubusercontent.com/18183560/61211942-cdd97380-a73b-11e9-887d-ad39c584bc30.png)

`bodyHeight` 옵션을 `'fitToParent'`로 설정할 수도 있는데, 이 경우 기존 스펙과 다르게 동작한다. Grid가 생성되는 컨테이너 엘리먼트 또는 그 상위의 엘리먼트에 설정된 높이값에 따라 뷰포트 영역이 그려진다.

```js
const grid = new Grid({
  // ...,
  bodyHeight: 'fitToParent'
});
```
```html
<div style="height: 300px;">
  <div id="grid"></div>
</div>
```

![13-height-bodyHeight-fitToParent](https://user-images.githubusercontent.com/18183560/61211943-ce720a00-a73b-11e9-8ae0-79050315e4a1.png)

뷰포트 최소 높이는 `130px`로, 더 작은 값을 설정하려는 경우에는 `minBodyHeight` 옵션을 사용한다. `minBodyHeight` 옵션의 기본값은 `minRowHeight`와 같다.

```js
const grid = new Grid({
  // ...,
  bodyHeight: 50,
  minBodyHeight: 50
});
```

![14-height-minBodyHeight](https://user-images.githubusercontent.com/18183560/61211945-ce720a00-a73b-11e9-9c4e-0fea528f9da7.png)
![15-height-minBodyHeight-resize](https://user-images.githubusercontent.com/18183560/61211946-ce720a00-a73b-11e9-987e-c68d8b873142.png)

### 헤더 영역 높이 설정

헤더 영역의 높이는 `header.height` 옵션을 사용하여 설정한다. 헤더 영역의 기본 높이값은 `40px`이며, 복합 컬럼 옵션 사용 시 `height` 값에 설정된 값에 따라 복합 컬럼의 각 행 높이가 균등 분할된다.

```js
const grid = new Grid({
  // ...,
  header: {
    height: 160
  }
});
```

![16-height-header](https://user-images.githubusercontent.com/18183560/61211947-ce720a00-a73b-11e9-8662-b8729d8b4122.png)

### 써머리 영역 높이 설정

써머리 영역의 높이는 `summary.height` 옵션을 사용하여 설정한다. 써머리 영역의 기본 높이값은 정해져있지 않으나, `summary.height` 옵션을 설정하지 않을 경우 높이가 `0`이 된다.

```js
const grid = new Grid({
  // ...,
  summary: {
    height: 60
  }
});
```

![17-height-summary](https://user-images.githubusercontent.com/18183560/61211949-cf0aa080-a73b-11e9-9c2b-46a8cd2e7c3c.png)

## 예제

넓이, 높이 설정 예제는 [여기](http://nhn.github.io/tui.grid/latest/tutorial-example22-setting-width-height)서 확인해 볼 수 있다.