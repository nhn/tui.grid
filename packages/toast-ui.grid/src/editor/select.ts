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
    el.className = cls('editor-layer-inner');

    const wrapper = document.createElement('div');
    wrapper.className = cls('editor-select-box-wrapper');
    wrapper.style.width = `${props.width - 15}px`;

    const data = getListItems(props).map(val => ({ ...val, label: val.text })) as IItemData[];
    el.appendChild(wrapper);

    this.selectBoxEl = new SelectBox(wrapper, { data });

    if (props.value) {
      this.selectBoxEl.select(props.value as string | number);
    }

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
