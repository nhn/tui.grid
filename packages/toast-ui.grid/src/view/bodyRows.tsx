import { h, Component } from 'preact';
import { Side } from '@t/store/focus';
import { ViewRow } from '@t/store/data';
import { ColumnInfo } from '@t/store/column';
import { BodyRow } from './bodyRow';
import { BodyDummyRow } from './bodyDummyRow';
import { shallowEqual, range } from '../helper/common';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  rows: ViewRow[];
  rowIndexOffset: number;
  columns: ColumnInfo[];
  dummyRowCount: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyRowsComp extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    return !shallowEqual(nextProps, this.props);
  }

  public render({ rows, rowIndexOffset, columns, dummyRowCount }: Props) {
    const columnNames = columns.map(({ name }) => name);
    return (
      <tbody>
        {rows.map((row, index) => (
          <BodyRow
            key={row.uniqueKey}
            rowIndex={index + rowIndexOffset}
            viewRow={row}
            columns={columns}
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
  rowIndexOffset: viewport.rowRange[0] - data.pageRowRange[0],
  rows: viewport.rows,
  columns: side === 'L' ? column.visibleColumnsBySideWithRowHeader.L : viewport.columns,
  dummyRowCount: viewport.dummyRowCount,
}))(BodyRowsComp);
