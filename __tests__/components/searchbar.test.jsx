import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import SearchBar from "../../components/searchbar";
import "@testing-library/jest-dom";

describe("SearchBar", () => {
    const mockClick = jest.fn();
    const mockChange = jest.fn();

    test("renders SearchBar component", () => {
        render(<SearchBar click={mockClick} change={mockChange}/>);

        // Assert that the component renders without throwing an error
        expect(screen.getByPlaceholderText("Search for Tenant")).toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Search"})).toBeInTheDocument();
    });

    test("calls click function when search button is clicked", () => {
        render(<SearchBar click={mockClick} change={mockChange}/>);

        fireEvent.click(screen.getByRole("button", {name: "Search"}));

        // Assert that the click function is called
        expect(mockClick).toHaveBeenCalled();
    });

    test("calls click function when enter key is pressed in search input", () => {
        render(<SearchBar click={mockClick} change={mockChange}/>);

        fireEvent.keyDown(screen.getByPlaceholderText("Search for Tenant"), {
            key: "Enter",
            keyCode: 13,
        });

        // Assert that the click function is called
        expect(mockClick).toHaveBeenCalled();
    });

    test("calls change function when search input value is changed", () => {
        render(<SearchBar click={mockClick} change={mockChange}/>);

        fireEvent.change(screen.getByPlaceholderText("Search for Tenant"), {
            target: {value: "John Doe"},
        });

        // Assert that the change function is called
        expect(mockChange).toHaveBeenCalled();
    });

    // Add more unit tests for other functionality as needed
});