import { h, Component } from 'preact';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import {
  ColumnInfo,
  Dictionary,
  EditingAddress,
  Rect,
  RowKey,
  Side,
  ViewRow
} from '../store/types';
import { cls } from '../helper/dom';
import { getKeyStrokeString, TabCommandType } from '../helper/keyboard';
import { CellEditor, CellEditorClass, CellEditorProps } from '../editor/types';
import { findProp, isFunction, isNull } from '../helper/common';
import { getInstance } from '../instance';
import Grid from '../grid';

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
}

interface OwnProps {
  side: Side;
}

type Props = StoreProps & OwnProps & DispatchProps;

export class EditingLayerComp extends Component<Props> {
  private editor?: CellEditor;

  private contentEl?: HTMLElement;

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
        this.finishEditing(true);
        break;
      case 'esc':
        this.finishEditing(false);
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

  private finishEditing(save: boolean) {
    const { dispatch, editingAddress, active } = this.props;

    if (this.editor && active) {
      const { rowKey, columnName } = editingAddress!;
      const value = this.editor.getValue();
      if (save) {
        dispatch('setValue', rowKey, columnName, value);
      }
      if (isFunction(this.editor.beforeDestroy)) {
        this.editor.beforeDestroy();
      }
      dispatch('finishEditing', rowKey, columnName, value);
    }
  }

  private createEditor() {
    const { allColumnMap, filteredViewData, editingAddress, grid, cellPosRect } = this.props;

    const { rowKey, columnName } = editingAddress!;
    const { right, left } = cellPosRect!;
    const columnInfo = allColumnMap[columnName];
    const value = findProp('rowKey', rowKey, filteredViewData)!.valueMap[columnName].value;
    const EditorClass: CellEditorClass = columnInfo.editor!.type;
    const editorProps: CellEditorProps = { grid, rowKey, columnInfo, value, width: right - left };
    const cellEditor: CellEditor = new EditorClass(editorProps);
    const editorEl = cellEditor.getElement();

    if (editorEl && this.contentEl) {
      this.contentEl.appendChild(editorEl);
      this.editor = cellEditor;

      const editorWidth = editorEl.getBoundingClientRect().width;
      const width = right - left;

      if (editorWidth > width) {
        const CELL_PADDING_WIDTH = 10;
        (this.contentEl as HTMLElement).style.width = `${editorWidth + CELL_PADDING_WIDTH}px`;
      }

      if (isFunction(cellEditor.mounted)) {
        cellEditor.mounted();
      }
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (!prevProps.active && this.props.active) {
      this.createEditor();
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    const {
      focusedColumnName: prevFocusedColumnName,
      focusedRowKey: prevFocusedRowKey,
      active: prevActive
    } = this.props;
    const { focusedColumnName, focusedRowKey, active, forcedDestroyEditing } = nextProps;

    if (
      (prevActive && !active && forcedDestroyEditing) ||
      (prevActive &&
        (focusedColumnName !== prevFocusedColumnName || focusedRowKey !== prevFocusedRowKey))
    ) {
      this.finishEditing(true);
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
      height: height + cellBorderWidth,
      lineHeight: `${height}px`
    };

    return (
      <div
        style={editorStyles}
        className={cls('layer-editing', 'cell-content', 'cell-content-editor')}
        onKeyDown={this.handleKeyDown}
        ref={el => {
          this.contentEl = el;
        }}
      />
    );
  }
}

export const EditingLayer = connect<StoreProps, OwnProps>((store, { side }) => {
  const { data, column, id, focus, dimension } = store;
  const {
    editingAddress,
    side: focusSide,
    rowKey: focusedRowKey,
    columnName: focusedColumnName,
    forcedDestroyEditing,
    cellPosRect
  } = focus;

  return {
    grid: getInstance(id),
    active: side === focusSide && !isNull(editingAddress),
    focusedRowKey,
    focusedColumnName,
    forcedDestroyEditing,
    cellPosRect,
    cellBorderWidth: dimension.cellBorderWidth,
    editingAddress,
    filteredViewData: data.filteredViewData,
    allColumnMap: column.allColumnMap
  };
}, true)(EditingLayerComp);
