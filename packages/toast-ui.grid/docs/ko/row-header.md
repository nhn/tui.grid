# 로우 헤더 ✅

TOAST UI Grid는 `rowHeaders` 옵션을 이용하여 각 로우에 쉽게 체크박스를 추가하거나 번호를 지정해 줄 수 있다.

## 옵션
### type

로우 Header type에는 행의 번호를 나타내주는 `rowNum`, 행을 선택할 수 있는 `checkbox`가 존재한다. 

```js
import Grid from 'tui-grid';

const grid = new Grid({
  // ...,
  rowHeaders: ['rowNum', 'checkbox']
  // or rowHeaders: [{ type: 'rowNum' }, { type: 'checkbox' }]
});
```

위 코드를 실행하면 아래 그림처럼 각 로우에 행 번호와 체크박스가 나타난다. 

![image](https://user-images.githubusercontent.com/35371660/60868741-9b75d500-a268-11e9-98f3-18a9293d32b4.png)

### width, align, valign

* `width`: 로우 헤더의 너비를 나타낸다. 단위는 px이다. 값을 작성하지 않으면 기본값이 들어간다.
* `align`: 가로 정렬을 정한다. 기본값은 `left`이며 `left`, `right`, `center`가 가능하다.
* `valign`: 세로 정렬을 정한다. 기본값은 `middle`이며 `top`, `middle`, `bottom`가 가능하다.

```js
const grid = new Grid({
  // ...,
  rowHeaders: [
    { type: 'rowNum', width: 100, align: 'left', valign: 'bottom' },
    { type: 'checkbox' }
  ]
})
```

### header, renderer 를 통한 로우 헤더 커스터마이징

* `header`: 헤더에 들어가는 로우 헤더를 커스터마이징 할 때 사용한다.

```js
const grid = new Grid({
  // ...,
  rowHeaders: [
    {
      type: 'checkbox',
      header: `
        <label for="all-checkbox" class="checkbox">
          <input type="checkbox" id="all-checkbox" class="hidden-input" name="_checked" />
          <span class="custom-input"></span>
        </label>
      `
    }
  ]
});
```

위 코드처럼 문자열 형태로 들어갈 로우 헤더를 커스터마이징 했다. 위 결과는 아래 그림처럼 나타난다.

![image](https://user-images.githubusercontent.com/35371660/60875736-7340a300-a275-11e9-9cd6-9472c2763323.png)


* `renderer`: Custom Renderer 생성자를 인자로 받는다. 사용하면 각 행의 로우 헤더 영역을 커스터마이징 할 수 있다. v4.0에서 사라진 라디오 버튼 또한 renderer 옵션을 사용하면 구현할 수 있다.

```js
// checkbox custom renderer
class CheckboxRenderer {
  constructor(props) {
    const { grid, rowKey } = props;

    const label = document.createElement('label');
    label.className = 'checkbox tui-grid-row-header-checkbox';
    label.setAttribute('for', String(rowKey));

    const hiddenInput = document.createElement('input');
    hiddenInput.className = 'hidden-input';
    hiddenInput.id = String(rowKey);

    const customInput = document.createElement('span');
    customInput.className = 'custom-input';

    label.appendChild(hiddenInput);
    label.appendChild(customInput);

    hiddenInput.type = 'checkbox';
    label.addEventListener('click', (ev) => {
      ev.preventDefault();

      if (ev.shiftKey) {
        grid[!hiddenInput.checked ? 'checkBetween' : 'uncheckBetween'](rowKey);
        return;
      }

      grid[!hiddenInput.checked ? 'check' : 'uncheck'](rowKey);
    });

    this.el = label;

    this.render(props);
  }

  getElement() {
    return this.el;
  }

  render(props) {
    const hiddenInput = this.el.querySelector('.hidden-input');
    const checked = Boolean(props.value);

    hiddenInput.checked = checked;
  }
}

const grid = new tui.Grid({
  el: document.getElementById('grid'),
  data,
  rowHeaders: [
    {
      type: 'checkbox',
      renderer: {
        type: CheckboxRenderer
      }
    }
  ]
});
```

위 코드는 아래 그림처럼 나타난다.

![image](https://user-images.githubusercontent.com/35371660/60876491-f6aec400-a276-11e9-8ff6-b2b30c5f6f4a.png)


자세한 Custom Renderer 설명은 다음 [링크](./custom-renderer)에서 확인할 수 있다.

## 로우헤더 체크 박스 활용
### check, uncheck 이벤트

체크박스가 선택 되었을 때, 그리고 해제 되었을 때 이벤트를 발생 시킬 수 있다.

```js
const grid = new Grid({
  data,
  rowHeaders: ['checkbox']
});

grid.on('check', (ev) => {
  alert(`check: ${ev.rowKey}`);
});

grid.on('uncheck', (ev) => {
  alert(`uncheck: ${ev.rowKey}`);
});
```

위 코드를 실행하면 아래 그림 처럼 이벤트가 발생하는 것을 볼 수 있다.

![check_uncheck](https://user-images.githubusercontent.com/35371660/60872188-3a053480-a26f-11e9-8af4-e5280bf45f69.gif)

### _attributes의 checkDisabled 옵션 사용하기

`_attributes`옵션의 `checkDisabled`를 `true`로 지정하면 해당 로우의 checkbox를 선택할 수 없다.

```js
const data = [
  {
    name: 'Beautiful Lies',
    artist: 'Birdy',
    _attributes: {
      checkDisabled: true
    }
  },
  {
    name: 'X',
    artist: 'Ed Sheeran',
  }
  // ...,
];

const grid = new Grid({
  data,
  rowHeaders: ['checkbox']
});
```

위 코드를 실행하면 밑 코드처럼 체크박스가 비활성화 된 것을 볼 수 있다.

![image](https://user-images.githubusercontent.com/35371660/60870503-fbba4600-a26b-11e9-8a5d-39af045b40bf.png)

모든 옵션은 [API 문서](http://nhn.github.io/tui.grid/latest)의 `Grid.rowHeaders` 부분에서 확인할 수 있다.

## 예제

[여기](http://nhn.github.io/tui.grid/latest/tutorial-example11-row-headers)서 로우 헤더 커스터 마이징을 확인해 볼 수 있다.
