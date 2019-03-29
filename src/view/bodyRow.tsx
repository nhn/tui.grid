import { h } from 'preact';
import { BodyCell } from './bodyCell';
import { Row } from '../store/types';
import { connect } from './hoc';

interface OwnProps {
  row: Row;
  columnNames: string[];
}

interface StateProps {
  rowHeight: number;
}

type Props = OwnProps & StateProps;

const BodyRowComp = ({ row, columnNames, rowHeight }: Props) => {
  return (
    <tr style={{ height: `${rowHeight}px` }}>
      {columnNames.map((name) => (
        <BodyCell value={row[name]} />
      ))}
    </tr>
  );
};

export const BodyRow = connect<StateProps, OwnProps>(({ dimension }) => ({
  rowHeight: dimension.rowHeight
}))(BodyRowComp);
