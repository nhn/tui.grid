import { h, Component } from 'preact';
import { Side } from '@t/store/focus';
import { ColumnInfo, ComplexColumnInfo } from '@t/store/column';
import { Range } from '@t/store/selection';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { getChildColumnRange } from '../query/selection';
import { ColumnHeader } from './columnHeader';
import Grid from '../grid';
import { getComplexColumnsHierarchy, getHierarchyMaxRowCount } from '../query/column';

interface OwnProps {
  side: Side;
  grid: Grid;
}

interface StoreProps {
  headerHeight: number;
  cellBorderWidth: number;
  columns: ColumnInfo[];
  complexColumnHeaders: ComplexColumnInfo[];
  columnSelectionRange: Range | null;
  rowHeaderCount: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class ComplexHeaderComp extends Component<Props> {
  private isSelected(name: string) {
    const { columnSelectionRange, columns, complexColumnHeaders } = this.props;

    if (!columnSelectionRange) {
      return false;
    }

    const [selectionStart, selectionEnd] = columnSelectionRange;
    const [columnStart, columnEnd] = getChildColumnRange(columns, complexColumnHeaders, name);

    return (
      columnStart >= selectionStart &&
      columnStart <= selectionEnd &&
      columnEnd >= selectionStart &&
      columnEnd <= selectionEnd
    );
  }

  private createTableHeaderComponent(
    column: ComplexColumnInfo | ColumnInfo,
    height: number,
    colspan: number,
    rowspan: number
  ) {
    const { name } = column;

    return (
      <ColumnHeader
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
    const { columns, headerHeight, cellBorderWidth, complexColumnHeaders } = this.props;
    const hierarchies = getComplexColumnsHierarchy(columns, complexColumnHeaders);
    const maxRowCount = getHierarchyMaxRowCount(hierarchies);
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
          height = headerHeight - curHeight - cellBorderWidth;
        } else {
          curHeight += height + cellBorderWidth;
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
    column: { rowHeaderCount, visibleColumnsBySideWithRowHeader, complexColumnHeaders },
    dimension: { headerHeight, cellBorderWidth },
    selection: { rangeBySide },
  } = store;

  return {
    headerHeight,
    cellBorderWidth,
    columns: visibleColumnsBySideWithRowHeader[side],
    complexColumnHeaders,
    columnSelectionRange: rangeBySide && rangeBySide[side].column ? rangeBySide[side].column : null,
    rowHeaderCount,
  };
})(ComplexHeaderComp);
