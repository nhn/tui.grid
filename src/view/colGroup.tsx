import { h, Component } from 'preact';
import { Side, ColumnInfo } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  columns: ColumnInfo[];
  widths: number[];
  borderWidth: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

class ColGroupComp extends Component<Props> {
  public render({ columns, widths, borderWidth }: Props) {
    return (
      <colgroup>
        {columns.map(({ name }, idx) => (
          <col key={name} data-column-name={name} style={{ width: widths[idx] + borderWidth }} />
        ))}
      </colgroup>
    );
  }
}

export const ColGroup = connect<StoreProps, OwnProps>(
  ({ columnCoords, dimension, column }, { side }) => ({
    widths: columnCoords.widths[side],
    columns: column.visibleColumnsBySide[side],
    borderWidth: dimension.cellBorderWidth
  })
)(ColGroupComp);
