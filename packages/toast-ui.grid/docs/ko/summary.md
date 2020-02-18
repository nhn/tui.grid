# 써머리(Summary) ✍️

TOAST UI Grid는 각 컬럼을 요약하는 **써머리(summary)** 기능을 제공한다. 또한 그 목적에 맞는 유용한 옵션들도 제공한다.

## 써머리 옵션

써머리 기능을 사용하기 위해 `tui.Grid` 인스턴스 생성 옵션에 `summary` 속성을 추가한다.

```javascript
import Grid from 'tui-grid';

const grid = new Grid({
  el: document.getElementById('grid'),
  columns: [/* … */],
  summary: {
    position: 'bottom',
    height: 100,  // by pixel
    columnContent: {
      col1: {
        template() {
          return 'col1 footer';
        }
      },
      col2: {
        template() {
          return 'col2 footer';
        }
      }
    },
    defaultContent: {
      template() {
        return 'default footer';
      }
    }
  }
});
```

`summary.position` 속성은 써머리 영역의 위치를 결정한다. 기본값은 `'bottom'`이다. 해당 속성을 `'top'`으로 설정한 경우, 써머리 영역은 헤더 아래에 위치한다.

`summary.height` 속성은 써머리 영역의 높이를 픽셀 단위로 지정한다. 해당 속성을 `0`으로 설정한 경우, 써머리 영역은 보이지 않는다.

`summary.columnContent` 속성은 객체로, 각 컬럼의 내용을 설정한다. 키는 컬럼의 이름, 값은 `template` 함수를 포함하는 객체이다. `template` 함수는 HTML 문자열을 반환하며, 이 문자열은 각 컬럼(`<th>` 태그)을 렌더링할 때 사용된다.

`summary.defaultContent` 속성은 객체로, `summary.columnContent` 속성이 설정된 컬럼을 제외한 모든 컬럼의 내용을 설정한다. `template` 속성은 `summary.columnContent`의 `template` 기능과 동일하다.

## 자동 써머리 사용하기

특정 컬럼을 위한 객체를 `columnContent` 속성에 지정한 경우, Grid는 자동으로 컬럼의 써머리 값을 계산한다. 다시 말해 컬럼 안의 값이 바뀔 때마다 Grid는 써머리 값을 새로 계산한다. 계산된 써머리 값이 `template` 함수의 인자로 넘겨지기 때문에 이 값을 이용하여 원하는 형태의 써머리 HTML 문자열을 생성할 수 있다. `defaultContent` 속성의 `template` 함수의 경우에도 동일하게 동작한다.

```javascript
const grid = new Grid({
  // ...,
  summary: {
    columnContent: {
      col1: {
        template(summary) {
          return 'sum: ' + summary.sum + '<br>avg: ' + summary.avg;
        }
      },
      col2: {
        template(summary) {
          return 'max: ' + summary.max + '<br>min: ' + summary.min;
        }
      }
    },
    defaultContent: {
      template(summary) {
        return 'default: ' + summary.sum;
      }
    }
  }
})
```

위의 예제처럼 `template` 함수는 `summary` 객체를 인자로 받는다. `summary` 객체에는 `sum`, `avg`와 같은 값이 포함되어있다. 사용 가능한 타입은 다음과 같다.

- `sum`: 합계
- `avg`: 평균값
- `min`: 최솟값
- `max`: 최댓값
- `cnt`: 로우의 개수

써머리 값이 바뀔 때마다 `template` 함수가 호출되고, 써머리 컬럼의 내용이 `template` 함수의 결과인 HTML 문자열로 수정된다.

한 가지 중요한 점은 컬럼의 모든 값이 `Number` 타입이어야 한다. Grid는 숫자 타입이 아닌 값을 `0`으로 취급한다.


## 자동 써머리 비활성화

`columnContent`와 `defaultContent`의 값 객체에서 사용할 수 있는 다른 속성인 `useAutoSummary`는 자동 써머리 여부를 결정한다. 기본값은 `true`이다. 만약 자동 써머리를 하지 않으면서 `template` 함수를 사용하고 싶다면 아래의 예제처럼 `useAutoSummary`를 `false`로 설정한다.

```javascript
const grid = new Grid({
  // ...,
  summary: {
    columnContent: {
      col1: {
        useAutoSummary: false,
        template(summary) {
          return 'max: ' + summary.max + '<br>min: ' + summary.min;;
        }
      }
      // …
    },
    defaultContent: {
      useAutoSummary: false,
      template(summary) {
        return 'default: ' + summary.sum;
      }
    }
  }
});
```

각 컬럼의 `columnContent` 또는 `defaultContent`에 HTML 문자열을 속성 값으로 지정하면 Grid는 내부적으로 `useAutoSummary: false`를 설정하여 불필요한 계산을 하지 않는다.

```javascript
const grid = new Grid({
  // ...,
  summary: {
    columnContent: {
      col1: 'col1 content'
    },
    defaultContent: 'static content'
  }
});
```

## setSummaryColumnContent()

Grid 인스턴스는 써머리의 컬럼 내용을 바꿀 수 있는 API를 제공한다. `setSummaryColumnContent()`는 주어진 컬럼의 써머리에 HTML 문자열 또는 `template` 함수를 설정한다.

```javascript
grid.setSummaryColumnContent('col1', 'content');

// 또는 template 함수를 설정하고 싶다면 아래처럼 사용한다.
grid.setSummaryColumnContent('col1', {
  template(summary) {
    return 'sum: ' + summary.sum + '<br>avg: ' + summary.avg;
  }
});
```

이 메서드는 동적으로 써머리 컬럼의 값을 설정하고 싶을 때 유용하게 쓰인다.

## 예제

자동 써머리를 사용하는 Grid 예제는 [여기](https://nhn.github.io/tui.grid/latest/tutorial-example09-summary)서 확인할 수 있다.