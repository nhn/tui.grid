import SelectBox from '@toast-ui/select-box';
import '@toast-ui/select-box/dist/toastui-select-box.css';
import { CellEditor, CellEditorProps } from './types';
import { getListItems } from '../helper/editor';
import { cls } from '../helper/dom';
import { CellValue, ListItem } from '../store/types';
import { getKeyStrokeString } from '../helper/keyboard';
import Grid from '../grid';
import { includes } from '../helper/common';

export class SelectEditor implements CellEditor {
  public el: HTMLDivElement;

  private wrapper: HTMLDivElement;

  private selectBoxEl!: SelectBox;

  private grid: Grid;

  private editFinish = false;

  private selectFinish = false;

  public constructor(props: CellEditorProps) {
    const { width, value, grid } = props;
    const el = document.createElement('div');
    el.className = cls('editor-layer-inner');

    const listItems = getListItems(props);
    const wrapper = this.createWrapper(listItems, width, value);

    el.appendChild(wrapper);

    this.wrapper = wrapper;
    this.wrapper.addEventListener('keydown', this.onKeydown);
    this.wrapper.addEventListener('click', this.setEditFinish);
    this.el = el;
    this.grid = grid;
  }

  private onKeydown = (ev: KeyboardEvent) => {
    const keyName = getKeyStrokeString(ev);

    if (keyName === 'enter') {
      ev.stopPropagation();

      if (this.editFinish) {
        this.grid.finishEditing(true);
        return;
      }

      this.setEditFinish();
    } else if (includes(['up', 'down'], keyName)) {
      this.selectFinish = false;
      this.setEditFinish();
    }
  };

  private setEditFinish = () => {
    this.editFinish = this.selectFinish;
  };

  private createWrapper(listItems: ListItem[], width: number, value: CellValue) {
    const wrapper = document.createElement('div');
    wrapper.className = cls('editor-select-box-wrapper');
    wrapper.style.minWidth = `${width - 10}px`;

    const data = listItems.map(item => ({ value: String(item.value), label: item.text }));
    this.selectBoxEl = new SelectBox(wrapper, { data });

    if (value) {
      this.selectBoxEl.select(value as string | number);

      this.selectBoxEl.on('close', () => {
        // https://github.com/nhn/toast-ui.select-box/issues/3
        // @TODO: need to change after apply this issue
        // @ts-ignore
        this.selectBoxEl.input.focus();
        this.selectFinish = true;
      });
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

  public beforeDestroy() {
    this.selectBoxEl.destroy();
    this.wrapper.removeEventListener('keydown', this.onKeydown);
    this.wrapper.removeEventListener('click', this.setEditFinish);
  }
}
