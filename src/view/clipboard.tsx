import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { KeyboardEventCommandType, KeyboardEventType, keyEventGenerate } from '../helper/keyboard';

interface StoreProps {
  active: boolean;
}

type Props = StoreProps & DispatchProps;

const KEYDOWN_LOCK_TIME = 10;

class ClipboardComp extends Component<Props> {
  private el?: HTMLFormElement;

  private isLocked: boolean = false;

  private lock = () => {
    this.isLocked = true;
    setTimeout(this.unlock.bind(this), KEYDOWN_LOCK_TIME);
  };

  /**
   * Unlock
   * @private
   */
  private unlock = () => {
    this.isLocked = false;
  };

  private onBlur = () => {
    this.props.dispatch('setFocusActive', false);
  };

  private hasFocus() {
    return document.hasFocus() && document.activeElement === this.el;
  }

  private dispatchKeyboardEvent = (type: KeyboardEventType, command?: KeyboardEventCommandType) => {
    const { dispatch } = this.props;
    switch (type) {
      case 'move':
        dispatch('moveFocus', command!);
        break;
      case 'edit':
        dispatch('editFocus', command!);
        break;
      case 'select':
        dispatch('selectFocus', command!);
        break;
      case 'remove':
        dispatch('removeFocus');
        break;
      default:
        break;
    }
  };

  /**
   * Event handler for the keydown event
   * @param {Event} ev - Event
   * @private
   */
  private onKeyDown = (ev: KeyboardEvent) => {
    if (this.isLocked) {
      ev.preventDefault();
      return;
    }

    const keyEvent = keyEventGenerate(ev);

    if (!keyEvent) {
      return;
    }

    const { type, command } = keyEvent;
    this.lock();

    if (type !== 'clipboard') {
      ev.preventDefault();
    }

    if (!(type === 'clipboard' && command === 'paste')) {
      this.dispatchKeyboardEvent(type, command);
    }
  };

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
        onKeyDown={this.onKeyDown}
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
