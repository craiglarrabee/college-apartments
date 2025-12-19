import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import LeaseForm from '../../components/leaseForm';

// Simple mock of window.open that captures written content
function createMockPrintWindow() {
  let written = '';
  return {
    document: {
      open: () => {},
      write: (s) => { written += s; },
      close: () => {}
    },
    focus: () => {},
    print: () => {},
    close: () => {},
    getWritten: () => written
  };
}

test('LeaseForm print clones content and replaces inputs with values and opens print window', () => {
  const mockWin = createMockPrintWindow();
  const originalOpen = window.open;
  window.open = jest.fn(() => mockWin);

  const lease = {
    lease_date: null,
    signed_date: 'Jan 1, 2000',
    name: 'Test Tenant',
    lease_discount: '0',
    room_type_id: '1',
    apartment_number: '101'
  };

  // Render with a text input in the form via lease props: leaseForm contains many fields, but we'll rely on the component
  const {getByText, container} = render(
    <LeaseForm
      navPage="application"
      site="test"
      userId={1}
      leaseId={1}
      lease={lease}
      canEdit={false}
      lease_header="<p>Header</p>"
      accommodations_header=""
      accommodations_body=""
      rent_header=""
      rent_body=""
      vehicle_header=""
      vehicle_body=""
      lease_body=""
      lease_acceptance=""
      rules=""
      cleaning=""
      repairs=""
      rooms={[]}
    />
  );

  const btn = getByText(/Print Lease/i);
  expect(btn).toBeTruthy();

  fireEvent.click(btn);

  expect(window.open).toHaveBeenCalled();
  // The mock written HTML should contain the Header and tenant name
  const written = mockWin.getWritten();
  expect(written).toMatch(/Header/);
  expect(written).toMatch(/Test Tenant/);

  window.open = originalOpen;
});
