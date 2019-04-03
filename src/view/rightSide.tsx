import { Component, h } from 'preact';
import { cls } from '../helper/common';
import { BodyArea } from './bodyArea';
import { HeadArea } from './headArea';
import { connect } from '../view/hoc';
import { DispatchProps } from '../dispatch/create';

interface StateProps {
  width: number;
}

class RightSideComp extends Component<StateProps & DispatchProps> {
  render() {
    const { width } = this.props;

    const style = {
      display: 'block',
      width: `${width}px`
    };

    return (
      <div class={cls('rside-area')} style={style}>
        <HeadArea side="R" />
        <BodyArea side="R" />
      </div>
    );
  }
}

export const RightSide = connect<StateProps, {}, DispatchProps>((store) => ({
  width: store.dimension.rsideWidth
}))(RightSideComp);
