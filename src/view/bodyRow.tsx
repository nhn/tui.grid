import { h, Component } from 'preact';
import { BodyCell } from './bodyCell';
import { ViewRow } from '../store/types';
import { connect } from './hoc';
import { cls } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { debounce } from '../helper/common';

interface OwnProps {
  rowIndex: number;
  viewRow: ViewRow;
  columnNames: string[];
}

interface StoreProps {
  rowHeight: number;
  autoRowHeight: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyRowComp extends Component<Props> {
  private renderedRowHeight = this.props.rowHeight;

  private updateRowHeightDebounced = debounce(() => {
    const { dispatch, rowIndex, rowHeight } = this.props;

    if (rowHeight !== this.renderedRowHeight) {
      dispatch('setRowHeight', rowIndex, this.renderedRowHeight);
    }
  }, 10);

  private refreshRowHeight = (cellHeight: number) => {
    this.renderedRowHeight = Math.max(cellHeight, this.renderedRowHeight);
    this.updateRowHeightDebounced();
  };

  public render({ rowIndex, viewRow, columnNames, rowHeight, autoRowHeight }: Props) {
    const isOddRow = rowIndex % 2 === 0;

    return (
      <tr style={{ height: rowHeight }} class={cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even'])}>
        {columnNames.map((name) => {
          // Pass row object directly instead of passing value of it only,
          // so that BodyCell component can watch the change of value using selector function.
          return (
            <BodyCell
              key={name}
              viewRow={viewRow}
              columnName={name}
              refreshRowHeight={autoRowHeight ? this.refreshRowHeight : null}
            />
          );
        })}
      </tr>
    );
  }
}

export const BodyRow = connect<StoreProps, OwnProps>(({ rowCoords, dimension }, { rowIndex }) => ({
  rowHeight: rowCoords.heights[rowIndex],
  autoRowHeight: dimension.autoRowHeight
}))(BodyRowComp);
