import { h, Component } from 'preact';
import { cls, Attributes } from '../helper/dom';
import { ColumnInfo, ViewRow, CellRenderData, RowKey } from '../store/types';
import { connect } from './hoc';
import { DispatchProps } from '../dispatch/create';
import { CellRenderer } from '../renderer/types';
import { get as getInstance } from '../instance';
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
    if (this.props.renderData !== nextProps.renderData) {
      if (this.renderer && this.renderer.changed) {
        const { grid, rowKey, renderData, columnInfo } = nextProps;
        this.renderer.changed({ grid, rowKey, columnInfo, ...renderData });
      }
    }
  }

  public render() {
    const { rowKey, columnInfo } = this.props;
    const editable = !!columnInfo.editor;
    const style = { textAlign: columnInfo.align };
    const isRowHeader = columnInfo.name === '_number';

    const attrs: Attributes = {
      'data-row-key': String(rowKey),
      'data-column-name': columnInfo.name
    };

    return (
      <td
        {...attrs}
        style={style}
        class={cls(
          'cell',
          'cell-has-input',
          [editable, 'cell-editable'],
          [isRowHeader, 'cell-row-head']
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
