import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls, isSupportWindowClipboardData } from '../helper/dom';
import { KeyboardEventCommandType, KeyboardEventType, keyEventGenerate } from '../helper/keyboard';
import { isEdge } from '../helper/browser';

interface StoreProps {
  text: string | null;
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
      case 'clipboard':
        dispatch('cellCopy', command!);
        break;
      default:
        break;
    }
  };

  private pasteInOtherBrowsers(clipboardData: DataTransfer) {
    const data = clipboardData.getData('text/html');
    let table;
    // if (data && data.find('tbody').length > 0) {
    //   // jquery find
    //   // step 1: Append copied data on contenteditable element to parsing correctly table data.
    //   this.el.html(`<table>${data.find('tbody').html()}</table>`); // jquery html
    //   // step 2: Make grid data from cell data of appended table element.
    //   table = this.el.find('table')[0];
    //   data = clipboardUtil.convertTableToData(table);
    //
    //   // step 3: Empty contenteditable element to reset.
    //   this.$el.html('');
    // } else {
    //   data = clipboardData.getData('text/plain');
    //   data = clipboardUtil.convertTextToData(data);
    // }
  }

  private pasteInMSBrowser(clipboardData: DataTransfer) {
    const data = clipboardData.getData('Text');
  }

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

  private onCopy(ev: ClipboardEvent) {
    // text 가져오기
    const text = '1';

    if (!isSupportWindowClipboardData && ev.clipboardData) {
      ev.clipboardData.setData('text/plain', text);
    }

    ev.preventDefault();
  }

  private onPaste(ev: ClipboardEvent) {
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
  }

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

export const Clipboard = connect<StoreProps>(({ focus, clipboard }) => ({
  text: clipboard.text,
  navigating: focus.navigating,
  editing: !!focus.editingAddress
}))(ClipboardComp);
