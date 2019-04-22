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

  private onBlur = () => {
    this.props.dispatch('setFocusActive', false);
  };

  private hasFocus() {
    return document.hasFocus() && document.activeElement === this.el;
  }

  public componentDidUpdate() {
    if (!this.el) {
      return;
    }

    if (this.props.active && !this.hasFocus()) {
      this.el.focus();
    }
  }

  public render() {
    return (
      <div
        class={cls('clipboard')}
        onBlur={this.onBlur}
        contentEditable={true}
        ref={(el) => {
          this.el = el;
        }}
      />
    );
  }
}

export const Clipboard = connect<StoreProps>(({ focus }) => ({
  active: focus.active
}))(ClipboardComp);
