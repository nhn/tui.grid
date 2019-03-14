import { h, Component } from 'preact';
import { HeadArea } from './headArea';
import { BodyArea } from './bodyArea';
import { cls } from '../helper/common';

export class RightSide extends Component {
  render() {
    const style = {
      display: 'block',
      width: '800px'
    };

    return (
      <div class={cls('rside-area')} style={style}>
        <HeadArea side="R" />
        <BodyArea side="R" />
      </div>
    )
  }
}