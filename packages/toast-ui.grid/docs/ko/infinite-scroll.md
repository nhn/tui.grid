# 무한 스크롤 📜

TOAST UI Grid는 스크롤이 최하단 위치에 도달하면 다음 데이터를 가져올 수 있도록 무한 스크롤 기능을 제공한다. 클라이언트 무한 스크롤, [데이터 소스](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/ko/data-source.md)와의 연동, `scrollEnd` 커스텀 이벤트를 이용한 구현 세 가지 방식으로 사용할 수 있다. 한 가지 중요한 점은 무한 스크롤을 사용하기 위해 반드시 적합한 `bodyHeight` 값을 설정하여 그리드 내부에 스크롤이 생기도록 해야한다. 무한 스크롤 기능은 `v4.10.0` 이상부터 사용할 수 있다.

## 클라이언트 무한 스크롤

클라이언트 무한 스크롤 기능을 사용하면 백엔드와의 연동없이 Grid내의 데이터를 자동으로 나누어 스크롤이 최하단 위치에 도달할 때 데이터를 추가해준다. 클라이언트 무한 스크롤 기능을 사용하기 위해 반드시 `pageOptions.useClient` 옵션을 `true`로 `pageOptions.type` 옵션을 `scroll`로 설정해야 한다. 또한 `pageOptions.perPage` 옵션 설정을 통해 무한 스크롤 시 추가될 데이터의 개수를 정의할 수 있다. 설정 방법은 아래 예제와 같다.

```js
const grid = new Grid({
  // ...,
  bodyHeight: 300,
  pageOptions: {
    useClient: true,
    type: 'scroll',
    perPage: 50
  }
});
```

## 데이터 소스 연동

일반적으로 무한 스크롤 기능과 함께 벡엔드와의 통신을 통해 원격 데이터를 사용하는 경우가 많다. 이런 경우, TOAST UI Grid의 [데이터 소스](https://github.com/nhn/tui.grid/blob/master/packages/toast-ui.grid/docs/ko/data-source.md)와 무한 스크롤 기능을 연동하여 사용할 수 있다. 옵션은 아래처럼 간단하게 설정할 수 있다.

```js
const grid = new Grid({
  // ...,
  data: {
    api: {
      readData: { url: '/api/readData', method: 'GET' }
    }
  },
  bodyHeight: 300,
  pageOptions: {
    type: 'scroll', 
    perPage: 50 
  }
});
```

### 정렬
데이터 소스와 연동한 무한 스크롤 기능과 정렬 기능을 함께 사용하고 싶은 경우, 페이지네이션을 사용할 때와는 다르게 `useClientSort` 옵션을 `false`로 설정할 필요가 없다. 무한 스크롤 시 데이터를 정렬한다면, 전체 데이터가 아닌 보이는 데이터를 기준으로 정렬해야 하므로 서버와의 연동이 필요없기 때문이다.

```js
const grid = new Grid({
  // ...,
  data: {
    api: {
      readData: { url: '/api/readData', method: 'GET' }
    }
  },
  bodyHeight: 300,
  pageOptions: {
    type: 'scroll', 
    perPage: 50 
  },
  // 아래 옵션은 설정할 필요가 없다.
  // useClientSort: false
});
```

## `scrollEnd` 커스텀 이벤트를 이용한 구현

클라이언트 무한 스크롤과 데이터 소스의 연동을 사용하기 어려운 경우, `scrollEnd` 커스텀 이벤트와 [appendRows](https://nhn.github.io/tui.grid/latest/Grid#appendRows) API를 이용하여 직접 무한 스크롤 기능을 구현할 수 있다.

```js
const grid = new Grid({ 
  data, 
  column,
  bodyHeight: 300
});

grid.on('scrollEnd', () => {
  axios.get('/api/readData', response => {
    grid.appendRows(response.data);
  });
})
```

> **참조**
> 무한 스크롤 기능은 `v4.10.0` 이상부터 사용할 수 있다.

## 예제

무한 스크롤 기능 예제는 [여기](http://nhn.github.io/tui.grid/latest/tutorial-eexample26-infinite-scroll)서 확인해 볼 수 있다.
