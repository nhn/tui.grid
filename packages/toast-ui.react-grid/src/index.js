import React from 'react';
import TuiGrid from 'tui-grid';

const reactivePropSetterMap = {
  data: 'setData',
  columns: 'setColumns',
  bodyHeight: 'setBodyHeight',
  frozenColumnCount: 'setFrozenColumnCount'
};

export default class Grid extends React.Component {
  rootEl = React.createRef();

  gridInst = null;

  useAddons() {
    const {addon} = this.props;

    if (addon) {
      Object.keys(addon).forEach((addonName) => {
        this.gridInst.use(addonName, addon[addonName]);
      });
    }
  }

  bindEventHandlers() {
    Object.keys(this.props)
      .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
      .forEach((key) => {
        const eventName = key[2].toLowerCase() + key.slice(3);
        this.gridInst.on(eventName, this.props[key]);
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

    this.useAddons();
    this.bindEventHandlers();
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

    return false;
  }

  render() {
    return <div ref={this.rootEl} />;
  }
}
