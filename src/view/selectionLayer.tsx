import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { connect } from './hoc';
import { Range, Side, SelectionRange } from '../store/types';
import { DispatchProps } from '../dispatch/create';

type ColumnWidths = { [key in Side]: number[] };

interface StoreProps {
  range: SelectionRange | null;
  rowOffsets: number[];
  rowHeights: number[];
  columnWidths: ColumnWidths;
  cellBorderWidth: number;
  visibleFrozenCount: number;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

class SelectionLayerComp extends Component<Props> {
  private getOwnSideColumnRange(columnRange: Range, side: Side, visibleFrozenCount: number): Range {
    let ownColumnRange = [-1, -1] as Range;

    if (side === 'L') {
      if (columnRange[0] < visibleFrozenCount) {
        ownColumnRange = [columnRange[0], Math.min(columnRange[1], visibleFrozenCount)];
      }
    } else if (columnRange[1] >= visibleFrozenCount) {
      ownColumnRange = [
        Math.max(columnRange[0], visibleFrozenCount) - visibleFrozenCount,
        columnRange[1] - visibleFrozenCount
      ];
    }

    return ownColumnRange;
  }

  private getVerticalStyles(rowRange: Range, rowOffsets: number[], rowHeights: number[]) {
    const top = rowOffsets[rowRange[0]];
    const bottom = rowOffsets[rowRange[1]] + rowHeights[rowRange[1]];

    return { top, height: bottom - top };
  }

  private getHorizontalStyles(
    columnRange: Range,
    columnWidths: ColumnWidths,
    side: Side,
    cellBorderWidth: number
  ) {
    // @TODO: L side 일 경우 meta 갯수 index에 더하기
    const widths = columnWidths[side];
    const [startIndex] = columnRange;
    let [, endIndex] = columnRange;
    let left = 0;
    let width = 0;
    let i = 0;

    if (startIndex === -1 || endIndex === -1) {
      return { left, width };
    }

    endIndex = Math.min(endIndex, widths.length - 1);

    for (; i <= endIndex; i += 1) {
      if (i < startIndex) {
        left += widths[i] + cellBorderWidth;
      } else {
        width += widths[i] + cellBorderWidth;
      }
    }
    width -= cellBorderWidth; // subtract last border width

    return { left, width };
  }

  public render() {
    let styles;
    const { range, side, columnWidths, rowOffsets, rowHeights, cellBorderWidth } = this.props;

    if (range) {
      const ownColumnRange = this.getOwnSideColumnRange(range.column, side, cellBorderWidth);
      styles = Object.assign(
        {},
        this.getVerticalStyles(range.row, rowOffsets, rowHeights),
        this.getHorizontalStyles(ownColumnRange, columnWidths, side, cellBorderWidth)
      );

      console.log(styles);
    }

    return <div class={cls('layer-focus', 'layer-selection')} />;
  }
}

export const SelectionLayer = connect<StoreProps, OwnProps>(
  ({ selection, columnCoords, rowCoords, dimension, column }) => {
    const { visibleFrozenCount } = column;
    const { cellBorderWidth } = dimension;
    const { range } = selection;
    const { widths: columnWidths } = columnCoords;
    const { offsets: rowOffsets, heights: rowHeights } = rowCoords;

    return {
      range,
      rowOffsets,
      rowHeights,
      cellBorderWidth,
      visibleFrozenCount,
      columnWidths
    };
  }
)(SelectionLayerComp);
