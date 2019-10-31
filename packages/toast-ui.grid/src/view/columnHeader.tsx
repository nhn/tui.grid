import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { HeaderCheckbox } from './headerCheckbox';
import { SortingButton } from './sortingButton';
import { SortingOrder } from './sortingOrder';
import { FilterButton } from './filterButton';
import { isRowHeader, isCheckboxColumn } from '../helper/column';
import { HeaderRenderer, ColumnHeaderInfo } from '../renderer/types';
import Grid from '../grid';
import { isFunction } from '../helper/common';

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
      headerColSpan
    } = columnInfo;

    if (headerRenderer) {
      return null;
    }

    switch (type) {
      case 'checkbox':
        return isCheckboxColumn(name) ? <HeaderCheckbox /> : header;
      case 'sortingBtn':
        return (
          !headerColSpan &&
          sortable && <SortingButton columnName={name} sortingType={sortingType} />
        );
      case 'sortingOrder':
        return !headerColSpan && sortable && <SortingOrder columnName={name} />;
      case 'filter':
        return !headerColSpan && filter && <FilterButton columnName={name} />;
      default:
        return null;
    }
  }

  public componentDidMount() {
    const { columnInfo, grid } = this.props;
    const { headerRenderer: HeaderRendererClass } = columnInfo;

    if (!HeaderRendererClass || !this.el) {
      return;
    }

    const renderer = new HeaderRendererClass({ grid, columnInfo });
    const rendererEl = renderer.getElement();

    this.el.appendChild(rendererEl);
    this.renderer = renderer;

    if (isFunction(renderer.mounted)) {
      renderer.mounted(this.el);
    }
  }

  public componentWillUnmount() {
    if (this.renderer && isFunction(this.renderer.beforeDestroy)) {
      this.renderer.beforeDestroy();
    }
  }

  public render() {
    const { columnInfo, colspan: colspanCount, rowspan, selected, height } = this.props;
    const {
      name,
      headerAlign: textAlign,
      headerVAlign: verticalAlign,
      headerRenderer,
      headerColSpan
    } = columnInfo;

    if (headerColSpan && !headerColSpan.mainColumn) {
      return null;
    }

    const colspan = (headerColSpan && headerColSpan.spanCount) || colspanCount;

    return (
      <th
        ref={el => {
          this.el = el;
        }}
        data-column-name={name}
        style={{ textAlign, verticalAlign, padding: headerRenderer ? 0 : null, height }}
        class={cls(
          'cell',
          'cell-header',
          [!isRowHeader(name) && selected, 'cell-selected'],
          [isRowHeader(name), 'cell-row-header']
        )}
        {...!!colspan && { colspan }}
        {...!!rowspan && { rowspan }}
      >
        {['checkbox', 'sortingBtn', 'sortingOrder', 'filter'].map(type => this.getElement(type))}
      </th>
    );
  }
}
