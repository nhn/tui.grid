import { h, Component } from 'preact';
import { ComplexColumnInfo, ColumnInfo, Side } from '../store/types';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { findIndex } from '../helper/common';
import { HeaderCheckbox } from './headerCheckbox';
import { SortingButton } from './sortingButton';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  headerHeight: number;
  columns: ColumnInfo[];
  complexHeaderColumns: ComplexColumnInfo[];
}

type Props = OwnProps & StoreProps & DispatchProps;

class ComplexHeaderComp extends Component<Props> {
  private getColumnHierarchy(
    column: ComplexColumnInfo,
    mergedComplexColumns?: ComplexColumnInfo[]
  ) {
    const { complexHeaderColumns } = this.props;
    const complexColumns: ComplexColumnInfo[] = mergedComplexColumns || [];

    if (column) {
      complexColumns.push(column);

      if (complexHeaderColumns) {
        complexHeaderColumns.forEach((complexHeaderColumn) => {
          const { childNames } = complexHeaderColumn;

          if (childNames) {
            const index = findIndex((name) => column.name === name, childNames);

            if (index !== -1) {
              this.getColumnHierarchy(complexHeaderColumn, complexColumns);
            }
          }
        });
      }
    }

    return complexColumns;
  }

  private getHierarchyMaxRowCount(hierarchies: ComplexColumnInfo[][]) {
    const lengths = [0, ...hierarchies.map((value) => value.length)];

    return Math.max(...lengths);
  }

  private createTableHeaderComponent(
    column: ComplexColumnInfo,
    height: number,
    colspan: number,
    rowspan: number
  ) {
    const { name, header, sortable } = column;

    return (
      <th
        key={name}
        data-column-name={name}
        class={cls('cell', 'cell-header')}
        height={height}
        {...!!colspan && { colspan }}
        {...!!rowspan && { rowspan }}
      >
        {name === '_checked' ? <HeaderCheckbox /> : header}
        {!!sortable && <SortingButton />}
      </th>
    );
  }

  public render() {
    const { columns, headerHeight } = this.props;
    const hierarchies = columns.map((column) => this.getColumnHierarchy(column).reverse());
    const maxRowCount = this.getHierarchyMaxRowCount(hierarchies);
    const rows = new Array(maxRowCount);
    const columnNames = new Array(maxRowCount);
    const colspans: number[] = [];
    const rowHeight = (maxRowCount ? Math.floor((headerHeight - 1) / maxRowCount) : 0) - 1;

    let rowspan = 1;
    let height;

    hierarchies.forEach((hierarchy, i) => {
      const { length } = hierarchies[i];
      let curHeight = 0;

      hierarchy.forEach((column, j) => {
        const { name: columnName } = column;

        rowspan = length - 1 === j && maxRowCount - length + 1 > 1 ? maxRowCount - length + 1 : 1;
        height = rowHeight * rowspan;

        if (j === length - 1) {
          height = headerHeight - curHeight - 2;
        } else {
          curHeight += height + 1;
        }

        if (columnNames[j] === columnName) {
          rows[j].pop();
          colspans[j] += 1;
        } else {
          colspans[j] = 1;
        }

        columnNames[j] = columnName;
        rows[j] = rows[j] || [];

        rows[j].push(this.createTableHeaderComponent(column, height, colspans[j], rowspan));
      });
    });

    return (
      <tbody>
        {rows.map((row, index) => (
          <tr key={`complex-header-${index}`}>{row}</tr>
        ))}
      </tbody>
    );
  }
}

export const ComplexHeader = connect<StoreProps, OwnProps>((store, { side }) => {
  const {
    column: { visibleColumnsBySide, complexHeaderColumns },
    dimension: { headerHeight }
  } = store;

  return {
    headerHeight,
    columns: visibleColumnsBySide[side],
    complexHeaderColumns
  };
})(ComplexHeaderComp);
