import { h, Component } from 'preact';
import { TreeCellContents } from './treeCellContents';
import {
  ColumnInfo,
  ViewRow,
  CellRenderData,
  RowKey,
  TreeCellInfo,
  Data,
  Column
} from '../store/types';
import { cls, setCursorStyle, getCoordinateWithOffset, dataAttr } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellRenderer } from '../renderer/types';
import { getInstance } from '../instance';
import { isRowHeader, isRowNumColumn } from '../helper/column';
import Grid from '../grid';
import { findIndexByRowKey } from '../query/data';
import { setCellHeight } from '../helper/cellHeightMap';

interface OwnProps {
  viewRow: ViewRow;
  columnInfo: ColumnInfo;
  refreshRowHeight: Function | null;
  rowSpanAttr: { rowSpan: number } | null;
}

interface StoreProps {
  grid: Grid;
  rowKey: RowKey;
  rowIndex: number;
  defaultRowHeight: number;
  columnInfo: ColumnInfo;
  renderData: CellRenderData;
  disabled: boolean;
  treeInfo?: TreeCellInfo;
  selectedRow: boolean;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  private renderer!: CellRenderer;

  private el!: HTMLElement;

  public componentDidMount() {
    const {
      grid,
      rowKey,
      rowIndex,
      renderData,
      columnInfo,
      refreshRowHeight,
      disabled: allDisabled,
      defaultRowHeight
    } = this.props;

    // eslint-disable-next-line new-cap
    this.renderer = new columnInfo.renderer.type({
      grid,
      rowKey,
      columnInfo,
      ...renderData,
      allDisabled
    });
    const rendererEl = this.renderer.getElement();
    this.el.appendChild(rendererEl);

    if (this.renderer.mounted) {
      this.renderer.mounted(this.el);
    }

    if (refreshRowHeight) {
      // In Preact, the componentDidMount is called before the DOM elements are actually mounted.
      // https://github.com/preactjs/preact/issues/648
      // Use setTimeout to wait until the DOM element is actually mounted
      //  - If the width of grid is 'auto' actual width of grid is calculated from the
      //    Container component using setTimeout(fn, 0)
      //  - Delay 16ms for defer the function call later than the Container component.
      window.setTimeout(() => {
        const { cellHeightMap } = this.context;
        const height = rendererEl.clientHeight;
        setCellHeight(cellHeightMap, columnInfo.name, rowIndex, height, defaultRowHeight);
        refreshRowHeight(height);
      }, 16);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (
      (this.props.renderData !== nextProps.renderData ||
        this.props.disabled !== nextProps.disabled) &&
      this.renderer &&
      this.renderer.render
    ) {
      const {
        grid,
        rowKey,
        rowIndex,
        renderData,
        columnInfo,
        refreshRowHeight,
        defaultRowHeight,
        disabled: allDisabled
      } = nextProps;

      this.renderer.render({
        grid,
        rowKey,
        columnInfo,
        ...renderData,
        allDisabled
      });

      if (refreshRowHeight) {
        const { cellHeightMap } = this.context;
        const height = this.renderer.getElement().clientHeight;
        setCellHeight(cellHeightMap, columnInfo.name, rowIndex, height, defaultRowHeight);
        refreshRowHeight(height);
      }
    }
  }

  private handleMouseMove = (ev: MouseEvent) => {
    const [pageX, pageY] = getCoordinateWithOffset(ev.pageX, ev.pageY);
    this.props.dispatch('dragMoveRowHeader', { pageX, pageY });
  };

  private handleMouseDown = (name: string, rowKey: RowKey) => {
    if (!isRowNumColumn(name)) {
      return;
    }

    this.props.dispatch('mouseDownRowHeader', rowKey);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.clearDocumentEvents);
    document.addEventListener('selectstart', this.handleSelectStart);
  };

  private clearDocumentEvents = () => {
    this.props.dispatch('dragEnd');

    setCursorStyle('');
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.clearDocumentEvents);
    document.removeEventListener('selectstart', this.handleSelectStart);
  };

  private handleSelectStart = (ev: Event) => {
    ev.preventDefault();
  };

  public render() {
    const {
      rowKey,
      renderData: { disabled, editable, invalidState, className },
      columnInfo: { align, valign, name, validation = {} },
      disabled: allDisabled,
      treeInfo,
      selectedRow,
      rowSpanAttr
    } = this.props;

    const style = {
      textAlign: align,
      ...(valign && { verticalAlign: valign })
    };
    const attrs = {
      [dataAttr.ROW_KEY]: String(rowKey),
      [dataAttr.COLUMN_NAME]: name
    };
    const classNames = `${cls(
      'cell',
      'cell-has-input',
      [editable, 'cell-editable'],
      [isRowHeader(name), 'cell-row-header'],
      [validation.required || false, 'cell-required'],
      [!!invalidState, 'cell-invalid'],
      [disabled || allDisabled, 'cell-disabled'],
      [!!treeInfo, 'cell-has-tree'],
      [isRowHeader(name) && selectedRow, 'cell-selected']
    )} ${className}`;

    return treeInfo ? (
      <td {...attrs} style={style} class={classNames}>
        <div class={cls('tree-wrapper-relative')}>
          <div
            class={cls('tree-wrapper-valign-center')}
            style={{ paddingLeft: treeInfo.indentWidth }}
            ref={el => {
              this.el = el;
            }}
          >
            <TreeCellContents treeInfo={treeInfo} rowKey={rowKey} />
          </div>
        </div>
      </td>
    ) : (
      <td
        {...attrs}
        {...rowSpanAttr}
        style={style}
        class={classNames}
        ref={el => {
          this.el = el;
        }}
        onMouseDown={() => this.handleMouseDown(name, rowKey)}
      />
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>(
  ({ id, column, data, selection, dimension }, { viewRow, columnInfo }) => {
    const { rowKey, valueMap, treeInfo } = viewRow;
    const { treeColumnName } = column;
    const { disabled } = data;
    const grid = getInstance(id);
    const { range } = selection;
    const columnName = columnInfo.name;
    const rowIndex = findIndexByRowKey(data as Data, column as Column, id, rowKey);
    const { rowHeight: defaultRowHeight } = dimension;

    return {
      grid,
      rowKey,
      rowIndex,
      disabled,
      columnInfo,
      defaultRowHeight,
      renderData: valueMap[columnName],
      ...(columnName === treeColumnName ? { treeInfo } : null),
      selectedRow: range ? rowIndex >= range.row[0] && rowIndex <= range.row[1] : false
    };
  }
)(BodyCellComp);
