import TuiDatePicker from 'tui-date-picker';
import { Dictionary } from '@t/options';
import {
  CellEditor,
  CellEditorProps,
  GridRectForDropDownLayerPos,
  InstantlyAppliable,
  LayerPos,
} from '@t/editor';
import { cls } from '../helper/dom';
import { deepMergedCopy, isNumber, isString, isNil, pixelToNumber } from '../helper/common';
import { setLayerPosition, getContainerElement, setOpacity, moveLayer } from './dom';

export class DatePickerEditor implements CellEditor, InstantlyAppliable {
  public el: HTMLDivElement;

  public isMounted = false;

  private layer: HTMLDivElement;

  private inputEl: HTMLInputElement;

  private datePickerEl: TuiDatePicker;

  private iconEl?: HTMLElement;

  private initLayerPos: LayerPos | null = null;

  instantApplyCallback: ((...args: any[]) => void) | null = null;

  private createInputElement() {
    const inputEl = document.createElement('input');
    inputEl.className = cls('content-text');
    inputEl.type = 'text';

    return inputEl;
  }

  private createLayer() {
    const layer = document.createElement('div');
    layer.className = cls('editor-datepicker-layer');
    // To hide the initial layer which is having the position which is not calculated properly
    setOpacity(layer, 0);

    return layer;
  }

  private openDatePicker() {
    this.datePickerEl.open();
  }

  private createIcon() {
    const icon = document.createElement('i');
    icon.className = cls('date-icon');
    icon.addEventListener('click', () => this.openDatePicker());

    return icon;
  }

  private focus() {
    this.inputEl.focus();
  }

  public constructor(props: CellEditorProps) {
    const {
      grid: { usageStatistics },
      columnInfo,
      instantApplyCallback,
    } = props;
    const value = String(isNil(props.value) ? '' : props.value);
    const el = document.createElement('div');
    el.className = cls('layer-editing-inner');

    this.el = el;
    this.inputEl = this.createInputElement();

    const datepickerInputContainer = document.createElement('div');
    datepickerInputContainer.className = cls('datepicker-input-container');
    datepickerInputContainer.appendChild(this.inputEl);
    this.el.appendChild(datepickerInputContainer);

    const layer = this.createLayer();
    this.layer = layer;

    const options: Dictionary<any> = { showIcon: true, ...columnInfo.editor!.options };

    if (options.showIcon) {
      const icon = this.createIcon();
      this.iconEl = icon;
      this.inputEl.className = cls('datepicker-input');
      datepickerInputContainer.appendChild(icon);
    }

    let date;

    if (!options.format) {
      options.format = 'yyyy-MM-dd';
    }

    if (options.instantApply) {
      this.instantApplyCallback = instantApplyCallback;
    }

    if (isNumber(value) || isString(value)) {
      date = new Date(value);
    }

    const defaultOptions = {
      date,
      type: 'date' as const,
      input: {
        element: this.inputEl,
        format: options.format,
      },
      usageStatistics,
    };

    this.datePickerEl = new TuiDatePicker(layer, deepMergedCopy(defaultOptions, options));
    this.datePickerEl.on('close', () => {
      this.focus();

      // eslint-disable-next-line no-unused-expressions
      this.instantApplyCallback?.();
    });
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
    return this.inputEl.value;
  }

  public mounted() {
    // To prevent wrong stacked z-index context, layer append to grid container
    getContainerElement(this.el).appendChild(this.layer);

    this.inputEl.select();
    this.datePickerEl.open();

    // `this.layer.firstElementChild` is real datePicker layer(it is need to get total height)
    setLayerPosition(this.el, this.layer, this.layer.firstElementChild as HTMLElement, true);

    this.initLayerPos = {
      top: pixelToNumber(this.layer.style.top),
      left: pixelToNumber(this.layer.style.left),
    };

    this.isMounted = true;
    // To show the layer which has appropriate position
    setOpacity(this.layer, 1);
  }

  public beforeDestroy() {
    if (this.iconEl) {
      this.iconEl.removeEventListener('click', this.openDatePicker);
    }
    this.datePickerEl.destroy();
    getContainerElement(this.el).removeChild(this.layer);
    this.initLayerPos = null;
    this.isMounted = false;
  }
}
