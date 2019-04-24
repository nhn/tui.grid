import { h, Component } from 'preact';
import { BodyRow } from './bodyRow';
import { shallowEqual } from '../helper/common';
import { Side, Row, ColumnInfo } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  rows: Row[];
  columns: ColumnInfo[];
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyRowsComp extends Component<Props> {
  public shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }

    return true;
  }

  public render({ rows, columns }: Props) {
    const columnNames = columns.map(({ name }) => name);

    return (
      <tbody>
        {rows.map((row) => (
          <BodyRow key={String(row.rowKey)} row={row} columnNames={columnNames} />
        ))}
      </tbody>
    );
  }
}

export const BodyRows = connect<StoreProps, OwnProps>(({ viewport, column }, { side }) => ({
  rows: viewport.rows,
  columns: column.visibleColumnsBySide[side]
}))(BodyRowsComp);
