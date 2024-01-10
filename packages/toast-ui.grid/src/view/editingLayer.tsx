import { Component, h } from 'preact';
import { RowKey, ViewRow } from '@t/store/data';
import { Dictionary } from '@t/options';
import { ColumnInfo } from '@t/store/column';
import { EditingAddress, Rect, Side } from '@t/store/focus';
import { CellEditor } from '@t/editor';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls, getTextWidth } from '../helper/dom';
import { EnterCommandType, getKeyStrokeString, TabCommandType } from '../helper/keyboard';
import { findProp, getLongestText, isNil, isNull, isUndefined } from '../helper/common';
import { getInstance } from '../instance';
import Grid from '../grid';
import { getListItems } from '../helper/editor';
import {
  HORIZONTAL_PADDING_OF_CELL,
  TEXT_EDITOR_MAX_HEIGHT,
  VERTICAL_PADDING_OF_CELL,
} from '../helper/constant';

interface InitBodyScroll {
  initBodyScrollTop: number;
  initBodyScrollLeft: number;
}

interface StoreProps {
  active: boolean;
  grid: Grid;
  focusedColumnName: string | null;
  focusedRowKey: RowKey | null;
  forcedDestroyEditing: boolean;
  cellBorderWidth: number;
  filteredViewData: ViewRow[];
  allColumnMap: Dictionary<ColumnInfo>;
  editingAddress: EditingAddress;
  cellPosRect?: Rect | null;
  bodyScrollTop: number;
  bodyScrollLeft: number;
  bodyHeight: number;
  bodyWidth: number;
  headerHeight: number;
  leftSideWidth: number;
  moveDirectionOnEnter?: EnterCommandType;
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  private initBodyScrollPos: InitBodyScroll = { initBodyScrollTop: 0, initBodyScrollLeft: 0 };

  private longestTextWidths: { [columnName: string]: number } = {};

  private moveTabAndEnterFocus(
    ev: KeyboardEvent,
    command: TabCommandType | EnterCommandType,
    moveFocusByEnter = false
  ) {
    const { dispatch } = this.props;

    ev.preventDefault();
    dispatch('moveTabAndEnterFocus', command, moveFocusByEnter);
    dispatch('setScrollToFocus');
  }

  private handleKeyDown = (ev: KeyboardEvent) => {
    const { moveDirectionOnEnter } = this.props;
    const keyName = getKeyStrokeString(ev);

    switch (keyName) {
      case 'enter':
        if (isUndefined(moveDirectionOnEnter)) {
          this.saveAndFinishEditing(true);
        } else {
          this.moveTabAndEnterFocus(ev, moveDirectionOnEnter, true);
        }
        break;
      case 'esc':
        this.cancelEditing();
        break;
      case 'tab':
        this.moveTabAndEnterFocus(ev, 'nextCell');
        break;
      case 'shift-tab':
        this.moveTabAndEnterFocus(ev, 'prevCell');
        break;
      default:
      // do nothing;
    }
  };

  private getEditingCellInfo() {
    const { rowKey, columnName } = this.props.editingAddress!;
    const value = this.editor!.getValue();

    return { rowKey, columnName, value };
  }

  private cancelEditing() {
    const { rowKey, columnName, value } = this.getEditingCellInfo();

    this.props.dispatch('finishEditing', rowKey, columnName, value, {
      save: false,
      triggeredByKey: true,
    });
  }

  private saveAndFinishEditing = (triggeredByKey = false) => {
    const { dispatch, active } = this.props;

    if (this.editor && active) {
      const { rowKey, columnName, value } = this.getEditingCellInfo();

      dispatch('setValue', rowKey, columnName, value);
      dispatch('finishEditing', rowKey, columnName, value, { save: true, triggeredByKey });
    }
  };

  private setInitScrollPos() {
    const { bodyScrollTop, bodyScrollLeft } = this.props;

    this.initBodyScrollPos = {
      initBodyScrollTop: bodyScrollTop,
      initBodyScrollLeft: bodyScrollLeft,
    };
  }

