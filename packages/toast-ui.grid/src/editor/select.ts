import SelectBox from '@toast-ui/select-box';
import '@toast-ui/select-box/dist/toastui-select-box.css';
import { CellEditor, CellEditorProps, HandleEditingKeyDown } from './types';
import { getListItems } from '../helper/editor';
import { cls } from '../helper/dom';
import { CellValue, ListItem } from '../store/types';
import { setLayerPosition, getContainerElement } from './helper';

export class SelectEditor implements CellEditor {
  public el: HTMLDivElement;

  private layer: HTMLDivElement;

  private selectBoxEl!: SelectBox;

  private selectFinish = false;

  private handleEditingKeyDown: HandleEditingKeyDown;

  public constructor(props: CellEditorProps) {
    const { width, value, formattedValue, handleEditingKeyDown } = props;
    const el = document.createElement('div');
    el.className = cls('layer-editing-inner');
    el.innerText = formattedValue;

    const listItems = getListItems(props);
    const layer = this.createLayer(listItems, width, value);

    this.handleEditingKeyDown = handleEditingKeyDown;
    this.el = el;
    this.layer = layer;
    this.layer.addEventListener('keydown', this.onKeydown);
  }

  private onKeydown = (ev: KeyboardEvent) => {
    if (this.selectFinish) {
      this.handleEditingKeyDown(ev);
    }
  };

  private setSelectFinish(selectFinish: boolean) {
    setTimeout(() => {
      this.selectFinish = selectFinish;
    });
  }

  private createLayer(listItems: ListItem[], width: number, value: CellValue) {
    const layer = document.createElement('div');
    layer.className = cls('editor-select-box-layer');
    layer.style.minWidth = `${width - 10}px`;

    const data = listItems.map(item => ({ value: String(item.value), label: item.text }));
    this.selectBoxEl = new SelectBox(layer, { data });

    this.selectBoxEl.on('close', () => {
      // https://github.com/nhn/toast-ui.select-box/issues/3
      // @TODO: need to change after apply this issue
      // @ts-ignore
      this.selectBoxEl.input.focus();
      this.setSelectFinish(true);
    });

    this.selectBoxEl.on('open', () => {
      this.setSelectFinish(false);
    });

    if (value) {
      this.selectBoxEl.select(value as string | number);
    }

    return layer;
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.selectBoxEl.getSelectedItem().getValue();
  }

  public mounted() {
    getContainerElement(this.el).appendChild(this.layer);
    this.selectBoxEl.open();

    // @ts-ignore
    setLayerPosition(this.el, this.layer, this.selectBoxEl.dropdown.el);
  }

  public beforeDestroy() {
    this.selectBoxEl.destroy();
    this.layer.removeEventListener('keydown', this.onKeydown);
    getContainerElement(this.el).removeChild(this.layer);
  }
}
