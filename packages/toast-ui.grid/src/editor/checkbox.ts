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
import { cls, hasClass } from '../helper/dom';
import { getKeyStrokeString, isArrowKey } from '../helper/keyboard';
import { findIndex, isNil, pixelToNumber } from '../helper/common';
import { getContainerElement, setLayerPosition, setOpacity, moveLayer } from './dom';

const LAYER_CLASSNAME = cls('editor-checkbox-list-layer');
const LIST_ITEM_CLASSNAME = cls('editor-checkbox');
const HOVERED_LIST_ITEM_CLASSNAME = `${cls('editor-checkbox-hovered')} ${LIST_ITEM_CLASSNAME}`;
const UNCHECKED_RADIO_LABEL_CLASSNAME = cls('editor-label-icon-radio');
const CHECKED_RADIO_LABEL_CLASSNAME = cls('editor-label-icon-radio-checked');
const UNCHECKED_CHECKBOX_LABEL_CLASSNAME = cls('editor-label-icon-checkbox');
const CHECKED_CHECKBOX_LABEL_CLASSNAME = cls('editor-label-icon-checkbox-checked');

export class CheckboxEditor implements CellEditor, InstantlyAppliable {
  public el: HTMLElement;

  public isMounted = false;

  private layer: HTMLUListElement;

  private readonly inputType: 'checkbox' | 'radio';

  private hoveredItemId = '';

  private portalEditingKeydown: PortalEditingKeydown;

  private elementIds: string[] = [];

  private initLayerPos: LayerPos | null = null;

  instantApplyCallback: ((...args: any[]) => void) | null = null;

  public constructor(props: CellEditorProps) {
    const { columnInfo, width, formattedValue, portalEditingKeydown, instantApplyCallback } = props;
    const { type: inputType, instantApply } = columnInfo.editor?.options ?? {};
    const el = document.createElement('div');
    const value = String(isNil(props.value) ? '' : props.value);
    el.className = cls('layer-editing-inner');
    el.innerText = formattedValue;

    this.inputType = inputType;

    const listItems = getListItems(props);
    const layer = this.createLayer(listItems, width);

    this.portalEditingKeydown = portalEditingKeydown;
    this.el = el;
    this.layer = layer;

    this.setValue(value);

    if (instantApply && inputType === 'radio') {
      this.instantApplyCallback = instantApplyCallback;
    }
  }

  private createLayer(listItems: ListItem[], width: number) {
    const layer = document.createElement('ul');
    layer.className = LAYER_CLASSNAME;
    layer.style.minWidth = `${width}px`;
    // To hide the initial layer which is having the position which is not calculated properly
    setOpacity(layer, 0);

    listItems.forEach(({ text, value }) => {
      const id = `checkbox-${value}`;
      const listItemEl = document.createElement('li');

      listItemEl.id = id;
      listItemEl.className = LIST_ITEM_CLASSNAME;
      listItemEl.appendChild(this.createCheckboxLabel(value, text));

      this.elementIds.push(id);

      layer.appendChild(listItemEl);
    });

    layer.addEventListener('change', this.onChange);
    layer.addEventListener('mouseover', this.onMouseover);
    layer.addEventListener('keydown', this.onKeydown);

    return layer;
  }

  private createCheckboxLabel(value: CellValue, text: string) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    const span = document.createElement('span');

    label.className =
      this.inputType === 'radio'
        ? UNCHECKED_RADIO_LABEL_CLASSNAME
        : UNCHECKED_CHECKBOX_LABEL_CLASSNAME;

    input.type = this.inputType;
    input.name = 'checkbox';
    input.value = String(value);

    span.innerText = text;

    label.appendChild(input);
    label.appendChild(span);

