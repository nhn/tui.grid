import { Component, h } from 'preact';
import { Side } from '@t/store/focus';
import { Row, RowKey, ViewRow } from '@t/store/data';
import { ColumnInfo } from '@t/store/column';
import { BodyRow } from './bodyRow';
import { BodyDummyRow } from './bodyDummyRow';
import { range, shallowEqual } from '../helper/common';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  rawData: Row[];
  rows: ViewRow[];
  rowIndexOffset: number;
  columns: ColumnInfo[];
  dummyRowCount: number;
  hasTreeColumn: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyRowsComp extends Component<Props> {
  private getVisibleStateOfRows({ rawData, rows }: Pick<Props, 'rows' | 'rawData'>) {
    const rowKeys = rows.map(({ rowKey }) => rowKey);

    return rawData.reduce((acc, { rowKey, _attributes }) => {
      if (!rowKeys.includes(rowKey)) {
        return acc;
      }

      acc[rowKey] = !_attributes.tree?.hidden;

      return acc;
    }, {} as Record<RowKey, boolean>);
  }

  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(nextProps, this.props);
  }

  public render({ rawData, rows, rowIndexOffset, columns, dummyRowCount, hasTreeColumn }: Props) {
    const columnNames = columns.map(({ name }) => name);

    const visibleStateOfRows = hasTreeColumn ? this.getVisibleStateOfRows({ rows, rawData }) : null;

    return (
      <tbody>
        {rows.map((row, index) => (
          <BodyRow
            key={row.uniqueKey}
            rowIndex={index + rowIndexOffset}
            viewRow={row}
            columns={columns}
            isVisible={visibleStateOfRows?.[row.rowKey] ?? true}
          />
        ))}
        {range(dummyRowCount).map((index) => (
          <BodyDummyRow
            key={`dummy-${index}`}
            index={rows.length + index}
            columnNames={columnNames}
          />
        ))}
      </tbody>
    );
  }
}

export const BodyRows = connect<StoreProps, OwnProps>(({ viewport, column, data }, { side }) => ({
  rawData: data.filteredRawData,
  rowIndexOffset: viewport.rowRange[0] - data.pageRowRange[0],
  rows: viewport.rows,
  columns: side === 'L' ? column.visibleColumnsBySideWithRowHeader.L : viewport.columns,
  dummyRowCount: viewport.dummyRowCount,
  hasTreeColumn: !!column.treeColumnName,
}))(BodyRowsComp);
