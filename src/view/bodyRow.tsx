import { h } from 'preact';
import { BodyCell } from './bodyCell';
import { Row, Store } from '../store/types';
import { connect } from './hoc';
import { Dispatch } from '../dispatch/types';

interface OwnProps {
  row: Row;
  columnNames: string[];
}

interface InjectedProps {
  rowHeight: number;
  dispatch: Dispatch
}

type Props = OwnProps & InjectedProps;

export const BodyRow = connect(({ dimension }, ownProps: OwnProps) => ({
  rowHeight: dimension.rowHeight
}))(
  ({ row, columnNames, rowHeight, dispatch }: Props) => {
    const onClick = () => dispatch({
      type: 'setRowHeight',
      height: rowHeight + 1
    });

    return (
      <tr style={{ height: `${rowHeight}px` }} onClick={onClick}>
        {columnNames.map(name =>
          <BodyCell value={row[name]} />
        )}
      </tr>
    )
  }
);