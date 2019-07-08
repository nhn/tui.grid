import React from 'react';
import TuiGrid from 'tui-grid';

const reactivePropSetterMap = {
  data: 'resetData',
  columns: 'setColumns',
  bodyHeight: 'setBodyHeight',
  frozenColumnCount: 'setFrozenColumnCount'
};

export default class Grid extends React.Component {
  rootEl = React.createRef();

  gridInst = null;

  bindEventHandlers(props, prevProps) {
    Object.keys(props)
      .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
      .forEach((key) => {
        const eventName = key[2].toLowerCase() + key.slice(3);
        // For <Grid onFocus={condition ? onFocus1 : onFocus2} />
        if (prevProps && prevProps[key] === props[key]) {
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
    this.gridInst = new TuiGrid({
      el: this.rootEl.current,
      ...this.props
    });

    this.bindEventHandlers(this.props);
  }

  shouldComponentUpdate(nextProps) {
    const {oneTimeBindingProps = []} = this.props;
    const reactiveProps = Object.keys(reactivePropSetterMap).filter(
      (propName) => oneTimeBindingProps.indexOf(propName) === -1
    );

    reactiveProps.forEach((propName) => {
      const currentValue = this.props[propName];
      const nextValue = nextProps[propName];
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
