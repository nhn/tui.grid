interface RenderProps {
  // container: HTMLElement;
  trigger(action: 'start' | 'finish'): void;
}

interface CellEditor {
  render(props: RenderProps): void;
  onChange(): void;
  onStart(): void;
  onFinish(): void;
}

function createEditor(options: CellEditor) {}

// class CellEditorText implements CellEditor {}

export function create() {
  return createEditor({
    render({ trigger }) {
      const el = document.createElement('input');

      el.addEventListener('focus', () => {
        trigger('start');
      });
      el.addEventListener('blur', () => {
        trigger('finish');
      });

      return el;
    },
    onChange() {},
    onStart() {},
    onFinish() {}
  });
}