    return label;
  }

  private getItemId(target: HTMLElement) {
    return target.id || target.parentElement!.id;
  }

  private onMouseover = (ev: MouseEvent) => {
    const targetId = this.getItemId(ev.target as HTMLElement);
    if (targetId && targetId !== this.hoveredItemId) {
      this.highlightItem(targetId);
    }
  };

  private onChange = (ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    this.setLabelClass(value);

    // eslint-disable-next-line no-unused-expressions
    this.instantApplyCallback?.();
  };

  private onKeydown = (ev: KeyboardEvent) => {
    const keyName = getKeyStrokeString(ev);
    if (isArrowKey(keyName)) {
      ev.preventDefault();
      const elementIdx = findIndex((id) => id === this.hoveredItemId, this.elementIds);
      const totalCount = this.elementIds.length;
      const offset = totalCount + (keyName === 'down' || keyName === 'right' ? 1 : -1);
      const id = this.elementIds[(elementIdx + offset) % totalCount];

      this.highlightItem(id);
    } else {
      // except arrow key, pass the event to editing layer for using existing editing keyMap
      this.portalEditingKeydown(ev);
    }
  };

  private highlightItem(targetId: string) {
    if (this.hoveredItemId) {
      this.layer.querySelector(`#${this.hoveredItemId}`)!.className = LIST_ITEM_CLASSNAME;
    }

    this.hoveredItemId = targetId;
    const item = this.layer.querySelector(`#${targetId}`)!;
    item.className = HOVERED_LIST_ITEM_CLASSNAME;
    item.querySelector('input')!.focus();
  }

  private setLabelClass(inputValue: CellValue) {
    const label = this.layer.querySelector(`#checkbox-${inputValue} label`) as HTMLLabelElement;
    if (this.inputType === 'checkbox') {
      label.className = hasClass(label, 'editor-label-icon-checkbox-checked')
        ? UNCHECKED_CHECKBOX_LABEL_CLASSNAME
        : CHECKED_CHECKBOX_LABEL_CLASSNAME;
    } else {
      const checkedLabel = this.layer.querySelector(`.${CHECKED_RADIO_LABEL_CLASSNAME}`);
      if (checkedLabel) {
        checkedLabel.className = UNCHECKED_RADIO_LABEL_CLASSNAME;
      }

      label.className = CHECKED_RADIO_LABEL_CLASSNAME;
    }
  }

  private getCheckedInput() {
    return (this.layer.querySelector('input:checked') ||
      this.layer.querySelector('input')) as HTMLInputElement;
  }

  public moveDropdownLayer(gridRect: GridRectForDropDownLayerPos) {
    if (this.initLayerPos) {
      moveLayer(this.layer, this.initLayerPos, gridRect);
    }
  }

  public getElement() {
    return this.el;
  }

  private setValue(value: CellValue) {
    String(value)
      .split(',')
      .forEach((inputValue) => {
        const input = this.layer.querySelector(`input[value="${inputValue}"]`) as HTMLInputElement;
        if (input) {
          input.checked = true;
          this.setLabelClass(inputValue);
        }
      });
  }

  public getValue() {
    const checkedInputs = this.layer.querySelectorAll('input:checked');
    const checkedValues = [];
    for (let i = 0, len = checkedInputs.length; i < len; i += 1) {
      checkedValues.push((checkedInputs[i] as HTMLInputElement).value);
    }

    return checkedValues.join(',');
  }

  public mounted() {
    // To prevent wrong stacked z-index context, layer append to grid container
    getContainerElement(this.el).appendChild(this.layer);
    // @ts-ignore
    setLayerPosition(this.el, this.layer);

    this.initLayerPos = {
      top: pixelToNumber(this.layer.style.top),
      left: pixelToNumber(this.layer.style.left),
    };

    const checkedInput = this.getCheckedInput();
    if (checkedInput) {
      this.highlightItem(`checkbox-${checkedInput.value}`);
    }

    this.isMounted = true;
    // To show the layer which has appropriate position
    setOpacity(this.layer, 1);
  }

  public beforeDestroy() {
    this.layer.removeEventListener('change', this.onChange);
    this.layer.removeEventListener('mouseover', this.onMouseover);
    this.layer.removeEventListener('keydown', this.onKeydown);
    getContainerElement(this.el).removeChild(this.layer);
    this.initLayerPos = null;
    this.isMounted = false;
  }
}
