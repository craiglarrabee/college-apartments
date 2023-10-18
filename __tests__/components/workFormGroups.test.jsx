import React from "react";
import {act, getAllByRole, queryByLabelText, render, waitFor} from "@testing-library/react";
import WorkFormGroups from "../../components/workFormGroups";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

describe("WorkFormGroups", () => {
    let user;
    beforeAll(() => {
        user = userEvent.setup();
    });
    
    it("renders the component", () => {
        render(<WorkFormGroups />);
    });

    it("calls handleShowExperience when 'Yes' radio button is clicked", async () => {
        const {queryByLabelText, getAllByRole} = render(<WorkFormGroups register={jest.fn()} />);
        const buttons = getAllByRole("radio");
        const yesButton = buttons.find(button => button.id === "maint_work_true");

        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeNull());
        await act(() => user.click(yesButton));
        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeInTheDocument());
    });

    it("calls handleHideExperience when 'No' radio button is clicked", async () => {
        const {queryByLabelText, getAllByRole} = render(<WorkFormGroups register={jest.fn()} />);
        const buttons = getAllByRole("radio");
        const noButton = buttons.find(button => button.id === "maint_work_false");
        const yesButton = buttons.find(button => button.id === "maint_work_true");

        await act(() => user.click(yesButton));
        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeInTheDocument());
        await act(() => user.click(noButton));
        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeNull());
    });

    test("renders WorkFormGroups component", () => {
        const mockRegister = jest.fn();
        const mockErrors = {};

        render(<WorkFormGroups register={mockRegister} errors={mockErrors} />);

        // Assert that the component renders without throwing an error
        expect(screen.getByText("Work Opportunities:")).toBeInTheDocument();
        expect(screen.getByText("Are you interested in doing maintenance work on the apartment this summer and during the school year for wages?")).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("No")).toBeInTheDocument();
        expect(screen.getByText("Are you interested in cleaning apartments during semester breaks for wages?")).toBeInTheDocument();
        expect(screen.getByText("Yes")).toBeInTheDocument();
        expect(screen.getByText("No")).toBeInTheDocument();
    });
});
