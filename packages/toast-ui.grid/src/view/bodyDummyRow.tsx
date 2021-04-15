import { h } from 'preact';
import { connect } from './hoc';
import { cls, dataAttr } from '../helper/dom';
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
  const isOddRow = index % 2 === 0;

  return (
    <tr style={{ height: rowHeight }} class={cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even'])}>
      {columnNames.map((name) => {
        const attrs = { [dataAttr.COLUMN_NAME]: name };

        return (
          <td
            {...attrs}
            key={`${name}-${index}`}
            class={cls('cell', 'cell-dummy', [isRowHeader(name), 'cell-row-header'])}
          />
        );
      })}
    </tr>
  );
};

export const BodyDummyRow = connect<StoreProps, OwnProps>(({ dimension: { rowHeight } }) => ({
  rowHeight,
}))(BodyDummyRowComp);
