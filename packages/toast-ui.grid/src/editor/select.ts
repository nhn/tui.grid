import SelectBox from '@toast-ui/select-box';
import '@toast-ui/select-box/dist/toastui-select-box.css';
import {
  CellEditor,
  CellEditorProps,
  GridRectForDropDownLayerPos,
  InstantlyAppliable,
  LayerPos,
  PortalEditingKeydown,
} from '@t/editor';
import { CellValue, ListItem } from '@t/store/data';
import { getListItems } from '../helper/editor';
import { cls } from '../helper/dom';
import { setLayerPosition, getContainerElement, setOpacity, moveLayer } from './dom';
import { getKeyStrokeString } from '../helper/keyboard';
import { includes, isNil, pixelToNumber } from '../helper/common';

export class SelectEditor implements CellEditor, InstantlyAppliable {
  public el: HTMLDivElement;

  public isMounted = false;

  private layer: HTMLDivElement;

  private selectBoxEl!: SelectBox;

  private selectFinish = false;

  private portalEditingKeydown: PortalEditingKeydown;

  private initLayerPos: LayerPos | null = null;

  instantApplyCallback: ((...args: any[]) => void) | null = null;

  public constructor(props: CellEditorProps) {
    const { width, formattedValue, portalEditingKeydown, columnInfo, instantApplyCallback } = props;

    const { instantApply } = columnInfo.editor?.options ?? {};
    const el = document.createElement('div');
    const value = String(isNil(props.value) ? '' : props.value);
    el.className = cls('layer-editing-inner');
    el.innerText = formattedValue;

    const listItems = getListItems(props);
    const layer = this.createLayer(listItems, width, value);

    this.portalEditingKeydown = portalEditingKeydown;
    this.el = el;
    this.layer = layer;
    this.layer.addEventListener('keydown', this.onKeydown);

    if (instantApply) {
      this.instantApplyCallback = instantApplyCallback;
      this.selectBoxEl.on('close', this.instantApplyCallback);
    }
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
    layer.style.minWidth = `${width}px`;
    // To hide the initial layer which is having the position which is not calculated properly
    setOpacity(layer, 0);

    const data = listItems.map((item) => ({ value: String(item.value), label: item.text }));
    this.selectBoxEl = new SelectBox(layer, { data });

    this.selectBoxEl.on('close', () => {
      this.focusSelectBox();
      this.setSelectFinish(true);
      // @ts-ignore
      setLayerPosition(this.el, this.layer, this.selectBoxEl.dropdown.el);
    });

    this.selectBoxEl.on('open', () => {
      this.setSelectFinish(false);
      if (this.isMounted) {
        // @ts-ignore
        setLayerPosition(this.el, this.layer, this.selectBoxEl.dropdown.el);
      }
    });

    if (value) {
      this.selectBoxEl.select(value as string | number);
    }

    return layer;
  }

  private focusSelectBox() {
    // https://github.com/nhn/toast-ui.select-box/issues/3
    // @TODO: need to change after apply this issue
    // @ts-ignore
    this.selectBoxEl.input.focus();
  }

  public moveDropdownLayer(gridRect: GridRectForDropDownLayerPos) {
    if (this.initLayerPos) {
      moveLayer(this.layer, this.initLayerPos, gridRect);
    }
  }

  public getElement() {
    return this.el;
  }

  public getValue() {
    return this.selectBoxEl.getSelectedItem()?.getValue() ?? '';
  }

  public mounted() {
    this.selectBoxEl.open();
    // To prevent wrong stacked z-index context, layer append to grid container
    getContainerElement(this.el).appendChild(this.layer);
    // @ts-ignore
    setLayerPosition(this.el, this.layer, this.selectBoxEl.dropdown.el);

    this.initLayerPos = {
      top: pixelToNumber(this.layer.style.top),
      left: pixelToNumber(this.layer.style.left),
    };

    this.focusSelectBox();
    this.isMounted = true;
    // To show the layer which has appropriate position
    setOpacity(this.layer, 1);
  }

  public beforeDestroy() {
    this.selectBoxEl.destroy();
    this.layer.removeEventListener('keydown', this.onKeydown);
    getContainerElement(this.el).removeChild(this.layer);
    this.initLayerPos = null;
    this.isMounted = false;
  }
}
