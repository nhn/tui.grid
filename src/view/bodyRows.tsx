import { h, Component } from 'preact';
import { BodyRow } from './bodyRow';
import { shallowEqual } from '../helper/common';
import { Side, Row, Column } from '../store/types';
import { connect } from './hoc';

interface OwnProps {
  side: Side;
}

interface StateProps {
  rows: Row[];
  columns: Column[];
}

type Props = OwnProps & StateProps;

class BodyRowsComp extends Component<Props> {
  shouldComponentUpdate(nextProps: Props) {
    if (shallowEqual(nextProps, this.props)) {
      return false;
    }
    return true;
  }

  render({ rows, columns }: Props) {
    const columnNames = columns.map(({ name }) => name);
    console.log('rows', rows);

    return (
      <tbody>
        {rows.map((row) => (
          <BodyRow key={row.id as string} row={row} columnNames={columnNames} />
        ))}
      </tbody>
    );
  }
}

export const BodyRows = connect<StateProps, OwnProps>(({ viewport }, { side }) => {
  if (side === 'L') {
    return {
      rows: viewport.rowsL,
      columns: viewport.colsL
    };
  }
  return {
    rows: viewport.rowsR,
    columns: viewport.colsR
  };
})(BodyRowsComp);
