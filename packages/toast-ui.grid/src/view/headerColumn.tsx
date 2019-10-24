import { h, Component } from 'preact';
import { cls } from '../helper/dom';
import { HeaderCheckbox } from './headerCheckbox';
import { SortingButton } from './sortingButton';
import { SortingOrder } from './sortingOrder';
import { FilterButton } from './filterButton';
import { isRowHeader, isCheckboxColumn } from '../helper/column';
import { HeaderRenderer, HeaderColumnInfo } from '../renderer/types';
import Grid from '../grid';

interface OwnProps {
  columnInfo: HeaderColumnInfo;
  selected: boolean;
  grid: Grid;
  colspan?: number;
  rowspan?: number;
  height?: number;
}

type Props = OwnProps;

export class HeaderColumn extends Component<Props> {
  private el?: HTMLElement;

  private renderer?: HeaderRenderer;

  public componentDidMount() {
    const { columnInfo, grid } = this.props;
    const { headerRenderer } = columnInfo;

    if (headerRenderer && this.el) {
      const HeaderRendererClass$ = headerRenderer;
      const renderer: HeaderRenderer = new HeaderRendererClass$({ grid, columnInfo });
      const rendererEl = renderer.getElement();

      if (renderer && rendererEl) {
        this.el.appendChild(rendererEl);
        this.renderer = renderer;
      }
    }
  }

  public componentWillUnmount() {
    if (this.renderer && this.renderer.beforeDestroy) {
      this.renderer.beforeDestroy();
    }
  }

  public render() {
    const { columnInfo, colspan, rowspan, selected, height } = this.props;
    const {
      name,
      header,
      sortable,
      headerAlign: textAlign,
      headerVAlign: verticalAlign,
      sortingType,
      filter,
      headerRenderer
    } = columnInfo;

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
        {!headerRenderer && (isCheckboxColumn(name) ? <HeaderCheckbox /> : header)}
        {!headerRenderer && !!sortable && (
          <SortingButton columnName={name} sortingType={sortingType} />
        )}
        {!headerRenderer && !!sortable && <SortingOrder columnName={name} />}
        {!headerRenderer && !!filter && <FilterButton columnName={name} />}
      </th>
    );
  }
}
