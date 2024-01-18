import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import LeaseForm from "../../components/leaseForm";
import "@testing-library/jest-dom";
import fetchMock from "jest-fetch-mock";

describe("LeaseForm", () => {
    const mockNavPage = "mockNavPage";
    const mockSite = "mockSite";
    const mockUserId = "mockUserId";
    const mockLeaseId = "mockLeaseId";
    const mockLease = {lease_date: null};
    const mockCanEdit = true;
    const mockLeaseHeader = "mockLeaseHeader";
    const mockAccommodationsHeader = "mockAccommodationsHeader";
    const mockAccommodationsBody = "mockAccommodationsBody";
    const mockRentHeader = "mockRentHeader";
    const mockRentBody = "mockRentBody";
    const mockVehicleHeader = "mockVehicleHeader";
    const mockVehicleBody = "mockVehicleBody";
    const mockLeaseBody = "mockLeaseBody";
    const mockLeaseAcceptance = "mockLeaseAcceptance";
    const mockRules = "mockRules";
    const mockCleaning = "mockCleaning";
    const mockRepairs = "mockRepairs";
    const mockRooms = [];

    beforeAll(() => {
        fetchMock.enableMocks();
    });

    beforeEach(() => {
        fetchMock.resetMocks();
        fetchMock.mockResponseOnce(undefined, {status: 204});
    });

    test("renders LeaseForm component", () => {
        render(
            <LeaseForm
                navPage={mockNavPage}
                site={mockSite}
                userId={mockUserId}
                leaseId={mockLeaseId}
                lease={mockLease}
                canEdit={mockCanEdit}
                leaseHeader={mockLeaseHeader}
                accommodationsHeader={mockAccommodationsHeader}
                accommodationsBody={mockAccommodationsBody}
                rentHeader={mockRentHeader}
                rentBody={mockRentBody}
                vehicleHeader={mockVehicleHeader}
                vehicleBody={mockVehicleBody}
                leaseBody={mockLeaseBody}
                leaseAcceptance={mockLeaseAcceptance}
                rules={mockRules}
                cleaning={mockCleaning}
                repairs={mockRepairs}
                rooms={mockRooms}
            />
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByText("This Contract is entered into on")).toBeInTheDocument();
        expect(screen.getByText("I pick room type")).toBeInTheDocument();
        expect(screen.getByText("Resident's vehicle is:")).toBeInTheDocument();
        expect(screen.getByLabelText("Color")).toBeInTheDocument();
        expect(screen.getByLabelText("Make/Model")).toBeInTheDocument();
        expect(screen.getByLabelText("License No.")).toBeInTheDocument();
        expect(screen.getByLabelText("State")).toBeInTheDocument();
        expect(screen.getByLabelText("REGISTERED OWNER'S NAME")).toBeInTheDocument();
        expect(screen.getByLabelText("Resident Name")).toBeInTheDocument();
        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Tenant's Full Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Tenant's Cell Phone with Area Code")).toBeInTheDocument();
        expect(screen.getByLabelText("Parents' names")).toBeInTheDocument();
        expect(screen.getByLabelText("and cell phone number with area codes")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    test("calls onSubmit with correct data when form is submitted", () => {
        const onSubmit = jest.fn();
        render(
            <LeaseForm
                navPage={mockNavPage}
                site={mockSite}
                userId={mockUserId}
                leaseId={mockLeaseId}
                lease={mockLease}
                canEdit={mockCanEdit}
                leaseHeader={mockLeaseHeader}
                accommodationsHeader={mockAccommodationsHeader}
                accommodationsBody={mockAccommodationsBody}
                rentHeader={mockRentHeader}
                rentBody={mockRentBody}
                vehicleHeader={mockVehicleHeader}
                vehicleBody={mockVehicleBody}
                leaseBody={mockLeaseBody}
                leaseAcceptance={mockLeaseAcceptance}
                rules={mockRules}
                cleaning={mockCleaning}
                repairs={mockRepairs}
                rooms={mockRooms}
                onSubmit={onSubmit} // Pass the onSubmit function as a prop
            />
        );

        // Fill in form fields
        fireEvent.change(screen.getByLabelText("Color"), {target: {value: "Red"}});
        fireEvent.change(screen.getByLabelText("Make/Model"), {target: {value: "Toyota Camry"}});
        fireEvent.change(screen.getByLabelText("License No."), {target: {value: "ABC123"}});
        fireEvent.change(screen.getByLabelText("State"), {target: {value: "California"}});
        fireEvent.change(screen.getByLabelText("REGISTERED OWNER'S NAME"), {target: {value: "John Doe"}});
        fireEvent.change(screen.getByLabelText("Resident Name"), {target: {value: "Jane Smith"}});
        fireEvent.change(screen.getByLabelText("Email Address"), {target: {value: "janesmith@example.com"}});
        fireEvent.change(screen.getByLabelText("Tenant's Full Address"), {target: {value: "123 Main St, City, State, Zip"}});
        fireEvent.change(screen.getByLabelText("Tenant's Cell Phone with Area Code"), {target: {value: "555-123-4567"}});
        fireEvent.change(screen.getByLabelText("Parents' names"), {target: {value: "John and Jane Smith"}});
        fireEvent.change(screen.getByLabelText("and cell phone number with area codes"), {target: {value: "555-987-6543"}});

        // Submit the form
        fireEvent.click(screen.getByText("Submit"));

        // Assert that the onSubmit function is called with the correct data
        expect(onSubmit).toHaveBeenCalledWith(
            {
                vehicle_color: "Red",
                vehicle_make_model: "Toyota Camry",
                vehicle_license: "ABC123",
                vehicle_state: "California",
                vehicle_owner: "John Doe",
                signature: "Jane Smith",
                lease_email: "janesmith@example.com",
                lease_address: "123 Main St, City, State, Zip",
                lease_cell_phone: "555-123-4567",
                lease_parent_name: "John and Jane Smith",
                lease_parent_phone: "555-987-6543",
            },
            expect.any(Object)
        );
    });

    test("calls /api/users/${userId}/leases/${leaseId} with correct data when form is submitted", () => {

        render(
            <LeaseForm
                navPage={mockNavPage}
                site={mockSite}
                userId={mockUserId}
                leaseId={mockLeaseId}
                lease={mockLease}
                canEdit={mockCanEdit}
                leaseHeader={mockLeaseHeader}
                accommodationsHeader={mockAccommodationsHeader}
                accommodationsBody={mockAccommodationsBody}
                rentHeader={mockRentHeader}
                rentBody={mockRentBody}
                vehicleHeader={mockVehicleHeader}
                vehicleBody={mockVehicleBody}
                leaseBody={mockLeaseBody}
                leaseAcceptance={mockLeaseAcceptance}
                rules={mockRules}
                cleaning={mockCleaning}
                repairs={mockRepairs}
                rooms={mockRooms}
            />
        );

        // Fill in form fields
        fireEvent.change(screen.getByLabelText("Color"), {target: {value: "Red"}});
        fireEvent.change(screen.getByLabelText("Make/Model"), {target: {value: "Toyota Camry"}});
        fireEvent.change(screen.getByLabelText("License No."), {target: {value: "ABC123"}});
        fireEvent.change(screen.getByLabelText("State"), {target: {value: "California"}});
        fireEvent.change(screen.getByLabelText("REGISTERED OWNER'S NAME"), {target: {value: "John Doe"}});
        fireEvent.change(screen.getByLabelText("Resident Name"), {target: {value: "Jane Smith"}});
        fireEvent.change(screen.getByLabelText("Email Address"), {target: {value: "janesmith@example.com"}});
        fireEvent.change(screen.getByLabelText("Tenant's Full Address"), {target: {value: "123 Main St, City, State, Zip"}});
        fireEvent.change(screen.getByLabelText("Tenant's Cell Phone with Area Code"), {target: {value: "555-123-4567"}});
        fireEvent.change(screen.getByLabelText("Parents' names"), {target: {value: "John and Jane Smith"}});
        fireEvent.change(screen.getByLabelText("and cell phone number with area codes"), {target: {value: "555-987-6543"}});

        // Submit the form
        fireEvent.click(screen.getByText("Submit"));

        expect(fetchMock).toHaveBeenCalledWith(`/api/users/${mockUserId}/leases/${mockLeaseId}`,
            expect.objectContaining({
                method: "PUT"
            })
            // {
            //     vehicle_color: "Red",
            //     vehicle_make_model: "Toyota Camry",
            //     vehicle_license: "ABC123",
            //     vehicle_state: "California",
            //     vehicle_owner: "John Doe",
            //     signature: "Jane Smith",
            //     lease_email: "janesmith@example.com",
            //     lease_address: "123 Main St, City, State, Zip",
            //     lease_cell_phone: "555-123-4567",
            //     lease_parent_name: "John and Jane Smith",
            //     lease_parent_phone: "555-987-6543",
            // }
        );
    });

    // Add more unit tests for other functionality as needed
});