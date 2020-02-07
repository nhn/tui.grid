import SelectBox from '@toast-ui/select-box';
import '@toast-ui/select-box/dist/toastui-select-box.css';
import { CellEditor, CellEditorProps } from './types';
import { getListItems } from '../helper/editor';
import { cls } from '../helper/dom';
import { CellValue, ListItem } from '../store/types';

export class SelectEditor implements CellEditor {
  public el: HTMLDivElement;

  private wrapper: HTMLDivElement;

  private selectBoxEl!: SelectBox;

  public constructor(props: CellEditorProps) {
    const { width, value } = props;
    const el = document.createElement('div');
    el.className = cls('editor-layer-inner');

    const listItems = getListItems(props);
    const wrapper = this.createWrapper(listItems, width, value);

    el.appendChild(wrapper);

    this.wrapper = wrapper;
    this.el = el;
  }

  private createWrapper(listItems: ListItem[], width: number, value: CellValue) {
    const wrapper = document.createElement('div');
    wrapper.className = cls('editor-select-box-wrapper');
    wrapper.style.minWidth = `${width - 10}px`;

    const data = listItems.map(val => ({ value: String(val.value), label: val.text }));
    this.selectBoxEl = new SelectBox(wrapper, { data });

    if (value) {
      this.selectBoxEl.select(value as string | number);
    }

    return wrapper;
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.selectBoxEl.getSelectedItem().getValue();
  }

  public mounted() {
    this.selectBoxEl.open();
    this.wrapper.style.top = `${this.el.getBoundingClientRect().bottom}px`;
  }
}
