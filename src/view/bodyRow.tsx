import { h } from 'preact';
import { BodyCell } from './bodyCell';
import { Row } from '../store/types';
import { connect } from './hoc';
import { cls } from '../helper/dom';

interface OwnProps {
  idx: number;
  row: Row;
  columnNames: string[];
}

interface StoreProps {
  rowHeight: number;
}

type Props = OwnProps & StoreProps;

const BodyRowComp = ({ row, columnNames, rowHeight, idx }: Props) => {
  const isOddRow = !!(idx % 2);

  return (
    <tr style={{ height: rowHeight }} class={cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even'])}>
      {columnNames.map((name) => (
        <BodyCell value={row[name]} rowKey={row.rowKey} columnName={name} />
      ))}
    </tr>
  );
};

export const BodyRow = connect<StoreProps, OwnProps>(({ dimension }) => ({
  rowHeight: dimension.rowHeight
}))(BodyRowComp);
