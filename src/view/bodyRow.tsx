import { h, Component } from 'preact';
import { ViewRow, ColumnInfo } from '../store/types';
import { connect } from './hoc';
import { cls } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { debounce } from '../helper/common';
import { RowSpanCell } from './rowSpanCell';

interface OwnProps {
  rowIndex: number;
  viewRow: ViewRow;
  columns: ColumnInfo[];
}

interface StoreProps {
  rowHeight: number;
  autoRowHeight: boolean;
  cellBorderWidth: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class BodyRowComp extends Component<Props> {
  private renderedRowHeight = this.props.rowHeight;

  // This debounced function is aimed to wait until setTimeout(.., 0) calls
  // from the all child BodyCell components is made.
  // 10ms is just an approximate number. (smaller than 10ms might be safe enough)
  private updateRowHeightDebounced = debounce(() => {
    const { dispatch, rowIndex, rowHeight } = this.props;

    if (rowHeight !== this.renderedRowHeight) {
      dispatch('refreshRowHeight', rowIndex);
    }
  }, 10);

  private refreshRowHeight = (cellHeight: number) => {
    const { cellBorderWidth } = this.props;

    this.renderedRowHeight = Math.max(cellHeight + cellBorderWidth, this.renderedRowHeight);
    this.updateRowHeightDebounced();
  };

  public render({ rowIndex, viewRow, columns, rowHeight, autoRowHeight }: Props) {
    const isOddRow = rowIndex % 2 === 0;

    return (
      rowHeight > 0 && (
        <tr
          style={{ height: rowHeight }}
          class={cls([isOddRow, 'row-odd'], [!isOddRow, 'row-even'], [!rowHeight, 'row-hidden'])}
        >
          {columns.map(columnInfo => {
            // Pass row object directly instead of passing value of it only,
            // so that BodyCell component can watch the change of value using selector function.
            return (
              <RowSpanCell
                key={columnInfo.name}
                viewRow={viewRow}
                columnInfo={columnInfo}
                refreshRowHeight={autoRowHeight ? this.refreshRowHeight : null}
              />
            );
          })}
        </tr>
      )
    );
  }
}

export const BodyRow = connect<StoreProps, OwnProps>(({ rowCoords, dimension }, { rowIndex }) => ({
  rowHeight: rowCoords.heights[rowIndex],
  autoRowHeight: dimension.autoRowHeight,
  cellBorderWidth: dimension.cellBorderWidth
}))(BodyRowComp);
