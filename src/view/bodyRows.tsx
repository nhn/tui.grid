import { h, Component } from 'preact';
import { BodyRow } from './bodyRow';
import { BodyDummyRow } from './bodyDummyRow';
import { shallowEqual } from '../helper/common';
import { Side, ColumnInfo, ViewRow } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  rows: ViewRow[];
  columns: ColumnInfo[];
  dummyRowCount: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyRowsComp extends Component<Props> {
  private getDummyRows({
    dummyRowCount,
    columnNames,
    startIndex
  }: {
    dummyRowCount: number;
    columnNames: string[];
    startIndex: number;
  }) {
    const dummyRows = [];

    for (let i = 0; i < dummyRowCount; i += 1) {
      dummyRows.push(
        <BodyDummyRow key={String(i)} index={startIndex + i} columnNames={columnNames} />
      );
    }

    return dummyRows;
  }

  public shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }
    return true;
  }

  public render({ rows, dummyRowCount }: Props) {
    const columnNames = this.props.columns.map(({ name }) => name);

    return (
      <tbody>
        {rows.map((row) => (
          <BodyRow key={String(row.rowKey)} viewRow={row} columnNames={columnNames} />
        ))}
        {dummyRowCount
          ? this.getDummyRows({ dummyRowCount, columnNames, startIndex: rows.length })
          : null}
      </tbody>
    );
  }
}

export const BodyRows = connect<StoreProps, OwnProps>(({ viewport, column }, { side }) => ({
  rows: viewport.rows,
  columns: column.visibleColumnsBySide[side],
  dummyRowCount: viewport.dummyRowCount
}))(BodyRowsComp);
