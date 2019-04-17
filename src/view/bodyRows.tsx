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
  shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }
    return true;
  }

  render({ rows, columns }: Props) {
    const columnNames = columns.map(({ name }) => name);

    return (
      <tbody>
        {rows.map((row, idx) => (
          <BodyRow key={row.id as string} row={row} columnNames={columnNames} idx={idx} />
        ))}
      </tbody>
    );
  }
}

export const BodyRows = connect<StoreProps, OwnProps>(({ viewport, column }, { side }) => ({
  rows: viewport.rows,
  columns: column.visibleColumns[side]
}))(BodyRowsComp);
