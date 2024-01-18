import {render, screen, fireEvent, act} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import ApplicationForm from "../../components/applicationForm";

describe("ApplicationForm component", () => {
    describe("rendering", () => {
        it("should render the Preferences label", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const preferencesLabel = screen.getByText("Preferences:");
            expect(preferencesLabel).toBeInTheDocument();
        });

        it("should render the Preferred Roommate label", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommateLabel = screen.getByLabelText("Preferred Roommate");
            expect(roommateLabel).toBeInTheDocument();
        });

        it("should render the roomate2 input", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommate2Input = screen.getByLabelText("Preferred Roommate 2");
            expect(roommate2Input).toBeInTheDocument();
        });

        it("should render the roomate3 input", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommate3Input = screen.getByLabelText("Preferred Roommate 3");
            expect(roommate3Input).toBeInTheDocument();
        });

        it("should render the roomate4 input", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommate4Input = screen.getByLabelText("Preferred Roommate 4");
            expect(roommate4Input).toBeInTheDocument();
        });

        it("should render the roomate5 input", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommate5Input = screen.getByLabelText("Preferred Roommate 5");
            expect(roommate5Input).toBeInTheDocument();
        });

        it("should render the Likes and Dislikes label", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const likesDislikesLabel = screen.getByLabelText("Likes and Dislikes");
            expect(likesDislikesLabel).toBeInTheDocument();
        });

        it("should render the 'Please do not share my information' checkbox", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const shareInfoCheckbox = screen.getByLabelText("Please do not share my information.");
            expect(shareInfoCheckbox).toBeInTheDocument();
        });

        it("should render the Roommate Description label", () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommateDescLabel = screen.getByLabelText("Roommate Description");
            expect(roommateDescLabel).toBeInTheDocument();
        });
    });

    describe("interactions", () => {
        xit("should validate the 'Preferred Roommate' field when typing more than 256 characters", async () => {
            render(<ApplicationForm/>);
            const roommateInput = screen.getByLabelText("Preferred Roommate");
            await fireEvent.input(roommateInput, "a".repeat(257));
            await fireEvent.blur(roommateInput);
            const errorMessage = screen.getByText("Too long.");
            expect(errorMessage).toBeInTheDocument();
        });

        it("should not validate the 'Preferred Roommate' field when typing less than or equal to 256 characters", async () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const roommateInput = screen.getByLabelText("Preferred Roommate");
            await userEvent.type(roommateInput, "a".repeat(256));
            const errorMessage = screen.queryByText("Too long.");
            expect(errorMessage).not.toBeInTheDocument();
        });

        it("should select the 'Please do not share my information' checkbox when clicking it", async () => {
            render(<ApplicationForm currentLeases={[]} application={{processed: false}}/>);
            const shareInfoCheckbox = screen.getByLabelText("Please do not share my information.");
            expect(shareInfoCheckbox.checked).toBe(false);
            await fireEvent.click(shareInfoCheckbox);
            expect(shareInfoCheckbox.checked).toBe(true);
        });
    });
});
