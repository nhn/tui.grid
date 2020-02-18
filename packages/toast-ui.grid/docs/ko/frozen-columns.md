# 고정 컬럼 ❄️

TOAST UI Grid는 `frozenCount` 옵션을 통해 컬럼을 고정할 수 있다. 

## 옵션

* `frozenCount`: `columnOptions` 옵션의 `frozenCount`를 통해 좌측에 고정할 컬럼의 갯수를 지정해 줄 수 있다. 기본값은 0이며 숫자값이 들어가야 한다.
* `frozenBorderWidth`: `columnOptions` 옵션의 `frozenBorderWidth`를 통해 고정 컬럼의 경계선 너비를 조절할 수 있다. 기본값은 1이며 숫자값이 들어가야 한다. 너비는 `px` 단위이다. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  data,
  column,
  columnOptions: {
    frozenCount: 3, // 3개의 컬럼을 고정하고
    frozenBorderWidth: 2 // 고정 컬럼의 경계선 너비를 2px로 한다.
  }
});
```

위 코드를 실행하면 아래 그림처럼 나타나는 것을 확인할 수 있다.

![image](https://user-images.githubusercontent.com/35371660/60934748-628a3e80-a302-11e9-8c41-b9bad694747a.png)

## 경계선 색 변경하기 

`applyTheme`을 이용하여 경계선의 색을 변경할 수 있다. `frozenBorder` 옵션의 `border`값을 색상으로 주면 원하는 색으로 경계선 색이 지정된다.

```js
Grid.applyTheme('striped', {
  frozenBorder: {
    border: '#ff0000'
  }
});
```

위 코드를 실행하면 아래 그림과 같이 실행된다.

![image](https://user-images.githubusercontent.com/35371660/60935380-a120f880-a304-11e9-9a37-6b5662430918.png)


## setFrozenColumnCount()

`setFrozenColumnCount` 메서드를 통해 Grid의 고정 컬럼 수를 변경할 수 있다.

```js
const grid = new Grid({
  // ...,
});

grid.setFrozenColumnCount(2); // 고정하고자 하는 컬럼의 갯수
```

모든 옵션은 [API 문서](http://nhn.github.io/tui.grid/latest)의 `Grid.columnOptions` 부분에서 확인할 수 있다.

## 예제

[여기](http://nhn.github.io/tui.grid/latest/tutorial-example16-frozen-columns)서 고정 컬럼 예제를 확인할 수 있다.
