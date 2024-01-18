import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {BulkEmailOptions} from "../../components/bulkEmailOptions";
import "@testing-library/jest-dom";

describe("BulkEmailOptions", () => {
    const mockTenants = [
        {user_id: 1, name: "John Doe"},
        {user_id: 2, name: "Jane Smith"},
    ];
    const mockApartments = [
        {apartment_number: 101},
        {apartment_number: 102},
    ];
    const mockRegister = jest.fn();
    const mockErrors = {};

    test("renders BulkEmailOptions component", () => {
        render(
            <BulkEmailOptions
                tenants={mockTenants}
                apartments={mockApartments}
                register={mockRegister}
                errors={mockErrors}
            />
        );

        // Assert that the component renders without throwing an error
        expect(screen.getByLabelText("All Tenants")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});