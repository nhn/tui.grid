import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { KeyboardEventCommandType, KeyboardEventType, keyEventGenerate } from '../helper/keyboard';

interface StoreProps {
  navigating: boolean;
  editing: boolean;
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
    this.props.dispatch('setNavigating', false);
  };

  private isClipboardFocused() {
    return document.hasFocus() && document.activeElement === this.el;
  }

  private dispatchKeyboardEvent = (type: KeyboardEventType, command?: KeyboardEventCommandType) => {
    const { dispatch } = this.props;
    switch (type) {
      case 'move':
        dispatch('moveFocus', command!);
        dispatch('setScrollPosition');
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

    const { type, command } = keyEventGenerate(ev);

    if (!type) {
      return;
    }

    this.lock();

    if (type !== 'clipboard') {
      ev.preventDefault();
    }

    if (!(type === 'clipboard' && command === 'paste')) {
      this.dispatchKeyboardEvent(type, command);
    }
  };

  public componentDidUpdate() {
    setTimeout(() => {
      const { navigating, editing } = this.props;
      if (this.el && navigating && !editing && !this.isClipboardFocused()) {
        this.el.focus();
      }
    });
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
  navigating: focus.navigating,
  editing: !!focus.editing
}))(ClipboardComp);
