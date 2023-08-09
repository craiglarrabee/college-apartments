import React from "react";
import {
    act,
    getAllByRole,
    getByLabelText,
    getByTestId,
    queryByLabelText,
    render,
    waitFor,
    within
} from "@testing-library/react";
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
        const yesButton = buttons.filter(button => button.id === "maint_work_true")[0];

        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeNull());
        await act(() => user.click(yesButton));
        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeInTheDocument());
    });

    it("calls handleHideExperience when 'No' radio button is clicked", async () => {
        const {queryByLabelText, getAllByRole} = render(<WorkFormGroups register={jest.fn()} />);
        const buttons = getAllByRole("radio");
        const noButton = buttons.filter(button => button.id === "maint_work_false")[0];
        const yesButton = buttons.filter(button => button.id === "maint_work_true")[0];

        await act(() => user.click(yesButton));
        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeInTheDocument());
        await act(() => user.click(noButton));
        await waitFor(() => expect(queryByLabelText("Maintenance Experience")).toBeNull());
    });
});
