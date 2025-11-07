import React from "react";
import {render, screen, fireEvent, act, waitFor} from "@testing-library/react";
import {TenantForm} from "../../components/tenantForm";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";

describe("TenantForm", () => {
    const mockSite = "mockSite";
    const mockUserId = "mockUserId";
    const mockTenant = {};
    const mockIsNewApplication = true;
    let user;

    beforeAll(() => {
        fetchMock.enableMocks();
        user = userEvent.setup();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(undefined, {status: 204});
    });

    test("renders TenantForm component", () => {
        render(
            <TenantForm
                site={mockSite}
                userId={mockUserId}
                tenant={mockTenant}
                isNewApplication={mockIsNewApplication}
            />
        );
        expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    });

    // helper to set a field by label
    const setVal = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});

    const fillBasePersonalFields = async (data) => {
        const {
            firstName = "John",
            lastName = "Doe",
            gender = "M",
            birthdate = "1990-01-01",
            last4 = "1234",
            cellPhone = "123-456-7890",
            altCellPhone = "987-654-3210",
            homePhone = "555-555-5555",
            email = "user@example.com",
            altEmail = "user2@example.com"
        } = data || {};
        await act(async () => {
            setVal("First Name", firstName);
            setVal("Last Name", lastName);
            setVal("Gender", gender);
            setVal("Birthdate", birthdate);
            setVal("Last 4 Social Security #", last4);
            setVal("Cell Phone", cellPhone);
            setVal("Alternate Cell Phone", altCellPhone);
            setVal("Home Phone", homePhone);
            setVal("Email", email);
            setVal("Alternate Email", altEmail);
        });
        await waitFor(() => expect(screen.getByPlaceholderText("Confirm Cell Phone")).toBeInTheDocument());
    };

    const fillConfirmPhonesIfPresent = (data) => {
        const {cellPhone = "123-456-7890", altCellPhone = "987-654-3210", homePhone = "555-555-5555"} = data || {};
        const confirmCell = screen.queryByPlaceholderText("Confirm Cell Phone");
        if (confirmCell) fireEvent.change(confirmCell, {target: {value: cellPhone}});
        const confirmAlt = screen.queryByPlaceholderText("Confirm Alt Cell Phone");
        if (confirmAlt) fireEvent.change(confirmAlt, {target: {value: altCellPhone}});
        const confirmHome = screen.queryByPlaceholderText("Confirm Home Phone");
        if (confirmHome) fireEvent.change(confirmHome, {target: {value: homePhone}});
    };

    const fillAddressAndParent = async (data) => {
        const {
            street = "123 Main St",
            city = "City",
            state = "ST",
            zip = "12345",
            parentName = "Jane Doe",
            parentPhone = "555-123-4567",
            parentStreet = "456 Main St",
            parentCity = "City",
            parentState = "State",
            parentZip = "54321"
        } = data || {};
        await act(async () => {
            setVal("Street Address", street);
            setVal("City", city);
            setVal("State", state);
            setVal("Zip Code", zip);
            setVal("Parent Name", parentName);
            setVal("Parent Phone", parentPhone);
            setVal("Parent Street Address", parentStreet);
            setVal("Parent City", parentCity);
            setVal("Parent State", parentState);
            setVal("Parent Zip Code", parentZip);
        });
    };

    test("submits tenant personal info with correct payload and site param", async () => {
        render(<TenantForm site={mockSite} userId={mockUserId} tenant={mockTenant} isNewApplication={mockIsNewApplication}/>);
        await fillBasePersonalFields();
        fillConfirmPhonesIfPresent();
        // radios set to NO
        const allRadios = screen.getAllByRole('radio');
        const noRadios = allRadios.filter(r => r.getAttribute('value') === '0').slice(0,2);
        if (noRadios.length < 2) throw new Error("Expected at least two 'No' radios for convicted and charged crime questions");
        await act(async () => { fireEvent.click(noRadios[0]); fireEvent.click(noRadios[1]); });
        await fillAddressAndParent();
        const submitBtn = screen.getByRole('button', {name: /Next/i});
        expect(submitBtn).not.toBeDisabled();
        await act(async () => { fireEvent.click(submitBtn); });
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const [url, options] = fetchMock.mock.calls[0];
        expect(url).toBe(`/api/users/${mockUserId}/tenant?site=${mockSite}`);
        const sent = JSON.parse(options.body);
        expect(sent).toEqual(expect.objectContaining({first_name: 'John', last_name: 'Doe', gender: 'M', date_of_birth: '1990-01-01', convicted_crime: '0', charged_crime: '0'}));
    });

    test("submits tenant personal info with correct payload and site param (Yes crime path)", async () => {
        render(<TenantForm site={mockSite} userId={mockUserId} tenant={mockTenant} isNewApplication={mockIsNewApplication}/>);
        await fillBasePersonalFields({firstName: 'Alice', lastName: 'Smith', gender: 'F', birthdate: '1995-05-05', last4: '4321', cellPhone: '111-222-3333', altCellPhone: '222-333-4444', homePhone: '333-444-5555', email: 'alice@example.com', altEmail: 'alice2@example.com'});
        fillConfirmPhonesIfPresent({cellPhone: '111-222-3333', altCellPhone: '222-333-4444', homePhone: '333-444-5555'});
        const allRadios = screen.getAllByRole('radio');
        const yesRadios = allRadios.filter(r => r.getAttribute('value') === '1');
        if (yesRadios.length < 2) throw new Error("Expected at least two 'Yes' radios");
        await act(async () => { fireEvent.click(yesRadios[0]); fireEvent.click(yesRadios[1]); });
        // Expect exactly two Explain fields (convicted + charged)
        await waitFor(() => expect(screen.getAllByLabelText("Explain").length).toBe(2));
        const [convictExplain, chargedExplain] = screen.getAllByLabelText("Explain");
        fireEvent.change(convictExplain, {target: {value: 'Convicted details'}});
        fireEvent.change(chargedExplain, {target: {value: 'Charged details'}});
        await fillAddressAndParent({street: '789 Side Rd', city: 'Town', state: 'TS', zip: '67890', parentName: 'Parent One', parentPhone: '999-888-7777', parentStreet: '101 Parent Ave', parentCity: 'Town', parentState: 'TS', parentZip: '67891'});
        const submitBtn = screen.getByRole('button', {name: /Next/i});
        expect(submitBtn).not.toBeDisabled();
        await act(async () => { fireEvent.click(submitBtn); });
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        const [, options] = fetchMock.mock.calls[0];
        const sent = JSON.parse(options.body);
        expect(sent).toEqual(expect.objectContaining({first_name: 'Alice', last_name: 'Smith', gender: 'F', date_of_birth: '1995-05-05', convicted_crime: '1', charged_crime: '1', convicted_explain: 'Convicted details', charged_explain: 'Charged details'}));
    });

    test("does not submit when conviction explanation missing (Yes convicted only)", async () => {
        render(<TenantForm site={mockSite} userId={mockUserId} tenant={mockTenant} isNewApplication={mockIsNewApplication}/>);
        await fillBasePersonalFields();
        fillConfirmPhonesIfPresent();
        const allRadios = screen.getAllByRole('radio');
        const yesRadios = allRadios.filter(r => r.getAttribute('value') === '1');
        const noRadios = allRadios.filter(r => r.getAttribute('value') === '0');
        if (yesRadios.length < 1 || noRadios.length < 1) throw new Error('Expected radios present');
        await act(async () => { fireEvent.click(yesRadios[0]); /* convicted yes */ fireEvent.click(noRadios[0]); /* charged no */ });
        // Explanation field for convicted should appear empty
        await waitFor(() => expect(screen.getAllByLabelText('Explain').length).toBe(1));
        await fillAddressAndParent();
        const submitBtn = screen.getByRole('button', {name: /Next/i});
        expect(submitBtn).not.toBeDisabled();
        await act(async () => { fireEvent.click(submitBtn); });
        // Should NOT call fetch because explanation required
        await new Promise(r => setTimeout(r, 50));
        expect(fetchMock).not.toHaveBeenCalled();
        // Error message should be present
        // (react-hook-form will show generic required, we didn't customize convict explain message in test) Look for text-danger near explain
        expect(screen.getByText(/Please enter an explanation/i)).toBeInTheDocument();
    });

    test("does not submit when confirm cell phone missing", async () => {
        render(<TenantForm site={mockSite} userId={mockUserId} tenant={mockTenant} isNewApplication={mockIsNewApplication}/>);
        await act(async () => {
            setVal("First Name", "Test");
            setVal("Last Name", "User");
            setVal("Gender", "M");
            setVal("Birthdate", "1990-01-01");
            setVal("Last 4 Social Security #", "9999");
            setVal("Cell Phone", "111-111-1111");
            // do NOT fill confirm cell phone
            setVal("Email", "test@example.com");
            setVal("Street Address", "1 Test Way");
            setVal("City", "Testville");
            setVal("State", "TS");
            setVal("Zip Code", "00000");
            setVal("Parent Name", "Parent");
            setVal("Parent Phone", "222-222-2222");
            setVal("Parent Street Address", "2 Parent Rd");
            setVal("Parent City", "Testville");
            setVal("Parent State", "TS");
            setVal("Parent Zip Code", "00001");
        });
        // radios default? choose NO for both to avoid explanation requirement
        const allRadios = screen.getAllByRole('radio');
        const noRadios = allRadios.filter(r => r.getAttribute('value') === '0').slice(0,2);
        if (noRadios.length === 2) {
            await act(async () => { fireEvent.click(noRadios[0]); fireEvent.click(noRadios[1]); });
        }
        const submitBtn = screen.getByRole('button', {name: /Next/i});
        expect(submitBtn).not.toBeDisabled();
        await act(async () => { fireEvent.click(submitBtn); });
        await new Promise(r => setTimeout(r, 50));
        expect(fetchMock).not.toHaveBeenCalled();
        // Look for validation error for confirm cell (Must match Cell Phone or required)
        expect(screen.getByText(/Must match Cell Phone|required/i)).toBeInTheDocument();
    });
});