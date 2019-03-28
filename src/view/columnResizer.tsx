import { h, Component } from 'preact'
import { cls } from '../helper/common';

export class ColumnResizer extends Component {
  render() {
    return (
      <div class={cls('column-resize-container')} style="display: block; margin-top: -35px; height: 35px;">
        <div data-column-index="0" data-column-name="name" class={cls('column-resize-handle')} title="" style="width: 7px; height: 33px; display: block; left: 249px;"></div>
        <div data-column-index="1" data-column-name="artist" class={cls('column-resize-handle')} title="" style="width: 7px; height: 33px; display: block; left: 501px;"></div>
        <div data-column-index="2" data-column-name="type" class={cls('column-resize-handle')} title="" style="width: 7px; height: 33px; display: block; left: 753px;"></div>
        <div data-column-index="3" data-column-name="release" class={cls('column-resize-handle')} title="" style="width: 7px; height: 33px; display: block; left: 1005px;"></div>
        <div data-column-index="4" data-column-name="genre" class={cls('column-resize-handle', 'column-resize-handle-last')} title="" style="width: 7px; height: 33px; display: block; left: 1255px;"></div>
      </div>
    );
  }
}