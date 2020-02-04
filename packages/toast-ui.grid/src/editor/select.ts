import SelectBox, { IItemData } from '@toast-ui/select-box';
import '@toast-ui/select-box/dist/toastui-select-box.css';
import { CellEditor, CellEditorProps } from './types';
import { getListItems } from '../helper/editor';
import { cls } from '../helper/dom';

export class SelectEditor implements CellEditor {
  public el: HTMLDivElement;

  public selectBoxEl: SelectBox;

  public constructor(props: CellEditorProps) {
    const el = document.createElement('div');
    el.className = cls('editing-layer-inner');

    const wrapper = document.createElement('div');
    wrapper.className = cls('editor-select-box');

    const data = getListItems(props).map(val => ({ ...val, label: val.text })) as IItemData[];
    el.appendChild(wrapper);

    this.selectBoxEl = new SelectBox(wrapper, { data });
    this.selectBoxEl.select(props.value);

    this.el = el;
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.selectBoxEl.getSelectedItem().getValue();
  }

  public mounted() {
    this.selectBoxEl.open();
  }
}
