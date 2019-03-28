import { h, Component } from 'preact';
import { BodyRow } from './bodyRow';
import { cls, shallowEqual } from '../helper/common';
import { Side, Row, Column } from '../store/types';
import { connect } from './hoc';

interface OwnProps {
  side: Side;
}

interface InjectedProps {
  rows: Row[];
  columns: Column[]
}

type Props = OwnProps & InjectedProps;

export const BodyRows = connect(({ viewport }, { side }: OwnProps) => {
  if (side === 'L') {
    return {
      rows: viewport.rowsL,
      columns: viewport.colsL
    }
  }
  return {
    rows: viewport.rowsR,
    columns: viewport.colsR
  }
})(
  class extends Component<Props> {
    shouldComponentUpdate(nextProps: Props) {
      if (shallowEqual(nextProps, this.props)) {
        return false;
      }
    }

    render({ rows, columns }: Props) {
      const columnNames = columns.map(({ name }) => name);

      return (
        <tbody>
          {rows.map(row =>
            <BodyRow
              key={row.id as string}
              row={row}
              columnNames={columnNames}
            />
          )}
        </tbody>
      );
    }
  }
);