import { h, Component } from 'preact';
import { ViewRow, RowKey } from '@t/store/data';
import { ColumnInfo } from '@t/store/column';
import { connect } from './hoc';
import { cls } from '../helper/dom';
import { DispatchProps } from '../dispatch/create';
import { debounce, isNull } from '../helper/common';
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
  hoveredRowKey: RowKey | null;
  focusedRowKey: RowKey | null;
}

type Props = OwnProps & StoreProps & DispatchProps;

const ROW_HEIGHT_DEBOUNCE_TIME = 10;

class BodyRowComp extends Component<Props> {
  public componentWillUnmount() {
    const { rowIndex, autoRowHeight, dispatch } = this.props;

    if (autoRowHeight) {
      dispatch('removeCellHeight', rowIndex);
    }
  }

  // This debounced function is aimed to wait until setTimeout(.., 0) calls
  // from the all child BodyCell components is made.
  // 10ms is just an approximate number. (smaller than 10ms might be safe enough)
  private updateRowHeightDebounced = debounce(() => {
    const { dispatch, rowIndex, rowHeight } = this.props;

    dispatch('refreshRowHeight', rowIndex, rowHeight);
  }, ROW_HEIGHT_DEBOUNCE_TIME);

  public render({
    rowIndex,
    viewRow,
    columns,
    rowHeight,
    autoRowHeight,
    hoveredRowKey,
    focusedRowKey,
  }: Props) {
    const isOddRow = rowIndex % 2 === 0;

    return (
      rowHeight > 0 && (
        <tr
          style={{ height: rowHeight }}
          class={cls(
            [isOddRow, 'row-odd'],
            [!isOddRow, 'row-even'],
            [!isNull(hoveredRowKey) && hoveredRowKey === viewRow.rowKey, 'row-hover'],
            [!isNull(focusedRowKey) && focusedRowKey === viewRow.rowKey, 'cell-current-row']
          )}
        >
          {columns.map((columnInfo) => {
            // Pass row object directly instead of passing value of it only,
            // so that BodyCell component can watch the change of value using selector function.
            return (
              <RowSpanCell
                key={columnInfo.name}
                viewRow={viewRow}
                columnInfo={columnInfo}
                refreshRowHeight={autoRowHeight ? this.updateRowHeightDebounced : null}
                rowIndex={rowIndex}
              />
            );
          })}
        </tr>
      )
    );
  }
}

export const BodyRow = connect<StoreProps, OwnProps>(
  ({ rowCoords, dimension, renderState, focus }, { rowIndex }) => ({
    rowHeight: rowCoords.heights[rowIndex],
    autoRowHeight: dimension.autoRowHeight,
    cellBorderWidth: dimension.cellBorderWidth,
    hoveredRowKey: renderState.hoveredRowKey,
    focusedRowKey: focus.rowKey,
  })
)(BodyRowComp);
