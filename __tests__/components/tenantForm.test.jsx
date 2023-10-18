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

        // Assert that the component renders without throwing an error
        expect(screen.getByLabelText("First Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Last Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Gender")).toBeInTheDocument();
        expect(screen.getByLabelText("Birthdate")).toBeInTheDocument();
        expect(screen.getByLabelText("Last 4 Social Security #")).toBeInTheDocument();
        expect(screen.getByLabelText("Cell Phone")).toBeInTheDocument();
        expect(screen.getByLabelText("Alternate Cell Phone")).toBeInTheDocument();
        expect(screen.getByLabelText("Home Phone")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Alternate Email")).toBeInTheDocument();
        expect(screen.getByText("Have you ever been convicted of a crime?")).toBeInTheDocument();
        expect(screen.getByText("Have you ever been charged with a crime?")).toBeInTheDocument();
        expect(screen.getByLabelText("Street Address")).toBeInTheDocument();
        expect(screen.getByLabelText("City")).toBeInTheDocument();
        expect(screen.getByLabelText("State")).toBeInTheDocument();
        expect(screen.getByLabelText("Zip Code")).toBeInTheDocument();
        expect(screen.getByLabelText("Parent Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Parent Phone")).toBeInTheDocument();
        expect(screen.getByLabelText("Parent Street Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Parent City")).toBeInTheDocument();
        expect(screen.getByLabelText("Parent State")).toBeInTheDocument();
        expect(screen.getByLabelText("Parent Zip Code")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Next"})).toBeInTheDocument();
    });

    test("calls onSubmitPersonal with correct data when form is submitted", async () => {
        render(
            <TenantForm
                site={mockSite}
                userId={mockUserId}
                tenant={mockTenant}
                isNewApplication={mockIsNewApplication}
            />
        );

        // Fill in form fields
        fireEvent.change(screen.getByLabelText("First Name"), {target: {value: "John"}});
        fireEvent.change(screen.getByLabelText("Last Name"), {target: {value: "Doe"}});
        fireEvent.change(screen.getByLabelText("Gender"), {target: {value: "M"}});
        fireEvent.change(screen.getByLabelText("Birthdate"), {target: {value: "1990-01-01"}});
        fireEvent.change(screen.getByLabelText("Last 4 Social Security #"), {target: {value: "1234"}});
        fireEvent.change(screen.getByLabelText("Cell Phone"), {target: {value: "123-456-7890"}});
        fireEvent.change(screen.getByLabelText("Alternate Cell Phone"), {target: {value: "987-654-3210"}});
        fireEvent.change(screen.getByLabelText("Home Phone"), {target: {value: "555-555-5555"}});
        fireEvent.change(screen.getByLabelText("Email"), {target: {value: "johndoe@example.com"}});
        fireEvent.change(screen.getByLabelText("Alternate Email"), {target: {value: "johndoe2@example.com"}});
        fireEvent.click(screen.getByLabelText("Yes")); // Select "Yes" for convicted of a crime
        fireEvent.click(screen.getByLabelText("No")); // Select "No" for charged with a crime
        fireEvent.change(screen.getByLabelText("Street Address"), {target: {value: "123 Main St"}});
        fireEvent.change(screen.getByLabelText("City"), {target: {value: "City"}});
        fireEvent.change(screen.getByLabelText("State"), {target: {value: "State"}});
        fireEvent.change(screen.getByLabelText("Zip Code"), {target: {value: "12345"}});
        fireEvent.change(screen.getByLabelText("Parent Name"), {target: {value: "Jane Doe"}});
        fireEvent.change(screen.getByLabelText("Parent Phone"), {target: {value: "555-123-4567"}});
        fireEvent.change(screen.getByLabelText("Parent Street Address"), {target: {value: "456 Main St"}});
        fireEvent.change(screen.getByLabelText("Parent City"), {target: {value: "City"}});
        fireEvent.change(screen.getByLabelText("Parent State"), {target: {value: "State"}});
        fireEvent.change(screen.getByLabelText("Parent Zip Code"), {target: {value: "54321"}});

        // Submit the form
        await act(() => user.click(screen.getByText("Next")));

        // Assert that the onSubmitPersonal function is called with the correct data
        await waitFor(() => expect(fetchMock).toHaveBeenCalled());
        expect(fetchMock).toHaveBeenCalledWith(
            {
                first_name: "John",
                last_name: "Doe",
                gender: "M",
                date_of_birth: "1990-01-01",
                last_4_social: "1234",
                cell_phone: "123-456-7890",
                cell_phone2: "987-654-3210",
                home_phone: "555-555-5555",
                email: "johndoe@example.com",
                email2: "johndoe2@example.com",
                convicted_crime: "1",
                charged_crime: "0",
                street: "123 Main St",
                city: "City",
                state: "State",
                zip: "12345",
                parent_name: "Jane Doe",
                parent_phone: "555-123-4567",
                parent_street: "456 Main St",
                parent_city: "City",
                parent_state: "State",
                parent_zip: "54321",
            },
            expect.any(Object)
        );
    });

    // Add more unit tests for other functionality as needed
});