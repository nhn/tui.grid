# Hooks

Hook provides interfaces for handling to decide to perform a process or don't.
  
Basically, If a hook returns `true` will perform the next work. 

If return `false` aborts the next work.

## event hooks 

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

`beforeKeydownOnEditCell()` will be called when triggered key down on editing. 
