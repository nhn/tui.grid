import { h, Component } from 'preact';
import { Side, Column } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface OwnProps {
  side: Side;
}

interface StoreProps {
  columns: Column[];
  widths: number[];
}

type Props = OwnProps & StoreProps & DispatchProps;

class ColGroupComp extends Component<Props> {
  render({ columns, widths }: Props) {
    return (
      <colgroup>
        {columns.map(({ name }, idx) => (
          <col data-column-name={name} style={{ width: `${widths[idx]}px` }} />
        ))}
      </colgroup>
    );
  }
}

export const ColGroup = connect<StoreProps, OwnProps>(({ viewport, columnCoords }, { side }) => ({
  widths: side === 'L' ? [] : columnCoords.widths,
  columns: side === 'L' ? viewport.colsL : viewport.colsR
}))(ColGroupComp);
