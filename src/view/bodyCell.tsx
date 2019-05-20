import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { ColumnInfo, ViewRow, CellRenderData, RowKey } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellRenderer } from '../renderer/types';
import { getInstance } from '../instance';
import { isRowHeader } from '../helper/column';
import Grid from '../grid';

interface OwnProps {
  viewRow: ViewRow;
  columnName: string;
}

interface StoreProps {
  grid: Grid;
  rowKey: RowKey;
  columnInfo: ColumnInfo;
  renderData: CellRenderData;
}

type Props = OwnProps & StoreProps & DispatchProps;

export class BodyCellComp extends Component<Props> {
  private renderer!: CellRenderer;

  private el!: HTMLElement;

  public componentDidMount() {
    const { grid, rowKey, renderData, columnInfo } = this.props;

    // eslint-disable-next-line new-cap
    this.renderer = new columnInfo.renderer({ grid, rowKey, columnInfo, ...renderData });
    this.el.appendChild(this.renderer.getElement());

    if (this.renderer.mounted) {
      this.renderer.mounted(this.el);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.props.renderData !== nextProps.renderData && this.renderer && this.renderer.changed) {
      const { grid, rowKey, renderData, columnInfo } = nextProps;
      this.renderer.changed({ grid, rowKey, columnInfo, ...renderData });
    }
  }

  public render() {
    const {
      rowKey,
      renderData: { editable },
      columnInfo: { align, valign, name }
    } = this.props;

    const style = {
      textAlign: align,
      ...(valign && { verticalAlign: valign })
    };
    const attrs: Attributes = {
      'data-row-key': String(rowKey),
      'data-column-name': name
    };

    return (
      <td
        {...attrs}
        style={style}
        class={cls(
          'cell',
          'cell-has-input',
          [editable, 'cell-editable'],
          [isRowHeader(name), 'cell-row-head']
        )}
        ref={(el) => {
          this.el = el;
        }}
      />
    );
  }
}

export const BodyCell = connect<StoreProps, OwnProps>(({ id, column }, { viewRow, columnName }) => {
  const { rowKey, valueMap } = viewRow;
  const grid = getInstance(id);
  const columnInfo = column.allColumnMap[columnName];

  return {
    grid,
    rowKey,
    columnInfo,
    renderData: valueMap[columnName]
  };
})(BodyCellComp);
