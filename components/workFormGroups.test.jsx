import React from "react";
import {render} from "@testing-library/react";
import WorkFormGroups from "./WorkFormGroups";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

describe("WorkFormGroups", () => {
    it("renders the component", () => {
        render(<WorkFormGroups />);
    });

    it("calls handleShowExperience when 'Yes' radio button is clicked", async () => {
        const handleShowExperience = jest.fn();
        const {getByRole} = render(<WorkFormGroups register={jest.fn()} handleShowExperience={handleShowExperience} />);
        const radioButtonYes = getByRole("radio", {label: "Yes"});

        await userEvent.click(radioButtonYes);

        expect(handleShowExperience).toHaveBeenCalled();
    });

    it("calls handleHideExperience when 'No' radio button is clicked", async () => {
        const handleHideExperience = jest.fn();
        const {getByRole} = render(<WorkFormGroups handleHideExperience={handleHideExperience} />);
        const radioButtonNo = getByRole("radio", {name: "No"});

        await userEvent.click(radioButtonNo);

        expect(handleHideExperience).toHaveBeenCalled();
    });

    it("validates the 'maint_work' field is required", async () => {
        const {getByRole, getByText} = render(<WorkFormGroups />);
        const radioButtonYes = getByRole("radio", {name: "Yes"});

        await userEvent.click(radioButtonYes);

        const submitButton = getByRole("button", {name: "Submit"});

        await userEvent.click(submitButton);

        expect(getByText("This is required.")).toBeInTheDocument();
    });

    it("validates the 'maint_experience' field is required when 'Yes' radio button is selected", async () => {
        const {getByRole, getByText} = render(<WorkFormGroups />);
        const radioButtonYes = getByRole("radio", {name: "Yes"});

        await userEvent.click(radioButtonYes);

        const submitButton = getByRole("button", {name: "Submit"});

        await userEvent.click(submitButton);

        expect(getByText("Please describe your experience.")).toBeInTheDocument();
    });

    it("validates the 'clean_work' field is required", async () => {
        const {getByRole, getByText} = render(<WorkFormGroups />);
        const radioButtonNo = getByRole("radio", {name: "No"});

        await userEvent.click(radioButtonNo);

        const submitButton = getByRole("button", {name: "Submit"});

        await userEvent.click(submitButton);

        expect(getByText("This is required.")).toBeInTheDocument();
    });
});
