import { h, Component } from 'preact';
import { HeadArea } from './headArea';
import { BodyArea } from './bodyArea';
import { cls } from '../helper/common';

export class LeftSide extends Component {
  render() {
    return (
      <div class={cls('lside-area')} style="display: block; width: 0px;">
        <HeadArea side="L" />
        <BodyArea side="L" />
      </div>
    );
  }
}