  private createEditor() {
    const { allColumnMap, filteredViewData, editingAddress, grid, cellPosRect } = this.props;

    const { rowKey, columnName } = editingAddress!;
    const { right, left, top, bottom } = cellPosRect!;
    const columnInfo = allColumnMap[columnName];
    const { value, formattedValue } = findProp('rowKey', rowKey, filteredViewData)!.valueMap[
      columnName
    ]!;
    const EditorClass = columnInfo.editor!.type;
    const height = Math.min(bottom - top - VERTICAL_PADDING_OF_CELL, TEXT_EDITOR_MAX_HEIGHT);
    const width = Math.max(
      right - left - HORIZONTAL_PADDING_OF_CELL,
      this.longestTextWidths[columnName] ?? 0
    );
    const editorProps = {
      grid,
      rowKey,
      columnInfo,
      value,
      formattedValue,
      height,
      width,
      portalEditingKeydown: this.handleKeyDown,
      instantApplyCallback: this.saveAndFinishEditing,
    };
    const cellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      if (cellEditor.mounted) {
        // To access the actual mounted DOM elements
        setTimeout(() => {
          cellEditor.mounted!();
          this.setInitScrollPos();
        });
      }
    }
  }

  public componentDidMount() {
    const { allColumnMap, grid } = this.props;
    const dummyCellEditorProps = {
      grid,
      rowKey: 0,
      value: 0,
      formattedValue: '0',
      width: 0,
      portalEditingKeydown: this.handleKeyDown,
      instantApplyCallback: () => {},
    };

    const bodyArea = document.querySelector(
      `.${cls('rside-area')} .${cls('body-container')} .${cls('table')}`
    ) as HTMLElement;

    Object.keys(allColumnMap).forEach((columnName) => {
      const columnInfo = allColumnMap[columnName];
      if (columnInfo.editor) {
        const listItems = getListItems({ columnInfo, ...dummyCellEditorProps });

        if (!isNil(listItems)) {
          const longestItem = getLongestText(listItems.map((item) => item.text));
          this.longestTextWidths[columnName] =
            getTextWidth(longestItem, bodyArea) + HORIZONTAL_PADDING_OF_CELL;
        }
      }
    });
  }

  public componentDidUpdate(prevProps: Props) {
    const {
      active,
      editingAddress,
      focusedColumnName,
      bodyHeight,
      bodyWidth,
      bodyScrollTop,
      bodyScrollLeft,
      headerHeight,
      leftSideWidth,
    } = this.props;

    if (!prevProps.active && active && editingAddress?.columnName === focusedColumnName) {
      this.createEditor();
    }

    if (this.editor?.moveDropdownLayer) {
      this.editor.moveDropdownLayer({
        bodyHeight,
        bodyWidth,
        bodyScrollTop,
        bodyScrollLeft,
        headerHeight,
        leftSideWidth,
        ...this.initBodyScrollPos,
      });
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      focusedColumnName: prevFocusedColumnName,
      focusedRowKey: prevFocusedRowKey,
      active: prevActive,
    } = this.props;
    const { focusedColumnName, focusedRowKey, active, forcedDestroyEditing } = nextProps;

    if (
      (prevActive && !active && forcedDestroyEditing) ||
      (prevActive &&
        (focusedColumnName !== prevFocusedColumnName || focusedRowKey !== prevFocusedRowKey))
    ) {
      this.saveAndFinishEditing();
    }

    if (
      this.editor &&
      prevActive &&
      !active &&
      (isUndefined(this.editor.isMounted) || this.editor.isMounted)
    ) {
      // eslint-disable-next-line no-unused-expressions
      this.editor.beforeDestroy?.();
    }
  }

  public render({ active, cellPosRect, cellBorderWidth }: Props) {
    if (!active) {
      return null;
    }

    const { top, left, right, bottom } = cellPosRect!;
    const height = bottom - top;
    const width = right - left;

    const editorStyles = {
      top: top ? top : cellBorderWidth,
      left,
      width: width + cellBorderWidth,
      height: top ? height + cellBorderWidth : height,
      lineHeight: top ? `${height - cellBorderWidth}px` : `${height - cellBorderWidth * 2}px`,
    };

    return (
      <div
        style={editorStyles}
        className={cls('layer-editing', 'cell-content', 'cell-content-editor')}
        onKeyDown={this.handleKeyDown}
        ref={(el) => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const EditingLayer = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, column, id, focus, dimension, viewport, columnCoords } = store;
  const {
    editingAddress,
    side: focusSide,
    rowKey: focusedRowKey,
    columnName: focusedColumnName,
    forcedDestroyEditing,
    cellPosRect,
    moveDirectionOnEnter,
  } = focus;
  const { scrollTop, scrollLeft } = viewport;
  const {
    cellBorderWidth,
    bodyHeight,
    width,
    scrollXHeight,
    scrollYWidth,
    headerHeight,
  } = dimension;

  return {
    grid: getInstance(id),
    active: side === focusSide && !isNull(editingAddress),
    focusedRowKey,
    focusedColumnName,
    forcedDestroyEditing,
    cellPosRect,
    cellBorderWidth,
    editingAddress,
    filteredViewData: data.filteredViewData,
    allColumnMap: column.allColumnMap,
    bodyScrollTop: scrollTop,
    bodyScrollLeft: scrollLeft,
    bodyHeight: bodyHeight - scrollXHeight,
    bodyWidth: width - scrollYWidth,
    headerHeight,
    leftSideWidth: side === 'L' ? 0 : columnCoords.areaWidth.L,
    moveDirectionOnEnter,
  };
}, true)(EditingLayerComp);
