import { cls } from '@/helper/dom';

before(() => {
  cy.visit('/dist');
});

type TestWindow = Window & {
  DataTransfer: typeof DataTransfer;
  ClipboardEvent: typeof ClipboardEvent;
  Element: typeof Element;
};

const columns = [
  { name: 'c1', editor: 'text' },
  { name: 'c2', editor: 'text' },
];

function createEditableGrid() {
  cy.createGrid({
    data: [
      { c1: '', c2: '' },
      { c1: '', c2: '' },
    ],
    columns,
  });
  cy.gridInstance().invoke('focus', 0, 'c1');
}

function pasteHTML(html: string) {
  cy.get(`.${cls('clipboard')}`).then(($clipboard) => {
    const win = $clipboard[0].ownerDocument!.defaultView as TestWindow;
    const clipboardData = new win.DataTransfer();

    clipboardData.setData('text/html', html);
    clipboardData.setData('text/plain', '');

    $clipboard[0].dispatchEvent(
      new win.ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true })
    );
  });
}

describe('paste HTML table', () => {
  it('should paste the cell text of the HTML table', () => {
    createEditableGrid();

    pasteHTML('<table><tr><td>a1</td><td>b1</td></tr><tr><td>a2</td><td>b2</td></tr></table>');

    cy.gridInstance()
      .invoke('getData')
      .should((data) => {
        expect(data.map(({ c1, c2 }: { c1: string; c2: string }) => [c1, c2])).to.eql([
          ['a1', 'b1'],
          ['a2', 'b2'],
        ]);
      });
  });

  it('should paste the merged cell of the HTML table', () => {
    createEditableGrid();

    pasteHTML('<table><tr><td colspan="2">merged</td></tr><tr><td>a2</td><td>b2</td></tr></table>');

    cy.gridInstance().invoke('getValue', 0, 'c1').should('eq', 'merged');
    cy.gridInstance().invoke('getValue', 0, 'c2').should('eq', ' ');
    cy.gridInstance().invoke('getValue', 1, 'c2').should('eq', 'b2');
  });

  it('should paste the text of the HTML table copied from a spreadsheet', () => {
    createEditableGrid();

    pasteHTML(
      '<html><head><style>td{mso-number-format:General;}</style></head>' +
        '<body><table><tr><td>R&amp;D</td><td class="xl65">1,200</td></tr></table></body></html>'
    );

    cy.gridInstance().invoke('getValue', 0, 'c1').should('eq', 'R&D');
    cy.gridInstance().invoke('getValue', 0, 'c2').should('eq', '1,200');
  });

  it('should not insert the pasted HTML into the document', () => {
    createEditableGrid();

    cy.get(`.${cls('clipboard')}`).then(($clipboard) => {
      const clipboardEl = $clipboard[0];
      const win = clipboardEl.ownerDocument!.defaultView as TestWindow;
      const descriptor = Object.getOwnPropertyDescriptor(win.Element.prototype, 'innerHTML')!;
      const insertedHTML: string[] = [];

      Object.defineProperty(clipboardEl, 'innerHTML', {
        configurable: true,
        get() {
          return descriptor.get!.call(this);
        },
        set(value: string) {
          if (value) {
            insertedHTML.push(value);
          }
          descriptor.set!.call(this, value);
        },
      });

      pasteHTML('<table><tr><td><img src="pasted-image.png">a1</td></tr></table>');

      cy.gridInstance()
        .invoke('getValue', 0, 'c1')
        .should('eq', 'a1')
        .then(() => {
          delete (clipboardEl as Partial<Element>).innerHTML;
          expect(insertedHTML).to.eql([]);
        });
    });
  });
});
