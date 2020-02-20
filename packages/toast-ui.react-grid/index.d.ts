import {HTMLAttributes, Component} from "react";
import TuiGrid, {GridOptions, EventCallback} from 'tui-grid';

type EventNameMapping = {
  onClick: 'click';
  onDblclick : 'dblclick';
  onMousedown :  'mousedown';
  onMouseover : 'mouseover';
  onMouseout : 'mouseout';
  onFocusChange : 'focusChange';
  onColumnResize: 'columnResize';
  onCheck: 'check';
  onUncheck: 'uncheck';
  onCheckAll: 'checkAll';
  onUncheckAll: 'uncheckAll';
  onSelection: 'selection';
  onEditingStart: 'editingStart';
  onEditingFinish: 'editingFinish';
  onSort : 'sort';
  onFilter : 'filter';
  onScrollEnd : 'scrollEnd';
  onBeforeRequest : 'beforeRequest';
  onResponse : 'response';
  onSuccessResponse : 'successResponse';
  onFailResponse : 'failResponse';
  onErrorResponse : 'errorResponse';
};

type EventMaps = {
  [K in keyof EventNameMapping]?: EventCallback;
};

type Props = GridOptions & EventMaps & HTMLAttributes<HTMLElement>;

export default class Grid extends Component<Props> {
  public getInstance(): TuiGrid;
  public getRootElement(): HTMLElement;
}