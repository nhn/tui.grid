import { Component, h } from 'preact';
import { cls } from '../helper/dom';
import { HeaderCheckbox } from './headerCheckbox';
import { SortingButton } from './sortingButton';
import { SortingOrder } from './sortingOrder';
import { FilterButton } from './filterButton';
import { isCheckboxColumn, isRowHeader } from '../helper/column';
import { ColumnHeaderInfo, HeaderRenderer } from '@t/renderer';
import Grid from '../grid';
import { isFunction } from '../helper/common';
import { isDraggableColumn } from '../query/column';

interface OwnProps {
  columnInfo: ColumnHeaderInfo;
  selected: boolean;
  grid: Grid;
  colspan?: number;
  rowspan?: number;
  height?: number;
}

type Props = OwnProps;

export class ColumnHeader extends Component<Props> {
  private el?: HTMLElement;

  private renderer?: HeaderRenderer;

  private getElement(type: string) {
    const { columnInfo } = this.props;
    const {
      name,
      sortable,
      sortingType,
      filter,
      headerRenderer,
      header,
      customHeader,
    } = columnInfo;

    if (headerRenderer) {
      return null;
    }

    switch (type) {
      case 'checkbox': {
        if (isCheckboxColumn(name)) {
          return <HeaderCheckbox />;
        }

        if (this.el && customHeader) {
          this.el.appendChild(customHeader);

          return null;
        }

        return header;
      }

      case 'sortingBtn':
        return sortable && <SortingButton columnName={name} sortingType={sortingType} />;
      case 'sortingOrder':
        return sortable && <SortingOrder columnName={name} />;
      case 'filter':
        return filter && <FilterButton columnName={name} />;
      default:
        return null;
    }
  }

  public componentDidMount() {
    const { columnInfo, grid } = this.props;
    const { headerRenderer } = columnInfo;

    if (!headerRenderer || !this.el) {
      return;
    }

    const HeaderRendererClass = headerRenderer;
    const renderer = new HeaderRendererClass({ grid, columnInfo });
    const rendererEl = renderer.getElement();

    this.el.appendChild(rendererEl);
    this.renderer = renderer;

    if (isFunction(renderer.mounted)) {
      renderer.mounted(this.el);
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (this.renderer) {
      this.renderer.render({ columnInfo: nextProps.columnInfo, grid: nextProps.grid });
    }
  }

  public componentWillUnmount() {
    if (this.renderer && isFunction(this.renderer.beforeDestroy)) {
      this.renderer.beforeDestroy();
    }
  }

  public render() {
    const { columnInfo, colspan, rowspan, selected, height = null } = this.props;
    const {
      name,
      headerAlign: textAlign,
      headerVAlign: verticalAlign,
      headerRenderer,
    } = columnInfo;

    return (
      <th
        ref={(el) => {
          this.el = el;
        }}
        data-column-name={name}
        style={{ textAlign, verticalAlign, padding: headerRenderer ? 0 : null, height }}
        class={cls(
          'cell',
          'cell-header',
          [!isRowHeader(name) && selected, 'cell-selected'],
          [isRowHeader(name), 'cell-row-header'],
          [isDraggableColumn(this.context.store, name) && !isRowHeader(name), 'header-draggable']
        )}
        {...(!!colspan && { colspan })}
        {...(!!rowspan && { rowspan })}
      >
        {['checkbox', 'sortingBtn', 'sortingOrder', 'filter'].map((type) => this.getElement(type))}
      </th>
    );
  }
}
