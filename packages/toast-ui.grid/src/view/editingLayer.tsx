import { h, Component } from 'preact';
import { RowKey, ViewRow } from '@t/store/data';
import { Dictionary } from '@t/options';
import { ColumnInfo } from '@t/store/column';
import { EditingAddress, Rect, Side } from '@t/store/focus';
import { CellEditor } from '@t/editor';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { cls } from '../helper/dom';
import { getKeyStrokeString, TabCommandType } from '../helper/keyboard';
import { findProp, isNull } from '../helper/common';
import { getInstance } from '../instance';
import Grid from '../grid';

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
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

  private initBodyScrollPos: InitBodyScroll = { initBodyScrollTop: 0, initBodyScrollLeft: 0 };

  private moveTabFocus(ev: KeyboardEvent, command: TabCommandType) {
    const { dispatch } = this.props;

    ev.preventDefault();
    dispatch('moveTabFocus', command);
    dispatch('setScrollToFocus');
  }

  private handleKeyDown = (ev: KeyboardEvent) => {
    const keyName = getKeyStrokeString(ev);

    switch (keyName) {
      case 'enter':
        this.saveAndFinishEditing(true);
        break;
      case 'esc':
        this.cancelEditing();
        break;
      case 'tab':
        this.moveTabFocus(ev, 'nextCell');
        break;
      case 'shift-tab':
        this.moveTabFocus(ev, 'prevCell');
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

  private saveAndFinishEditing(triggeredByKey = false) {
    const { dispatch, active } = this.props;

    if (this.editor && active) {
      const { rowKey, columnName, value } = this.getEditingCellInfo();

      dispatch('setValue', rowKey, columnName, value);
      dispatch('finishEditing', rowKey, columnName, value, { save: true, triggeredByKey });
    }
  }

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
    const { right, left } = cellPosRect!;
    const columnInfo = allColumnMap[columnName];
    const { value, formattedValue } = findProp('rowKey', rowKey, filteredViewData)!.valueMap[
      columnName
    ]!;
    const EditorClass = columnInfo.editor!.type;
    const editorProps = {
      grid,
      rowKey,
      columnInfo,
      value,
      formattedValue,
      width: right - left,
      portalEditingKeydown: this.handleKeyDown,
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

    if (prevActive && !active) {
      // eslint-disable-next-line no-unused-expressions
      this.editor?.beforeDestroy?.();
    }

    if (
      (prevActive && !active && forcedDestroyEditing) ||
      (prevActive &&
        (focusedColumnName !== prevFocusedColumnName || focusedRowKey !== prevFocusedRowKey))
    ) {
      this.saveAndFinishEditing();
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
  };
}, true)(EditingLayerComp);
