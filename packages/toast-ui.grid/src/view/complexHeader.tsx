import { h, Component } from 'preact';
import { ComplexColumnInfo, ColumnInfo, Side, Range } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { findIndex } from '../helper/common';
import { getChildColumnRange } from '../query/selection';
import { HeaderColumn } from './headerColumn';
import Grid from '../grid';

interface OwnProps {
  side: Side;
  grid: Grid;
}

interface StoreProps {
  headerHeight: number;
  cellBorderWidth: number;
  columns: ColumnInfo[];
  complexHeaderColumns: ComplexColumnInfo[];
  columnSelectionRange: Range | null;
  rowHeaderCount: number;
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
        complexHeaderColumns.forEach(complexHeaderColumn => {
          const { childNames } = complexHeaderColumn;

          if (childNames) {
            const index = findIndex(name => column.name === name, childNames);

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
    const lengths = [0, ...hierarchies.map(value => value.length)];

    return Math.max(...lengths);
  }

  private isSelected(name: string) {
    const { columnSelectionRange, columns, complexHeaderColumns } = this.props;

    if (!columnSelectionRange) {
      return false;
    }

    const [selectionStart, selectionEnd] = columnSelectionRange;
    const [columnStart, columnEnd] = getChildColumnRange(columns, complexHeaderColumns, name);

    return (
      columnStart >= selectionStart &&
      columnStart <= selectionEnd &&
      columnEnd >= selectionStart &&
      columnEnd <= selectionEnd
    );
  }

  private createTableHeaderComponent(
    column: ComplexColumnInfo,
    height: number,
    colspan: number,
    rowspan: number
  ) {
    const { name } = column;

    return (
      <HeaderColumn
        key={name}
        height={height}
        colspan={colspan}
        rowspan={rowspan}
        columnInfo={column}
        selected={this.isSelected(name)}
        grid={this.props.grid}
      />
    );
  }

  public render() {
    const { columns, headerHeight, cellBorderWidth } = this.props;
    const hierarchies = columns.map(column => this.getColumnHierarchy(column).reverse());
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

        rows[j].push(
          this.createTableHeaderComponent(column, height + cellBorderWidth, colspans[j], rowspan)
        );
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
    column: { rowHeaderCount, visibleColumnsBySideWithRowHeader, complexHeaderColumns },
    dimension: { headerHeight, cellBorderWidth },
    selection: { rangeBySide }
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: visibleColumnsBySideWithRowHeader[side],
    complexHeaderColumns,
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null,
    rowHeaderCount
  };
})(ComplexHeaderComp);
