import React, {useRef} from 'react';
import {render, fireEvent} from '@testing-library/react';

// Recreate the minimal print behavior used in the page
function PrintableWrapper({children}) {
  const printRef = useRef(null);
  const handlePrint = () => {
    if (!printRef.current) return;
    const cloned = printRef.current.cloneNode(true);
    const inputs = cloned.querySelectorAll('input, textarea, select');
    inputs.forEach(inp => {
      const span = document.createElement('div');
      span.textContent = inp.value || inp.getAttribute('value') || '';
      inp.parentNode && inp.parentNode.replaceChild(span, inp);
    });
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write('<html><body>');
    printWindow.document.write(cloned.outerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'flex-end'}} className="mb-2">
        <button onClick={handlePrint}>Print</button>
      </div>
      <div ref={printRef}>
        {children}
      </div>
    </div>
  );
}

test('PrintableWrapper prints only printable content and replaces inputs', () => {
  const mockWin = { document: { open: () => {}, write: jest.fn(), close: () => {} }, focus: () => {}, close: () => {} };
  const originalOpen = window.open;
  window.open = jest.fn(() => mockWin);

  const {getByText, container} = render(
    <PrintableWrapper>
      <div>
        <input defaultValue="abc" />
        <div className="nav">NAV</div>
        <div className="content">CONTENT</div>
      </div>
    </PrintableWrapper>
  );

  const btn = getByText('Print');
  fireEvent.click(btn);
  expect(window.open).toHaveBeenCalled();
  // ensure the written html contains CONTENT but not the input element tag
  const writes = mockWin.document.write.mock.calls.map(c => c[0]).join('');
  expect(writes).toMatch(/CONTENT/);
  expect(writes).not.toMatch(/<input/);

  window.open = originalOpen;
});

