import { h, Component } from 'preact';
import { BodyRow } from './bodyRow';
import { Side } from '../types';
import { cls } from '../helper/common';

interface Props {
  side: Side
}

export class BodyArea extends Component<Props> {
  render() {
    return (
      <div class={cls('body-area')} style="overflow-x: hidden; height: 560px;">
        <div class={cls('body-container')} style="height: 560px;">
          <div class={cls('table-container')} style="overflow: visible; top: 0px;">
            <table class={cls('table')}>
              <colgroup>
                <col data-column-name="name" style="width: 100px;" />
                <col data-column-name="artist" style="width: 100px;" />
                <col data-column-name="type" style="width: 100px;" />
                <col data-column-name="release" style="width: 100px;" />
                <col data-column-name="genre" style="width: 100px;" />
              </colgroup>
              <tbody>
                <BodyRow />
                <BodyRow />
                <BodyRow />
                <BodyRow />
                <BodyRow />
              </tbody>
            </table>
            <div class={cls('layer-selection')} style="display: none;"></div>
          </div>
        </div>
      </div>
    );
  }
}


