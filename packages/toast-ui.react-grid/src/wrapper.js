import React from 'react';
import TuiGrid from 'tui-grid';
import 'tui-grid/dist/tui-grid.css';

export function applyTheme(presetName, extOptions) {
  TuiGrid.applyTheme(presetName, extOptions);
}

export function setLanguage(localeCode, data) {
  TuiGrid.setLanguage(localeCode, data);
}

export function getInstanceById(id) {
  return TuiGrid.getInstanceById(id);
}

export class Grid extends React.Component {
  container = React.createRef();

  gridInst = null;

  componentDidMount() {
    this.gridInst = new TuiGrid({
      el: this.container.current,
      columns: [
        {
          title: 'c1',
          name: 'c1'
        },
        {
          title: 'C2',
          name: 'c2'
        }
      ],
      data: [
        {
          c1: 1,
          c2: 1
        },
        {
          c1: 1,
          c2: 1
        }
      ]
    });
  }

  componentWillUnmount() {
    this.gridInst.destroy();
    this.gridInst = null;
  }

  render() {
    return <div ref={this.container} />;
  }
}
