import { h } from 'preact';
import { connect } from './hoc';
import { cls, Attributes } from '../helper/dom';
import { isRowHeader } from '../helper/column';

interface OwnProps {
  columnNames: string[];
  index: number;
}

interface StoreProps {
  rowHeight: number;
}

type Props = OwnProps & StoreProps;

const BodyDummyRowComp = ({ columnNames, rowHeight, index }: Props) => {
  const isOddRow = !!(index % 2);

  return (
    <tr style={{ height: rowHeight }} class={cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even'])}>
      {columnNames.map((name) => {
        const attrs: Attributes = {
          'data-column-name': name
        };

        return (
          <td
            {...attrs}
            key={index}
            class={cls('cell', 'cell-dummy', [isRowHeader(name), 'cell-row-head'])}
          />
        );
      })}
    </tr>
  );
};

export const BodyDummyRow = connect<StoreProps, OwnProps>(({ dimension: { rowHeight } }) => ({
  rowHeight
}))(BodyDummyRowComp);
