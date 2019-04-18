import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';

interface StoreProps {
  active: boolean;
}

type Props = StoreProps & DispatchProps;

class ClipboardComp extends Component<Props> {
  private el?: HTMLFormElement;

  onBlur = () => {
    this.props.dispatch('setFocusActive', false);
  };

  hasFocus() {
    return document.hasFocus() && document.activeElement === this.el;
  }

  componentDidUpdate() {
    if (!this.el) {
      return;
    }

    if (this.props.active && !this.hasFocus()) {
      this.el.focus();
    }
  }

  render() {
    return (
      <div
        class={cls('clipboard')}
        onBlur={this.onBlur}
        contentEditable={true}
        ref={(el) => (this.el = el)}
      />
    );
  }
}

export const Clipboard = connect<StoreProps>(({ focus }) => ({
  active: focus.active
}))(ClipboardComp);
