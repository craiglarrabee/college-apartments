import React from "react";
import {render, screen} from "@testing-library/react";
import {UserApartment} from "../../components/assignments";
import "@testing-library/jest-dom";

describe("UserApartment", () => {
    const mockData = [
        {
            name: "John Doe",
            cell_phone: "123-456-7890",
            home_phone: "987-654-3210",
            email: "johndoe@example.com",
            apartment_number: "101"
        },
        {
            name: "Jane Smith",
            cell_phone: "111-222-3333",
            home_phone: "444-555-6666",
            email: "janesmith@example.com",
            apartment_number: "101"
        },
    ];

    test("renders UserApartment component", () => {
        render(<UserApartment data={mockData}/>);

        // Assert that the component renders without throwing an error
        expect(screen.getByText("Apartment 101")).toBeInTheDocument();
        expect(screen.getByText("Apartment 101")).toHaveClass("h3");
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("123-456-7890")).toBeInTheDocument();
        expect(screen.getByText("987-654-3210")).toBeInTheDocument();
        expect(screen.getByText("johndoe@example.com")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText("111-222-3333")).toBeInTheDocument();
        expect(screen.getByText("444-555-6666")).toBeInTheDocument();
        expect(screen.getByText("janesmith@example.com")).toBeInTheDocument();
    });

    // Add more unit tests for other functionality as needed
});