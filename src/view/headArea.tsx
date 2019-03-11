
import { h, Component } from 'preact';
import { Side } from '../types';
import { cls } from '../helper/common';

interface Props {
  side: Side
}

export class HeadArea extends Component<Props> {
  render() {
    return (
      <div class={cls('head-area')} style="height: 34px;">
        <table class={cls('table')}>
          <colgroup>
            <col data-column-name="name" style="width: 100px;" />
            <col data-column-name="artist" style="width: 100px;" />
            <col data-column-name="type" style="width: 100px;" />
            <col data-column-name="release" style="width: 100px;" />
            <col data-column-name="genre" style="width: 100px;" />
          </colgroup>
          <tbody>
            <tr>
              <th data-column-name="name" class={cls('cell', 'cell-head')} height="33">Name</th>
              <th data-column-name="artist" class={cls('cell', 'cell-head')} height="33">Artist</th>
              <th data-column-name="type" class={cls('cell', 'cell-head')} height="33">Type</th>
              <th data-column-name="release" class={cls('cell', 'cell-head')} height="33">Release</th>
              <th data-column-name="genre" class={cls('cell', 'cell-head')} height="33">Genre</th>
            </tr>
          </tbody>
        </table>

      </div>
    );
  }
}


