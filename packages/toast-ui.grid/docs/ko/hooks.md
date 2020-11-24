# Hooks
 
Grid 내에서 작업을 수행하기 전에 수행 여부를 자유롭게 조절할 수 있는 Hook 인터페이스를 제공 합니다.

일반적으로 true 를 반환하면 다음 작업을 수행하며 false 를 반환하면 다음 작업을 수행 하지 않습니다.

## event hooks

event hooks 에서 제공하는 특정한 이벤트가 발생했을 때 Grid 가 다음 작업을 수행할지 여부를 조절할 수 있습니다.

###  beforeKeydownOnEditCell(KeyboardEvent, Grid)

```js 
 const grid = new Grid({
   ...options, 
    hooks: {
      event: {
        beforeKeydownOnEditCell(e, grid) {
          return true;
        },
      },
    },
  });
```

셀 편집 중에 KeydownEvent 가 발생 했을 때 호출 됩니다.
