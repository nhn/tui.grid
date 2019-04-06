import { h, Component } from 'preact';
import { connect } from './hoc';
import { cls } from '../helper/common';
import { DispatchProps } from '../dispatch/create';

class HeightResizeHandleComp extends Component<DispatchProps> {
  render() {
    return (
      <div class={cls('height-resize-handle')}>
        <button>
          <span />
        </button>
      </div>
    );
  }
}

export const HeightResizeHandle = connect()(HeightResizeHandleComp);
