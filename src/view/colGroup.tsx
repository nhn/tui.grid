import { h, Component } from 'preact';
import { Side, Column, Store } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from 'src/dispatch/types';

interface OwnProps {
  side: Side;
}

interface StateProps {
  columns: Column[];
}

type Props = OwnProps & StateProps;

class ColGroupComp extends Component<Props> {
  render({ columns }: Props) {
    return (
      <colgroup>
        {columns.map(({ name, width }) => (
          <col data-column-name={name} style={{ width: `${100}px` }} />
        ))}
      </colgroup>
    );
  }
}

export const ColGroup = connect<OwnProps, StateProps>(
  ({ viewport }: Store, { side }: OwnProps) => ({
    columns: side === 'L' ? viewport.colsL : viewport.colsR
  })
)(ColGroupComp);
