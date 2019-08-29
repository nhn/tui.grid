import React from 'react';
import TuiGrid from 'tui-grid';

const reactivePropSetterMap = {
  data: 'resetData',
  columns: 'setColumns',
  bodyHeight: 'setBodyHeight',
  frozenColumnCount: 'setFrozenColumnCount',
  columnOptions: 'setFrozenColumnCount'
};

export default class Grid extends React.Component {
  rootEl = React.createRef();

  gridInst = null;

  bindEventHandlers(props, prevProps) {
    Object.keys(props)
      .filter(key => /on(?!Grid)[A-Z][a-zA-Z]+/.test(key))
      .forEach(key => {
        const eventName = key[2].toLowerCase() + key.slice(3);
        // For <Grid onFocus={condition ? onFocus1 : onFocus2} />
        if (prevProps && prevProps[key] !== props[key]) {
          this.gridInst.off(eventName);
        }
        this.gridInst.on(eventName, props[key]);
      });
  }

  getInstance() {
    return this.gridInst;
  }

  getRootElement() {
    return this.rootEl.current;
  }

  componentDidMount() {
    const { frozenColumnCount: frozenCount, columnOptions: columnOptionsProp = {} } = this.props;

    const columnOptions =
      typeof frozenCount === 'number'
        ? {
            ...columnOptionsProp,
            frozenCount
          }
        : { ...columnOptionsProp };

    this.gridInst = new TuiGrid({
      el: this.rootEl.current,
      ...this.props,
      columnOptions
    });
    this.bindEventHandlers(this.props);
  }

  componentWillUnmount() {
    this.gridInst.destroy();
  }

  shouldComponentUpdate(nextProps) {
    const { oneTimeBindingProps = [] } = this.props;
    const reactiveProps = Object.keys(reactivePropSetterMap).filter(
      propName => oneTimeBindingProps.indexOf(propName) === -1
    );

    reactiveProps.forEach(propName => {
      let currentValue, nextValue;
      if (propName === 'columnOptions' && this.props.columnOptions) {
        currentValue = this.props.columnOptions.frozenCount;
        nextValue = nextProps.columnOptions.frozenCount;
      } else {
        currentValue = this.props[propName];
        nextValue = nextProps[propName];
      }

      if (currentValue !== nextValue) {
        const setterName = reactivePropSetterMap[propName];
        this.gridInst[setterName](nextValue);
      }
    });

    this.bindEventHandlers(nextProps, this.props);

    return false;
  }

  render() {
    return <div ref={this.rootEl} />;
  }
}
