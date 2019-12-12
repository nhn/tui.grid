import { h, Component } from 'preact';
import { TreeCellContents } from './treeCellContents';
import { ColumnInfo, ViewRow, CellRenderData, RowKey, TreeCellInfo } from '../store/types';
import { cls, setCursorStyle, getCoordinateWithOffset, dataAttr } from '../helper/dom';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellRenderer } from '../renderer/types';
import { getInstance } from '../instance';
import { isRowHeader, isRowNumColumn } from '../helper/column';
import Grid from '../grid';
import { isEmpty, isFunction } from '../helper/common';

interface OwnProps {
  viewRow: ViewRow;
  columnInfo: ColumnInfo;
  refreshRowHeight: Function | null;
  rowSpanAttr: { rowSpan: number } | null;
  rowIndex: number;
}

interface StoreProps {
  grid: Grid;
  rowKey: RowKey;
  defaultRowHeight: number;
  columnInfo: ColumnInfo;
  renderData: CellRenderData;
  disabled: boolean;
  treeInfo?: TreeCellInfo;
  selectedRow: boolean;
  cellBorderWidth: number;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  private renderer!: CellRenderer;

  private el!: HTMLElement;

  public componentDidMount() {
    const { grid, rowKey, renderData, columnInfo, disabled: allDisabled } = this.props;

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
    this.calculateRowHeight(this.props);
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (
      (this.props.renderData !== nextProps.renderData ||
        this.props.disabled !== nextProps.disabled) &&
      this.renderer &&
      this.renderer.render
    ) {
      const { grid, rowKey, renderData, columnInfo, disabled: allDisabled } = nextProps;

      this.renderer.render({
        grid,
        rowKey,
        columnInfo,
        ...renderData,
        allDisabled
      });
      this.calculateRowHeight(nextProps);
    }
  }

  public componentWillUnmount() {
    if (this.renderer && isFunction(this.renderer.beforeDestroy)) {
      this.renderer.beforeDestroy();
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

  private calculateRowHeight(props: Props) {
    const {
      rowIndex,
      columnInfo,
      refreshRowHeight,
      defaultRowHeight,
      dispatch,
      cellBorderWidth
    } = props;

    if (refreshRowHeight) {
      // In Preact, the componentDidMount is called before the DOM elements are actually mounted.
      // https://github.com/preactjs/preact/issues/648
      // Use setTimeout to wait until the DOM element is actually mounted
      //  - If the width of grid is 'auto' actual width of grid is calculated from the
      //    Container component using setTimeout(fn, 0)
      //  - Delay 16ms for defer the function call later than the Container component.
      window.setTimeout(() => {
        const height = this.renderer.getElement().clientHeight + cellBorderWidth;
        dispatch('setCellHeight', columnInfo.name, rowIndex, height, defaultRowHeight);
        refreshRowHeight(height);
      }, 16);
    }
  }

  public render() {
    const {
      rowKey,
      renderData: { disabled, editable, invalidStates, className },
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
      [!!invalidStates.length, 'cell-invalid'],
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
  ({ id, column, data, selection, dimension }, { viewRow, columnInfo, rowIndex }) => {
    const { rowKey, valueMap, treeInfo } = viewRow;
    const { treeColumnName } = column;
    const { disabled, pageOptions } = data;
    const grid = getInstance(id);
    const { range } = selection;
    const columnName = columnInfo.name;
    const { rowHeight: defaultRowHeight, cellBorderWidth } = dimension;
    const rowIndexWithPage = isEmpty(pageOptions) ? rowIndex : rowIndex % pageOptions.perPage;

    return {
      grid,
      rowKey,
      disabled,
      columnInfo,
      defaultRowHeight,
      renderData: (valueMap && valueMap[columnName]) || { invalidStates: [] },
      ...(columnName === treeColumnName ? { treeInfo } : null),
      selectedRow: range
        ? rowIndexWithPage >= range.row[0] && rowIndexWithPage <= range.row[1]
        : false,
      cellBorderWidth
    };
  }
)(BodyCellComp);
