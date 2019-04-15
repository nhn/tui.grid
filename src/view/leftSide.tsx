import { h, Component } from 'preact';
import { HeadArea } from './headArea';
import { BodyArea } from './bodyArea';
import { cls } from '../helper/common';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';

interface StoreProps {
  width: number;
  scrollX: boolean;
}

type Props = StoreProps & DispatchProps;

class LeftSideComp extends Component<Props> {
  render({ width, scrollX }: Props) {
    const style = { width, display: 'block' };

    return (
      <div class={cls('lside-area')} style={style}>
        <HeadArea side="L" />
        <BodyArea side="L" />

        {scrollX && <div class={cls('scrollbar-left-bottom')} />}
      </div>
    );
  }
}

export const LeftSide = connect<StoreProps>(({ columnCoords, dimension }) => ({
  width: columnCoords.areaWidth.L,
  scrollX: dimension.scrollX
}))(LeftSideComp);
