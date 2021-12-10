import { h, Component } from 'preact';
import { ViewRow, RowSpan } from '@t/store/data';
import { ColumnInfo } from '@t/store/column';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { BodyCell } from './bodyCell';
import { isRowSpanEnabled } from '../query/rowSpan';

interface OwnProps {
  viewRow: ViewRow;
  columnInfo: ColumnInfo;
  refreshRowHeight: Function | null;
  rowIndex: number;
}

interface StoreProps {
  rowSpan: RowSpan | null;
  enableRowSpan: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class RowSpanCellComp extends Component<Props> {
  public render() {
    const { columnInfo, refreshRowHeight, rowSpan, enableRowSpan, viewRow, rowIndex } = this.props;
    let rowSpanAttr = null;

    if (enableRowSpan && rowSpan) {
      if (!rowSpan.mainRow) {
        return null;
      }
      rowSpanAttr = { rowSpan: rowSpan.spanCount };
    }

    return (
      <BodyCell
        viewRow={viewRow}
        columnInfo={columnInfo}
        refreshRowHeight={refreshRowHeight}
        rowSpanAttr={rowSpanAttr}
        rowIndex={rowIndex}
      />
    );
  }
}

export const RowSpanCell = connect<StoreProps, OwnProps>(
  ({ data, column }, { viewRow, columnInfo }) => {
    const { sortState } = data;
    const rowSpan = (viewRow.rowSpanMap && viewRow.rowSpanMap[columnInfo.name]) || null;
    const enableRowSpan = isRowSpanEnabled(sortState, column);

    return { rowSpan, enableRowSpan };
  }
)(RowSpanCellComp);
