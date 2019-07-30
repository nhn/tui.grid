import { h, Component } from 'preact';
import { ViewRow, RowSpan, ColumnInfo } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { BodyCell } from './bodyCell';

interface OwnProps {
  viewRow: ViewRow;
  columnInfo: ColumnInfo;
  refreshRowHeight: Function | null;
}

interface StoreProps {
  rowSpan: RowSpan | null;
  enableRowSpan: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class RowSpanCellComp extends Component<Props> {
  public render() {
    const { columnInfo, refreshRowHeight, rowSpan, enableRowSpan, viewRow } = this.props;
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
      />
    );
  }
}

export const RowSpanCell = connect<StoreProps, OwnProps>(({ data }, { viewRow, columnInfo }) => {
  const { sortOptions } = data;
  const rowSpan = viewRow.rowSpanMap[columnInfo.name] || null;
  const enableRowSpan = sortOptions.columns[0].columnName === 'sortKey';

  return { rowSpan, enableRowSpan };
})(RowSpanCellComp);
