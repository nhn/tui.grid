import { h } from 'preact';
import { BodyCell } from './bodyCell';
import { ViewRow } from '../store/types';
import { connect } from './hoc';
import { cls } from '../helper/dom';

interface OwnProps {
  viewRow: ViewRow;
  columnNames: string[];
}

interface StoreProps {
  rowHeight: number;
}

type Props = OwnProps & StoreProps;

const BodyRowComp = ({ viewRow, columnNames, rowHeight }: Props) => {
  const isOddRow = !!(Number(viewRow.rowKey) % 2);

  return (
    <tr style={{ height: rowHeight }} class={cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even'])}>
      {columnNames.map((name) => {
        // Pass row object directly instead of passing value of it only,
        // so that BodyCell component can watch the change of value using selector function.
        return <BodyCell key={name} viewRow={viewRow} columnName={name} />;
      })}
    </tr>
  );
};

export const BodyRow = connect<StoreProps, OwnProps>(({ dimension }) => ({
  rowHeight: dimension.rowHeight
}))(BodyRowComp);
