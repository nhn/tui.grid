import { h, Component } from 'preact';
import { RowKey } from '@t/store/data';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import {
  cls,
  convertTableToData,
  isSupportWindowClipboardData,
  setClipboardSelection,
  WindowWithClipboard,
} from '../helper/dom';
import {
  EnterCommandType,
  KeyboardEventCommandType,
  KeyboardEventType,
  keyEventGenerate,
} from '../helper/keyboard';
import { isEdge, isMobile } from '../helper/browser';
import { getText } from '../query/clipboard';
import { convertTextToData } from '../helper/common';
import GridEvent from '../event/gridEvent';
import { getEventBus, EventBus } from '../event/eventBus';
import { sanitize } from 'dompurify';

interface StoreProps {
  navigating: boolean;
  editing: boolean;
  rowKey: RowKey | null;
  columnName: string | null;
  filtering: boolean;
  eventBus: EventBus;
  moveDirectionOnEnter?: EnterCommandType;
}

type Props = StoreProps & DispatchProps;

const KEYDOWN_LOCK_TIME = 10;

class ClipboardComp extends Component<Props> {
  private el?: HTMLFormElement;

  private isLocked = false;

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
        dispatch('setScrollToFocus');
        break;
      case 'select':
        dispatch('moveSelection', command!);
        dispatch('setScrollToSelection');
        break;
      case 'remove':
        dispatch('removeContent');
        break;
      /*
       * Call directly because of timing issues
       * - Step 1: When the keys(ctrl+c) are downed on grid, 'clipboard' is triggered.
       * - Step 2: When 'clipboard' event is fired,
       *           all browsers append copied data and focus to contenteditable element and
       *           IE browsers set selection for triggering 'copy' event.
       * - Step 3: Finally, when 'copy' event is fired on browsers,
       *           setting copied data to ClipboardEvent.clipboardData or window.clipboardData(IE).
       */
      case 'clipboard': {
        if (!this.el) {
          return;
        }
        const { store } = this.context;
        this.el.textContent = getText(store);

        if (isSupportWindowClipboardData()) {
          setClipboardSelection(this.el.childNodes[0]);
        }
        break;
      }
      default:
        break;
    }
  };

  /**
   * Paste copied data in other browsers (chrome, safari, firefox)
   * [if] condition is copying from ms-excel,
   * [else] condition is copying from the grid or the copied data is plain text.
   */
  private pasteInOtherBrowsers(clipboardData: DataTransfer) {
    if (!this.el) {
      return;
    }

    const { el } = this;
    const html = sanitize(clipboardData.getData('text/html'));

    let data;
    if (html && html.indexOf('table') !== -1) {
      // step 1: Append copied data on contenteditable element to parsing correctly table data.
      el.innerHTML = html;
      // step 2: Make grid data from cell data of appended table element.
      const { rows } = el.querySelector('tbody')!;
      data = convertTableToData(rows);
      // step 3: Empty contenteditable element to reset.
      el.innerHTML = '';
    } else {
      data = convertTextToData(clipboardData.getData('text/plain'));
    }

    this.props.dispatch('paste', data);
  }

  /**
   * Paste copied data in MS-browsers (IE, edge)
   */
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

    const { keyStroke, type, command } = keyEventGenerate(ev);

    if (!type) {
      return;
    }

    this.lock();

    if (type !== 'clipboard') {
      ev.preventDefault();
    }

    if (!(type === 'clipboard' && command === 'paste')) {
      const { rowKey, columnName, moveDirectionOnEnter } = this.props;
      const gridEvent = new GridEvent({ keyboardEvent: ev, rowKey, columnName });
      /**
       * Occurs when key down event is triggered.
       * @event Grid#keydown
       * @property {Grid} instance - Current grid instance
       * @property {Object} keyboardEvent - Keyboard Event
       * @property {Object} rowKey - Focused rowKey
       * @property {Object} columnName - Focused column name
       */
      this.props.eventBus.trigger('keydown', gridEvent);

      if (!gridEvent.isStopped()) {
        const isEditable =
          keyStroke === 'enter' &&
          this.context.store &&
          this.context.store.column.allColumnMap[columnName ?? ''].editor;

        this.dispatchKeyboardEvent(
          type,
          keyStroke === 'enter' && moveDirectionOnEnter && !isEditable
            ? moveDirectionOnEnter
            : command
        );
      }
    }
  };

  private onCopy = (ev: ClipboardEvent) => {
    if (!this.el) {
      return;
    }
    const text = this.el.textContent!;
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
      const { navigating, editing, filtering } = this.props;

      if (
        this.el &&
        navigating &&
        !filtering &&
        !editing &&
        !this.isClipboardFocused() &&
        !isMobile()
      ) {
        // @TODO: apply polifyll or alternative for IE, safari
        this.el.focus({ preventScroll: true });
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

export const Clipboard = connect<StoreProps>(({ focus, filterLayerState, id }) => ({
  navigating: focus.navigating,
  rowKey: focus.rowKey,
  columnName: focus.columnName,
  editing: !!focus.editingAddress,
  filtering: !!filterLayerState.activeColumnAddress,
  eventBus: getEventBus(id),
  moveDirectionOnEnter: focus.moveDirectionOnEnter,
}))(ClipboardComp);
