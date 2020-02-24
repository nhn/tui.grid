import SelectBox from '@toast-ui/select-box';
import '@toast-ui/select-box/dist/toastui-select-box.css';
import { CellEditor, CellEditorProps, PortalEditingKeydown } from '@t/editor';
import { CellValue, ListItem } from '@t/store/data';
import { getListItems } from '../helper/editor';
import { cls } from '../helper/dom';
import { setLayerPosition, getContainerElement } from './dom';
import { getKeyStrokeString } from '../helper/keyboard';
import { includes } from '../helper/common';

export class SelectEditor implements CellEditor {
  public el: HTMLDivElement;

  private layer: HTMLDivElement;

  private selectBoxEl!: SelectBox;

  private selectFinish = false;

  private portalEditingKeydown: PortalEditingKeydown;

  public constructor(props: CellEditorProps) {
    const { width, value, formattedValue, portalEditingKeydown } = props;
    const el = document.createElement('div');
    el.className = cls('layer-editing-inner');
    el.innerText = formattedValue;

    const listItems = getListItems(props);
    const layer = this.createLayer(listItems, width, value);

    this.portalEditingKeydown = portalEditingKeydown;
    this.el = el;
    this.layer = layer;
    this.layer.addEventListener('keydown', this.onKeydown);
  }

  private onKeydown = (ev: KeyboardEvent) => {
    const passingKeyNames = ['esc', 'shift-tab', 'tab'];
    const keyName = getKeyStrokeString(ev);
    if (this.selectFinish || includes(passingKeyNames, keyName)) {
      // with passingKeyNames, pass the event to editing layer for using existing editing keyMap
      this.portalEditingKeydown(ev);
    } else {
      ev.preventDefault();
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
    // To prevent wrong stacked z-index context, layer append to grid container
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
