import { h, Component } from 'preact';
import { HeadArea } from './headArea';
import { BodyArea } from './bodyArea';
import { cls } from '../helper/common';

export class RightSide extends Component {
  render() {
    return (
      <div class={cls('rside-area')} style="display:block; width: 500px;">
        <HeadArea side="R" />
        <BodyArea side="R" />
      </div>
    )
  }
}