import { h, Component } from 'preact';
import { Side } from '@t/store/focus';
import { ColumnInfo } from '@t/store/column';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { dataAttr } from '../helper/dom';

interface OwnProps {
  side: Side;
  useViewport: boolean;
}

interface StoreProps {
  columns: ColumnInfo[];
  widths: number[];
  borderWidth: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class ColGroupComp extends Component<Props> {
  public render({ columns, widths, borderWidth }: Props) {
    const attrs = { [dataAttr.COLUMN_NAME]: name };
    return (
      <colgroup>
        {columns.map(({ name }, idx) => (
          <col key={name} {...attrs} style={{ width: widths[idx] + borderWidth }} />
        ))}
      </colgroup>
    );
  }
}

export const ColGroup = connect<StoreProps, OwnProps>(
  ({ columnCoords, viewport, dimension, column }, { side, useViewport }) => ({
    widths:
      useViewport && side === 'R'
        ? columnCoords.widths[side].slice(...viewport.colRange)
        : columnCoords.widths[side],
    columns:
      useViewport && side === 'R'
        ? viewport.columns
        : column.visibleColumnsBySideWithRowHeader[side],
    borderWidth: dimension.cellBorderWidth,
  })
)(ColGroupComp);
