import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { KeyboardEventCommandType, KeyboardEventType, keyEventGenerate } from '../helper/keyboard';
import { isEdge } from '../helper/browser';
import {
  convertTableToData,
  convertTextToData,
  isSupportWindowClipboardData
} from '../helper/clipboard';
import { getText } from '../query/clipboard';

interface StoreProps {
  navigating: boolean;
  editing: boolean;
}

export interface WindowWithClipboard extends Window {
  clipboardData: DataTransfer | null;
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
        dispatch('selectionEnd');
        dispatch('moveFocus', command!);
        dispatch('setScrollToFocus');
        break;
      case 'edit':
        dispatch('editFocus', command!);
        break;
      case 'select':
        dispatch('changeSelection', command!);
        dispatch('setScrollToSelection');
        break;
      case 'remove':
        dispatch('removeFocus');
        break;
      case 'clipboard': {
        if (!this.el) {
          return;
        }
        // Call directly because of timing issues
        const { store } = this.context;
        if (isSupportWindowClipboardData()) {
          (window as WindowWithClipboard).clipboardData!.setData('Text', getText(store));
        } else {
          this.el.innerHTML = getText(store);
        }
        break;
      }
      default:
        break;
    }
  };

  private pasteInOtherBrowsers(clipboardData: DataTransfer) {
    if (!this.el) {
      return;
    }

    const { el } = this;
    const html = clipboardData.getData('text/html');
    let data;
    if (html && html.indexOf('table') !== -1) {
      el.innerHTML = html;
      const { rows } = el.querySelector('tbody')!;
      data = convertTableToData(rows);
      el.innerHTML = '';
    } else {
      data = convertTextToData(clipboardData.getData('text/plain'));
    }

    this.props.dispatch('paste', data);
  }

  private pasteInMSBrowser(clipboardData: DataTransfer) {
    let data = convertTextToData(clipboardData.getData('Text'));

    setTimeout(() => {
      if (!this.el) {
        return;
      }

      const { el } = this;
      if (el.querySelector('table')) {
        const { rows } = el.querySelector('tbody')!;
        data = convertTableToData(rows);
      }
      this.props.dispatch('paste', data);
      el.innerHTML = '';
    }, 0);
  }

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

  // @TODO: IE 에서 onCopy 이벤트 발생하지 않는 이유 찾기
  private onCopy = (ev: ClipboardEvent) => {
    if (!this.el) {
      return;
    }
    const text = this.el.innerHTML;
    if (isSupportWindowClipboardData()) {
      (window as WindowWithClipboard).clipboardData!.setData('Text', text);
    } else if (ev.clipboardData) {
      ev.clipboardData.setData('text/plain', text);
    }

    ev.preventDefault();
  };

  private onPaste = (ev: ClipboardEvent) => {
    const clipboardData = ev.clipboardData || (window as WindowWithClipboard).clipboardData;

    if (!clipboardData) {
      return;
    }

    if (!isEdge() && !isSupportWindowClipboardData()) {
      ev.preventDefault();
      this.pasteInOtherBrowsers(clipboardData);
    } else {
      this.pasteInMSBrowser(clipboardData);
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
        onCopy={this.onCopy}
        onPaste={this.onPaste}
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
  editing: !!focus.editingAddress
}))(ClipboardComp);
